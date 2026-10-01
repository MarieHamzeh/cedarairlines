import { useState } from 'react';
import { Link } from 'react-router-dom';
import SideMenu from './SideMenu';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar-logo">Cedar Airlines</Link>

       

        <button
          className="navbar-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Navbar;