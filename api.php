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
    "db"   => "kliacust_pekemamy",
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
    $yearFilter = isset($_GET['year']) ? $_GET['year'] : '';

    $yearCond = "";
    $vYearCond = "";
    $whereAndYear = "";

    if ($yearFilter && $yearFilter !== 'Semua') {
        $y = intval($yearFilter);
        $yearCond = "WHERE YEAR(created_at) = $y";
        $vYearCond = "WHERE YEAR(v.created_at) = $y";
        $whereAndYear = "AND YEAR(v.created_at) = $y";
    }

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
            $stmt = $conn->query("SELECT COUNT(*) as totalVehicles, IFNULL(SUM(duty_rm), 0) as taxExact FROM vehicle_inventory $yearCond");
            $res = $stmt->fetch();
            $compQuery = "SELECT COUNT(DISTINCT gbpekema_id) FROM vehicle_inventory " . ($yearCond ? "$yearCond AND gbpekema_id IS NOT NULL" : "WHERE gbpekema_id IS NOT NULL");
            $compCount = $conn->query($compQuery)->fetchColumn();
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
            $stmt = $conn->query("SELECT v.lot_number as lot, IFNULL(g.nama, 'Tiada Syarikat') as company, v.chassis_number as chassis, v.color, DATE_FORMAT(v.`bond-in_date`, '%d/%m/%Y') as date, v.vehicle_model as model FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id $vYearCond ORDER BY v.created_at DESC LIMIT 100");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_dominance_data':
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as name, COUNT(*) as value FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id $vYearCond GROUP BY v.gbpekema_id ORDER BY value DESC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_activity_log':
            $stmt = $conn->query("SELECT v.id, v.lot_number as vehicle, IFNULL(g.nama, 'Tiada Syarikat') as company, DATE_FORMAT(v.created_at, '%H:%i') as time, DATE_FORMAT(v.created_at, '%d/%m/%Y') as date FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id $vYearCond ORDER BY v.created_at DESC LIMIT 10");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_aging_data':
            $stmt = $conn->query("SELECT v.lot_number as lot, IFNULL(g.nama, 'Tiada Syarikat') as company, v.`bond-in_date` as bond_in_date, DATEDIFF(CURDATE(), v.`bond-in_date`) as days FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id WHERE v.`bond-in_date` IS NOT NULL $whereAndYear ORDER BY days DESC");
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
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as name, IFNULL(g.negeri, '-') as negeri, SUM(v.duty_rm) as tax, COUNT(*) as units FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id $vYearCond GROUP BY v.gbpekema_id ORDER BY tax DESC");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_network_analysis':
            $sql = "SELECT g.nama AS company, v.vehicle_model AS model, COUNT(v.id) AS value, SUM(v.duty_rm) as total_tax
                    FROM vehicle_inventory v
                    LEFT JOIN gbpekema g ON v.gbpekema_id = g.id
                    $vYearCond " . ($vYearCond ? " AND " : " WHERE ") . " v.vehicle_model IS NOT NULL AND v.vehicle_model != '' 
                    GROUP BY g.nama, v.vehicle_model";
            $stmt = $conn->query($sql);
            $records = $stmt->fetchAll();
            
            $links = [];
            $nodes = [];
            $node_ids = [];
            
            foreach ($records as $row) {
                $comp = $row['company'] ?? 'Syarikat Tidak Diketahui';
                $model = $row['model'];
                $val = (int)$row['value'];
                $tax = (float)$row['total_tax'];
                
                if (!isset($node_ids[$comp])) {
                    $nodes[] = ['id' => $comp, 'group' => 'company', 'size' => 0, 'tax' => 0];
                    $node_ids[$comp] = count($nodes) - 1;
                }
                if (!isset($node_ids[$model])) {
                    $nodes[] = ['id' => $model, 'group' => 'model', 'size' => 0, 'tax' => 0];
                    $node_ids[$model] = count($nodes) - 1;
                }
                
                $nodes[$node_ids[$comp]]['size'] += $val;
                $nodes[$node_ids[$comp]]['tax'] += $tax;
                $nodes[$node_ids[$model]]['size'] += $val;
                
                $links[] = [
                    'source' => $comp,
                    'target' => $model,
                    'value' => $val,
                    'tax' => $tax
                ];
            }
            echo json_encode(['nodes' => $nodes, 'links' => $links]);
            break;

        case 'get_smart_analysis':
            // Analisa pintar: sentiasa analisa SEMUA data tanpa filter tahun
            $stmt = $conn->query("SELECT ROUND(AVG(DATEDIFF(CURDATE(), COALESCE(v.`bond-in_date`, v.import_date)))) as avg_days, SUM(CASE WHEN DATEDIFF(CURDATE(), COALESCE(v.`bond-in_date`, v.import_date)) > 90 THEN 1 ELSE 0 END) as over_90_days, MIN(DATEDIFF(CURDATE(), COALESCE(v.`bond-in_date`, v.import_date))) as min_days, MAX(DATEDIFF(CURDATE(), COALESCE(v.`bond-in_date`, v.import_date))) as max_days FROM vehicle_inventory v WHERE COALESCE(v.`bond-in_date`, v.import_date) IS NOT NULL");
            $aging = $stmt->fetch();
            
            $stmt = $conn->query("SELECT v.lot_number, v.ap, v.tarikh_luput, IFNULL(g.nama, 'Tiada Syarikat') as company FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id WHERE v.tarikh_luput IS NOT NULL AND v.tarikh_luput <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY v.tarikh_luput ASC LIMIT 10");
            $ap_warnings = $stmt->fetchAll();
            $ap_count_stmt = $conn->query("SELECT COUNT(*) FROM vehicle_inventory v WHERE v.tarikh_luput IS NOT NULL AND v.tarikh_luput <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)");
            $ap_critical_count = $ap_count_stmt->fetchColumn();

            $stmt = $conn->query("SELECT SUM(v.duty_rm) as total_tax, ROUND(AVG(v.duty_rm)) as avg_tax, MAX(v.duty_rm) as max_tax, SUM(v.duti_import) as total_import, SUM(v.duti_eksais) as total_eksais, SUM(v.cukai_jualan) as total_jualan FROM vehicle_inventory v WHERE v.duty_rm IS NOT NULL AND v.duty_rm > 0");
            $tax = $stmt->fetch();
            
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as top_company, SUM(v.duty_rm) as top_tax FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id WHERE v.duty_rm IS NOT NULL AND v.duty_rm > 0 GROUP BY v.gbpekema_id ORDER BY top_tax DESC LIMIT 1");
            $top_comp = $stmt->fetch();

            // Model popularity ranking (Top 5)
            $stmt = $conn->query("SELECT v.vehicle_model as model, COUNT(*) as count FROM vehicle_inventory v WHERE v.vehicle_model IS NOT NULL AND v.vehicle_model != '' GROUP BY v.vehicle_model ORDER BY count DESC LIMIT 5");
            $top_models = $stmt->fetchAll();

            // Condition breakdown (New vs Used)
            $stmt = $conn->query("SELECT UPPER(IFNULL(v.condition_status,'USED')) as cond, COUNT(*) as count FROM vehicle_inventory v GROUP BY cond ORDER BY count DESC");
            $conditions = $stmt->fetchAll();

            // Monthly trend (last 12 months based on created_at)
            $stmt = $conn->query("SELECT DATE_FORMAT(v.created_at, '%Y-%m') as month, COUNT(*) as count FROM vehicle_inventory v WHERE v.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month ASC");
            $monthly_trend = $stmt->fetchAll();

            // Top 5 companies by vehicle count
            $stmt = $conn->query("SELECT IFNULL(g.nama, 'Tiada Syarikat') as company, COUNT(*) as count, IFNULL(SUM(v.duty_rm),0) as total_tax FROM vehicle_inventory v LEFT JOIN gbpekema g ON v.gbpekema_id = g.id GROUP BY v.gbpekema_id ORDER BY count DESC LIMIT 5");
            $top_companies = $stmt->fetchAll();

            // Engine CC distribution
            $stmt = $conn->query("SELECT CASE WHEN v.engine_cc <= 1500 THEN '≤1500cc' WHEN v.engine_cc <= 2000 THEN '1501-2000cc' WHEN v.engine_cc <= 3000 THEN '2001-3000cc' ELSE '>3000cc' END as bracket, COUNT(*) as count FROM vehicle_inventory v WHERE v.engine_cc IS NOT NULL GROUP BY bracket ORDER BY MIN(v.engine_cc)");
            $cc_distribution = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "aging" => [
                    "avg_days" => $aging['avg_days'] ?? 0,
                    "over_90_days" => $aging['over_90_days'] ?? 0,
                    "min_days" => $aging['min_days'] ?? 0,
                    "max_days" => $aging['max_days'] ?? 0
                ],
                "ap" => [
                    "critical_count" => $ap_critical_count ?? 0,
                    "warnings" => $ap_warnings ?: []
                ],
                "tax" => [
                    "total" => $tax['total_tax'] ?? 0,
                    "average" => $tax['avg_tax'] ?? 0,
                    "max" => $tax['max_tax'] ?? 0,
                    "top_company" => $top_comp['top_company'] ?? '-',
                    "top_company_tax" => $top_comp['top_tax'] ?? 0,
                    "total_import" => $tax['total_import'] ?? 0,
                    "total_eksais" => $tax['total_eksais'] ?? 0,
                    "total_jualan" => $tax['total_jualan'] ?? 0
                ],
                "top_models" => $top_models ?: [],
                "conditions" => $conditions ?: [],
                "monthly_trend" => $monthly_trend ?: [],
                "top_companies" => $top_companies ?: [],
                "cc_distribution" => $cc_distribution ?: []
            ]);
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
