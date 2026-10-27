import { useState } from 'react';
import Field from './field';

const emptyAlbum = {title : "", artist : "", genre : "", releaseYear : "", tracks : 1, rating : 3, status : "owned", prices : {vinyl : 0, cd : 0, digital : 0}};

// Shared form for the add and edit pages
const AlbumForm = ({initialAlbum,onSubmit,buttonText}) =>{

    const [album,setAlbum] = useState({...emptyAlbum, ...initialAlbum, prices : {...emptyAlbum.prices, ...(initialAlbum && initialAlbum.prices)}});
    const [saving,setSaving] = useState(false);
    const [error,setError] = useState("");
    const [touched,setTouched] = useState({});

    const year = Number(album.releaseYear);

    const errors = {
        title : album.title.trim() ? "" : "Title is required",
        artist : album.artist.trim() ? "" : "Artist is required",
        releaseYear : album.releaseYear === "" || (year >= 1900 && year <= new Date().getFullYear() + 1) ? "" : "Enter a year from 1900 to next year",
        tracks : Number(album.tracks) >= 0 ? "" : "Tracks cannot be negative",
        prices : Object.values(album.prices).every(p => p === "" || Number(p) >= 0) ? "" : "Prices cannot be negative"
    };

    const show = (name) => (touched[name] ? errors[name] : "");
    const blur = (e) => setTouched({...touched,[e.target.name] : true});

    const handleChange = (e) =>{

        // price inputs are named price-vinyl, price-cd and price-digital
        if( e.target.name.startsWith("price-") ){

            setAlbum({...album, prices : {...album.prices, [e.target.name.slice(6)] : e.target.value}});
            return;
        }

        setAlbum({...album,[e.target.name] : e.target.value});
    }

    const handleSubmit = async (e) =>{

        e.preventDefault();

        if( Object.values(errors).some(Boolean) ){

            setTouched({title : true, artist : true, releaseYear : true, tracks : true, prices : true});
            return;
        }

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
        <form onSubmit={handleSubmit} className="card-form" noValidate>

            { error && <div className="alert alert-danger">{error}</div> }

            <Field label="Title" htmlFor="f-title" error={show("title")}>
                <input id="f-title" className={"form-control" + (show("title") ? " invalid" : "")} name="title" value={album.title} onChange={handleChange} onBlur={blur}/>
            </Field>
            <Field label="Artist" htmlFor="f-artist" error={show("artist")}>
                <input id="f-artist" className={"form-control" + (show("artist") ? " invalid" : "")} name="artist" value={album.artist} onChange={handleChange} onBlur={blur}/>
            </Field>
            <div className="form-row">
                <div className="form-group col">
                    <label htmlFor="f-genre">Genre</label>
                    <input id="f-genre" className="form-control" name="genre" value={album.genre} onChange={handleChange}/>
                </div>
                <Field label="Release Year" htmlFor="f-year" error={show("releaseYear")} className="col">
                    <input id="f-year" className={"form-control" + (show("releaseYear") ? " invalid" : "")} type="number" name="releaseYear" value={album.releaseYear} onChange={handleChange} onBlur={blur}/>
                </Field>
                <div className="form-group col">
                    <label htmlFor="f-rating">Rating</label>
                    <select id="f-rating" className="form-control" name="rating" value={album.rating} onChange={handleChange}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <Field label="Tracks" htmlFor="f-tracks" error={show("tracks")} className="col">
                    <input id="f-tracks" className={"form-control" + (show("tracks") ? " invalid" : "")} type="number" name="tracks" value={album.tracks} onChange={handleChange} onBlur={blur}/>
                </Field>
            </div>
            <Field label="Store prices in ₹ (0 = not sold in that format)" error={show("prices")}>
                <div className="form-row">
                    {
                        [["vinyl","Vinyl"],["cd","CD"],["digital","Digital"]].map(([key,label]) =>
                            <div className="col" key={key}>
                                <input className="form-control" type="number" min="0" name={"price-" + key} aria-label={label + " price"} placeholder={label}
                                    value={album.prices[key]} onChange={handleChange} onBlur={() => setTouched({...touched, prices : true})}/>
                            </div>
                        )
                    }
                </div>
            </Field>
            <div className="form-group">
                <label htmlFor="f-status">Status</label>
                <select id="f-status" className="form-control" name="status" value={album.status} onChange={handleChange}>
                    <option value="owned">Owned</option>
                    <option value="wishlist">Wishlist</option>
                </select>
            </div>

            <button className="pill pill-gold" disabled={saving}>{saving ? "Saving..." : buttonText}</button>
        </form>
    )
}


export default AlbumForm;
