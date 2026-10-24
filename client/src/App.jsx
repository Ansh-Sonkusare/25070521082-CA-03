import { useState } from 'react';
import { Routes,Route } from 'react-router-dom';
import Home from './home';
import About from './about';
import Nav from './nav';
import AddAlbum from './addAlbum';
import EditAlbum from './editAlbum';
import AlbumDetails from './albumDetails';
import Login from './login';
import Register from './register';
import Footer from './homeComp/footer';
import { getUserName } from './api';

const App = () => {

  const [userName,setUserName] = useState(getUserName());

  return (

    <div className="app">

      <Nav userName = {userName} setUserName = {setUserName}/>

      <div className="main-cont">

        <Routes>

          <Route path = "/" element = {<Home userName = {userName}/>}></Route>
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
  )
}

export default App;
