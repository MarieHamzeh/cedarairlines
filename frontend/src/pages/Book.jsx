import { useEffect, useState } from 'react';
import { useSearchParams, Link ,useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Book.css';

const API = 'http://localhost:5000/api';
const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;

function Book() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState(null);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const travelClass = searchParams.get('travelClass') || 'economy';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch(`${API}/flights`);
        if (!res.ok) throw new Error('Could not load flights');
        const data = await res.json();

        const filtered = data.filter(f => {
          const matchesFrom = from
            ? f.origin_city?.toLowerCase().includes(from.toLowerCase()) ||
              f.origin_code?.toLowerCase().includes(from.toLowerCase())
            : true;
          const matchesTo = to
            ? f.destination_city?.toLowerCase().includes(to.toLowerCase()) ||
              f.destination_code?.toLowerCase().includes(to.toLowerCase())
            : true;
          const matchesDate = date ? f.departure_time?.startsWith(date) : true;
          return matchesFrom && matchesTo && matchesDate;
        });

        setFlights(filtered);

        // Grab destination country from the first match to fetch a relevant photo
        const destinationCountry = filtered[0]?.destination_country;
        console.log('Destination country:', destinationCountry); // DEBUG
        if (destinationCountry) {
          fetchCountryImage(destinationCountry);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, date]);

  const fetchCountryImage = async (country) => {
    console.log('Fetching image for:', country, 'Key exists:', !!UNSPLASH_KEY); // DEBUG
    if (!UNSPLASH_KEY) return; // no key set, skip silently

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(country)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`
      );
      const data = await res.json();
      console.log('Unsplash response:', data); // DEBUG
      const imageUrl = data.results?.[0]?.urls?.regular;
      if (imageUrl) setBgImage(imageUrl);
    } catch (err) {
      console.error('Could not fetch destination image:', err);
    }
  };

  return (
    <div className="book-page">
      <Navbar />

      <div
        className="book-hero"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        <div className="book-hero-overlay" />
        <div className="book-hero-text">
          <h1>Available flights</h1>
          <p className="book-subtitle">
            {from || 'Anywhere'} → {to || 'Anywhere'}
            {date && ` · ${date}`} · {travelClass}
          </p>
        </div>
      </div>

      <div className="book-content">
        {loading && <p>Loading flights...</p>}
        {error && <p className="book-error">{error}</p>}

        {!loading && !error && flights.length === 0 && (
          <p>No flights match your search. Try different dates or cities.</p>
        )}

        <div className="flight-list">
          {flights.map(f => (
            <div key={f.flight_id} className="flight-card">
              <div className="flight-info">
                <span className="flight-number">{f.flight_number}</span>
                <span className="flight-route">
                  {f.origin_city} ({f.origin_code}) → {f.destination_city} ({f.destination_code})
                </span>
                <span className="flight-time">
                  {new Date(f.departure_time).toLocaleString()}
                </span>
              </div>
             <div className="flight-price">
  <span>${f.base_price}</span>
  <button onClick={() => navigate(`/flight/${f.flight_id}`)}>Select</button>
</div>
            </div>
          ))}
        </div>

        <Link to="/" className="back-link">← Back to search</Link>
      </div>

      <Footer />
    </div>
  );
}

export default Book;