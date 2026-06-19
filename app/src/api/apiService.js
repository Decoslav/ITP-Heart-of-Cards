//const baseURL = "../public/api/";
const baseURL = "http://localhost/ITP-Heart-of-Cards/app/public/api/";

export async function login(username, password) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(baseURL+ "login.php",{
        method : "POST",
        body : formData,
        credentials : "include"
    });

    return response.json();
}

export async function registration(email, username, password, passwordConfirm) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("passwordConfirm", passwordConfirm);

    const response = await fetch(baseURL+"registration.php" ,{
        method : "POST",
        body : formData,
        credentials : "include"
    });
    return response.json();
}

export async function logout() {
    const response = await fetch(baseURL+ "logout.php", {
        method : "POST",
        credentials : "include",
    });

    return response.json();
}

export async function saveDeck(name, cards, deckId = null) {
    const response = await fetch(baseURL + "saveDeck.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({
            name,
            deck_id: deckId,
            cards: cards.map((card) => ({
                name: card.name,
                hp:   card.hp,
                atk:  card.atk,
            })),
        }),
    });

    return response.json();
}

export async function getSavedDecks() {
    const response = await fetch(baseURL + "getDeck.php", {
        method: "GET",
        credentials: "include",
    });

    return response.json();
}

export async function createDuelGame(mode, player1Deck, deckSize, player2Deck = null){

    const formData = new FormData();

    formData.append("action" , "createGame");
    formData.append("mode", mode);

    formData.append("deck", JSON.stringify(player1Deck));
    formData.append("deck1", JSON.stringify(player1Deck));

    if(player2Deck){

        formData.append("deck2", JSON.stringify(player2Deck));
    }
    
    formData.append("deckSize", deckSize);

    const response = await fetch(baseURL+ "game.php", {
        method: "POST",
        body: formData,
        credentials: "include"
    });

    return response.json();
}

export async function drawDuelCard() {
    
    const formData = new FormData();
    formData.append("action", "drawCard");

    const response = await fetch(baseURL + "game.php", {
        method: "POST",
        body: formData, 
        credentials: "include"
        
    });

    return response.json();
}

export async function playDuelCard(cardIndex) {

    const formData = new FormData();
    formData.append("action", "playCard");
    formData.append("cardIndex", cardIndex);

    const response = await fetch(baseURL + "game.php", {
        method: "POST",
        body: formData, 
        credentials: "include"
        
    });

    return response.json();
    
}

export async function endDuelTurn(){

    const formData = new FormData();
    formData.append("action", "endTurn");

    const response = await fetch(baseURL+ "game.php", {
        method: "POST",
        body: formData,
        credentials: "include"
    });

    return response.json();
}

export async function leaveDuelGame() {

    const formData = new FormData();
    formData.append("action" , "leaveGame");

    const response = await fetch(baseURL+ "game.php", {
        method: "POST",
        body: formData,
        credentials: "include"
    });

    return response.json();
    
}