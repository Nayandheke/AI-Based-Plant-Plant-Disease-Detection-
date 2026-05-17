import React from 'react';
import { Leaf, ShieldCheck, Zap, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ color: '#1b5e20', fontSize: '2.5rem', marginBottom: '1rem' }}>About KrishiSathi</h1>
                <p style={{ color: '#757575', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                    Empowering farmers and gardeners with cutting-edge AI technology to detect plant diseases early and effectively.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Leaf size={40} color="#2e7d32" style={{ marginBottom: '1rem' }} />
                    <h3>Our Mission</h3>
                    <p style={{ color: '#757575', marginTop: '0.5rem' }}>
                        To reduce crop loss and promote sustainable farming practices through accessible AI tools.
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <ShieldCheck size={40} color="#2e7d32" style={{ marginBottom: '1rem' }} />
                    <h3>Reliable Diagnosis</h3>
                    <p style={{ color: '#757575', marginTop: '0.5rem' }}>
                        Trained on thousands of leaf images, our model provides high-accuracy disease identification.
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <Zap size={40} color="#2e7d32" style={{ marginBottom: '1rem' }} />
                    <h3>Instant Results</h3>
                    <p style={{ color: '#757575', marginTop: '0.5rem' }}>
                        Get identification and professional remedies in seconds, directly from your browser.
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <Users size={40} color="#2e7d32" style={{ marginBottom: '1rem' }} />
                    <h3>Community First</h3>
                    <p style={{ color: '#757575', marginTop: '0.5rem' }}>
                        Built for everyone—from home gardeners to commercial farmers—without any registration required.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '5rem', background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#1b5e20', marginBottom: '1rem' }}>Support the Project</h2>
                <p style={{ color: '#757575' }}>
                    KrishiSathi is a public initiative to help agriculture. Spread the word or suggest improvements to help us grow better!
                </p>
            </div>
        </div>
    );
};

export default About;
