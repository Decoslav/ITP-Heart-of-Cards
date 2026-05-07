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

$email = trim($_POST["email"]?? "");
$username = trim($_POST["username"]?? "");
$password = $_POST["password"]?? "";
$password_confirm = $_POST["password_confirm"]?? "";

$errors = [];

if($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)){
    $errors[]= "Bitte geben Sie eine gültige E-Mail-Adresse ein";
}

if($username === ""){
    $errors[]= "Bitte geben Sie einen gültigen Benutzernamen ein.";
}

if($password === "" || strlen($password) < 8){
    $errors[] = "Das Passwort muss mindestens 8 Zeichen lang sein";
} elseif (!preg_match('/[A-Z]/', $password)) {
    $errors[] = 'Das Passwort muss mindestens einen Großbuchstaben enthalten.';
} elseif (!preg_match('/[0-9]/', $password)) {
    $errors[] = 'Das Passwort muss mindestens eine Zahl enthalten.';
} elseif (!preg_match('/[\W_]/', $password)) {
    $errors[] = 'Das Passwort muss mindestens ein Sonderzeichen enthalten.';
}

if($password !== $password_confirm){
    $errors[] = "Die Passwörter stimmen nicht überein";
}

if(!empty($errors)){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "errors" => $errors
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->bind_result($userExists);
$stmt->fetch();
$stmt->close();

if($userExists > 0){
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "errors" => ["Benutzername oder Email bereits vergeben"]
    ]);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users(email, username, password) VALUES(?,?,?)");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("sss", $email, $username, $passwordHash);

if(! $stmt->execute()) {
    $stmt->close();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Registrierung fehlgeschlagen"
    ]);
    exit;
}

$user_id = $conn->insert_id;

$stmt->close();

$_SESSION["loggedin"] = true;
$_SESSION["username"] = $username;
$_SESSION["user_id"] = $user_id;

echo json_encode([
    "success" => true, 
    "message" => "Registrierung erfolgreich",
    "user" => ["id" => $user_id,
    "email" => $email, "username" => $username]
]);
