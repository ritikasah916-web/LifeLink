import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ dashboard = false }) {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <Link to="/" className="brand-lockup"><span className="brand-mark">♥</span><span>LifeLink</span></Link>
      {dashboard ? (
        <div className="nav-right"><span className="nav-user">{user?.name}</span><button className="button button-ghost button-small" onClick={logout}>Log out</button></div>
      ) : (
        <nav className="main-nav">
          <a href="/#how-it-works">How it works</a>
          <a href="/#impact">Our impact</a>
          {user ? <NavLink className="button button-primary button-small" to="/dashboard">Dashboard</NavLink> : <><Link to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Join LifeLink</Link></>}
        </nav>
      )}
    </header>
  );
}