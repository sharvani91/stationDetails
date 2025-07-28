import React from 'react';
import { Link } from 'react-router-dom';
import { FaUpload, FaFileAlt } from 'react-icons/fa';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>

      </div>
      <ul>
        <li>
          <Link to="/upload">
            <FaUpload style={{ marginRight: '8px' }} />
            Upload
          </Link>
        </li>
        <li>
          <Link to="/view">
            <FaFileAlt style={{ marginRight: '8px' }} />
            View
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
