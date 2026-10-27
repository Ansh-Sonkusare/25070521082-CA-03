import { useEffect,useState } from 'react';
import { Navigate,useNavigate,useParams } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import AlbumForm from './homeComp/albumForm';
import { useToast } from './uiContext';

const EditAlbum = () =>{

    const {id} = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [album,setAlbum] = useState(null);
    const [error,setError] = useState("");

    // Load the current values of the album from the server
    useEffect(()=>{

        apiRequest("/get/" + id).then(setAlbum).catch(err => setError(err.message));

    },[id]);

    if( !getToken() ){

        return <Navigate to="/login" replace/>
    }

    const updateAlbum = async (updated) =>{

        const {title,artist,genre,releaseYear,tracks,rating,status,prices} = updated;
        await apiRequest("/update/" + id,{method : "PUT", body : {title,artist,genre,releaseYear,tracks,rating,status,prices}});
        toast("Changes saved");
        navigate("/album/" + id);
    }

    return (
        <>
            <h2 className="page-title">Edit Album</h2>
            { error && <div className="alert alert-danger">{error}</div> }
            { !album && !error && <p className="empty">Loading album...</p> }
            { album && <AlbumForm initialAlbum={album} onSubmit={updateAlbum} buttonText="Save Changes"/> }
        </>
    )
}


export default EditAlbum;
