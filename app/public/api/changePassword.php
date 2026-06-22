<?php
session_start();
include "cors.php";
include "databaseAccess.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nur POST-Anfragen erlaubt"
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

$currentPassword = $_POST["currentPassword"] ?? "";
$newPassword = $_POST["newPassword"] ?? "";
$newPasswordConfirm = $_POST["newPasswordConfirm"] ?? "";

$errors = [];

if($currentPassword === ""){
    $errors[] = "Bitte geben Sie Ihr aktuelles Passwort ein.";
}

if($newPassword === "" || strlen($newPassword) < 8){
    $errors[] = "Das neue Passwort muss mindestens 8 Zeichen lang sein.";
} elseif (!preg_match('/[A-Z]/', $newPassword)) {
    $errors[] = "Das neue Passwort muss mindestens einen Großbuchstaben enthalten.";
} elseif (!preg_match('/[0-9]/', $newPassword)) {
    $errors[] = "Das neue Passwort muss mindestens eine Zahl enthalten.";
} elseif (!preg_match('/[\W_]/', $newPassword)) {
    $errors[] = "Das neue Passwort muss mindestens ein Sonderzeichen enthalten.";
}

if($newPassword !== $newPasswordConfirm){
    $errors[] = "Die neuen Passwörter stimmen nicht überein.";
}

if(!empty($errors)){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "errors" => $errors
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");

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
$stmt->bind_result($db_password);

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

if(!password_verify($currentPassword, $db_password)){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "errors" => ["Das aktuelle Passwort ist falsch."]
    ]);
    exit;
}

$newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("si", $newPasswordHash, $_SESSION["user_id"]);

if(!$stmt->execute()){
    $stmt->close();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Passwort konnte nicht geändert werden"
    ]);
    exit;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "message" => "Passwort erfolgreich geändert"
]);
