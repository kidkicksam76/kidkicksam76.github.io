function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    
    const messageText = messageInput.value.trim();
  
    if (messageText) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.textContent = messageText;
  
      messagesContainer.appendChild(messageDiv);
      messageInput.value = ''; // Clear the input field
  
      // Scroll to the bottom of the messages container
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  