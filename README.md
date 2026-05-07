# React Befehle

Da `node_modules` in der `.gitignore` steht, müssen die Abhängigkeiten nach jedem Clone neu installiert werden.

```bash
cd app
npm install
npm run build   # Erstellt fertige Produktversion
npm run dev     # Startet lokalen Entwicklungsserver

Für volle Funktionsweise muss MySQL in XAMPP zusätzlich gestartet werden

Repository/
├── app/        # Für jeglichen Code, wird noch organisiert
├── database/   # Für die Datenbank
└── documents/  # Für jegliche sonstige Dateien


