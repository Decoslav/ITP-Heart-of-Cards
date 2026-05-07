<?php 
session_start();

header("Content-Type: application/json; charset=UTF-8");

include "databaseAccess.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nur POST-Anfragen erlaubt"
    ]);
    exit;
}

$username = isset($_POST["username"]) ? trim($_POST["username"]) : "";
$password = isset($_POST["password"]) ? $_POST["password"] : "";

if($username === "" || $password === ""){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Benutzername und Passwort sind erforderlich"
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE username = ?");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows === 0){
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Benutzername oder Passwort ist falsch"
    ]);
    exit;
}

$stmt->bind_result($db_id,$db_username, $db_password, $db_role);
$stmt->fetch();

if(!password_verify($password, $db_password)){
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Benutzername oder Passwort ist falsch"
    ]);
    exit;
}

$_SESSION["looggedin"] = true;
$_SESSION["username"] = $db_username;
$_SESSION["role"] = $db_role;
$_SESSION["user_id"] = $db_id;

$stmt->close();

echo json_encode([
    "success" => true,
    "message" => "Login erfolgreich",
    "user" => 
    [ "id" => $db_id,
    "username" => $db_username,
    "role" => $db_role]
]);
    