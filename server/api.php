<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: https://gameswords.kesug.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, multipart/form-data");
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

if (isset($_GET['action']) && $_GET['action'] === 'check_ddns') {
    echo 'yes';
    exit;
}

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
        case 'updateprofile':
            changeprofile($conn, $data);
            break;
        case 'loadProfile':
            loadProfile($conn);
            break;
        case 'getAvatar':
            getAvatar($conn, $data);
            break;
        default:
            throw new Exception('Invalid action: ' . $action);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getRequestData()
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}

function handleCreateGuest($conn)
{
    $username = generateGuestUsername($conn);
    $loginKey = bin2hex(random_bytes(32));
    $defaults = json_encode([]);
    $improvementsdefault = json_encode([
        "armorAndWeapons" => [
            [
                "name" => "helmet",
                "level" => 0,
                "baseCost" => 100,
                "cost" => 100,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/helmet-icon.png",
                "descriptionKeyitem" => "helmet_description",
                "additionalUpgrades" => [["type" => "armor", "value" => 10]]
            ],
            [
                "name" => "body",
                "level" => 0,
                "baseCost" => 200,
                "cost" => 200,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/body-icon.png",
                "descriptionKeyitem" => "body_description",
                "additionalUpgrades" => [["type" => "armor", "value" => 10]]
            ],
            [
                "name" => "pants",
                "level" => 0,
                "baseCost" => 150,
                "cost" => 150,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/pants-icon.png",
                "descriptionKeyitem" => "pants_description",
                "additionalUpgrades" => [["type" => "armor", "value" => 10]]
            ],
            [
                "name" => "boots",
                "level" => 0,
                "baseCost" => 100,
                "cost" => 100,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/boots-icon.png",
                "descriptionKeyitem" => "boots_description",
                "additionalUpgrades" => [["type" => "armor", "value" => 10], ["type" => "dodge", "value" => 10]]
            ],
            [
                "name" => "shield",
                "level" => 0,
                "baseCost" => 300,
                "cost" => 300,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/shield-icon.png",
                "descriptionKeyitem" => "shield_description",
                "additionalUpgrades" => [["type" => "block", "value" => 10]]
            ],
            [
                "name" => "sword",
                "level" => 0,
                "baseCost" => 500,
                "cost" => 500,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/sword-icon.png",
                "descriptionKeyitem" => "sword_description",
                "additionalUpgrades" => [["type" => "Basedamage", "value" => 10]]
            ]
        ],
        "heroImprovements" => [
            [
                "name" => "intellect",
                "level" => 0,
                "baseCost" => 100,
                "cost" => 100,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/intellect-icon.png",
                "descriptionKeyitem" => "intellect_description",
                "additionalUpgrades" => [["type" => "", "value" => 10]]
            ],
            [
                "name" => "courage",
                "level" => 0,
                "baseCost" => 150,
                "cost" => 150,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/courage-icon.png",
                "descriptionKeyitem" => "courage_description",
                "additionalUpgrades" => [["type" => "Basedamage", "value" => 10]]
            ],
            [
                "name" => "endurance",
                "level" => 0,
                "baseCost" => 200,
                "cost" => 200,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/endurance-icon.png",
                "descriptionKeyitem" => "endurance_description",
                "additionalUpgrades" => [["type" => "block", "value" => 10]]
            ],
            [
                "name" => "confidence",
                "level" => 0,
                "baseCost" => 100,
                "cost" => 100,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/confidence-icon.png",
                "descriptionKeyitem" => "confidence_description",
                "additionalUpgrades" => [["type" => "dodge", "value" => 10]]
            ],
            [
                "name" => "strength",
                "level" => 0,
                "baseCost" => 250,
                "cost" => 250,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/strength-icon.png",
                "descriptionKeyitem" => "strength_description",
                "additionalUpgrades" => [["type" => "Basedamage", "value" => 10]]
            ],
            [
                "name" => "life",
                "level" => 0,
                "baseCost" => 300,
                "cost" => 300,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/life-icon.png",
                "descriptionKeyitem" => "life_description",
                "additionalUpgrades" => [["type" => "HP", "value" => 10]]
            ],
            [
                "name" => "reaction",
                "level" => 0,
                "baseCost" => 200,
                "cost" => 200,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/reaction-icon.png",
                "descriptionKeyitem" => "reaction_description",
                "additionalUpgrades" => [["type" => "dodge", "value" => 10]]
            ]
        ],
        "magic" => [
            [
                "name" => "mana",
                "level" => 0,
                "baseCost" => 100,
                "cost" => 100,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/mana-icon.png",
                "descriptionKeyitem" => "mana_description",
                "additionalUpgrades" => [["type" => "", "value" => 10]]
            ],
            [
                "name" => "regeneration",
                "level" => 0,
                "baseCost" => 150,
                "cost" => 150,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/regeneration-icon.png",
                "descriptionKeyitem" => "regeneration_description",
                "additionalUpgrades" => [["type" => "regeneration", "value" => 10]]
            ],
            [
                "name" => "strength",
                "level" => 0,
                "baseCost" => 200,
                "cost" => 200,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/Magic-power-icon.png",
                "descriptionKeyitem" => "magicstrength_description",
                "additionalUpgrades" => [["type" => "", "value" => 10]]
            ],
            [
                "name" => "fireResistance",
                "level" => 0,
                "baseCost" => 250,
                "cost" => 250,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/fire-resistance-icon.png",
                "descriptionKeyitem" => "fireResistance_description",
                "additionalUpgrades" => [["type" => "", "value" => 10]]
            ],
            [
                "name" => "vulnerability",
                "level" => 0,
                "baseCost" => 250,
                "cost" => 250,
                "bonus" => 1.25,
                "totalBonus" => 0,
                "icon" => "assets/textures/vulnerability-icon.png",
                "descriptionKeyitem" => "vulnerability_description",
                "additionalUpgrades" => [["type" => "vulnerability", "value" => 10]]
            ]
        ]
    ], JSON_UNESCAPED_SLASHES);

    $potionsdefault = json_encode([
        ["name" => "speedPotion", "baseCost" => 100, "cost" => 100, "icon" => "assets/textures/speed-potion-icon.png", "unlocksAbility" => "IncreasedMovementSpeed", "duration" => 60000, "cooldown" => 300000, "purchased" => false, "descriptionKey" => "SpeedPotion"],
        ["name" => "magicResistancePotion", "baseCost" => 200, "cost" => 200, "icon" => "assets/textures/magic-resistance-potion-icon.png", "unlocksAbility" => "MagicResistance", "duration" => 60000, "cooldown" => 300000, "purchased" => false, "descriptionKey" => "MagicResistancePotion"],
        ["name" => "teleportationPotion", "baseCost" => 300, "cost" => 300, "icon" => "assets/textures/teleportation-potion-icon.png", "unlocksAbility" => "Teleport", "duration" => 1000, "cooldown" => 300000, "purchased" => false, "descriptionKey" => "TeleportationPotion"],
        ["name" => "invisibilityPotion", "baseCost" => 400, "cost" => 400, "icon" => "assets/textures/invisibility-potion-icon.png", "unlocksAbility" => "Invisibility", "duration" => 60000, "cooldown" => 300000, "purchased" => false, "descriptionKey" => "InvisibilityPotion"],
        ["name" => "berserkPotion", "baseCost" => 500, "cost" => 500, "icon" => "assets/textures/berserk-potion-icon.png", "unlocksAbility" => "Berserk", "duration" => 60000, "cooldown" => 300000, "purchased" => false, "descriptionKey" => "BerserkPotion"],
        ["name" => "healingPotion", "baseCost" => 600, "cost" => 600, "icon" => "assets/textures/healing-potion-icon.png", "unlocksAbility" => "Healing", "duration" => 60000, "cooldown" => 60000, "purchased" => false, "descriptionKey" => "HealingPotion"],
        ["name" => "poisonPotion", "baseCost" => 600, "cost" => 600, "icon" => "assets/textures/poison-icon.png", "unlocksAbility" => "poison", "duration" => 75000, "cooldown" => 40000, "purchased" => false, "descriptionKey" => "PoisonPotion"],
        ["name" => "shieldmagicPotion", "baseCost" => 600, "cost" => 600, "icon" => "assets/textures/shieldmagic-icon.png", "unlocksAbility" => "shield", "duration" => 1000, "cooldown" => 35000, "purchased" => false, "descriptionKey" => "ShieldmagicPotion"],
        ["name" => "secondlife", "baseCost" => 600, "cost" => 600, "icon" => "assets/textures/second-life-icon.png", "unlocksAbility" => "Secondlife", "duration" => 1000, "cooldown" => 35000, "purchased" => false, "descriptionKey" => "Secondlife"]
    ], JSON_UNESCAPED_SLASHES);

    $stmt = $conn->prepare("SELECT id FROM users WHERE login_key = ?");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("s", $loginKey);

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        // Пользователь с таким login_key не найден, создаем новый аккаунт
        $stmt = $conn->prepare("INSERT INTO users (username, login_key, improvements, potions, active_abilities, cooldown_timers, timers) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param("sssssss", $username, $loginKey, $improvementsdefault, $potionsdefault, $defaults, $defaults, $defaults);

        if (!$stmt->execute()) {
            throw new Exception('Failed to create guest: ' . $stmt->error);
        }

        echo json_encode(['login_key' => $loginKey, 'username' => $username]);
    } else {
        echo json_encode(['login_key' => $loginKey, 'username' => $username]); // Или другие данные пользователя
    }

    $stmt->close();
    $conn->close();
}

