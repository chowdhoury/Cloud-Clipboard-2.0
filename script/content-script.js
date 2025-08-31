// Content page functionality for clipboard operations

document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.querySelector("textarea");
  const fileContainer = document.querySelector(".file-container");
  const secretCodeElement = document.querySelector(".secret-code p");
  const shareButton = document.querySelector(".secret-code svg");

  // Button elements
  const selectAllBtn = document.querySelector(".select-all-btn");
  const copyBtn = document.querySelector(".copy-btn");
  const pasteBtn = document.querySelector(".paste-btn");
  const clearTextBtn = document.querySelector(".text-actions .clear-btn");
  const clearFileBtn = document.querySelector(".file-actions .clear-btn");
  const downloadBtn = document.querySelector('button[title="Download"]');

  // Get clipboard ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const clipboardId =
    urlParams.get("id") || localStorage.getItem("currentClipboardId");

  if (!clipboardId) {
    showNotification("No clipboard ID found. Redirecting to home...", "error");
    setTimeout(() => (window.location.href = "index.html"), 2000);
    return;
  }

  // Display clipboard ID
  secretCodeElement.textContent = clipboardId;

  // Auto-save functionality
  let saveTimeout;
  textarea.addEventListener("input", function () {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveText();
    }, 1000); // Save after 1 second of no typing
  });

  // Text operations
  selectAllBtn.addEventListener("click", function () {
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    showNotification("Text selected", "success");
  });

  copyBtn.addEventListener("click", async function () {
    if (textarea.value.trim() === "") {
      showNotification("No text to copy", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(textarea.value);
      showNotification("Text copied to clipboard!", "success");
    } catch (err) {
      // Fallback for older browsers
      textarea.select();
      document.execCommand("copy");
      showNotification("Text copied to clipboard!", "success");
    }
  });

  pasteBtn.addEventListener("click", async function () {
    try {
      const text = await navigator.clipboard.readText();
      textarea.value = text;
      saveText();
      showNotification("Text pasted from clipboard!", "success");
    } catch (err) {
      showNotification("Unable to paste. Please use Ctrl+V", "error");
    }
  });

  clearTextBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all text?")) {
      textarea.value = "";
      saveText();
      showNotification("Text cleared", "success");
    }
  });

  // Share clipboard ID
  shareButton.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(clipboardId);
      showNotification("Clipboard ID copied!", "success");
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = clipboardId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showNotification("Clipboard ID copied!", "success");
    }
  });

  // File operations
  let currentFile = null;

  // Drag and drop functionality
  fileContainer.addEventListener("dragover", function (e) {
    e.preventDefault();
    fileContainer.style.backgroundColor = "#ffffff80";
    fileContainer.style.borderColor = "#1e3e62";
  });

  fileContainer.addEventListener("dragleave", function (e) {
    e.preventDefault();
    fileContainer.style.backgroundColor = "#ffffff50";
  });

  fileContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    fileContainer.style.backgroundColor = "#ffffff50";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  // Click to upload
  fileContainer.addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,text/*,.pdf,.doc,.docx";
    input.onchange = function (e) {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
      }
    };
    input.click();
  });

  // Paste files
  document.addEventListener("paste", function (e) {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        handleFileUpload(file);
        break;
      }
    }
  });

  clearFileBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear the uploaded file?")) {
      clearFile();
    }
  });

  downloadBtn.addEventListener("click", function () {
    if (currentFile) {
      downloadFile();
    } else {
      showNotification("No file to download", "error");
    }
  });

  // Functions
  async function saveText() {
    const formData = new FormData();
    formData.append("text", textarea.value);
    formData.append("code", clipboardId);

    try {
      const response = await fetch("save_content.php", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Text saved successfully");
      }
    } catch (error) {
      console.error("Error saving text:", error);
    }
  }

  async function loadContent() {
    try {
      const response = await fetch(`get_content.php?code=${clipboardId}`);
      const data = await response.json();

      if (data.text) {
        textarea.value = data.text;
      }

      if (data.file) {
        window.loadedFileData = data.file;
        displayFile(data.file.name);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  }

  async function handleFileUpload(file) {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showNotification("File size must be less than 10MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("code", clipboardId);

    // Show upload progress
    showNotification("Uploading file...", "info");

    try {
      const response = await fetch("save_content.php", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        currentFile = file;
        displayFile(file);
        showNotification("File uploaded successfully!", "success");
      } else {
        showNotification("Failed to upload file", "error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showNotification("Error uploading file", "error");
    }
  }

  function displayFile(file) {
    const fileName = typeof file === "string" ? file : file.name;
    const fileSize = typeof file === "string" ? "" : formatFileSize(file.size);

    fileContainer.innerHTML = `
            <div class="file-preview">
                ${getFileIcon(fileName)}
                <p><strong>${fileName}</strong></p>
                ${fileSize ? `<p><small>${fileSize}</small></p>` : ""}
            </div>
            <div class="file-actions">
                <button title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                </button>
                <button class="clear-btn" title="Clear">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M269-86q-53 0-89.5-36.5T143-212v-497H80v-126h257v-63h284v63h259v126h-63v497q0 53-36.5 89.5T691-86H269Zm422-623H269v497h422v-497ZM342-281h103v-360H342v360Zm173 0h103v-360H515v360ZM269-709v497-497Z"/></svg>
                </button>
            </div>
        `;

    // Re-attach event listeners
    const newClearBtn = fileContainer.querySelector(".clear-btn");
    const newDownloadBtn = fileContainer.querySelector(
      'button[title="Download"]'
    );

    newClearBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear the uploaded file?")) {
        clearFile();
      }
    });

    newDownloadBtn.addEventListener("click", function () {
      downloadFile();
    });
  }

  function clearFile() {
    currentFile = null;
    fileContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#1e3e62"><path d="M252-135q-96.34 0-165.67-68.68Q17-272.35 17-368q0-84 50.5-151T201-600q24-100 102.17-162.5T482.29-825Q599-825 680.5-742.5 762-660 770-543v24q75 7 124 60.7 49 53.71 49 131.3 0 79.92-57.5 135.96Q828-135 749-135H539q-38.98 0-66.99-27.99Q444-190.97 444-229v-212l-88 89-51-50 175-176 176 176-52 50-88-89v212h233.36Q789-229 819-258.87T849-329q0-41-29.87-70.5T749-429h-72v-95q0-84.43-57.15-145.22Q562.71-730 478.47-730 392-730 335-665.5T278-513h-28q-58.27 0-98.64 40.81-40.36 40.81-40.36 101Q111-313 152.44-271t100.06 42H384v94H252Zm228-298Z"/></svg>
            <p>Upload, paste or drag files here...</p>
            <div class="file-actions">
                <button title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M874-694v482q0 53-36.5 89.5T748-86H212q-53 0-89.5-36.5T86-212v-536q0-53 36.5-89.5T212-874h482l180 180Zm-126 53L641-748H212v536h536v-429ZM480-252q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM252-548h360v-160H252v160Zm-40-93v429-536 107Z"/></svg>
                </button>
                <button class="clear-btn" title="Clear">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M269-86q-53 0-89.5-36.5T143-212v-497H80v-126h257v-63h284v63h259v126h-63v497q0 53-36.5 89.5T691-86H269Zm422-623H269v497h422v-497ZM342-281h103v-360H342v360Zm173 0h103v-360H515v360ZM269-709v497-497Z"/></svg>
                </button>
            </div>
        `;
    showNotification("File cleared", "success");
  }

  function downloadFile() {
    if (currentFile && typeof currentFile === "object") {
      // For newly uploaded files, create blob URL
      const url = URL.createObjectURL(currentFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("File downloaded!", "success");
    } else if (window.loadedFileData) {
      // For files loaded from server
      const file = window.loadedFileData;
      window.open(
        `download.php?code=${clipboardId}&file=${file.url.split("/").pop()}`,
        "_blank"
      );
      showNotification("File download started!", "success");
    } else {
      showNotification("No file to download", "error");
    }
  }

  function getFileIcon(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    const textExtensions = ["txt", "md", "rtf"];
    const docExtensions = ["pdf", "doc", "docx"];

    if (imageExtensions.includes(extension)) {
      return '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#1e3e62"><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm56-97h489L578-473 446-302l-93-127-117 152Zm-56 97v-600 600Z"/></svg>';
    } else if (textExtensions.includes(extension)) {
      return '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#1e3e62"><path d="M319-250h322v-60H319v60Zm0-170h322v-60H319v60Zm-99 340q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v186h186L551-634Z"/></svg>';
    } else {
      return '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#1e3e62"><path d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554h186L551-820v186Z"/></svg>';
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Load existing content on page load
  loadContent();

  // Refresh content every 30 seconds to sync with other users
  setInterval(loadContent, 30000);
});

// Show notification function (same as in main-script.js)
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
            : type === "success"
            ? "background-color: #27ae60;"
            : "background-color: #3498db;"
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
