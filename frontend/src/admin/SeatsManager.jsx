import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function SeatsManager() {
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [seats, setSeats] = useState([]);
  const [checked, setChecked] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/aircraft`).then(r => r.json()).then(setAircraftList);
  }, []);

  const loadSeats = () => {
    if (!selectedAircraftId) return;
    fetch(`${API}/seats/${selectedAircraftId}`)
      .then(r => r.json())
      .then(data => {
        setSeats(data);
        setChecked(true);
      });
  };

  useEffect(() => {
    setChecked(false);
    setSeats([]);
    setMessage('');
    loadSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAircraftId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/seats/${selectedAircraftId}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate seats');
      setMessage(data.message);
      loadSeats();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const counts = seats.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1>Aircraft seats</h1>

      <div className="admin-form" style={{ gridTemplateColumns: '1fr' }}>
        <select value={selectedAircraftId} onChange={e => setSelectedAircraftId(e.target.value)}>
          <option value="">Select an aircraft</option>
          {aircraftList.map(a => (
            <option key={a.aircraft_id} value={a.aircraft_id}>
              {a.model} · {a.registration_number} · {a.total_seats} seats
            </option>
          ))}
        </select>
      </div>

      {message && <p style={{ color: '#166534' }}>{message}</p>}

      {selectedAircraftId && checked && seats.length === 0 && (
        <div style={{ padding: 16, border: '1px dashed var(--grey-300)', borderRadius: 6, marginTop: 16 }}>
          <p style={{ margin: '0 0 12px' }}>This aircraft has no seats defined yet.</p>
          <button className="btn-edit" disabled={generating} onClick={handleGenerate}>
            {generating ? 'Generating...' : 'Generate seats'}
          </button>
        </div>
      )}

      {selectedAircraftId && seats.length > 0 && (
        <>
          <p style={{ margin: '16px 0' }}>
            {seats.length} seats total —{' '}
            {Object.entries(counts).map(([cls, n]) => `${n} ${cls}`).join(', ')}
          </p>
          <table className="admin-table">
            <thead>
              <tr><th>Seat</th><th>Class</th><th>Window</th><th>Aisle</th></tr>
            </thead>
            <tbody>
              {seats.map(s => (
                <tr key={s.seat_id}>
                  <td>{s.seat_number}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.class}</td>
                  <td>{s.is_window ? 'Yes' : ''}</td>
                  <td>{s.is_aisle ? 'Yes' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default SeatsManager;