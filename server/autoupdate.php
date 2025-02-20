<?php
header('Content-Type: application/json');

$ignoreList = ['autoupdate.php', 'autoupdateclient.js', 'ignoredir']; // Файлы и папки, которые игнорируются
$directory = __DIR__;
$clientFiles = json_decode($_POST['files'], true);
$serverFiles = [];

function scanDirRecursive($dir, $ignoreList, $baseDir) {
    $files = [];
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..' || in_array($item, $ignoreList)) continue;
        $path = "$dir/$item";
        $relativePath = str_replace($baseDir . '/', '', $path);
        if (is_dir($path)) {
            if (!in_array($item, $ignoreList)) {
                $files = array_merge($files, scanDirRecursive($path, $ignoreList, $baseDir));
            }
        } else {
            $files[$relativePath] = date("d.m.Y H:i", filemtime($path));
        }
    }
    return $files;
}

$serverFiles = scanDirRecursive($directory, $ignoreList, $directory);

$updatedFiles = [];
$deletedFiles = [];
$fileContents = [];

foreach ($serverFiles as $file => $serverTime) {
    if (!isset($clientFiles[$file]) || strtotime($clientFiles[$file]) < strtotime($serverTime)) {
        $updatedFiles[] = $file;
        $fileContents[$file] = base64_encode(file_get_contents($directory . '/' . $file));
    }
}

foreach ($clientFiles as $file => $clientTime) {
    if (!isset($serverFiles[$file])) {
        $deletedFiles[] = $file;
    }
}

echo json_encode(["updated" => $updatedFiles, "deleted" => $deletedFiles, "files" => $fileContents]);
?>