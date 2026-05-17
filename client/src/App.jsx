import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Leaf, Info } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <nav style={{ background: 'white', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, z_index: 100 }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <Leaf /> KrishiSathi
                        </Link>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <Link to="/" style={{ textDecoration: 'none', color: '#212121', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Home
                            </Link>
                            <Link to="/about" style={{ textDecoration: 'none', color: '#212121', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Info size={18} /> About Us
                            </Link>
                        </div>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
