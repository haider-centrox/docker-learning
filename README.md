# Docker Learning - NestJS App

A NestJS application containerized with Docker using multi-stage builds.

## Build

```bash
docker build -t docker-learning .
```

## Run

```bash
docker run -p 3000:3000 docker-learning
```

The app will be available at `http://localhost:3000`

## Development

```bash
npm install
npm run start:dev
```

