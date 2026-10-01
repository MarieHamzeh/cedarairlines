import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PopularFlights from '../components/PopularFlights';
import heroImage from '../assets/homepageplane.jpg';
import './Home.css';

function Home() {
  const [search, setSearch] = useState({ from: '', to: '', date: '', travelClass: 'economy' });
  const navigate = useNavigate();

  const handleChange = (e) => setSearch({ ...search, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(search).toString();
    navigate(`/book?${params}`);
  };

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <img src={heroImage} alt="Airplane flying above the clouds" className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-text animate-in delay-1">
            <p>Book, manage, and track every leg of your trip in one place.</p>
          </div>

          <form className="search-panel animate-in delay-2" onSubmit={handleSearch}>
            <div className="search-field">
              <label>From</label>
              <input name="from" placeholder="Departure city" value={search.from} onChange={handleChange} />
            </div>
            <div className="search-field">
              <label>To</label>
              <input name="to" placeholder="Destination city" value={search.to} onChange={handleChange} />
            </div>
            <div className="search-field">
              <label>Date</label>
              <input type="date" name="date" value={search.date} onChange={handleChange} />
            </div>
            <div className="search-field">
              <label>Class</label>
              <select name="travelClass" value={search.travelClass} onChange={handleChange}>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First class</option>
              </select>
            </div>
            <button type="submit">Search flights</button>
          </form>
        </div>
      </section>

      <PopularFlights />

      <section className="features">
        <div className="feature">
          <h3>Straightforward pricing</h3>
          <p>The fare you see at search is the fare you pay at checkout.</p>
        </div>
        <div className="feature">
          <h3>Manage from one place</h3>
          <p>Change seats, add bags, or check in without digging through email.</p>
        </div>
        <div className="feature">
          <h3>Live flight status</h3>
          <p>Real-time updates on delays, gates, and boarding times.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;