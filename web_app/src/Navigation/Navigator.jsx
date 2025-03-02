import "./style_nav.css";
import Option from './Option';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, React } from "react";

const api_server = process.env.REACT_APP_API_SERVER;


export default function Navigator() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch(`${api_server}/auth`, {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUsername(userInfo.username);
      });
    });
  }, []);

  async function logout() {
    await fetch(`${api_server}/auth/logout`, {
      credentials: 'include',
      method: 'POST',
    })
    if (location.pathname === '/') {
      navigate(0);
    }
    navigate('/');
    setUsername(null);
  }


  return (<div className="Nav">
    <div className="topLeft">
      <h className="Title">Sustainable Travel</h>
    </div>
    <div className="topCenter">
      <Option />
    </div>
    <div className="topRight">
      {username && (
        <>
          <Link to='/profile'>{username}</Link>
          <span className="link-separator"> | </span>
          <a onClick={logout} className="logOut">Log out</a>
        </>
      )}
      {!username && (
        <>
          <Link to="/login">Login</Link>
          <span className="link-separator"> | </span>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  </div>);
}
