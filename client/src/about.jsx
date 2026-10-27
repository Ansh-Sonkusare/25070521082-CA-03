
const About = () =>{

    return (
        <>
            <h2 className="page-title">About</h2>
            <p className="muted">Music Album Collection is a full-stack app. The React client calls an Express server, and the server stores the data in MongoDB.</p>
            <table className="routes">
                <thead><tr><th>Method</th><th>Route</th><th>What it does</th></tr></thead>
                <tbody>
                    <tr><td>GET</td><td>/getall?search=&amp;status=&amp;sort=&amp;page=&amp;limit=</td><td>Paginated, sorted albums: items, total, page, pages</td></tr>
                    <tr><td>GET</td><td>/get/:id</td><td>Get one album</td></tr>
                    <tr><td>GET</td><td>/stats</td><td>Totals, average rating, albums per genre and rating distribution</td></tr>
                    <tr><td>POST</td><td>/create</td><td>Add an album (login needed)</td></tr>
                    <tr><td>PUT</td><td>/update/:id</td><td>Edit an album (login needed)</td></tr>
                    <tr><td>PATCH</td><td>/status/:id</td><td>Move an album between owned and wishlist (login needed)</td></tr>
                    <tr><td>PATCH</td><td>/rating/:id</td><td>Change only the rating (login needed)</td></tr>
                    <tr><td>GET</td><td>/activity?limit=</td><td>Latest create, update, status, rating and delete events</td></tr>
                    <tr><td>GET</td><td>/favorites</td><td>Your favorite albums (login needed)</td></tr>
                    <tr><td>POST / DELETE</td><td>/favorites/:id</td><td>Add or remove a favorite (login needed)</td></tr>
                    <tr><td>GET / POST</td><td>/playlists</td><td>List or create your playlists (login needed)</td></tr>
                    <tr><td>GET / PATCH / DELETE</td><td>/playlists/:id</td><td>Open, rename or delete a playlist (login needed)</td></tr>
                    <tr><td>POST / DELETE</td><td>/playlists/:id/albums/:albumId</td><td>Add or remove an album in a playlist (login needed)</td></tr>
                    <tr><td>PUT</td><td>/albums/:id/tracklist</td><td>Replace the tracklist (add, edit, delete, reorder) (login needed)</td></tr>
                    <tr><td>GET / POST / PATCH</td><td>/cart</td><td>Your server-side cart with subtotal, 18% GST and total (login needed)</td></tr>
                    <tr><td>DELETE</td><td>/cart/:albumId/:format</td><td>Remove a cart line (login needed)</td></tr>
                    <tr><td>GET / POST</td><td>/orders</td><td>List your orders, or pay for the cart with a mock card (login needed)</td></tr>
                    <tr><td>GET</td><td>/orders/:id</td><td>One of your orders (login needed)</td></tr>
                    <tr><td>DELETE</td><td>/delete/:id</td><td>Delete an album (login needed)</td></tr>
                    <tr><td>POST</td><td>/register</td><td>Create a user with a bcrypt-hashed password</td></tr>
                    <tr><td>POST</td><td>/login</td><td>Return a JWT token</td></tr>
                </tbody>
            </table>
        </>
    )
}


export default About;
