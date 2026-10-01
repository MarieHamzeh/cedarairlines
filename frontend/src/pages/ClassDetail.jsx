import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './FlightDetail.css';

const API = 'http://localhost:5000/api';

const CLASS_INFO = {
  economy: {
    label: 'Economy',
    description: 'Comfortable, no-frills travel — everything you need to get there.',
    perks: ['1 checked bag (23kg)', 'Standard seat', 'Meal included', 'Free carry-on'],
  },
  business: {
    label: 'Business',
    description: 'More space, more comfort, and priority service throughout your trip.',
    perks: ['2 checked bags (32kg)', 'Extra legroom seat', 'Priority boarding', 'Lounge access', 'Premium meal service'],
  },
  first: {
    label: 'First class',
    description: 'The full Cedar Airlines experience, front to back.',
    perks: ['3 checked bags (32kg)', 'Fully flat seat', 'Dedicated check-in', 'Chauffeur pickup', 'À la carte dining'],
  },
};

function ClassDetail() {
  const { id, className } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [flightRes, summaryRes] = await Promise.all([
        fetch(`${API}/flights/${id}`),
        fetch(`${API}/flights/${id}/seat-summary`)
      ]);
      const flightData = await flightRes.json();
      const summaryData = await summaryRes.json();
      setFlight(flightData);
      const classData = summaryData.find(s => s.class === className);
      setPrice(classData?.price || null);
      setLoading(false);
    };
    fetchData();
  }, [id, className]);

  if (loading) return <p style={{ padding: 60, textAlign: 'center' }}>Loading...</p>;

  const info = CLASS_INFO[className];

  return (
    <div className="flight-detail-page">
      <Navbar />

      <div className="flight-detail-hero">
        <div className="flight-detail-hero-text">
          <h1>{info?.label} · {flight.origin_city} → {flight.destination_city}</h1>
          <p>{flight.flight_number} · {new Date(flight.departure_time).toLocaleString()}</p>
        </div>
      </div>

      <div className="flight-detail-content">
        <div className="flight-summary-card">
          <p style={{ margin: '0 0 16px', color: 'var(--grey-600)' }}>{info?.description}</p>
          <p className="class-price" style={{ marginBottom: 20 }}>${Number(price).toFixed(2)}</p>

          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {info?.perks.map(perk => (
              <li key={perk} style={{ fontSize: 14, color: 'var(--navy-900)' }}>✓ {perk}</li>
            ))}
          </ul>

          <button
            onClick={() => navigate(`/booking/${id}/${className}`)}
            style={{
              background: 'var(--amber-500)', color: 'white', border: 'none',
              padding: '14px 28px', borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Continue to booking
          </button>
        </div>

        <Link to={`/flight/${id}`} className="back-link">← Back to classes</Link>
      </div>

      <Footer />
    </div>
  );
}

export default ClassDetail;