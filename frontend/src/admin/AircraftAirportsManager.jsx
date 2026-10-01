import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function AircraftAirportsManager() {
  const [aircraft, setAircraft] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircraftForm, setAircraftForm] = useState({
    model: '', registration_number: '', total_seats: '', economy_seats: '', business_seats: '', first_class_seats: ''
  });
  const [airportForm, setAirportForm] = useState({ code: '', name: '', city: '', country: '', timezone: '' });

  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    const [a1, a2] = await Promise.all([
      fetch(`${API}/aircraft`).then(r => r.json()),
      fetch(`${API}/airports`).then(r => r.json())
    ]);
    setAircraft(a1);
    setAirports(a2);
  };

  useEffect(() => { fetchAll(); }, []);

  const submitAircraft = async (e) => {
    e.preventDefault();
    await fetch(`${API}/aircraft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(aircraftForm)
    });
    fetchAll();
    setAircraftForm({ model: '', registration_number: '', total_seats: '', economy_seats: '', business_seats: '', first_class_seats: '' });
  };

  const submitAirport = async (e) => {
    e.preventDefault();
    await fetch(`${API}/airports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(airportForm)
    });
    fetchAll();
    setAirportForm({ code: '', name: '', city: '', country: '', timezone: '' });
  };

  const deleteAircraft = async (id) => {
    await fetch(`${API}/aircraft/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const deleteAirport = async (id) => {
    await fetch(`${API}/airports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  return (
    <div>
      <h1>Aircraft</h1>
      <form className="admin-form" onSubmit={submitAircraft}>
        <input placeholder="Model" value={aircraftForm.model} onChange={e => setAircraftForm({...aircraftForm, model: e.target.value})} required />
        <input placeholder="Registration #" value={aircraftForm.registration_number} onChange={e => setAircraftForm({...aircraftForm, registration_number: e.target.value})} required />
        <input placeholder="Total Seats" value={aircraftForm.total_seats} onChange={e => setAircraftForm({...aircraftForm, total_seats: e.target.value})} required />
        <input placeholder="Economy Seats" value={aircraftForm.economy_seats} onChange={e => setAircraftForm({...aircraftForm, economy_seats: e.target.value})} required />
        <input placeholder="Business Seats" value={aircraftForm.business_seats} onChange={e => setAircraftForm({...aircraftForm, business_seats: e.target.value})} required />
        <input placeholder="First Class Seats" value={aircraftForm.first_class_seats} onChange={e => setAircraftForm({...aircraftForm, first_class_seats: e.target.value})} />
        <button type="submit">Add Aircraft</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Model</th><th>Registration</th><th>Total Seats</th><th>Actions</th></tr></thead>
        <tbody>
          {aircraft.map(a => (
            <tr key={a.aircraft_id}>
              <td>{a.model}</td><td>{a.registration_number}</td><td>{a.total_seats}</td>
              <td><button className="btn-delete" onClick={() => deleteAircraft(a.aircraft_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1 style={{ marginTop: 40 }}>Airports</h1>
      <form className="admin-form" onSubmit={submitAirport}>
        <input placeholder="Code (e.g. JFK)" value={airportForm.code} onChange={e => setAirportForm({...airportForm, code: e.target.value})} required />
        <input placeholder="Name" value={airportForm.name} onChange={e => setAirportForm({...airportForm, name: e.target.value})} required />
        <input placeholder="City" value={airportForm.city} onChange={e => setAirportForm({...airportForm, city: e.target.value})} required />
        <input placeholder="Country" value={airportForm.country} onChange={e => setAirportForm({...airportForm, country: e.target.value})} required />
        <input placeholder="Timezone" value={airportForm.timezone} onChange={e => setAirportForm({...airportForm, timezone: e.target.value})} />
        <button type="submit">Add Airport</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Country</th><th>Actions</th></tr></thead>
        <tbody>
          {airports.map(a => (
            <tr key={a.airport_id}>
              <td>{a.code}</td><td>{a.name}</td><td>{a.city}</td><td>{a.country}</td>
              <td><button className="btn-delete" onClick={() => deleteAirport(a.airport_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AircraftAirportsManager;