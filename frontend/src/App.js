import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './admin/AdminDashboard';
import Home from './pages/Home';
 import Book from './pages/Book';
import FlightDetail from './pages/FlightDetail';
import ClassDetail from './pages/ClassDetail';
import BookingPage from './pages/BookingPage';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public homepage */}
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />

        <Route path="/flight/:id" element={<FlightDetail />} />
        <Route path="/flight/:id/class/:className" element={<ClassDetail />} />

        <Route path="/booking/:id/:className" element={<BookingPage />} />


        {/* Login page */}
        <Route
          path="/login"
          element={user ? <Navigate to="/admin" /> : <Login onLogin={setUser} />}
        />

        {/* Admin dashboard - protected */}
        <Route
          path="/admin/*"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role !== 'admin' && user.role !== 'staff' ? (
              <div style={{ padding: 40, fontFamily: 'system-ui' }}>
                <p>You're logged in as {user.email}, but this account isn't an admin.</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div>
                <div style={{ padding: '10px 20px', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Logged in as {user.first_name} ({user.role})</span>
                  <button onClick={handleLogout}>Logout</button>
                </div>
                <AdminDashboard />
              </div>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;