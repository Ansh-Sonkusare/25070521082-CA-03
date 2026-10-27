import { useEffect,useState } from 'react';
import { Routes,Route,useLocation } from 'react-router-dom';
import Landing from './landing';
import Home from './home';
import About from './about';
import Nav from './nav';
import AddAlbum from './addAlbum';
import EditAlbum from './editAlbum';
import AlbumDetails from './albumDetails';
import Login from './login';
import Register from './register';
import Dashboard from './dashboard';
import Playlists from './playlists';
import PlaylistDetail from './playlistDetail';
import Account from './account';
import Store from './store';
import Cart from './cart';
import Checkout from './checkout';
import Orders from './orders';
import PlayerProvider from './PlayerProvider';
import CartProvider from './CartProvider';
import ScrollUi from './scrollUi';
import UiProvider from './UiProvider';
import FavProvider from './FavProvider';
import Footer from './homeComp/footer';
import { getUserName } from './api';

const App = () => {

  const [userName,setUserName] = useState(getUserName());
  const location = useLocation();

  // api.js fires "logout" when the server rejects the saved token
  useEffect(()=>{

    const onLogout = () => setUserName(null);
    window.addEventListener("logout",onLogout);
    return () => window.removeEventListener("logout",onLogout);

  },[]);

  return (

    <UiProvider>
      <FavProvider userName={userName}>
      <CartProvider userName={userName}>
      <PlayerProvider>

        <div className="app">

          <ScrollUi/>
          <Nav userName = {userName} setUserName = {setUserName}/>

          {/* keyed on the path so every route change replays the page-in animation */}
          <div className="main-cont page" key={location.pathname}>

            <Routes location={location}>

              <Route path = "/" element = {<Landing/>}></Route>
              <Route path = "/collection" element = {<Home userName = {userName}/>}></Route>
              <Route path = "/dashboard" element = {<Dashboard/>}></Route>
              <Route path = "/playlists" element = {<Playlists/>}></Route>
              <Route path = "/playlists/:id" element = {<PlaylistDetail userName = {userName}/>}></Route>
              <Route path = "/store" element = {<Store/>}></Route>
              <Route path = "/cart" element = {<Cart/>}></Route>
              <Route path = "/checkout" element = {<Checkout/>}></Route>
              <Route path = "/orders" element = {<Orders/>}></Route>
              <Route path = "/account" element = {<Account userName = {userName}/>}></Route>
              <Route path = "/add" element = {<AddAlbum/>}></Route>
              <Route path = "/edit/:id" element = {<EditAlbum/>}></Route>
              <Route path = "/album/:id" element = {<AlbumDetails userName = {userName}/>}></Route>
              <Route path = "/login" element = {<Login setUserName = {setUserName}/>}></Route>
              <Route path = "/register" element = {<Register/>}></Route>
              <Route path = "/about" element = {<About/>}></Route>

            </Routes>

          </div>

          <Footer/>

        </div>

      </PlayerProvider>
      </CartProvider>
      </FavProvider>
    </UiProvider>
  )
}

export default App;
