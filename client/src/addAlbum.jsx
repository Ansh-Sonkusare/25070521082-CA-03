import { Navigate,useNavigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import AlbumForm from './homeComp/albumForm';
import { useToast } from './uiContext';

const AddAlbum = () =>{

    const navigate = useNavigate();
    const toast = useToast();

    if( !getToken() ){

        return <Navigate to="/login" replace/>
    }

    const createAlbum = async (album) =>{

        await apiRequest("/create",{method : "POST", body : album});
        toast('"' + album.title + '" added to the collection');
        navigate("/collection");
    }

    return (
        <>
            <h2 className="page-title">Add a New Album</h2>
            <AlbumForm onSubmit={createAlbum} buttonText="Add Album"/>
        </>
    )
}


export default AddAlbum;
