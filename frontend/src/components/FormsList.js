import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FormList = () => {
  const { projectId } = useParams();
  const [forms, setForms] = useState([]);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}/forms/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    const fetchProject = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setProjectName(response.data.name);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchForms();
    fetchProject();
  }, [projectId]);

  return (
    <div className="container mt-5">
      <h2>Forms for Project: {projectName}</h2>
      <ul className="list-group">
        {forms.map((form) => (
          <li key={form.id} className="list-group-item">
            {form.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormList;
