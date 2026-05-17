import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Leaf, Info } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white p-4 shadow-sm sticky top-0 z-50">
                    <div className="container mx-auto flex justify-between items-center max-w-6xl">
                        <Link to="/" className="text-2xl font-bold text-green-700 flex items-center gap-2 no-underline">
                            <Leaf className="w-8 h-8" />
                            <span>KrishiSathi</span>
                        </Link>
                        <div className="flex gap-6 items-center">
                            <Link to="/about" className="no-underline text-gray-800 font-medium flex items-center gap-1 hover:text-green-700 transition-colors">
                                <Info size={18} />
                                <span>About Us</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
