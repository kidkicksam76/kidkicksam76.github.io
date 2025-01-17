document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form from submitting traditionally

    // Collect form data
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePicture = document.getElementById('profile-picture').files[0];
    const age = document.getElementById('age').value;
    const bio = document.getElementById('bio').value;

    // Create an object to hold the form data
    const userData = {
        firstName,
        lastName,
        email,
        password,  // In a real app, password should be encrypted before storage
        age,
        bio
    };

    // If there's a profile picture, save the file name (not the file itself for simplicity)
    if (profilePicture) {
        userData.profilePicture = profilePicture.name;
    }

    // Store user data in localStorage
    localStorage.setItem(email, JSON.stringify(userData));

    // Display a message indicating success
    alert('Sign-up successful! Your data has been saved.');

    // Optionally, reset the form
    document.getElementById('signupForm').reset();
});
