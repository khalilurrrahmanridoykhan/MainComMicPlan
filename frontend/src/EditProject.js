import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, updateProject } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetchProject(projectId);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    getProject();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prevProject) => ({
      ...prevProject,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProject(projectId, project);
      alert('Project updated successfully');
      navigate('/projects/all');
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={project.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea
            className="form-control"
            name="description"
            value={project.description}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Project</button>
      </form>
    </div>
  );
};

export default EditProject;