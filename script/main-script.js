// Main page functionality for creating and joining clipboards

document.addEventListener("DOMContentLoaded", function () {
  const createButton = document.querySelector(".primary-button");
  const joinButton = document.querySelector(".secondary-button");
  const joinInput = document.querySelector(".input-container input");
  const modeToggle = document.querySelector(".rotateImg");

  // Create new clipboard functionality
  createButton.addEventListener("click", function () {
    // Generate a random clipboard ID
    const clipboardId = generateClipboardId();

    // Store the clipboard ID in localStorage for quick access
    localStorage.setItem("currentClipboardId", clipboardId);

    // Redirect to content page with the new clipboard ID
    window.location.href = `content.html?id=${clipboardId}`;
  });

  // Join existing clipboard functionality
  joinButton.addEventListener("click", function () {
    const clipboardId = joinInput.value.trim().toUpperCase();

    if (!clipboardId) {
      showNotification("Please enter a clipboard ID", "error");
      return;
    }

    if (clipboardId.length !== 5) {
      showNotification("Clipboard ID must be 5 characters long", "error");
      return;
    }

    // Store the clipboard ID in localStorage
    localStorage.setItem("currentClipboardId", clipboardId);

    // Redirect to content page with the clipboard ID
    window.location.href = `content.html?id=${clipboardId}`;
  });

  // Allow joining by pressing Enter in the input field
  joinInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      joinButton.click();
    }
  });

  // Dark/Light mode toggle
  modeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);

    // Rotate the mode icon
    this.style.transform = isDark ? "rotate(280deg)" : "rotate(130deg)";
  });

  // Load saved theme preference
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "true") {
    document.body.classList.add("dark-mode");
    modeToggle.style.transform = "rotate(280deg)";
  }
});

// Generate a random 5-character clipboard ID
function generateClipboardId() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Show notification to user
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${
          type === "error"
            ? "background-color: #e74c3c;"
            : "background-color: #27ae60;"
        }
    `;

  // Add animation keyframes if not already added
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);
  }

  // Add to DOM
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}
