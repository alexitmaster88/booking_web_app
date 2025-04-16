# ConferenceHub

## Pre-requisites (local development)
- Cloudinary account
- Docker Desktop
- /api/.env file update cloudinary and postgres credentials

## Run the database (Postgres)

```bash
docker-compose up -d
```

## Run the server (backend)

```
cd api/ && npm install && node index.js
``` 

## Run the client (front end)

```
cd client/ && npm install && npm run dev
```
