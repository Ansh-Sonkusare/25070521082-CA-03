import { Navigate,useNavigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import AlbumForm from './homeComp/albumForm';

const AddAlbum = () =>{

    const navigate = useNavigate();

    if( !getToken() ){

        return <Navigate to="/login" replace/>
    }

    const createAlbum = async (album) =>{

        await apiRequest("/create",{method : "POST", body : album});
        navigate("/");
    }

    return (
        <>
            <h2 className="page-title">Add a New Album</h2>
            <AlbumForm onSubmit={createAlbum} buttonText="Add Album"/>
        </>
    )
}


export default AddAlbum;
