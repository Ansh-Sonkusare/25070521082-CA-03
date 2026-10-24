import { useState } from 'react';

const emptyAlbum = {title : "", artist : "", genre : "", releaseYear : "", tracks : 1, rating : 3, status : "owned"};

// Shared form for the add and edit pages
const AlbumForm = ({initialAlbum,onSubmit,buttonText}) =>{

    const [album,setAlbum] = useState(initialAlbum || emptyAlbum);
    const [saving,setSaving] = useState(false);
    const [error,setError] = useState("");

    const handleChange = (e) =>{

        setAlbum({...album,[e.target.name] : e.target.value});
    }

    const handleSubmit = async (e) =>{

        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await onSubmit(album);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card-form">

            { error && <div className="alert alert-danger">{error}</div> }

            <div className="form-group">
                <label>Title</label>
                <input className="form-control" name="title" value={album.title} onChange={handleChange} required/>
            </div>
            <div className="form-group">
                <label>Artist</label>
                <input className="form-control" name="artist" value={album.artist} onChange={handleChange} required/>
            </div>
            <div className="form-row">
                <div className="form-group col">
                    <label>Genre</label>
                    <input className="form-control" name="genre" value={album.genre} onChange={handleChange}/>
                </div>
                <div className="form-group col">
                    <label>Release Year</label>
                    <input className="form-control" type="number" name="releaseYear" value={album.releaseYear} onChange={handleChange}/>
                </div>
                <div className="form-group col">
                    <label>Rating</label>
                    <select className="form-control" name="rating" value={album.rating} onChange={handleChange}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div className="form-group col">
                    <label>Tracks</label>
                    <input className="form-control" type="number" min="0" name="tracks" value={album.tracks} onChange={handleChange}/>
                </div>
            </div>
            <div className="form-group">
                <label>Status</label>
                <select className="form-control" name="status" value={album.status} onChange={handleChange}>
                    <option value="owned">Owned</option>
                    <option value="wishlist">Wishlist</option>
                </select>
            </div>

            <button className="pill pill-gold" disabled={saving}>{saving ? "Saving..." : buttonText}</button>
        </form>
    )
}


export default AlbumForm;
