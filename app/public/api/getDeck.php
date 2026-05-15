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

if($_SERVER["REQUEST_METHOD"] !== "GET"){
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nur GET-Anfragen erlaubt"
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

$user_id = $_SESSION["user_id"];

$stmt = $conn->prepare("SELECT id, name FROM deck WHERE user_id = ? LIMIT 1");

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

if($stmt->num_rows === 0){
    $stmt->close();

    echo json_encode([
        "success" => true, 
        "deck" => null
    ]);
    exit;
}

$stmt->bind_result($deck_id, $deckName);
$stmt->fetch();
$stmt->close();

$stmt = $conn->prepare(" SELECT card.id, card.name, card.hp, card.atk FROM deck_card
                        INNER JOIN card ON deck_cards.card_id = card.id WHERE deck_cards.deck_id = ?");

if(!$stmt){
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Datenbankfehler"
    ]);
    exit;
}

$stmt->bind_param("i", $deck_id);
$stmt->execute();
$result = $stmt->get_result();

$cards = [];

while($row = $result->fetch_assoc()){
    $cards[] = [
        "id" => $row["id"],
        "name" => $row["name"],
        "hp" => $row["hp"],
        "atk" => $row["atk"]
    ];
}

$stmt->close();

echo json_encode([
    "success" => true,
    "deck" => [
        "id" => $deck_id,
        "name" => $deckName,
        "cards" => $cards
    ]
]);