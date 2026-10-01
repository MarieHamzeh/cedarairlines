import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3 className="footer-logo">Cedar Airlines</h3>
          <p className="footer-tagline">Fly with intention.</p>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About us</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact us</Link>
        </div>

        <div className="footer-col">
          <h4>Travel</h4>
          <Link to="/book">Book a flight</Link>
          <Link to="/my-flights">My flights</Link>
          <Link to="/check-in">Check in</Link>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/terms">Terms of service</Link>
          <Link to="/privacy">Privacy policy</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Cedar Airlines. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;