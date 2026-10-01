import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './FlightDetail.css';

const API = 'http://localhost:5000/api';


const CLASS_INFO = {
  economy: {
    label: 'Economy',
    perks: ['1 checked bag (23kg)', 'Standard seat', 'Meal included'],
  },
  business: {
    label: 'Business',
    perks: ['2 checked bags (32kg)', 'Extra legroom seat', 'Priority boarding', 'Lounge access'],
  },
  first: {
    label: 'First class',
    perks: ['3 checked bags (32kg)', 'Fully flat seat', 'Dedicated check-in', 'Chauffeur pickup'],
  },
};

function FlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [seatSummary, setSeatSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightRes, summaryRes] = await Promise.all([
          fetch(`${API}/flights/${id}`),
          fetch(`${API}/flights/${id}/seat-summary`)
        ]);

        if (!flightRes.ok) throw new Error('Flight not found');

        const flightData = await flightRes.json();
        const summaryData = await summaryRes.json();

        setFlight(flightData);
        setSeatSummary(summaryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p style={{ padding: 60, textAlign: 'center' }}>Loading flight...</p>;
  if (error) return <p style={{ padding: 60, textAlign: 'center' }}>{error}</p>;

  return (
    <div className="flight-detail-page">
      <Navbar />

      <div className="flight-detail-hero">
        <div className="flight-detail-hero-text">
          <h1>{flight.origin_city} → {flight.destination_city}</h1>
          <p>{flight.flight_number} · {flight.model}</p>
        </div>
      </div>

      <div className="flight-detail-content">
        <div className="flight-summary-card">
          <div className="flight-summary-row">
            <div>
              <span className="label">Departure</span>
              <span className="value">{new Date(flight.departure_time).toLocaleString()}</span>
              <span className="sub">{flight.origin_name} ({flight.origin_code})</span>
            </div>
            <div className="flight-summary-arrow">→</div>
            <div>
              <span className="label">Arrival</span>
              <span className="value">{new Date(flight.arrival_time).toLocaleString()}</span>
              <span className="sub">{flight.destination_name} ({flight.destination_code})</span>
            </div>
          </div>
          {flight.duration_minutes && (
            <p className="flight-duration">Duration: {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</p>
          )}
        </div>

        <h2>Choose your class</h2>
        <div className="class-packages">
          {seatSummary.map(s => (
            <div
              key={s.class}
              className="class-package"
              onClick={() => navigate(`/flight/${id}/class/${s.class}`)}
            >
              <h3>{CLASS_INFO[s.class]?.label || s.class}</h3>
              <p className="class-price">${Number(s.price).toFixed(2)}</p>
              <ul>
                {CLASS_INFO[s.class]?.perks.map(perk => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <p className="class-availability">
                {s.available_seats > 0 ? `${s.available_seats} seats left` : 'Sold out'}
              </p>
              <button disabled={s.available_seats === 0}>View details</button>
            </div>
          ))}
        </div>

        <Link to="/book" className="back-link">← Back to results</Link>
      </div>

      <Footer />
    </div>
  );
}

export default FlightDetail;