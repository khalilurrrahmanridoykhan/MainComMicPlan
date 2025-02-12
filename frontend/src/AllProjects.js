import React, { useEffect, useState } from 'react';
import { fetchProjects, deleteProject } from './api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
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