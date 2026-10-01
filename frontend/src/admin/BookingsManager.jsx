import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const token = localStorage.getItem('token');

  const fetchBookings = useCallback(async () => {
    const res = await fetch(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!details[id]) {
      const res = await fetch(`${API}/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDetails(prev => ({ ...prev, [id]: data }));
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ booking_status: status })
    });
    fetchBookings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    await fetch(`${API}/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchBookings();
  };

  return (
    <div>
      <h1>Bookings</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Customer</th>
            <th>Flight</th>
            <th>Seat(s)</th>
            <th>Class</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => [
            <tr key={b.booking_id}>
              <td>{b.booking_reference}</td>
              <td>
                {b.first_name} {b.last_name}
                {!b.user_id && <span style={{ fontSize: 11, color: '#888' }}> (guest)</span>}
              </td>
              <td>{b.flight_number} · {b.origin_code} → {b.destination_code}</td>
              <td><strong>{b.seats || '—'}</strong></td>
              <td style={{ textTransform: 'capitalize' }}>{b.seat_classes || '—'}</td>
              <td>
                <select value={b.booking_status} onChange={(e) => updateStatus(b.booking_id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td>${b.total_amount}</td>
              <td>
                <button className="btn-edit" onClick={() => toggleExpand(b.booking_id)}>
                  {expandedId === b.booking_id ? 'Hide' : 'Details'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(b.booking_id)}>Delete</button>
              </td>
            </tr>,

            expandedId === b.booking_id && (
              <tr key={`${b.booking_id}-details`}>
                <td colSpan={8} style={{ background: '#fafafa', padding: 16 }}>
                  {!details[b.booking_id] ? (
                    <span>Loading passengers...</span>
                  ) : (
                    <table className="admin-table" style={{ boxShadow: 'none' }}>
                      <thead>
                        <tr>
                          <th>Passenger</th>
                          <th>Seat</th>
                          <th>Class</th>
                          <th>Position</th>
                          <th>Price</th>
                          <th>Passport</th>
                          <th>Checked in</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details[b.booking_id].passengers?.map(p => (
                          <tr key={p.passenger_id}>
                            <td>{p.first_name} {p.last_name}</td>
                            <td><strong>{p.seat_number || '—'}</strong></td>
                            <td style={{ textTransform: 'capitalize' }}>{p.seat_class || '—'}</td>
                            <td>{p.is_window ? 'Window' : p.is_aisle ? 'Aisle' : 'Middle'}</td>
                            <td>{p.price ? `$${Number(p.price).toFixed(2)}` : '—'}</td>
                            <td>{p.passport_number || '—'}</td>
                            <td>{p.checked_in ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </td>
              </tr>
            )
          ])}
        </tbody>
      </table>
    </div>
  );
}

export default BookingsManager;