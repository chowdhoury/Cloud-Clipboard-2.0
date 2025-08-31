<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['code'])) {
    $code = strtoupper(trim($_GET['code']));
    $response = ['success' => false, 'text' => '', 'file' => null, 'message' => ''];

    try {
        if (!preg_match('/^[A-Z0-9]{5}$/', $code)) {
            throw new Exception('Invalid clipboard code format');
        }

        $hasContent = false;

        $textFile = "uploads_text/" . $code . ".txt";
        if (file_exists($textFile)) {
            $response['text'] = file_get_contents($textFile);
            $hasContent = true;
        }

        $fileMetadataPath = "uploads_files/" . $code . "_metadata.json";
        if (file_exists($fileMetadataPath)) {
            $metadata = json_decode(file_get_contents($fileMetadataPath), true);
            
            if ($metadata && isset($metadata['file_path'])) {
                $filePath = "uploads_files/" . $metadata['file_path'];
                
                if (file_exists($filePath)) {
                    $response['file'] = [
                        'name' => $metadata['original_name'],
                        'size' => $metadata['file_size'],
                        'type' => $metadata['file_type'],
                        'url' => $filePath,
                        'upload_time' => $metadata['upload_time']
                    ];
                    $hasContent = true;
                }
            }
        }

        if ($hasContent) {
            $response['success'] = true;
            $response['message'] = 'Content found';
        } else {
            $response['success'] = false;
            $response['message'] = 'No content found for the provided code';
        }

    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }

    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
