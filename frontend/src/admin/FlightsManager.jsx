import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function FlightsManager() {
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState({
    flight_number: '', aircraft_id: '', origin_airport_id: '',
    destination_airport_id: '', departure_time: '', arrival_time: '',
    duration_minutes: '', base_price: ''
  });

  const token = localStorage.getItem('token');

  const fetchFlights = async () => {
    const res = await fetch(`${API}/flights`);
    const data = await res.json();
    setFlights(data);
  };

  useEffect(() => { fetchFlights(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    fetchFlights();
    setForm({ flight_number: '', aircraft_id: '', origin_airport_id: '', destination_airport_id: '',
               departure_time: '', arrival_time: '', duration_minutes: '', base_price: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flight?')) return;
    await fetch(`${API}/flights/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchFlights();
  };

  return (
    <div>
      <h1>Flights</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="flight_number" placeholder="Flight Number" value={form.flight_number} onChange={handleChange} required />
        <input name="aircraft_id" placeholder="Aircraft ID" value={form.aircraft_id} onChange={handleChange} required />
        <input name="origin_airport_id" placeholder="Origin Airport ID" value={form.origin_airport_id} onChange={handleChange} required />
        <input name="destination_airport_id" placeholder="Destination Airport ID" value={form.destination_airport_id} onChange={handleChange} required />
        <input type="datetime-local" name="departure_time" value={form.departure_time} onChange={handleChange} required />
        <input type="datetime-local" name="arrival_time" value={form.arrival_time} onChange={handleChange} required />
        <input name="duration_minutes" placeholder="Duration (min)" value={form.duration_minutes} onChange={handleChange} />
        <input name="base_price" placeholder="Base Price" value={form.base_price} onChange={handleChange} required />
        <button type="submit">Add Flight</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Flight #</th><th>Route</th><th>Departure</th><th>Status</th><th>Price</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map(f => (
            <tr key={f.flight_id}>
              <td>{f.flight_number}</td>
              <td>{f.origin_code} → {f.destination_code}</td>
              <td>{new Date(f.departure_time).toLocaleString()}</td>
              <td>{f.status}</td>
              <td>${f.base_price}</td>
              <td>
                <button className="btn-delete" onClick={() => handleDelete(f.flight_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FlightsManager;