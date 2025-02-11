import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register'; // Import the Register component
import Forms from './Forms';
import AdminPanel from './AdminPanel'; // Import the AdminPanel component
import CreateProject from './CreateProject';
import AllProjects from './AllProjects';
import Dashboard from './Dashboard';
import Submissions from './Submissions';

const App = () => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'));

  useEffect(() => {
    setAuthToken(sessionStorage.getItem('authToken'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={authToken ? <Navigate to="/admin" /> : <Login setAuthToken={setAuthToken} />} />
        <Route path="/register" element={<Register />} /> {/* Add the register route */}
        <Route path="/" element={authToken ? <AdminPanel setAuthToken={setAuthToken} user={authToken} /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects/all" element={<AllProjects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="forms" element={<Forms />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;