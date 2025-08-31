document.addEventListener("DOMContentLoaded", function () {
  const createButton = document.querySelector(".primary-button");
  const joinButton = document.querySelector(".secondary-button");
  const joinInput = document.querySelector(".input-container input");
  const modeToggle = document.querySelector(".rotateImg");

  createButton.addEventListener("click", function () {
    const clipboardId = generateClipboardId();

    localStorage.setItem("currentClipboardId", clipboardId);

    window.location.href = `content.html?id=${clipboardId}`;
  });

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

    localStorage.setItem("currentClipboardId", clipboardId);

    window.location.href = `content.html?id=${clipboardId}`;
  });

  joinInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      joinButton.click();
    }
  });

  modeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);

    this.style.transform = isDark ? "rotate(280deg)" : "rotate(130deg)";
  });

  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "true") {
    document.body.classList.add("dark-mode");
    modeToggle.style.transform = "rotate(280deg)";
  }
});

function generateClipboardId() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

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

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}
