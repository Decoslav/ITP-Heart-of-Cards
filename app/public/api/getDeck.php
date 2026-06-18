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

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || !isset($_SESSION["user_id"])){
    
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "decks" => []
    ]);

    exit;
}

$user_id = $_SESSION["user_id"];

// ── Alle Decks des Users laden ─────────────────────────────────────────────
$stmt = $conn->prepare("SELECT id, name FROM deck WHERE user_id = ? ORDER BY id ASC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($deck_id, $deck_name);

$deckList = [];
while($stmt->fetch()){
    $deckList[] = ["id" => $deck_id, "name" => $deck_name];
}
$stmt->close();

if(empty($deckList)){
    echo json_encode([
        "success" => true,
        "decks" => []
    ]);
    exit;
}

// ── Karten für jedes Deck laden ────────────────────────────────────────────
$decks = [];

foreach($deckList as $deck){
    $did = $deck["id"];

    $stmt = $conn->prepare(
        "SELECT card.id, card.name, card.hp, card.atk
         FROM deck_cards
         INNER JOIN card ON deck_cards.card_id = card.id
         WHERE deck_cards.deck_id = ?"
    );
    $stmt->bind_param("i", $did);
    $stmt->execute();
    $stmt->bind_result($card_id, $card_name, $card_hp, $card_atk);

    $cards = [];
    while($stmt->fetch()){
        $cards[] = [
            "id"   => $card_id,
            "name" => $card_name,
            "hp"   => $card_hp,
            "atk"  => $card_atk,
        ];
    }
    $stmt->close();

    $decks[] = [
        "id"    => $did,
        "name"  => $deck["name"],
        "cards" => $cards,
    ];
}

echo json_encode([
    "success" => true,
    "decks" => $decks
]);
