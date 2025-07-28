import React, { useEffect, useState, useRef } from 'react';
// import testImage from "../assets/testImage.png";
import './View.css';

const View = () => {
  const [dots, setDots] = useState([]);
  const [division, setDivision] = useState('');
  const [zoneMapUrl, setZoneMapUrl] = useState('');
  const imageRef = useRef(null);

  const handleDivisionChange = async (e) => {
    const selectedDivision = e.target.value;
    setDivision(selectedDivision);

    try {
      const response = await fetch(`http://localhost:5000/api/zones/map/${selectedDivision}`);
      if (!response.ok) throw new Error('Image fetch failed');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setZoneMapUrl(imageUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to load zone map image');
    }

    handleDots(selectedDivision);
  };

  const handleDots = (selecteddivision) => {
    fetch(`./dots_${selecteddivision}.csv`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(csvText => {
        console.log(csvText)
        let rows = csvText.trim().split('\n').map(row => row.split(','));
        rows.shift(); // remove header

        const cleanedRows = rows
          .filter(row => row.length === 4)
          .map(([id, stationName, centerX, centerY]) => ({
            id: parseInt(id.trim(), 10),
            stationName: stationName.trim(),
            x: parseInt(centerX.trim(), 10),
            y: parseInt(centerY.trim(), 10)
          }));

        setDots(cleanedRows);
      })
      .catch(err => {
        console.error("Error loading CSV:", err);
      });
  }


  return (
    <div className="dashboard-content" style={{ marginTop: division != '' ? "0px" : "80px" }}>
      {/* Show dropdown only before division is selected */}
      {!division && (
        <>
          <h3>Choose your Division</h3>
          <select value={division} onChange={handleDivisionChange}>
            <option value="">-- Select Division --</option>
            <option value="Khordha">Khordha</option>
            <option value="Waltair">Waltair</option>
            <option value="Sambalpur">Sambalpur</option>
          </select>
        </>
      )
      }

      {/* Show image and dots after selection */}
      {
        division && (
          <>
            <h3>{division} Division Map</h3>
            <div
              className="image-dot-container"
              style={{ position: 'relative', display: 'inline-block', marginTop: '20px' }}
            >
              {zoneMapUrl && (
                <img
                  ref={imageRef}
                  src={zoneMapUrl}
                  alt={`${division} Map`}
                  style={{ border: '1px solid black', maxWidth: '100%', height: 'auto' }}
                />
              )}
              {dots.map(dot => (
                <a
                  key={dot.id}
                  href="https://www.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute',
                    top: dot.y,
                    left: dot.x,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    opacity: 0.7,
                    transform: 'translate(-50%, -50%)',
                    display: 'block',
                  }}
                  title={`Point ${dot.id}`}
                ></a>
              ))}
            </div>
          </>
        )
      }
    </div >
  );
};

export default View;
