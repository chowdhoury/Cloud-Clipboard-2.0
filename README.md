# Cloud Clipboard

A modern, web-based clipboard application that allows users to share text and files instantly across devices. No sign-up required!

## Features

- 🔗 **Instant Sharing**: Share text and files with a simple 5-character code
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📂 **File Support**: Upload images, documents, and other files (up to 10MB)
- ⚡ **Real-time Sync**: Content syncs automatically across all connected devices
- 🔒 **Temporary Storage**: Content automatically expires after 24 hours for privacy
- 💾 **Auto-save**: Text is automatically saved as you type

## How to Use

### Creating a New Clipboard

1. Open `index.html` in your browser
2. Click "Create Clipboard" to generate a new clipboard with a unique 5-character ID
3. Share the ID with others to allow them to access the same clipboard

### Joining an Existing Clipboard

1. Enter the 5-character clipboard ID in the "Join" input field
2. Click "Join" or press Enter
3. You'll be taken to the shared clipboard

### Using the Clipboard

- **Text**: Type or paste text in the large text area. It auto-saves as you type
- **Files**: Click the file area, drag & drop files, or paste images directly
- **Copy/Paste**: Use the toolbar buttons for quick text operations
- **Share**: Click the share icon next to the clipboard ID to copy it

## Installation

### Requirements

- Web server with PHP support (Apache, Nginx, etc.)
- PHP 7.0 or higher

### Setup

1. Upload all files to your web server
2. Ensure the web server has write permissions for creating upload directories
3. Access `index.html` through your web browser

### Local Development

For local testing, you can use PHP's built-in server:

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
Cloud-Clipboard/
├── index.html              # Landing page
├── content.html            # Clipboard interface
├── index.php              # Original PHP backend (legacy)
├── save_content.php       # Save text/files endpoint
├── get_content.php        # Retrieve content endpoint
├── download.php           # File download handler
├── style/
│   └── style.css          # All CSS styles including dark mode
├── script/
│   ├── header-script.js   # Mobile menu functionality
│   ├── main-script.js     # Landing page functionality
│   └── content-script.js  # Clipboard page functionality
└── asset/
    ├── *.png, *.svg       # Images and icons
    └── *.webp
```

## API Endpoints

### Save Content

- **POST** `save_content.php`
- Parameters: `text`, `file`, `code`
- Returns: JSON with success status and clipboard code

### Get Content

- **GET** `get_content.php?code={clipboardId}`
- Returns: JSON with text and file data

### Download File

- **GET** `download.php?code={clipboardId}&file={filename}`
- Returns: File download

## Security Features

- Input validation and sanitization
- File type restrictions
- File size limits (10MB)
- Automatic cleanup of expired content
- Path traversal protection

## Browser Compatibility

- Chrome/Edge 70+
- Firefox 65+
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
# Cloud-Clipboard-2.0
