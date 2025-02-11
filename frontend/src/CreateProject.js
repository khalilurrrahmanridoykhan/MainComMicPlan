import React, { useState } from 'react';
import { createProject } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [form, setForm] = useState('');
  const [data, setData] = useState('');
  const [settings, setSettings] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({ name, description, summary, form, data, settings });
      alert('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Summary:</label>
          <textarea className="form-control" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Form:</label>
          <textarea className="form-control" value={form} onChange={(e) => setForm(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Data:</label>
          <textarea className="form-control" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Settings:</label>
          <textarea className="form-control" value={settings} onChange={(e) => setSettings(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProject;