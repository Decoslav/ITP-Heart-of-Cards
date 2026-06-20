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
    resetAttackFlags($game, $player);
}

function getOpponent($player){
    
    if($player === "1"){
        return "2";
    }else{
        return "1";
    }
}

function stopIfGameOver($game){
    if(!empty($game["gameOver"])){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Das Duell ist bereits beendet"
        ]);
        exit;
    }
}

function checkWinner(&$game, $opponent, $activePlayer){

    if($game["players"][$opponent]["hp"] <= 0){
        $game["players"][ $opponent]["hp"] = 0;
        $game["winner"] = $activePlayer;
        $game["gameOver"] = true; 
    }
}

function resetAttackFlags(&$game, $player){
    
    foreach($game["players"][$player]["field"] as &$card){
        $card["hasAttacked"]= false;
    }
    unset($card);
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

function playCardForPlayer(&$game, $player, $cardIndex, $targetIndex = null){

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

    if(($card["type"] ?? "") === "spell"){
        resolveSpellCard($game, $player, $card, $targetIndex);

        array_splice($game["players"][$player]["hand"], $cardIndex, 1);
        $game["players"] [$player]["grave"][] = $card;
        $game["players"][$player]["playsThisTurn"]++;

        return "ok";
    }

    array_splice($game["players"][$player]["hand"], $cardIndex, 1);
    $game["players"] [$player]["field"][] = $card;
    $game["players"][$player]["playsThisTurn"]++;

    return "ok";
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

    makeComputerAttack($game);
    $game["activePlayer"] = 1;
    resetTurnLimit($game, "1");

}

function makeComputerAttack(&$game){

$player = "2";
$opponent = "1";
$attackers = [];

foreach($game["players"][$player]["field"] as $index => $card){

    if(($card["type"] ?? "") === "spell") continue;
    if(!empty($card["hasAttacked"])) continue;
    if(intval($card["atk"] ?? 0) <= 0) continue;

    $attackers[] = $index;
}

if(count($attackers) === 0){
    return;
}

shuffle($attackers);

foreach($attackers as $attackerIndex){

    if(!isset($game["players"][$player]["field"][$attackerIndex])) continue;

    $attacker = $game["players"][$player]["field"][$attackerIndex];
    $damage = intval($attacker["atk"] ?? 0);

    if(playerHasTankOnField($game, $opponent)){

        $tankTargets = [];

        foreach($game["players"][$opponent]["field"] as $targetIndex => $targetCard){
            if(isTankCard($targetCard)){
                $tankTargets[] = $targetIndex;
            }
        }

        if(count($tankTargets) === 0) continue;

        $targetIndex = $tankTargets[random_int(0, count($tankTargets) -1)];
        damageEnemyCard($game, $opponent, $targetIndex, $damage);
        $game["players"][$player]["field"][$attackerIndex]["hasAttacked"] = true;
        continue;

    }

    //Ohne Tank also wird zufällig der Spieler oder eine Karte angegriffen
    $canAttackCard = count($game["players"][$opponent]["field"]) > 0;
    $attackPlayerDirectly = !$canAttackCard || random_int(0,1) === 1;

    if($attackPlayerDirectly){

        $game["players"][$opponent]["hp"] = intval($game["players"][$opponent]["hp"] ?? 0 ) - $damage;

        checkWinner($game, $opponent, $player);

        $game["players"][$player]["field"][$attackerIndex]["hasAttacked"] = true;

        if(!empty($game["gameOver"])){
            return;
        }
    }else{
        $targetIndex = random_int(0, count($game["players"][$opponent]["field"]) -1 );
        damageEnemyCard($game, $opponent, $targetIndex, $damage);
        $game["players"][$player]["field"][$attackerIndex]["hasAttacked"] = true;
    }

}


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

function isTankCard($card){
    if(isset($card["type"]) && $card["type"] === "tank"){
        return true;
    }else{
        return false;
    }
}

function playerHasTankOnField($game, $player){
    foreach($game["players"][$player]["field"] as $card){
        if(isTankCard($card)){
            return true;
        }
    }
    return false;
}

function damageEnemyCard(&$game, $targetPlayer, $targetIndex, $damage){

    if(!isset($game["players"][$targetPlayer]["field"][$targetIndex])){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Zielkarte existiert nicht"
        ]);
        exit;
    }

    $game["players"][$targetPlayer]["field"][$targetIndex]["hp"] = intval($game["players"][$targetPlayer]["field"][$targetIndex]["hp"] ?? 0) - $damage;

    if($game["players"][$targetPlayer]["field"][$targetIndex]["hp"] <= 0){

        $destroyedCard = $game["players"][$targetPlayer]["field"][$targetIndex];
        array_splice($game["players"][$targetPlayer]["field"], $targetIndex, 1);
        $game["players"][$targetPlayer]["grave"][] = $destroyedCard;

    }

}

function healOwnField(&$game, $player, $amount){

    foreach($game["players"][$player]["field"]as &$card){
        if(($card["type"] ?? "") !== "spell"){
            $card["hp"] = intval($card["hp"] ?? 0) + $amount;
        }
    }
    unset($card);
}

function resolveSpellCard(&$game, $player, $card, $targetIndex = null){

    $opponent = getOpponent($player);
    $effect = $card["effect"] ?? "";
    $value = intval($card["atk"] ?? 0);

    if($effect === "heal_all"){
        healOwnField($game, $player, $value);
        return;
    }

    if($effect === "damage_single"){
        if($targetIndex === null){

            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Fireball braucht ein Ziel"
            ]);
            exit;
        }

        if(playerHasTankOnField($game, $opponent)){
            if(!isset($game["players"][$opponent]["field"][$targetIndex]) || !isTankCard($game["players"][$opponent]["field"][$targetIndex])){

                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Ein Tank liegt am Feld, greife diesen an"
                ]);
                exit;
            }
        }

        damageEnemyCard($game, $opponent, $targetIndex, $value);
        return;
    }

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Unbekannter Spell-Effekt"
    ]);
    exit;
}