function generateGuestUsername($conn)
{
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

function handleSaveGame($conn, $data)
{
    if (empty($data['login_key'])) {
        throw new Exception('Missing login key');
    }

    $fieldMapping = [
        'improvements' => 'improvements',
        'potions' => 'potions',
        'clickBonus' => 'click_bonus',
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
    $conn->close();
}

function handleLoadGame($conn, $data)
{
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

    // Декодируем JSON-поля
    $jsonFields = ['improvements', 'potions', 'active_abilities', 'cooldown_timers', 'timers'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field])) {
            $row[$field] = json_decode($row[$field], true);
        }
    }

    $reverseMapping = array_flip([
        'improvements' => 'improvements',
        'potions' => 'potions',
        'click_bonus' => 'clickBonus',
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
    $conn->close();
}

function changeprofile($conn, $data)
{
    // Проверка наличия логин-ключа
    if (empty($data['login_key'])) {
        throw new Exception('Missing login key');
    }

    $loginKey = $data['login_key'];
    $newUsername = isset($data['username']) ? trim($data['username']) : null;
    $newDescription = isset($data['description']) ? trim($data['description']) : null;
    $avatarFile = isset($_FILES['avatar']) ? $_FILES['avatar'] : null;

    // Если нет нового имени и реального файла (либо файл не передан, либо UPLOAD_ERR_NO_FILE)
    if (empty($newUsername) && empty($newDescription) && (!$avatarFile || $avatarFile['error'] === UPLOAD_ERR_NO_FILE)) {
        throw new Exception('Nothing to update');
    }

    // Получаем ID пользователя по loginkey
    $stmt = $conn->prepare("SELECT id FROM users WHERE login_key = ?");
    $stmt->bind_param("s", $loginKey);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        throw new Exception('User not found');
    }

    $userId = $user['id'];

    // Обновление имени пользователя
    if (!empty($newUsername)) {
        $stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
        $stmt->bind_param("si", $newUsername, $userId);
        $stmt->execute();
    }

    if (!empty($newDescription)) {
        $stmt = $conn->prepare("UPDATE users SET description_profile = ? WHERE id = ?");
        $stmt->bind_param("si", $newDescription, $userId);
        $stmt->execute();
    }

    // Обработка аватарки
    if ($avatarFile && $avatarFile['error'] === UPLOAD_ERR_OK) {
        // Проверка типа файла
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = finfo_file($fileInfo, $avatarFile['tmp_name']);

        if (!in_array($detectedType, $allowedTypes)) {
            http_response_code(404);
            throw new Exception('Invalid file type');
        }

        // Определение расширения
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif'
        ];
        $extension = $extensions[$detectedType];

        // Путь для сохранения
        $avatarDir = 'assets/textures/public/uploads/';
        $newFilename = $userId . '.' . $extension;
        $destination = $avatarDir . $newFilename;

        // Удаление старого аватара (если он есть)
        $oldAvatar = $avatarDir . $userId . ".*"; // Шаблон для поиска старых файлов
        $files = glob($oldAvatar); // Получаем список файлов, соответствующих шаблону

        if (!empty($files)) {
            foreach ($files as $file) {
                if (file_exists($file)) {
                    unlink($file); // Удаляем каждый найденный файл
                }
            }
        }

        // Перемещение файла
        if (!move_uploaded_file($avatarFile['tmp_name'], $destination)) {
            throw new Exception('Failed to save avatar');
        }

        // Обновление пути в БД
        $stmt = $conn->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt->bind_param("si", $destination, $userId);
        $stmt->execute();
    }

    $conn->close();
}

