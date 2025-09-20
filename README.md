# Backend – YourCarYourWay (setup minimal)

API REST Java 21 / Spring Boot 3.5.x avec MySQL local. Secrets chargés via `.env`.

## Prérequis

- Java 21
- Maven 3.9+
- MySQL 8+

## Configuration minimale

- `backend/src/main/resources/application.properties` est déjà configuré pour MySQL local (`ycyw-db`).
- Créez `backend/.env` à partir de `backend/.env.example` et renseignez:
  ```env
  DB_PASSWORD=VotreMotDePasseLocal
  ```
- Spring Boot créera la base au besoin via `createDatabaseIfNotExist=true`. Pas d’action manuelle requise pour ce POC.
- Assurez-vous que l’utilisateur MySQL (ex: `root`) peut se connecter depuis `localhost` et créer/écrire dans `ycyw-db`.

## Démarrage

Depuis `backend/`:

```bash
mvn clean install
mvn spring-boot:run
```

Par défaut, l’API écoute sur le port 8080.
