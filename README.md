# Journal des Transactions Financières

## Prérequis

- Node.js 18+
- MySQL Server
- Git

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd projet
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   - Créer une base de données MySQL nommée `financepro`
   - Configurer le fichier `.env` à la racine du projet :
     ```
     DATABASE_URL=mysql://utilisateur:mot_de_passe@localhost:3306/financepro
     ```

4. **Initialiser la base de données**
   ```bash
   # Générer les migrations
   npm run db:generate
   
   # Appliquer les migrations
   npm run db:migrate
   
   # Remplir la base de données avec des données de test
   npm run db:seed
   ```

## Démarrage pour test

1. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible à l'adresse http://localhost:3000

2. **Pour réinitialiser la base de données si nécessaire**
   ```bash
   npm run db:reset
   ``` 