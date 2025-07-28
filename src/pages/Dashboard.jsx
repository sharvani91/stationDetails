import React from 'react';
import './Dashboard.css';
import railLogo from '../assets/Rail_logo.png';

function Dashboard() {
    return (
        <div
            className="dashboard-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                color: '#333',
                fontFamily: 'Segoe UI, sans-serif',
                textAlign: 'center',
                padding: '20px',
                marginTop: '3rem'
            }}
        >
            <img
                src={railLogo}
                alt="Indian Railways Logo"
                style={{ width: '120px', marginBottom: '1.5rem' }}
            />

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                Welcome to Indian Railways
            </h1>

            <p style={{ fontSize: '1.1rem', maxWidth: '700px', marginBottom: '2rem' }}>
                Upload division maps and let our AI-powered engine do the magic — detecting every station with precision using advanced OCR and Gemini intelligence. <br /><br />
                Explore interactive maps. Access station-wise documents instantly. Redefining how Indian Railways connects data with decisions.
            </p>

            <footer style={{ position: 'absolute', bottom: '20px', fontSize: '0.9rem' }}>
                © 2025 Indian Railways Project | Designed by Group M
            </footer>
        </div >
    );
}

export default Dashboard;