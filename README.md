# React Befehle

Da `node_modules` in der `.gitignore` steht, müssen die Abhängigkeiten nach jedem Clone neu installiert werden.

```bash
cd app
npm install
npm run dev

Repository/
├── app/        # Für jeglichen Code, wird noch organisiert
├── database/   # Für die Datenbank
└── documents/  # Für jegliche sonstige Dateien
