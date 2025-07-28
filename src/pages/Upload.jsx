import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

function Upload() {
  const [mapImage, setMapImage] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [showBrowse, setShowBrowse] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [stationList, setStationList] = useState([]);
  const [stationFiles, setStationFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [division, setDivision] = useState('');
  const [zoneMapFile, setZoneMapFile] = useState(null);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMapImage(file);
    setZoneMapFile(file);
    setPreviewURL('');
    if (file) {
      setShowBrowse(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('uploadedImage', reader.result); // optional
      };
      reader.readAsDataURL(file);
    }
  };


  const handleBrowse = () => {
    if (mapImage) {
      const imageURL = URL.createObjectURL(mapImage);
      setPreviewURL(imageURL);
      setShowScan(true);
    }
  };

  const handleScan = () => {
    const formData = new FormData();
    formData.append('image', mapImage);

    formData.append('division', division);
    
    fetch('http://127.0.0.1:5000/process_stations', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (!data.stations || data.stations.length === 0) {
          setShowTable(false);
        }
        setStationList(data.stations);
        setShowTable(true);
      })
      .catch(err => {
        console.error(err);
        alert("Scan failed: " + err.message);
      });
  };

  const handleStationUpload = (e, station) => {
    const file = e.target.files[0];
    if (file) {
      setStationFiles(prev => ({ ...prev, [station]: file })); // ✅ store File object
    }
  };

  const handleFileUpload = async (station) => {
    const file = stationFiles[station];
    if (!file || !division) {
      alert('Missing station file or division.');
      return;
    }

    const formData = new FormData();
    formData.append('station_name', station);
    formData.append('zone_name', division);
    formData.append('mapImage', file);

    try {
      const response = await fetch(`http://localhost:5000/api/stations/${station}/map`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(prev => ({ ...prev, [station]: '✅ Uploaded' }));
      } else {
        console.error(result.error);
        setUploadStatus(prev => ({ ...prev, [station]: '❌ Upload failed' }));
      }
    } catch (err) {
      console.error(err);
      setUploadStatus(prev => ({ ...prev, [station]: '❌ Upload error' }));
    }
  };

  const uploadZoneMap = async () => {
    if (!zoneMapFile || !division) {
      alert('Please select a division and a file');
      return;
    }

    const formData = new FormData();
    formData.append('zoneMap', zoneMapFile);
    formData.append('zoneName', division);

    try {
      const res = await fetch(`http://localhost:5000/api/zones/${division}/map`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Zone map for ${division} uploaded successfully`);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Zone map upload error');
    }
  };


  const handleDivisionChange = (e) => {
    setDivision(e.target.value);
  };

  return (
    <div className="upload-container dashboard-content" style={{ marginTop: division !== '' ? "0px" : "80px" }}>
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
      )}
      {division && (
        <h3>{division} Division Map</h3>
      )}
      {division && (
        <div className="upload-box">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {showBrowse && (
            <button className="browse-btn" onClick={() => {handleBrowse(); uploadZoneMap();}}>
              Browse
            </button>
          )}
        </div>
      )}
      {previewURL && (
        <div className="picture-box">
          <img src={previewURL} alt="Preview" className="image-preview" />
        </div>
      )}

      {showScan && (
        <div className="scan-button">
          <button className="scan-btn" onClick={handleScan}>Scan</button>
        </div>
      )}

      {showTable && (
        <div className="station-table">
          <table>
            <thead>
              <tr>
                <th>Station Name</th>
                <th>Browse</th>
                <th>Upload</th>
              </tr>
            </thead>
            <tbody>
              {stationList.map((station, index) => (
                <tr key={index}>
                  <td>{station}</td>
                  <td>
                    <label className="table-btn upload-label">
                      Browse
                      <input
                        type="file"
                        accept="application/pdf, image/*"
                        onChange={(e) => handleStationUpload(e, station)}
                        hidden
                      />
                    </label>
                    {stationFiles[station] && (
                      <div className="file-name">{stationFiles[station].name}</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="table-btn upload-btn"
                      onClick={() => handleFileUpload(station)}
                      disabled={!stationFiles[station]}
                    >
                      Upload
                    </button>
                    {uploadStatus[station] && (
                      <div className="file-status">{uploadStatus[station]}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Upload;
