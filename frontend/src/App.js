import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Forms from './Forms';
import AdminPanel from './AdminPanel';
import CreateProject from './CreateProject';
import AllProjects from './AllProjects';
import Dashboard from './Dashboard';
import Submissions from './Submissions';
import EditProject from './EditProject';
import CreateForm from './components/CreateForm/CreateForm';
import FormList from './components/FormsList';
import EditForm from './components/EditForm';
import FormInfo from './components/FormInfo/FormInfo';

const App = () => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'));

  useEffect(() => {
    setAuthToken(sessionStorage.getItem('authToken'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={authToken ? <Navigate to="/dashboard" /> : <Login setAuthToken={setAuthToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={authToken ? <AdminPanel setAuthToken={setAuthToken} user={authToken} /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects/all" element={<AllProjects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/edit/:projectId" element={<EditProject />} />
          <Route path="projects/:projectId/forms" element={<FormList />} />
          <Route path="projects/:projectId/create_form" element={<CreateForm />} />
          <Route path="projects/:projectId/edit_form/:formId" element={<EditForm />} />
          <Route path="projects/:projectId/forms/:formId" element={<FormInfo />} />
          <Route path="forms" element={<Forms />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;