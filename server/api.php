<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: https://gameswords.kesug.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dbConfig = [
    'host' => '',
    'dbname' => '',
    'user' => '',
    'pass' => ''
];

try {
    $conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['dbname']);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    $data = getRequestData();
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'create_guest':
            handleCreateGuest($conn);
            break;
        case 'save':
            handleSaveGame($conn, $data);
            break;
        case 'load':
            handleLoadGame($conn, $data);
            break;
        default:
            throw new Exception('Invalid action: ' . $action);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getRequestData() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}

function handleCreateGuest($conn) {
    $username = generateGuestUsername($conn);
    $loginKey = bin2hex(random_bytes(32));
    $defaults = json_encode([]);

    $stmt = $conn->prepare("INSERT INTO users (username, login_key, improvements, potions, active_abilities, cooldown_timers, timers) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param("sssssss", $username, $loginKey, $defaults, $defaults, $defaults, $defaults, $defaults);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create guest: ' . $stmt->error);
    }

    echo json_encode(['login_key' => $loginKey, 'username' => $username]);
}

function generateGuestUsername($conn) {
    for ($i = 0; $i < 10; $i++) {
        $username = 'guest' . random_int(10000, 99999);
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            return $username;
        }
    }
    throw new Exception('Failed to generate unique username');
}

function handleSaveGame($conn, $data) {
    if (empty($data['login_key'])) {
        throw new Exception('Missing login key');
    }

    $fieldMapping = [
        'improvements' => 'improvements',
        'potions' => 'potions',
        'activeAbilities' => 'active_abilities',
        'cooldownTimers' => 'cooldown_timers',
        'timers' => 'timers',
        'isBlocked' => 'is_blocked',
        'blockStartTime' => 'block_start_time',
        'blockDuration' => 'block_duration',
        'lastBlockTime' => 'last_block_time',
        'blockLevel' => 'block_level',
        'currentCount' => 'current_count',
        'maxHP' => 'max_hp',
        'playerBaseDamage' => 'player_base_damage',
        'playerArmor' => 'player_armor',
        'playerBlock' => 'player_block',
        'regenerationAmount' => 'regeneration_amount',
        'dodgeChance' => 'dodge_chance',
        'playerVulnerability' => 'player_vulnerability'
    ];

    $updates = [];
    $params = [];
    $types = "";

    foreach ($fieldMapping as $clientKey => $dbField) {
        if (isset($data[$clientKey])) {
            $updates[] = "$dbField = ?";
            $params[] = is_array($data[$clientKey]) ? json_encode($data[$clientKey]) : $data[$clientKey];
            $types .= is_int($data[$clientKey]) || is_float($data[$clientKey]) ? "i" : "s";
        }
    }

    if (empty($updates)) {
        throw new Exception('No valid fields to update');
    }

    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE login_key = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $types .= "s";
    $params[] = $data['login_key'];
    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception('Save failed: ' . $stmt->error);
    }

    echo json_encode(['status' => 'success']);
}

function handleLoadGame($conn, $data) {
    if (empty($data['login_key'])) {
        throw new Exception('Missing login key');
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE login_key = ?");
    $stmt->bind_param("s", $data['login_key']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }

    $row = $result->fetch_assoc();

    $reverseMapping = array_flip([
        'improvements' => 'improvements',
        'potions' => 'potions',
        'active_abilities' => 'activeAbilities',
        'cooldown_timers' => 'cooldownTimers',
        'timers' => 'timers',
        'is_blocked' => 'isBlocked',
        'block_start_time' => 'blockStartTime',
        'block_duration' => 'blockDuration',
        'last_block_time' => 'lastBlockTime',
        'block_level' => 'blockLevel',
        'current_count' => 'currentCount',
        'max_hp' => 'maxHP',
        'player_base_damage' => 'playerBaseDamage',
        'player_armor' => 'playerArmor',
        'player_block' => 'playerBlock',
        'regeneration_amount' => 'regenerationAmount',
        'dodge_chance' => 'dodgeChance',
        'player_vulnerability' => 'playerVulnerability'
    ]);

    $response = [];
    foreach ($row as $dbField => $value) {
        $response[$reverseMapping[$dbField] ?? $dbField] = $value;
    }

    echo json_encode($response);
}
