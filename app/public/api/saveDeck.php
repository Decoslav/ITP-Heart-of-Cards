<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    exit;
}

include "databaseAccess.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nur POST-Anfragen erlaubt"
    ]);
    exit;
}

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || !isset($_SESSION["user_id"])){
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Bitte zuerst einloggen"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Ungültige Daten"
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];
$deckName = trim($data["name"] ?? "Mein Deck");
$cards = $data["cards"] ?? [];

if($deckName === ""){
    $deckName = "Mein Deck";
}

if(!is_array($cards)){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Karten müssen als Array gesendet werden"
    ]);
    exit;
}

if(count($cards) > 10){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Ein Deck darf maximal 10 Karten haben"
    ]);
    exit;
}

if(count($cards) === 0){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Ein Deck muss mindestens 1 Karte haben"
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM deck WHERE user_id = ? LIMIT 1");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows > 0){
    $stmt->bind_result($deck_id);
    $stmt->fetch();
    $stmt->close();

    $stmt-> $conn->prepare("UPDATE deck SET name= ? WHERE id= ? AND user_id = ?");
    $stmt->bind_param("sii", $deckName, $deck_id, $user_id);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM deck_cards WHERE deck_id = ?");
    $stmt->bind_param("i", $deck_id,);
    $stmt->execute();
    $stmt->close();
   
}else{
    $stmt->close();
    $stmt = $conn->prepare("INSERT INTO deck(name, user_id) VALUES(?,?)");
    $stmt->bind_param("si", $deckName, $user_id);
    $stmt->execute();
    $deck_id = $conn->insert_id;
    $stmt->close();
}
    
foreach($cards as $card){
    $name = trim($card["name"] ?? "");
    $hp = $card["hp"] ?? null;
    $atk = $card["atk"] ?? null;

    if($name === "" || $hp === null || $atk === null){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Jede Karte braucht name, hp und atk"
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM card WHERE name =? LIMIT 1");
    $stmt ->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows > 0 ){
        $stmt->bind_result($card_id);
        $stmt->fetch();
        $stmt->close();
    }else{
        $stmt->close();

        $stmt  = $conn->prepare("INSERT INTO card(name, hp, atk) VALUES (?,?,?)");
        $stmt->bind_param("sii", $name, $hp, $atk);
        $stmt->execute();
        
        $card_id = $conn->insert_id;
        $stmt->close();
    }

    $stmt = $conn->prepare("INSERT INTO deck_cards(deck_id, card_id) VALUES(?,?)");
    $stmt->bind_param("ii", $deck_id, $card_id);
    $stmt->execute();
    $stmt->close();
}

echo json_encode([
    "success" => true, 
    "message" => "Deck gespeichert",
    "deck_id" => $deck_id
]);
