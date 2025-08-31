<?php
if (!isset($_GET['code']) || !isset($_GET['file'])) {
    http_response_code(400);
    echo 'Invalid request';
    exit;
}

$code = strtoupper(trim($_GET['code']));
$requestedFile = $_GET['file'];

// Validate code format
if (!preg_match('/^[A-Z0-9]{5}$/', $code)) {
    http_response_code(400);
    echo 'Invalid clipboard code';
    exit;
}

// Check metadata
$metadataFile = "uploads_files/" . $code . "_metadata.json";
if (!file_exists($metadataFile)) {
    http_response_code(404);
    echo 'File not found';
    exit;
}

$metadata = json_decode(file_get_contents($metadataFile), true);
if (!$metadata || !isset($metadata['file_path'])) {
    http_response_code(404);
    echo 'File metadata not found';
    exit;
}

$filePath = "uploads_files/" . $metadata['file_path'];
if (!file_exists($filePath)) {
    http_response_code(404);
    echo 'File not found';
    exit;
}

// Security check - ensure the requested file matches the stored file
if ($metadata['file_path'] !== $requestedFile) {
    http_response_code(403);
    echo 'Access denied';
    exit;
}

// Set appropriate headers for file download
header('Content-Description: File Transfer');
header('Content-Type: ' . $metadata['file_type']);
header('Content-Disposition: attachment; filename="' . $metadata['original_name'] . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));

// Clear output buffer and read file
ob_clean();
flush();
readfile($filePath);
exit;
?>
