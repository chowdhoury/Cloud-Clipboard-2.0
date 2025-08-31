<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function generateCode($length = 5) {
    return substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $length);
}

function cleanExpiredEntries($directory, $expiryTime) {
    if (!is_dir($directory)) return;
    
    foreach (glob($directory . "*") as $file) {
        if (is_file($file) && filemtime($file) < time() - $expiryTime) {
            unlink($file);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => '', 'code' => ''];

    try {
        $code = isset($_POST['code']) ? strtoupper(trim($_POST['code'])) : '';
        
        if (empty($code)) {
            $code = generateCode();
        }

        if (!preg_match('/^[A-Z0-9]{5}$/', $code)) {
            throw new Exception('Invalid clipboard code format');
        }

        if (isset($_POST['text'])) {
            $text = $_POST['text'];
            $uploadText = "uploads_text/";
            
            if (!is_dir($uploadText)) {
                mkdir($uploadText, 0777, true);
            }

            $textFile = $uploadText . $code . ".txt";
            
            if (file_put_contents($textFile, $text) !== false) {
                $response['success'] = true;
                $response['code'] = $code;
                $response['type'] = 'text';
                $response['message'] = 'Text saved successfully';
            } else {
                throw new Exception('Failed to save text');
            }
        }

        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $uploadImage = "uploads_files/";
            
            if (!is_dir($uploadImage)) {
                mkdir($uploadImage, 0777, true);
            }

            $fileInfo = pathinfo($_FILES['file']['name']);
            $fileName = $code . "_" . time() . "." . $fileInfo['extension'];
            $filePath = $uploadImage . $fileName;

            if ($_FILES['file']['size'] > 10 * 1024 * 1024) {
                throw new Exception('File size exceeds 10MB limit');
            }

            $allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml',
                'text/plain', 'text/markdown', 'text/rtf',
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!in_array($_FILES['file']['type'], $allowedTypes)) {
                throw new Exception('File type not allowed');
            }

            if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
                $metadata = [
                    'original_name' => $_FILES['file']['name'],
                    'file_path' => $fileName,
                    'file_size' => $_FILES['file']['size'],
                    'file_type' => $_FILES['file']['type'],
                    'upload_time' => time()
                ];
                
                $metadataFile = $uploadImage . $code . "_metadata.json";
                file_put_contents($metadataFile, json_encode($metadata));

                $response['success'] = true;
                $response['code'] = $code;
                $response['type'] = 'file';
                $response['message'] = 'File uploaded successfully';
            } else {
                throw new Exception('Failed to upload file');
            }
        }

        cleanExpiredEntries("uploads_text/", 86400);
        cleanExpiredEntries("uploads_files/", 86400);

    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }

    echo json_encode($response);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
?>
