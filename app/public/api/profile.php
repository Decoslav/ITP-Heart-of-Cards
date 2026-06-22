<?php
session_start();
include "cors.php";
include "databaseAccess.php";

if($_SERVER["REQUEST_METHOD"] !== "GET"){
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nur GET-Anfragen erlaubt"
    ]);
    exit;
}

if(!isset($_SESSION["loggedin"]) || !$_SESSION["loggedin"]){
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Nicht eingeloggt"
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("i", $_SESSION["user_id"]);
$stmt->execute();
$stmt->bind_result($db_id, $db_username, $db_email, $db_role, $db_created_at);

if(!$stmt->fetch()){
    $stmt->close();

    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Benutzer nicht gefunden"
    ]);
    exit;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $db_id,
        "username" => $db_username,
        "email" => $db_email,
        "role" => $db_role,
        "createdAt" => $db_created_at,
    ]
]);
