<?php
session_start();
include "cors.php";
include "databaseAccess.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Nur POST-Anfragen erlaubt"]);
    exit;
}

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || !isset($_SESSION["user_id"])){
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Bitte zuerst einloggen"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ungültige Daten"]);
    exit;
}

$user_id  = $_SESSION["user_id"];
$deckName = trim($data["name"] ?? "Mein Deck");
$cards    = $data["cards"] ?? [];
$deck_id  = isset($data["deck_id"]) ? (int)$data["deck_id"] : null;

if($deckName === "") $deckName = "Mein Deck";

if(!is_array($cards) || count($cards) === 0){
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ein Deck muss mindestens 1 Karte haben"]);
    exit;
}

if(count($cards) > 10){
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ein Deck darf maximal 10 Karten haben"]);
    exit;
}

// ── Update eines bestehenden Decks ────────────────────────────────────────
if($deck_id !== null){
    // Sicherstellen dass das Deck dem User gehört
    $stmt = $conn->prepare("SELECT id FROM deck WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $deck_id, $user_id);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows === 0){
        $stmt->close();
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Deck nicht gefunden oder kein Zugriff"]);
        exit;
    }
    $stmt->close();

    $stmt = $conn->prepare("UPDATE deck SET name = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $deckName, $deck_id, $user_id);
    $stmt->execute();
    $stmt->close();

// ── Neues Deck anlegen (max. 3) ────────────────────────────────────────────
}else{
    $stmt = $conn->prepare("SELECT COUNT(*) FROM deck WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($deckCount);
    $stmt->fetch();
    $stmt->close();

    if($deckCount >= 3){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Maximal 3 Decks erlaubt. Bitte ein bestehendes Deck überschreiben."]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO deck(name, user_id) VALUES(?, ?)");
    $stmt->bind_param("si", $deckName, $user_id);
    $stmt->execute();
    $deck_id = $conn->insert_id;
    $stmt->close();
}

// ── Alte Karten löschen und neue einfügen ─────────────────────────────────
$stmt = $conn->prepare("DELETE FROM deck_cards WHERE deck_id = ?");
$stmt->bind_param("i", $deck_id);
$stmt->execute();
$stmt->close();

foreach($cards as $card){
    $name = trim($card["name"] ?? "");
    $hp   = $card["hp"]  ?? null;
    $atk  = $card["atk"] ?? null;

    if($name === "" || $hp === null || $atk === null){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Jede Karte braucht name, hp und atk"]);
        exit;
    }

    // Karte in card-Tabelle suchen oder anlegen
    $stmt = $conn->prepare("SELECT id FROM card WHERE name = ? LIMIT 1");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows > 0){
        $stmt->bind_result($card_id);
        $stmt->fetch();
        $stmt->close();
    }else{
        $stmt->close();
        $stmt = $conn->prepare("INSERT INTO card(name, hp, atk) VALUES(?, ?, ?)");
        $stmt->bind_param("sii", $name, $hp, $atk);
        $stmt->execute();
        $card_id = $conn->insert_id;
        $stmt->close();
    }

    $stmt = $conn->prepare("INSERT INTO deck_cards(deck_id, card_id) VALUES(?, ?)");
    $stmt->bind_param("ii", $deck_id, $card_id);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(["success" => true, "message" => "Deck gespeichert", "deck_id" => $deck_id]);
