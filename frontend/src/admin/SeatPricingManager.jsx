import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function SeatPricingManager() {
  const [flights, setFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [summary, setSummary] = useState([]);
  const [prices, setPrices] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [checkedSummary, setCheckedSummary] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/flights`).then(r => r.json()).then(setFlights);
  }, []);

  const loadSummary = () => {
    if (!selectedFlightId) return;
    fetch(`${API}/flights/${selectedFlightId}/seat-summary`)
      .then(r => r.json())
      .then(data => {
        setSummary(data);
        const initialPrices = {};
        data.forEach(row => { initialPrices[row.class] = row.price; });
        setPrices(initialPrices);
        setCheckedSummary(true);
      });
  };

  useEffect(() => {
    setCheckedSummary(false);
    setSummary([]);
    setMessage('');
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlightId]);

  const handlePriceChange = (cls, value) => {
    setPrices({ ...prices, [cls]: value });
  };

  const handleSave = async (cls) => {
    setSaving(true);
    setMessage('');
    try {
      await fetch(`${API}/flights/${selectedFlightId}/seat-pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class: cls, price: prices[cls] })
      });
      setMessage(`${cls} pricing updated`);
    } catch (err) {
      setMessage('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/flights/${selectedFlightId}/generate-seats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate pricing');
      setMessage(data.message);
      loadSummary();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1>Seat pricing</h1>

      <div className="admin-form" style={{ gridTemplateColumns: '1fr' }}>
        <select value={selectedFlightId} onChange={e => setSelectedFlightId(e.target.value)}>
          <option value="">Select a flight</option>
          {flights.map(f => (
            <option key={f.flight_id} value={f.flight_id}>
              {f.flight_number} · {f.origin_code} → {f.destination_code} · {new Date(f.departure_time).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {message && <p style={{ color: '#166534' }}>{message}</p>}

      {selectedFlightId && checkedSummary && summary.length === 0 && (
        <div style={{ padding: 16, border: '1px dashed var(--grey-300)', borderRadius: 6, marginTop: 16 }}>
          <p style={{ margin: '0 0 12px' }}>This flight has no seat pricing yet.</p>
          <button className="btn-edit" disabled={generating} onClick={handleGenerate}>
            {generating ? 'Generating...' : 'Generate seat pricing'}
          </button>
        </div>
      )}

      {selectedFlightId && summary.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Available / Total</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {summary.map(row => (
              <tr key={row.class}>
                <td style={{ textTransform: 'capitalize' }}>{row.class}</td>
                <td>{row.available_seats} / {row.total_seats}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={prices[row.class] ?? ''}
                    onChange={e => handlePriceChange(row.class, e.target.value)}
                    style={{ width: 100, padding: 6, border: '1px solid var(--grey-300)', borderRadius: 4 }}
                  />
                </td>
                <td>
                  <button
                    className="btn-edit"
                    disabled={saving}
                    onClick={() => handleSave(row.class)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SeatPricingManager;