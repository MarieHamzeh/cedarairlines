import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './BookingPage.css';

const API = 'http://localhost:5000/api';

function BookingPage() {
  const { id, className } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLoginModal, setShowLoginModal] = useState(!localStorage.getItem('token'));
  const [isGuest, setIsGuest] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [flight, setFlight] = useState(null);
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    passport_number: '',
    nationality: '',
    payment_method: 'card',
    guest_email: '',
    guest_phone: '',
  });

  const loadSeatMap = async () => {
    const res = await fetch(`${API}/flights/${id}/seat-map?class=${className}`);
    const data = await res.json();
    setSeatMap(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const flightRes = await fetch(`${API}/flights/${id}`);
        const flightData = await flightRes.json();
        setFlight(flightData);
        await loadSeatMap();
      } catch (err) {
        setError('Could not load flight details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, className]);

  const selectedSeat = seatMap.find(s => s.flight_seat_id === selectedSeatId);

  const rows = seatMap.reduce((acc, seat) => {
    const rowNumber = seat.seat_number.match(/^\d+/)?.[0] || '?';
    acc[rowNumber] = acc[rowNumber] || [];
    acc[rowNumber].push(seat);
    return acc;
  }, {});

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setShowLoginModal(false);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setShowLoginModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeatId) {
      setError('Please select a seat before continuing');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          flight_id: id,
          seat_class: className,
          flight_seat_id: selectedSeatId,
          ...form,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // Someone else grabbed the seat between page load and submit — refresh the map
        if (res.status === 409) {
          setSelectedSeatId(null);
          await loadSeatMap();
        }
        throw new Error(data.error || 'Booking failed');
      }
      setConfirmation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: 60, textAlign: 'center' }}>Loading...</p>;
  if (error && !flight) return <p style={{ padding: 60, textAlign: 'center' }}>{error}</p>;

  if (confirmation) {
    return (
      <div className="booking-page">
        <Navbar />
        <div className="booking-confirmation">
          <div className="confirmation-check">✓</div>
          <h1>Booking confirmed</h1>
          <p>Your reference number</p>
          <p className="confirmation-ref">{confirmation.booking_reference}</p>
          {selectedSeat && <p>Seat {selectedSeat.seat_number}</p>}
          <button className="confirmation-button" onClick={() => navigate('/')}>
            Back to home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Navbar />

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>Log in to continue</h2>
            <p className="login-modal-sub">Sign in to track your booking, or continue without an account.</p>

            <form onSubmit={handleLogin}>
              <div className="booking-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="booking-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              {loginError && <p className="booking-error">{loginError}</p>}

              <button type="submit" className="booking-submit" disabled={loggingIn}>
                {loggingIn ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="login-modal-divider"><span>or</span></div>

            <button className="guest-button" onClick={handleContinueAsGuest}>
              Continue as guest
            </button>
          </div>
        </div>
      )}

      <div className="booking-hero">
        <h1>Complete your booking</h1>
        <p>{flight.origin_city} → {flight.destination_city} · {flight.flight_number}</p>
      </div>

      <div className="booking-content">
        <div className="seat-map-card">
          <h2>Choose your seat</h2>

          <div className="seat-map-legend">
            <span><i className="seat-swatch available" /> Available</span>
            <span><i className="seat-swatch selected" /> Selected</span>
            <span><i className="seat-swatch taken" /> Taken</span>
          </div>

          <div className="seat-map">
            {Object.entries(rows).map(([rowNumber, seats]) => (
              <div className="seat-row" key={rowNumber}>
                <span className="seat-row-number">{rowNumber}</span>
                {seats.map(seat => (
                  <button
                    key={seat.flight_seat_id}
                    type="button"
                    disabled={!!seat.is_booked}
                    className={
                      'seat-button' +
                      (seat.is_booked ? ' taken' : '') +
                      (seat.flight_seat_id === selectedSeatId ? ' selected' : '')
                    }
                    title={seat.is_window ? 'Window' : seat.is_aisle ? 'Aisle' : 'Middle'}
                    onClick={() => setSelectedSeatId(seat.flight_seat_id)}
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {selectedSeat && (
            <p className="seat-selected-note">
              Selected: <strong>{selectedSeat.seat_number}</strong> · ${Number(selectedSeat.price).toFixed(2)}
            </p>
          )}
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          {isGuest && (
            <>
              <h2>Contact details</h2>
              <div className="booking-form-row">
                <div className="booking-field">
                  <label>Email</label>
                  <input type="email" name="guest_email" value={form.guest_email} onChange={handleFormChange} required />
                </div>
                <div className="booking-field">
                  <label>Phone</label>
                  <input name="guest_phone" value={form.guest_phone} onChange={handleFormChange} />
                </div>
              </div>
            </>
          )}

          <h2>Passenger details</h2>

          <div className="booking-form-row">
            <div className="booking-field">
              <label>First name</label>
              <input name="first_name" value={form.first_name} onChange={handleFormChange} required />
            </div>
            <div className="booking-field">
              <label>Last name</label>
              <input name="last_name" value={form.last_name} onChange={handleFormChange} required />
            </div>
          </div>

          <div className="booking-form-row">
            <div className="booking-field">
              <label>Date of birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleFormChange} required />
            </div>
            <div className="booking-field">
              <label>Nationality</label>
              <input name="nationality" value={form.nationality} onChange={handleFormChange} />
            </div>
          </div>

          <div className="booking-field">
            <label>Passport number</label>
            <input name="passport_number" value={form.passport_number} onChange={handleFormChange} required />
          </div>

          <h2>Payment</h2>
          <div className="booking-field">
            <label>Payment method</label>
            <select name="payment_method" value={form.payment_method} onChange={handleFormChange}>
              <option value="card">Credit / Debit card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash at counter</option>
            </select>
          </div>

          {error && <p className="booking-error">{error}</p>}

          <div className="booking-summary">
            <span>Total</span>
            <span className="booking-summary-price">
              ${selectedSeat ? Number(selectedSeat.price).toFixed(2) : '—'}
            </span>
          </div>

          <button type="submit" className="booking-submit" disabled={submitting || !selectedSeatId}>
            {submitting ? 'Processing...' : 'Confirm and pay'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default BookingPage;