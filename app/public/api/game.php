<?php

session_start();

include "cors.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Nur POST Anfragen erlaubt"    
    ]);
    exit;
}

$action = $_POST["action"] ?? "";

function sendResponse($data){
    http_response_code(200);

    echo json_encode($data);
    exit;

}

function shuffleCards($cards){
    $shuffled = $cards;

    for($i = count($shuffled) -1 ; $i > 0 ; $i-- ){

        $j= random_int(0, $i);

        $temp= $shuffled[$i];
        $shuffled[$i] = $shuffled[$j];
        $shuffled[$j] = $temp;

    }
    return $shuffled; 
}

function resetTurnLimit(&$game, $player){

    $game["players"][$player]["drawsThisTurn"] = 0;
    $game["players"][$player]["playsThisTurn"] = 0;
}

function drawCardForPlayer(&$game, $player){

    if($game["players"][$player]["drawsThisTurn"] >= 2){
        return "limit";
    }

    if(count($game["players"][$player]["deck"]) === 0)
        {
            return "empty";
        }

        $card = array_shift($game["players"][$player]["deck"]);
        $game["players"][$player]["hand"][] = $card;
        $game["players"][$player]["drawsThisTurn"]++;

        return "ok";
}

function playCardForPlayer(&$game, $player, $cardIndex){

    if($game["players"][$player]["playsThisTurn"] >= 2){
        return "limit";
    }

    if(!isset($game["players"][$player]["hand"][$cardIndex])){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Karte existiert nicht"
        ]);
        exit;

    }

    $card = $game["players"][$player]["hand"][$cardIndex];
    array_splice($game ["players"][$player]["hand"], $cardIndex, 1);
    $game["players"] [$player]["field"][] = $card;
    $game["players"][$player]["playsThisTurn"]++;
}

function makeComputerTurn(&$game){
    $player = "2";

    resetTurnLimit($game, $player);

    for($i = 0; $i < 2; $i++){

        $drawResult = drawCardForPlayer($game, $player);

        if($drawResult !== "ok"){
            break;
        }
    }

    $cardsToPlay = random_int(1,2);

    for($i = 0; $i < $cardsToPlay; $i++){
        if(count($game["players"][$player]["hand"]) === 0){
            break;
        }

        $randomCardIndex = random_int(0, count($game["players"][$player]["hand"]) -1 );
        $playResult = playCardForPlayer($game, $player, $randomCardIndex);

        if($playResult !== "ok"){
            break;
        }
    }

    $game["activePlayer"] = 1;
    resetTurnLimit($game, "1");

}

function getGame(){

    if(!isset($_SESSION["duel_game"])){

        http_response_code(404);
        echo json_encode([
        "success" => false,
        "message" => "Kein aktives Duell gefunden"
        ]);
        exit;
    }

    return $_SESSION["duel_game"];
}

if($action === "createGame") {

    $mode = $_POST["mode"] ?? "";
    $deckJson = $_POST["deck"] ?? "";

    if(isset($_POST["deckSize"])){
        $deckSize = intval($_POST["deckSize"]);
    }else {
        $deckSize = 3;
    }

    if($mode !== "player" && $mode !== "computer")
        {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Ungültiger Spielmodus"
            ]);
            exit;
        }

    $cards = json_decode($deckJson, true);

    if(!$cards || count ($cards) === 0){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Deck ist leer"
        ]);
        exit;
    } 

    $deck1 = shuffleCards($cards);
    $deck2 = shuffleCards($cards);

    $game = [
        "gameId" => bin2hex(random_bytes(8)),
        "mode" => $mode,
        "activePlayer" => 1,
        "players" => ["1" =>
        [
            "deck" => array_slice($deck1, $deckSize),
            "hand" => array_slice($deck1, 0 , $deckSize),
            "field" => [],
            "grave" => [],
            "drawsThisTurn" => 0,
            "playsThisTurn" => 0
        ],
        "2" =>
        [
            "deck" => array_slice($deck2, $deckSize),
            "hand" => array_slice($deck2, 0 , $deckSize),
            "field" => [],
            "grave" => [],
            "drawsThisTurn" => 0,
            "playsThisTurn" => 0
        ]]
    ];

    $_SESSION["duel_game"] = $game;

    echo json_encode([
        "success" => true,
        "message" => "Duell erstellt",
        "game" => $game
    ]);
    exit;

}

if($action === "drawCard"){
    $game = getGame();
    $player = strval($game["activePlayer"]);

    if($game["mode"] === "computer" && $player === "2"){
        
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Computer zieht selbst"
        ]);
        exit;
    }

    $drawResult = drawCardForPlayer($game, $player);

    if($drawResult === "limit"){
       
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Man darf max 2 Karten pro Runde ziehen"
        ]);
        exit;
    }

    if($drawResult === "empty"){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Der Stapel ist leer"
        ]);
        exit;
    }

    $_SESSION["duel_game"] = $game;

    echo json_encode([
        "success" => true,
        "message" => "Karte gezogen",
        "game" => $game
    ]);
    exit;

} 

if($action === "playCard"){

    $game = getGame();

    $player = strval($game["activePlayer"]);

    if(isset($_POST["cardIndex"])){
        $cardIndex = intval($_POST["cardIndex"]);
    }
    else{

        $cardIndex = -1;
    }

    if($game["mode"] === "computer" && $player === "2" ){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Der Computer spielt"
        ]);
        exit;
    }

    $playResult = playCardForPlayer($game, $player, $cardIndex);

    if($playResult === "limit"){
        
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Du darfst max 2 Karten pro runde spielen"
        ]);
        exit;
    }


    $_SESSION["duel_game"] = $game;

    echo json_encode([
        "success" => true,
        "message" => "Karte gespielt",
        "game" => $game
    ]);
    exit;

}

if($action === "endTurn"){

    $game = getGame();

    if($game["mode"] === "computer" && intval($game["activePlayer"]) === 1){

        $game["activePlayer"] = 2;

        makeComputerTurn($game);

    }else{

        if(intval($game["activePlayer"]) === 1){
            $game["activePlayer"] = 2;
        }else{
            $game["activePlayer"] = 1;
        }

        resetTurnLimit($game, strval($game["activePlayer"]));
    }

    $_SESSION["duel_game"] = $game;

    echo json_encode([
        "success" => true,
        "message" => "Zug beendet",
        "game" => $game
    ]);
    exit;

}

if($action === "leaveGame") {

    unset($_SESSION["duel_game"]);

    echo json_encode([
        "success" => true,
        "message" => "Duell verlassen"
    ]);
    exit;
}


   




