
const About = () =>{

    return (
        <>
            <h2 className="page-title">About</h2>
            <p className="muted">Music Album Collection is a CRUD app. The React client calls an Express server, and the server stores the data in MongoDB.</p>
            <table className="routes">
                <thead><tr><th>Method</th><th>Route</th><th>What it does</th></tr></thead>
                <tbody>
                    <tr><td>GET</td><td>/getall?search=&amp;status=</td><td>List albums with search and filter</td></tr>
                    <tr><td>GET</td><td>/get/:id</td><td>Get one album</td></tr>
                    <tr><td>GET</td><td>/stats</td><td>Count total, owned and wishlist albums, and the average rating</td></tr>
                    <tr><td>POST</td><td>/create</td><td>Add an album (login needed)</td></tr>
                    <tr><td>PUT</td><td>/update/:id</td><td>Edit an album (login needed)</td></tr>
                    <tr><td>PATCH</td><td>/status/:id</td><td>Move an album between owned and wishlist (login needed)</td></tr>
                    <tr><td>DELETE</td><td>/delete/:id</td><td>Delete an album (login needed)</td></tr>
                    <tr><td>POST</td><td>/register</td><td>Create a user with a bcrypt-hashed password</td></tr>
                    <tr><td>POST</td><td>/login</td><td>Return a JWT token</td></tr>
                </tbody>
            </table>
        </>
    )
}


export default About;
