# Backend – Springboot

API REST Java 21 / Spring Boot 3.5.x avec MySQL local. Secrets chargés via `.env`.

## Prérequis

- Java 21
- Maven 3.9+
- MySQL 8+

## Configuration minimale

- `backend/src/main/resources/application.properties` est déjà configuré pour MySQL local (`ycyw-db`).
- Créez votre propre `.env` à partir de `.env.example` à la racine de `backend` :
  ```env
  DB_PASSWORD=VotreMotDePasseLocal
  ```
- Spring Boot créera la base si elle n'éxiste pas via `createDatabaseIfNotExist=true`.
- Vos identifiants MySQL (ex: `root`) doit pouvoir lire/écrire dans `ycyw-db`.

## Démarrage

Depuis `backend/`:

```bash
mvn clean install
mvn spring-boot:run
```

Par défaut, l’API écoute sur le port 8080.

# Frontend – Angular

- Version minimale Node.js: 18 (LTS) ou plus récente

```bash
cd frontend
npm install
npm start
```

Rendez vous sur http://localhost:4200
