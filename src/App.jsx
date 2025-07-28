// Original
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import View from './pages/View';
import Login from './pages/Login';
import Khordha from './pages/Khordha';
import Admin from './pages/Admin';
import DivisionLanding from './pages/DivisionLanding';


function App() {
  const location = useLocation();
  const noSidebarRoutes = ['/login']; // Add more paths if needed

  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="app">
      <Header />
      <div className="main-container" style={{ display: 'flex' }}>
        {shouldShowSidebar && <Sidebar />}
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/view" element={<View />} />
            <Route path="/login" element={<Login />} />
            <Route path="/khordha" element={<Khordha />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/division" element={<DivisionLanding />} />

          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;