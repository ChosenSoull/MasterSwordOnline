<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: https://gameswords.kesug.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Прямое указание параметров БД
$host = '';      // Хост БД
$dbname = '';      // Имя базы данных
$user = '';           // Пользователь БД
$pass = '';       // Пароль БД

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Создание гостевого аккаунта
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_guest') {
    $username = generateGuestUsername($conn);
    $login_key = bin2hex(random_bytes(32));
    
    $stmt = $conn->prepare("INSERT INTO users 
        (username, login_key, improvements, potions, active_abilities, cooldown_timers, timers)
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    // Начальные значения по умолчанию
    $defaults = json_encode([]);
    $stmt->bind_param("sssssss", 
        $username, 
        $login_key,
        $defaults,
        $defaults,
        $defaults,
        $defaults,
        $defaults
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'id' => $stmt->insert_id,
            'username' => $username,
            'login_key' => $login_key
        ]);
    } else {
        echo json_encode(['error' => 'Account creation failed']);
    }
    exit;
}

// Сохранение данных игры
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    $login_key = $data['login_key'];
    
    $stmt = $conn->prepare("UPDATE users SET
        improvements = ?,
        potions = ?,
        active_abilities = ?,
        cooldown_timers = ?,
        timers = ?,
        is_blocked = ?,
        block_start_time = ?,
        block_duration = ?,
        last_block_time = ?,
        block_level = ?,
        current_count = ?,
        max_hp = ?,
        player_base_damage = ?,
        player_armor = ?,
        player_block = ?,
        regeneration_amount = ?,
        dodge_chance = ?,
        player_vulnerability = ?
        WHERE login_key = ?");
    
    $stmt->bind_param("ssssssiiiiiiiiiiiiis", 
        json_encode($data['improvements']),
        json_encode($data['potions']),
        json_encode($data['activeAbilities']),
        json_encode($data['cooldownTimers']),
        json_encode($data['timers']),
        $data['isBlocked'],
        $data['blockStartTime'],
        $data['blockDuration'],
        $data['lastBlockTime'],
        $data['blockLevel'],
        $data['currentCount'],
        $data['maxHP'],
        $data['playerBaseDamage'],
        $data['playerArmor'],
        $data['playerBlock'],
        $data['regenerationAmount'],
        $data['dodgeChance'],
        $data['playerVulnerability'],
        $login_key
    );
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['error' => 'Save failed']);
    }
    exit;
}

// Загрузка данных игры
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'load') {
    $login_key = $_POST['login_key'];
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE login_key = ?");
    $stmt->bind_param("s", $login_key);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'improvements' => json_decode($row['improvements'], true),
            'potions' => json_decode($row['potions'], true),
            'activeAbilities' => json_decode($row['active_abilities'], true),
            'cooldownTimers' => json_decode($row['cooldown_timers'], true),
            'timers' => json_decode($row['timers'], true),
            'isBlocked' => $row['is_blocked'],
            'blockStartTime' => $row['block_start_time'],
            'blockDuration' => $row['block_duration'],
            'lastBlockTime' => $row['last_block_time'],
            'blockLevel' => $row['block_level'],
            'currentCount' => $row['current_count'],
            'maxHP' => $row['max_hp'],
            'playerBaseDamage' => $row['player_base_damage'],
            'playerArmor' => $row['player_armor'],
            'playerBlock' => $row['player_block'],
            'regenerationAmount' => $row['regeneration_amount'],
            'dodgeChance' => $row['dodge_chance'],
            'playerVulnerability' => $row['player_vulnerability']
        ]);
    } else {
        echo json_encode(['error' => 'User not found']);
    }
    exit;
}

function generateGuestUsername($conn) {
    $attempts = 0;
    do {
        $number = rand(1, 99999);
        $username = "guest" . str_pad($number, 5, '0', STR_PAD_LEFT);
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $attempts++;
    } while ($result->num_rows > 0 && $attempts < 10);
    
    return $username;
}
?>