<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
require_once '/path/to/secure/directory/config.php';

// Конфигурация базы данных
$servername = "sqlXXX.infinityfree.com";
$username = "if0_XXXXXXX";
$password = "YOUR_DB_PASSWORD";
$dbname = "if0_XXXXXXX";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Создание таблиц
$conn->query("CREATE TABLE IF NOT EXISTS players (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    session_token VARCHAR(64) UNIQUE,
    count INT DEFAULT 0,
    level INT DEFAULT 1,
    improvements JSON,
    potions JSON,
    stats JSON,
    active_abilities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Обработка входящих запросов
$data = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        handlePostRequest($conn, $data);
    } elseif ($method === 'GET') {
        handleGetRequest($conn);
    } else {
        throw new Exception("Method not allowed", 405);
    }
} catch (Exception $e) {
    http_response_code($e->getCode());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();

// Обработчики запросов
function handlePostRequest($conn, $data) {
    if (!isset($data['action'])) {
        throw new Exception("Action is required", 400);
    }

    switch ($data['action']) {
        case 'create_account':
            createAccount($conn, $data);
            break;
        case 'save_data':
            saveGameData($conn, $data);
            break;
        default:
            throw new Exception("Invalid action", 400);
    }
}

function handleGetRequest($conn) {
    if (!isset($_GET['player_id']) || !isset($_GET['session_token'])) {
        throw new Exception("Player ID and session token required", 400);
    }
    
    loadGameData(
        $conn,
        intval($_GET['player_id']),
        $_GET['session_token']
    );
}

// Основные функции
function createAccount($conn, $data) {
    validateData($data, ['name']);
    
    // Генерация токена
    $sessionToken = bin2hex(random_bytes(32));
    
    // Инициализация данных
    $defaults = [
        'improvements' => initializeImprovements(),
        'potions' => initializePotions(),
        'stats' => initializeStats(),
        'active_abilities' => []
    ];

    $stmt = $conn->prepare("INSERT INTO players 
        (name, session_token, improvements, potions, stats, active_abilities)
        VALUES (?, ?, ?, ?, ?, ?)");
        
    $stmt->bind_param("ssssss",
        $data['name'],
        $sessionToken,
        json_encode($defaults['improvements']),
        json_encode($defaults['potions']),
        json_encode($defaults['stats']),
        json_encode($defaults['active_abilities'])
    );

    if (!$stmt->execute()) {
        throw new Exception("Account creation failed: " . $stmt->error, 500);
    }

    echo json_encode([
        "status" => "success",
        "player_id" => $stmt->insert_id,
        "session_token" => $sessionToken,
        "name" => $data['name']
    ]);
    $stmt->close();
}

function saveGameData($conn, $data) {
    validateData($data, [
        'player_id', 'session_token', 'count', 'level',
        'improvements', 'potions', 'stats', 'active_abilities'
    ]);

    verifySession($conn, $data['player_id'], $data['session_token']);

    $stmt = $conn->prepare("UPDATE players SET
        count = ?,
        level = ?,
        improvements = ?,
        potions = ?,
        stats = ?,
        active_abilities = ?
        WHERE id = ?");

    $stmt->bind_param("iissssi",
        $data['count'],
        $data['level'],
        encryptData(json_encode($data['improvements'])),
        encryptData(json_encode($data['potions'])),
        encryptData(json_encode($data['stats'])),
        encryptData(json_encode($data['active_abilities'])),
        $data['player_id']
    );

    if (!$stmt->execute()) {
        throw new Exception("Save failed: " . $stmt->error, 500);
    }

    echo json_encode(["status" => "success"]);
    $stmt->close();
}

function loadGameData($conn, $playerId, $sessionToken) {
    verifySession($conn, $playerId, $sessionToken);

    $stmt = $conn->prepare("SELECT * FROM players WHERE id = ?");
    $stmt->bind_param("i", $playerId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Player not found", 404);
    }

    $row = $result->fetch_assoc();
    $response = [
        "status" => "success",
        "data" => [
            "count" => $row['count'],
            "level" => $row['level'],
            "improvements" => json_decode(decryptData($row['improvements']), true),
            "potions" => json_decode(decryptData($row['potions']), true),
            "stats" => json_decode(decryptData($row['stats']), true),
            "active_abilities" => json_decode(decryptData($row['active_abilities']), true),
            "account_info" => [
                "name" => $row['name'],
                "id" => $row['id']
            ]
        ]
    ];

    echo json_encode($response);
    $stmt->close();
}

// Вспомогательные функции
function validateData($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field", 400);
        }
    }
}

function verifySession($conn, $playerId, $sessionToken) {
    $stmt = $conn->prepare("SELECT id FROM players WHERE id = ? AND session_token = ?");
    $stmt->bind_param("is", $playerId, $sessionToken);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Invalid session", 401);
    }
    $stmt->close();
}

function encryptData($data) {
    $key = "YOUR_SECRET_ENCRYPTION_KEY"; // Замените на реальный ключ
    $iv = openssl_random_pseudo_bytes(16);
    return base64_encode($iv . openssl_encrypt($data, 'aes-256-ctr', $key, 0, $iv));
}

function decryptData($data) {
    $key = "YOUR_SECRET_ENCRYPTION_KEY"; // Тот же ключ
    $data = base64_decode($data);
    $iv = substr($data, 0, 16);
    return openssl_decrypt(substr($data, 16), 'aes-256-ctr', $key, 0, $iv);
}

// Инициализация начальных значений
function initializeImprovements() {
    return [
        "armorAndWeapons" => array_map(function($item) {
            return array_merge($item, ['level' => 0, 'totalBonus' => 0]);
        }, [
            // Ваши данные об улучшениях
        ]),
        // Остальные категории
    ];
}

function initializePotions() {
    return array_map(function($potion) {
        return array_merge($potion, ['purchased' => false]);
    }, [
        // Ваши данные о зельях
    ]);
}

function initializeStats() {
    return [
        "playerBaseDamage" => 1,
        "playerArmor" => 0,
        "playerBlock" => 0,
        "regenerationAmount" => 0,
        "dodgeChance" => 0,
        "playerVulnerability" => 0,
        "maxHP" => 450
    ];
}
?>