if($action === "createGame") {

    $mode = $_POST["mode"] ?? "";
    
    if(isset($_POST["deck1"])){
        $deck1Json = $_POST["deck1"];
    }else{
        if(isset($_POST["deck"])){
            $deck1Json = $_POST["deck"];
        }else{
            $deck1Json = "";
        }
    }

    if(isset($_POST["deck2"])){
        $deck2Json = $_POST["deck2"];
    }else{
        $deck2Json = $deck1Json;
    }


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

    $cards1 = json_decode($deck1Json, true);
    $cards2 = json_decode($deck2Json, true);

    if(!$cards1 || count ($cards1) === 0){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Deck Spieler 1 ist leer"
        ]);
        exit;
    } 

    if(!$cards2 || count ($cards2) === 0){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Deck Spieler 2 ist leer"
        ]);
        exit;
    } 

    $deck1 = shuffleCards($cards1);
    $deck2 = shuffleCards($cards2);

    $game = [
        "gameId" => bin2hex(random_bytes(8)),
        "mode" => $mode,
        "activePlayer" => 1,
        "players" => ["1" =>
        [
            "hp" => 30,
            "deck" => array_slice($deck1, $deckSize),
            "hand" => array_slice($deck1, 0 , $deckSize),
            "field" => [],
            "grave" => [],
            "drawsThisTurn" => 0,
            "playsThisTurn" => 0
        ],
        "2" =>
        [
            "hp" => 30,
            "deck" => array_slice($deck2, $deckSize),
            "hand" => array_slice($deck2, 0 , $deckSize),
            "field" => [],
            "grave" => [],
            "drawsThisTurn" => 0,
            "playsThisTurn" => 0
        ]],
        
        "winner" => null,
        "gameOver" => false 

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
    stopIfGameOver($game);
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
    stopIfGameOver($game);

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

    $targetIndex = isset($_POST["targetIndex"]) ? intval($_POST["targetIndex"]) : null;
    $playResult = playCardForPlayer($game, $player, $cardIndex, $targetIndex);

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

if($action=== "attack"){

    $game = getGame();
    stopIfGameOver($game);

    $activePlayer = strval($game["activePlayer"]);
    $opponent = getOpponent($activePlayer);

    if($game["mode"] === "computer" && $activePlayer === "2"){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Der computer greift selbst an"
        ]);
        exit;
    }

    if(isset($_POST["attackerIndex"])){
        $attackerIndex = intval($_POST["attackerIndex"]);
    }else{
        $attackerIndex = -1;
    }

    if(isset($_POST["targetIndex"])){
        $targetIndex = intval($_POST["targetIndex"]);
    }else{
        $targetIndex = -1;
    }

    $targetType = $_POST["targetType"] ?? "";

    if(!isset($game["players"][$activePlayer]["field"][$attackerIndex])){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Angreifende Karte existiert nicht"
        ]);
        exit;
    }

    $attacker = $game["players"][$activePlayer]["field"][$attackerIndex];

    //ist falsch eine zauberkarte kann angreifen
    if(($attacker["type"] ?? "") === "spell"){

        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Zauberkarten können nicht angreifen"
        ]);
        exit;
    }

    if(!empty($attacker["hasAttacked"])){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Diese Karte hat in dieser Runde bereits angegriffen"
        ]);
        exit;
    }

    $damage = intval($attacker["atk"] ?? 0);

    if($damage <= 0){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Diese Karte hat keinen Angriffswert"
        ]);
        exit;
    }

    if(playerHasTankOnField($game, $opponent)){

        if($targetType !== "card") {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Wenn ein Tank am Feld ist muss dieser angegriffen werden"
            ]);
            exit;
        }

        if(!isset($game["players"][$opponent]["field"][$targetIndex]) || !isTankCard($game["players"][$opponent]["field"][$targetIndex])){
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Der Tank muss angegriffen werden"
            ]);
            exit;
        }
    }

    if($targetType === "card") {
        if(!isset($game["players"][$opponent]["field"][$targetIndex])){
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Zielkarte existiert nicth"
            ]);
            exit;
        }



        $game["players"][$opponent]["field"][$targetIndex]["hp"] = intval($game["players"][$opponent]["field"][$targetIndex]["hp"] ?? 0) - $damage;

        if($game["players"][$opponent]["field"][$targetIndex]["hp"] <= 0){

            $destroyedCard = $game["players"][$opponent]["field"][$targetIndex];
            array_splice($game["players"][$opponent]["field"], $targetIndex, 1);
            $game["players"][$opponent]["grave"][] = $destroyedCard;
        }

        $message = "Karte angegriffen";

    }else if($targetType === "player"){

        $game["players"][$opponent]["hp"] = intval($game["players"][$opponent]["hp"] ?? 0) - $damage;

        checkWinner($game, $opponent, $activePlayer);
        $message = "Spieler angegriffen";

    }else{
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Ungültiges angriffsziel"
        ]);
        exit;
    }

    $game["players"][$activePlayer]["field"][$attackerIndex]["hasAttacked"] = true;

    $_SESSION["duel_game"] = $game;

    echo json_encode([
        "success" => true,
        "message" => $message,
        "game" => $game
    ]);
    exit;

}

if($action === "endTurn"){

    $game = getGame();
    stopIfGameOver($game);

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


   




