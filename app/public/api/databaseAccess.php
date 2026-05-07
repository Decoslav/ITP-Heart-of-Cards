<?php
    $servername = "localhost";
    $username = "root";
    $password = ""; // Ihr MySQL-Passwort
    $dbname = "heart-of-cards";
    
    // Verbindung erstellen
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Verbindung prüfen
    if ($conn->connect_error) {
        die("Verbindung zur Datenbank fehlgeschlagen: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

