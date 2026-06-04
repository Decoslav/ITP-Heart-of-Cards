<?php
    $servername = "localhost";
    $username = "root";
    $password = ""; // Ihr MySQL-Passwort
    $dbname = "heart-of-cards";
    
    // Verbindung erstellen
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Verbindung prüfen
    if ($conn->connect_error) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Datenbankverbindung fehlgeschlagen: " . $conn->connect_error
        ]);
        exit;
    }

    $conn->set_charset("utf8mb4");

