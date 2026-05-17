import React, { useState } from 'react';
import { diseaseService } from '../services/api';
import { Upload, Leaf, Search, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const { data } = await diseaseService.analyze(formData);
            setResult(data);
        } catch (err) {
            console.error('Analysis Error:', err);
            setError({
                title: err.response?.data?.error || 'Analysis Failed',
                message: err.response?.data?.message || 'The system encountered an error while processing the image. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: '#1b5e20', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱 KrishiSathi AI</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Instant Plant Disease Diagnosis & Treatment Remedies</p>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
                {!result && !error && (
                    <div style={{ textAlign: 'center' }}>
                        <div 
                            className="upload-zone" 
                            onClick={() => !loading && document.getElementById('fileInput').click()}
                            style={{
                                border: '3px dashed #c8e6c9',
                                borderRadius: '20px',
                                padding: '3rem 2rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                background: preview ? '#f8fdf8' : '#fafafa',
                                minHeight: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            ) : (
                                <>
                                    <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                        <Upload size={48} color="#2e7d32" />
                                    </div>
                                    <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Upload Leaf Image</h3>
                                    <p style={{ color: '#757575' }}>Drag and drop or click to browse files</p>
                                    <p style={{ color: '#9e9e9e', fontSize: '0.85rem', marginTop: '1rem' }}>Supports JPG, PNG, WEBP (Max 5MB)</p>
                                </>
                            )}
                            <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                        </div>

                        {selectedFile && !loading && (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button onClick={handleReset} className="btn btn-outline" style={{ height: '50px', padding: '0 2rem' }}>
                                    Change Image
                                </button>
                                <button onClick={handleAnalyze} className="btn btn-primary" style={{ height: '50px', padding: '0 3rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    <Search size={20} style={{ marginRight: '8px' }} /> Start Analysis
                                </button>
                            </div>
                        )}

                        {loading && (
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                                <h3 style={{ color: '#2e7d32' }}>AI is Analyzing...</h3>
                                <p style={{ color: '#757575' }}>Identifying plant species and disease patterns</p>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ color: '#c62828', marginBottom: '1.5rem' }}>
                            <AlertCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ color: '#c62828', marginBottom: '1rem' }}>{error.title}</h2>
                        <p style={{ color: '#555', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                            {error.message}
                        </p>
                        <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
                            <RefreshCw size={18} style={{ marginRight: '8px' }} /> Try Again
                        </button>
                    </div>
                )}

                {result && (
                    <div className="result-container animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
                            <div className="result-image-box">
                                <img src={preview} alt="Analyzed leaf" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '4px solid white' }} />
                                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                    <button onClick={handleReset} className="btn btn-outline" style={{ width: '100%' }}>
                                        <RefreshCw size={18} style={{ marginRight: '8px' }} /> Analyze Another Leaf
                                    </button>
                                </div>
                            </div>
                            
                            <div className="result-details">
                                <div style={{ background: '#f1f8e9', padding: '2rem', borderRadius: '24px', border: '1px solid #c8e6c9', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2e7d32', marginBottom: '1rem' }}>
                                        <CheckCircle2 size={24} />
                                        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnosis Complete</span>
                                    </div>
                                    <h2 style={{ color: '#1b5e20', fontSize: '2rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                                        {result.disease}
                                    </h2>
                                    
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: '#666' }}>AI Confidence Score</span>
                                            <span style={{ fontWeight: 800, color: '#2e7d32', fontSize: '1.2rem' }}>{result.confidence.toFixed(1)}%</span>
                                        </div>
                                        <div style={{ height: '14px', background: '#f5f5f5', borderRadius: '7px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${result.confidence}%`, 
                                                background: 'linear-gradient(90deg, #4caf50, #2e7d32)',
                                                borderRadius: '7px',
                                                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '0 0.5rem' }}>
                                    <h3 style={{ color: '#1b5e20', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Leaf size={20} /> About this condition
                                    </h3>
                                    <p style={{ color: '#444', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                        {result.remedy.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="remedy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                            <div style={{ background: 'white', border: '1px solid #c8e6c9', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <h4 style={{ color: '#2e7d32', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                                    <span style={{ background: '#e8f5e9', padding: '8px', borderRadius: '10px' }}>🌿</span> Organic Control
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {result.remedy.organic.map((item, i) => (
                                        <li key={i} style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative', color: '#555', lineHeight: '1.5' }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#4caf50' }}>•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div style={{ background: 'white', border: '1px solid #ffccbc', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <h4 style={{ color: '#d84315', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                                    <span style={{ background: '#fff3e0', padding: '8px', borderRadius: '10px' }}>🧪</span> Chemical Control
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {result.remedy.chemical.map((item, i) => (
                                        <li key={i} style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative', color: '#555', lineHeight: '1.5' }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#ff7043' }}>•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <footer style={{ textAlign: 'center', marginTop: '4rem', color: '#9e9e9e', fontSize: '0.9rem' }}>
                <p>© 2026 KrishiSathi AI. Trained on 38 disease classes.</p>
            </footer>
        </div>
    );
};

export default Dashboard;
