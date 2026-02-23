<?php
/**
 * GBPekema Command Center Backend API - Perbaikan SSL/CORS & Database
 */

ob_start();

// 1. Konfigurasi CORS Paling Terbuka (Penting untuk Vercel -> kliacustoms.net)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400");

// Tangani permintaan pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_level() > 0) ob_end_clean();
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// 2. Konfigurasi Pangkalan Data
$db_config = [
    "host" => "localhost",
    "db"   => "kliacust_gudang",
    "user" => "kliacust_iris",
    "pass" => "Iris6102009@#" 
];

function connectDB($config) {
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
        return new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);
    } catch (PDOException $e) {
        throw new Exception("Gagal sambung ke DB: " . $e->getMessage());
    }
}

try {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // Action: test / ping (Tanpa perlu DB sambung)
    if ($action === 'ping' || $action === 'test') {
        $db_status = "Offline";
        try {
            $conn = connectDB($db_config);
            $db_status = "Online";
        } catch (Exception $e) { $db_status = "Ralat DB: " . $e->getMessage(); }

        if (ob_get_level() > 0) ob_clean();
        echo json_encode([
            "status" => "success",
            "message" => "API is Active",
            "database" => $db_status,
            "server_time" => date('Y-m-d H:i:s'),
            "note" => "Jika anda melihat ini, sambungan API anda sudah sah."
        ]);
        exit;
    }

    $conn = connectDB($db_config);

    switch($action) {
        case 'setup_database':
            $sql = "CREATE TABLE IF NOT EXISTS vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lot_no VARCHAR(50) NOT NULL UNIQUE,
                company_name VARCHAR(255) NOT NULL,
                chassis_no VARCHAR(100) NOT NULL,
                engine_no VARCHAR(100),
                model_desc TEXT,
                color VARCHAR(50),
                capacity VARCHAR(50),
                kw VARCHAR(50),
                year_made VARCHAR(10),
                k8_no VARCHAR(100),
                k1_no VARCHAR(100),
                ap_no VARCHAR(100),
                bond_in_date DATE,
                total_tax DECIMAL(15,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
            CREATE TABLE IF NOT EXISTS whitelist_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE
            ) ENGINE=InnoDB;";
            $conn->exec($sql);
            echo json_encode(["status" => "success", "message" => "Jadual sedia digunakan."]);
            break;

        case 'debug_database':
            $stmt = $conn->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $report = [];
            foreach($tables as $table) {
                $stmt = $conn->query("DESCRIBE $table");
                $report[$table] = $stmt->fetchAll();
            }
            echo json_encode(["status" => "success", "report" => $report]);
            break;

        case 'get_summary_stats':
            $stmt = $conn->query("SELECT COUNT(*) as totalVehicles, IFNULL(SUM(duty_rm), 0) as taxExact FROM vehicle_inventory");
            $res = $stmt->fetch();
            $compCount = $conn->query("SELECT COUNT(DISTINCT gbpekema_id) FROM vehicle_inventory WHERE gbpekema_id IS NOT NULL")->fetchColumn();
            echo json_encode([
                "status" => "success",
                "totalVehicles" => number_format((int)$res['totalVehicles']),
                "activeUnits" => number_format((int)$res['totalVehicles']),
                "companies" => (int)$compCount,
                "taxAmount" => "RM " . number_format((float)$res['taxExact'] / 1000000, 1) . "M",
                "taxExact" => "RM " . number_format((float)$res['taxExact'], 2)
            ]);
            break;

        case 'get_vehicles':
            $stmt = $conn->query("SELECT v.lot_number as lot, IFNULL(g.nama, 'Tiada Syarikat') as company, v.chassis_number as chassis, v.color, DATE_FORMAT(v.`bond-in_date`, '%d/%m/%Y') as date, v.vehicle_model as model FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id ORDER BY v.created_at DESC LIMIT 100");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_dominance_data':
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as name, COUNT(*) as value FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id GROUP BY v.gbpekema_id ORDER BY value DESC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_activity_log':
            $stmt = $conn->query("SELECT v.id, v.lot_number as vehicle, IFNULL(g.nama, 'Tiada Syarikat') as company, DATE_FORMAT(v.created_at, '%H:%i') as time, DATE_FORMAT(v.created_at, '%d/%m/%Y') as date FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id ORDER BY v.created_at DESC LIMIT 10");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_aging_data':
            $stmt = $conn->query("SELECT v.lot_number as lot, IFNULL(g.nama, 'Tiada Syarikat') as company, v.`bond-in_date` as bond_in_date, DATEDIFF(CURDATE(), v.`bond-in_date`) as days FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id WHERE v.`bond-in_date` IS NOT NULL ORDER BY days DESC");
            $records = $stmt->fetchAll();
            $summary = [
                ['range' => '< 1 Bulan', 'total' => 0],
                ['range' => '1-3 Bulan', 'total' => 0],
                ['range' => '> 3 Bulan', 'total' => 0]
            ];
            $formattedRecords = [];
            foreach ($records as $r) {
                $days = (int)$r['days'];
                if ($days < 30) $summary[0]['total']++;
                elseif ($days <= 90) $summary[1]['total']++;
                else $summary[2]['total']++;
                $months = floor($days / 30);
                $duration = $months > 0 ? "$months Bulan" : "$days Hari";
                $formattedRecords[] = [
                    'lot' => $r['lot'],
                    'company' => $r['company'],
                    'duration' => $duration
                ];
            }
            echo json_encode(["summary" => $summary, "records" => $formattedRecords]);
            break;

        case 'get_tax_analysis':
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as name, SUM(v.duty_rm) as tax, COUNT(*) as units FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id GROUP BY v.gbpekema_id ORDER BY tax DESC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_whitelist':
            try {
                $stmt = $conn->query("SELECT email FROM whitelist_users");
                echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
            } catch (Exception $e) { echo json_encode([]); }
            break;

        case 'add_to_whitelist':
            $email = isset($_GET['email']) ? $_GET['email'] : '';
            if ($email) {
                try {
                    $stmt = $conn->prepare("INSERT IGNORE INTO whitelist_users (email) VALUES (:email)");
                    $stmt->execute(['email' => $email]);
                } catch(Exception $e) {}
            }
            echo json_encode(["status" => "success"]);
            break;

        case 'remove_from_whitelist':
            $email = isset($_GET['email']) ? $_GET['email'] : '';
            if ($email) {
                try {
                    $stmt = $conn->prepare("DELETE FROM whitelist_users WHERE email = :email");
                    $stmt->execute(['email' => $email]);
                } catch(Exception $e) {}
            }
            echo json_encode(["status" => "success"]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Action '$action' tidak sah."]);
            break;
    }

} catch (Exception $e) {
    if (ob_get_level() > 0) ob_clean();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

if (ob_get_level() > 0) ob_end_flush();
?>
