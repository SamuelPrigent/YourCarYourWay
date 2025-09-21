# Backend – Springboot

API REST Java 21 / Spring Boot 3.5.x avec MySQL local. Secrets chargés via `.env`.

## Prérequis

- Java 21
- Maven 3.9+
- MySQL 8+

## Configuration minimale

- Base MySQL locale: `ycyw-db` créée automatiquement par Springboot si non éxistante (via `createDatabaseIfNotExist=true`).
- Vos identifiants MySQL (ex. `root`) requiers droits de lecture/écriture sur `ycyw-db`.
- Fichier d’environnement: créer `backend/.env` en vous basant sur l'exemple `.env.example` avec au minimum :

```env
DB_PASSWORD=VotreMotDePasseLocal
```

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
