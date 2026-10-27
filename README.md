# Music Album Collection

## What the app does

- **Landing page** (`/`): animated hero with a spinning vinyl, count-up stats from the database, features, and scroll-snap strips of recently added and top rated albums. Sections reveal as you scroll.
- **Collection** (`/collection`): search, status filter, sort (newest, title, artist, top rated), grid or list view, skeleton loading, and infinite scroll backed by server pagination.
- **Rate and favorite** (login needed): click the stars on any album, tap the heart to favorite it.
- **Playlists** (`/playlists`, `/playlists/:id`, login needed): create, rename and delete your own playlists, add albums from the album page ("Add to playlist") and remove them again.
- **Tracklist and mini player** (album page): every album has a tracklist with durations and total runtime. Logged in users can add, edit, delete and reorder tracks. Each track has a fake play button (equalizer and progress bar, no audio) and a mini player bar at the bottom with play/pause, next and previous. Tracks marked "Preview" play a 30 second clip.
- **Store, cart and checkout** (`/store`, `/cart`, `/checkout`, `/orders`): albums have prices in rupees for Vinyl, CD and Digital (set them on the add/edit form). The cart is saved on the server per user, with quantity controls, subtotal, 18% GST and total, a navbar cart icon with a count badge and a slide-in drawer. Checkout has a validated shipping form and a mock card form with a live card preview that flips to show the CVV. It is a mock: no real payment happens. Use test card `4242 4242 4242 4242` with any future expiry and CVV. Card `4000 0000 0000 0002` is always declined. Paid orders are stored in `orders` and listed on `/orders`.
- **Dashboard** (`/dashboard`): stat cards (with revenue and order count), albums per genre, owned vs wishlist donut, rating distribution, orders per day (last 7 days) and a live activity feed (all CSS/SVG, no chart library).
- **My account** (`/account`, login needed): your favorites, playlists and activity.
- Add, edit, delete and move albums between owned and wishlist (login needed), with inline form validation, toasts and an animated confirm dialog.
- UI polish: sticky blurred navbar, scroll progress bar, mobile menu, route transitions, back-to-top button, smooth scrolling, `prefers-reduced-motion` support.

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
    src/                React pages: store, cart, checkout, orders, landing, home (collection), dashboard, playlists, account, login, register, add, edit, details, about
    src/homeComp/       Small parts: tracklist, buy box, cart drawer, card preview, album card, stars, charts, forms, skeleton, footer. Shared hooks and providers (reveal, count-up, toasts, confirm modal, favorites, cart, player) sit in src/
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
| GET | `/getall` | No | List all albums. Optional query: `forSale=1` (only albums with a price), `search` (title, artist or genre), `status` (`owned`/`wishlist`), `sort` (`newest`, `title`, `artist`, `rating`), `page` and `limit` (default 12, max 50). Returns `{items, total, page, pages}`. |
| GET | `/stats` | No | Revenue, order count and orders per day (last 7 days), plus totals (total, owned, wishlist), average rating, `genres` (count per genre) and `ratings` (count for each of 1 to 5 stars). |
| GET | `/get/:id` | No | Return one album. Returns 404 if the id is wrong or not found. |
| POST | `/create` | Yes | Add an album. Needs `title` and `artist`. Rating is kept between 1 and 5. |
| PUT | `/update/:id` | Yes | Change all the fields of an album. |
| PATCH | `/status/:id` | Yes | Move an album between owned and wishlist. Body: `{"status": "owned"}` or `{"status": "wishlist"}`. |
| PATCH | `/rating/:id` | Yes | Change only the rating. Body: `{"rating": 4}`. |
| DELETE | `/delete/:id` | Yes | Delete an album (also removes it from playlists and favorites). |
| GET | `/activity?limit=10` | No | Latest create, update, status, rating, delete, favorite and playlist events from the `activity` collection. |
| GET | `/me/activity?limit=10` | Yes | The same feed, only your events. |
| PUT | `/albums/:id/tracklist` | Yes | Replace the tracklist. Body: `{"tracklist": [{"title", "duration" (seconds), "preview"}]}`. Used for add, edit, delete and reorder. |
| GET | `/cart` | Yes | Your cart with `items`, `count`, `subtotal`, `gst` (18%) and `total`. Prices always come from the albums. |
| POST | `/cart` | Yes | Add one copy. Body: `{"albumId", "format": "vinyl"/"cd"/"digital"}`. |
| PATCH | `/cart` | Yes | Set a quantity (0 removes). Body: `{"albumId", "format", "qty"}`. |
| DELETE | `/cart/:albumId/:format` | Yes | Remove a cart line. |
| POST | `/orders` | Yes | Pay for the cart. Body: `{"shipping": {...}, "card": {number, name, expiry "MM/YY", cvv}}`. Mock checks: Luhn, expiry not in the past, card 4000 0000 0000 0002 is declined (402). On success the order is saved as `paid` with a txn id and the cart is cleared. |
| GET | `/orders`, `/orders/:id` | Yes | Your past orders. |
| GET | `/favorites` | Yes | Your favorite albums (`items`) and their ids (`ids`). |
| POST / DELETE | `/favorites/:id` | Yes | Add or remove a favorite. |
| GET / POST | `/playlists` | Yes | List your playlists, or create one (`{"name": "..."}`). |
| GET / PATCH / DELETE | `/playlists/:id` | Yes | Open (with albums), rename or delete your playlist. |
| POST / DELETE | `/playlists/:id/albums/:albumId` | Yes | Add or remove an album in a playlist. |
| POST | `/register` | No | Create a user (`name`, `email`, `password`). Returns 409 if the email is already used. |
| POST | `/login` | No | Check email and password. Returns a `jwtToken`. Returns 422 if they are wrong. |

## Reset the data

`cd server && npm run seed` drops the database and adds the demo user plus 6 albums with tracklists and prices.

## How to stop

- Stop the server and the client with Ctrl+C in their terminals.
- Stop the database: `docker compose down`
- Stop the database and delete all its data: `docker compose down -v`
