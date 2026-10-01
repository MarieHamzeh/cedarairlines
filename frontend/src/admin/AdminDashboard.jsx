import { useState } from 'react';
import FlightsManager from './FlightsManager';
import BookingsManager from './BookingsManager';
import UsersManager from './UsersManager';
import AircraftAirportsManager from './AircraftAirportsManager';
import SeatPricingManager from './SeatPricingManager';
import SeatsManager from './SeatsManager';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('flights');

  const tabs = [
    { id: 'flights', label: 'Flights' },
    { id: 'seats', label: 'Seats' },
    { id: 'pricing', label: 'Seat pricing' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'users', label: 'Users' },
    { id: 'fleet', label: 'Aircraft & Airports' },
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Cedar Airlines Admin</h2>
        <nav>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'flights' && <FlightsManager />}
        {activeTab === 'seats' && <SeatsManager />}
        {activeTab === 'pricing' && <SeatPricingManager />}
        {activeTab === 'bookings' && <BookingsManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'fleet' && <AircraftAirportsManager />}
      </main>
    </div>
  );
}

export default AdminDashboard;