function loadProfile($conn)
{
    $loginKey = $_POST['login_key'] ?? '';

    if (empty($loginKey)) {
        echo json_encode(['error' => 'Missing login key']);
        return;
    }

    try {
        // Подготавливаем запрос
        $stmt = $conn->prepare("
            SELECT id, username, avatar, description_profile
            FROM users 
            WHERE login_key = ? 
            LIMIT 1
        ");

        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        // Привязываем параметры
        $stmt->bind_param('s', $loginKey);

        // Выполняем запрос
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        // Получаем результат
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user) {
            echo json_encode([
                'id' => $user['id'],
                'username' => $user['username'],
                'avatar' => $user['avatar'],
                'description' => $user['description_profile']
            ]);
        } else {
            echo json_encode(['error' => 'User not found']);
        }

        $stmt->close();

    } catch (Exception $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['error' => 'Database error']);
    } finally {
        $conn->close();
    }
}

function getAvatar($conn, $data) {
    $loginkey = $data['loginkey'];

    // Находим путь к аватару
    $stmt = $conn->prepare("SELECT avatar FROM users WHERE loginkey = ?");
    $stmt->bind_param("s", $loginkey);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $avatarPath = $row['avatar'];

        if (file_exists($avatarPath)) {
            // Читаем файл и отправляем его содержимое в формате Base64
            $avatarData = base64_encode(file_get_contents($avatarPath));
            echo json_encode(['status' => 'success', 'avatar' => $avatarData]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Avatar not found']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
    }

    $stmt->close();
}

?>
