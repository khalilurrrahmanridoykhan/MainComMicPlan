import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ManageTranslationsModal = ({ show, onHide, formId, onSave }) => {
  const [languages, setLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [defaultLanguageCode, setDefaultLanguageCode] = useState('');
  const [formDetails, setFormDetails] = useState({});

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/languages/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setLanguages(response.data);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    const fetchFormDetails = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/forms/${formId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setFormDetails(response.data);
      } catch (error) {
        console.error('Error fetching form details:', error);
      }
    };

    fetchLanguages();
    fetchFormDetails();
  }, [formId]);

  const handleLanguageChange = (e) => {
    const selectedLanguageId = e.target.value;
    setDefaultLanguage(selectedLanguageId);
    const selectedLanguage = languages.find(language => language.id === parseInt(selectedLanguageId));
    if (selectedLanguage) {
      setDefaultLanguageCode(selectedLanguage.subtag);
    }
  };

  const handleLanguageCodeChange = (e) => {
    const selectedLanguageCode = e.target.value;
    setDefaultLanguageCode(selectedLanguageCode);
    const selectedLanguage = languages.find(language => language.subtag === selectedLanguageCode);
    if (selectedLanguage) {
      setDefaultLanguage(selectedLanguage.id);
    }
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const payload = {
        ...formDetails,
        default_language: defaultLanguage
      };
      console.log('Request Payload:', payload); // Log the request payload
      await axios.put(`http://localhost:8000/api/forms/${formId}/`, payload, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      onSave();
      onHide();
    } catch (error) {
      console.error('Error saving translations:', error);
      console.error('Server Response:', error.response.data); // Log the server response
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Manage Translations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please name your default language before adding languages and translations.</p>
        <Form>
          <Form.Group controlId="defaultLanguage">
            <Form.Label>Default Language Name</Form.Label>
            <Form.Control as="select" value={defaultLanguage} onChange={handleLanguageChange}>
              <option value="">Select Language</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>{language.description}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="defaultLanguageCode">
            <Form.Label>Default Language Code</Form.Label>
            <Form.Control as="select" value={defaultLanguageCode} onChange={handleLanguageCodeChange}>
              <option value="">Select Language Code</option>
              {languages.map((language) => (
                <option key={language.id} value={language.subtag}>{language.subtag}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageTranslationsModal;