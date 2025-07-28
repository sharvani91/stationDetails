import React, { useState } from 'react';

const DivisionLanding = () => {
  const [division, setDivision] = useState('Khordha');

  return (
    <div className="dashboard-content">
      <h3>Choose your Division</h3>
      <select value={division} onChange={(e) => setDivision(e.target.value)}>
        <option value="Khordha">Khordha</option>
        <option value="Waltair">Waltair</option>
        <option value="Sambalpur">Sambalpur</option>
      </select>
    </div>
  );
};

export default DivisionLanding;
