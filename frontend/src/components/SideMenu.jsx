import { Link } from 'react-router-dom';
import './SideMenu.css';

function SideMenu({ open, onClose }) {
  const links = [
    { to: '/book', label: 'Book a flight' },
    { to: '/my-flights', label: 'My flights' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/about', label: 'About us' },
    { to: '/contact', label: 'Contact us' },
  ];

  return (
    <>
      <div
        className={`side-menu-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`side-menu ${open ? 'open' : ''}`}>
        <button className="side-menu-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>

        <nav className="side-menu-links">
          {links.map(link => (
            <Link key={link.to} to={link.to} onClick={onClose}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default SideMenu;