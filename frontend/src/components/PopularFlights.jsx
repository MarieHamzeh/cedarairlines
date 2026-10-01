import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularFlights.css';

const API = 'http://localhost:5000/api';
const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;

function PopularFlights() {
  const [flights, setFlights] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch(`${API}/flights/popular?limit=3`);
        const data = await res.json();
        setFlights(data);

        data.forEach(f => {
          if (f.destination_country) fetchImage(f.flight_id, f.destination_country);
        });
      } catch (err) {
        console.error('Could not load popular flights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchImage = async (flightId, country) => {
    if (!UNSPLASH_KEY) return;
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(country)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`
      );
      const data = await res.json();
      const url = data.results?.[0]?.urls?.regular;
      if (url) setImages(prev => ({ ...prev, [flightId]: url }));
    } catch (err) {
      console.error('Could not fetch image for', country, err);
    }
  };

  if (loading || flights.length === 0) return null;

  return (
    <section className="popular-flights">
      <h2>Most requested flights</h2>

      <div className="popular-flights-list">
        {flights.map(f => (
          <div className="popular-flight-card" key={f.flight_id}>
            <div
              className="popular-flight-image"
              style={images[f.flight_id] ? { backgroundImage: `url(${images[f.flight_id]})` } : undefined}
            />

            <div className="popular-flight-info">
              <span className="popular-flight-route">
                {f.origin_city} ({f.origin_code}) → {f.destination_city} ({f.destination_code})
              </span>
              <span className="popular-flight-meta">
                {f.flight_number} · {new Date(f.departure_time).toLocaleDateString()}
              </span>
              <span className="popular-flight-price">From ${Number(f.base_price).toFixed(2)}</span>
            </div>

            <button onClick={() => navigate(`/flight/${f.flight_id}`)}>
              View details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularFlights;