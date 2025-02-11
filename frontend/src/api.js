import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  return config;
});

export const fetchForms = () => API.get('forms/');
export const submitForm = (data) => API.post('submissions/', data);
export const fetchProjects = () => API.get('projects/');
export const createProject = (data) => API.post('projects/', data);