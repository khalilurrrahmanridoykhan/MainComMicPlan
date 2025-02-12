import React, { useEffect, useState } from 'react';
import { fetchProjects, deleteProject, fetchForms } from './api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [forms, setForms] = useState({});
  const [activeProjectId, setActiveProjectId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetchProjects();
        console.log('Fetched projects:', response.data); // Debugging line
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    getProjects();
  }, []);

  const handleDelete = async (projectId) => {
    console.log('Deleting project with ID:', projectId); // Debugging line
    if (!projectId) {
      console.error('Project ID is undefined');
      return;
    }
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (projectId) => {
    console.log('Editing project with ID:', projectId); // Debugging line
    navigate(`/projects/edit/${projectId}`);
  };

  const handleCreateForm = (projectId) => {
    console.log('Creating form for project with ID:', projectId); // Debugging line
    navigate(`/projects/${projectId}/create_form`, { state: { projectId } });
  };

  const handleViewForms = async (projectId) => {
    console.log('Fetching forms for project with ID:', projectId); // Debugging line
    try {
      const response = await fetchForms(projectId);
      setForms((prevForms) => ({ ...prevForms, [projectId]: response.data }));
      setActiveProjectId(projectId); // Set the active project ID to show forms
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const handleOpenFormInEnketo = (fileUrl) => {
    const enketoUrl = `https://enketo.example.com/preview?form=${encodeURIComponent(fileUrl)}`;
    window.open(enketoUrl, '_blank');
  };

  return (
    <div>
      <h2>All Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="d-flex justify-content-between align-items-center">
            <div>
              <h3 style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleCreateForm(project.id)}>
                {project.name}
              </h3>
              <p>{project.description}</p>
              <button className="btn btn-link" onClick={() => handleViewForms(project.id)}>View Forms</button>
              {activeProjectId === project.id && forms[project.id] && (
                <ul>
                  {forms[project.id].map((form) => (
                    <li key={form.id}>
                      <span
                        style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => handleOpenFormInEnketo(form.file_url)}
                      >
                        {form.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <FontAwesomeIcon
                icon={faEdit}
                style={{ cursor: 'pointer', marginRight: '10px' }}
                onClick={() => handleEdit(project.id)}
              />
              <FontAwesomeIcon
                icon={faTrash}
                style={{ cursor: 'pointer' }}
                onClick={() => handleDelete(project.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllProjects;