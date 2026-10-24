# Music Album Collection

## What the app does

Music Album Collection helps you keep track of your music albums. You can:

- See all albums, with live counts of total, owned and wishlist albums, and the average rating.
- Search albums by title, artist or genre, and filter them by status.
- Open one album to see its details.
- Add, edit and delete albums (login needed).
- Move an album to your wishlist or mark it as owned (login needed).
- Give each album a rating from 1 to 5 stars.
- Register a new user and log in.

## Tech stack

- Client: React 19, Vite, react-router-dom 7, Bootstrap 4.5.3 (from a CDN). Plain JavaScript.
- Server: Node.js, Express 5, the native `mongodb` driver, body-parser, cors, bcrypt (password hashing) and jsonwebtoken (login tokens).
- Database: MongoDB 7, started with Docker Compose.

## Folder structure

```
music-album-collection/
  docker-compose.yml    MongoDB container (music-mongo, port 27018)
  server/
    server.js           The whole API (port 5002)
    package.json
  client/
    index.html
    src/                React pages: home, login, register, add, edit, details, about
    src/homeComp/       Small parts: header, album row, album form, footer
    src/api.js          All calls to the server
```

## How to run

1. Start the database: `docker compose up -d`
2. Start the server: `cd server && npm install && npm start`
   The server prints `Server started at port : 5002`. On the first run it adds a demo user and 6 sample albums.
3. Start the client (in a new terminal): `cd client && npm install && npm run dev`
4. Open http://localhost:5174

## Demo login

- Email: `admin@music.com`
- Password: `admin123`

## API routes

The server runs at http://localhost:5002. For routes that need login, send the header `Authorization: Bearer <token>`. You get the token from `POST /login`.

| Method | Route | Login needed? | What it does |
| ------ | ----- | ------------- | ------------ |
| GET | `/getall` | No | List all albums. Optional query: `?search=text` (title, artist or genre) and `?status=owned` or `?status=wishlist`. |
| GET | `/stats` | No | Return the counts: total, owned and wishlist, and the average rating (one decimal). |
| GET | `/get/:id` | No | Return one album. Returns 404 if the id is wrong or not found. |
| POST | `/create` | Yes | Add an album. Needs `title` and `artist`. Rating is kept between 1 and 5. |
| PUT | `/update/:id` | Yes | Change all the fields of an album. |
| PATCH | `/status/:id` | Yes | Move an album between owned and wishlist. Body: `{"status": "owned"}` or `{"status": "wishlist"}`. |
| DELETE | `/delete/:id` | Yes | Delete an album. |
| POST | `/register` | No | Create a user (`name`, `email`, `password`). Returns 409 if the email is already used. |
| POST | `/login` | No | Check email and password. Returns a `jwtToken`. Returns 422 if they are wrong. |

## How to stop

- Stop the server and the client with Ctrl+C in their terminals.
- Stop the database: `docker compose down`
- Stop the database and delete all its data: `docker compose down -v`
