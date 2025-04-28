const MODRINTH_API = 'https://api.modrinth.com/v2';

// Utility function for retrying failed requests
async function fetchWithRetry(url, options, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

async function searchMods(description, minecraftVersion) {
  try {
    // Validate inputs
    const query = description?.trim();
    const version = minecraftVersion?.trim();
    if (!query) throw new Error('Please provide a mod description.');
    if (!version) throw new Error('Please select a Minecraft version.');

    // Search for mods
    const searchUrl = `${MODRINTH_API}/search?query=${encodeURIComponent(query)}&facets=[["project_type:mod"],["versions:${version}"]]`;
    const searchResponse = await fetchWithRetry(
      searchUrl,
      { headers: { 'User-Agent': 'ModCraftAI/1.0' } }
    );
    const searchData = await searchResponse.json();
    const mods = searchData.hits || [];

    if (mods.length === 0) {
      throw new Error('No mods found for this description and version. Try a different description (e.g., "fabric" or "magic") or a modern version like 1.20.1.');
    }

    // Fetch download links for each mod
    const results = await Promise.all(
      mods.map(async mod => {
        try {
          // Get version-specific data
          const versionUrl = `${MODRINTH_API}/project/${mod.project_id}/version?game_versions=["${version}"]`;
          const versionResponse = await fetchWithRetry(
            versionUrl,
            { headers: { 'User-Agent': 'ModCraftAI/1.0' } }
          );
          const versionData = await versionResponse.json();
          const latestVersion = versionData.find(v => v.game_versions.includes(version));
          const downloadUrl = latestVersion?.files[0]?.url || `https://modrinth.com/mod/${mod.slug}`;

          return {
            name: mod.title,
            description: mod.description || 'No description available.',
            platform: 'Modrinth',
            url: downloadUrl
          };
        } catch (error) {
          console.warn(`Failed to get download link for ${mod.title}:`, error);
          return {
            name: mod.title,
            description: mod.description || 'No description available.',
            platform: 'Modrinth',
            url: `https://modrinth.com/mod/${mod.slug}` // Fallback to mod page
          };
        }
      })
    );

    return results.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching mods:', error);
    // Provide specific error messages
    if (error.message.includes('HTTP')) {
      throw new Error(`Modrinth API error: ${error.message}. Please try again later or use mock data.`);
    } else if (error.message.includes('fetch') || error.name === 'TypeError') {
      throw new Error('Network error: Unable to reach Modrinth API. Check your internet connection, ensure you are running a local server (e.g., python -m http.server), or try again later.');
    }
    throw new Error(error.message || 'Failed to search for mods. Please try again or use mock data.');
  }
}

// Export for browser usage
window.searchMods = searchMods;