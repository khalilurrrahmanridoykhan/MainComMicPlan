import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import axios from 'axios';

const UpdateTranslationsModal = ({ show, onHide, formId, defaultLanguageDescription, defaultLanguageSubtag }) => {
  const [labels, setLabels] = useState([]);
  const [updatedTranslations, setUpdatedTranslations] = useState({});

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/forms/${formId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        const formDetails = response.data;
        const extractedLabels = [];

        formDetails.questions.forEach((question) => {
          extractedLabels.push({ original: question.label, updated: question.translations?.[defaultLanguageDescription] || question.label });
          if (question.subQuestions) {
            question.subQuestions.forEach((subQuestion) => {
              extractedLabels.push({ original: subQuestion.label, updated: subQuestion.translations?.[defaultLanguageDescription] || subQuestion.label });
            });
          }
        });

        setLabels(extractedLabels);
      } catch (error) {
        console.error('Error fetching form details:', error);
      }
    };

    if (show) {
      fetchFormDetails();
    }
  }, [show, formId, defaultLanguageDescription]);

  const handleTranslationChange = (original, value) => {
    setUpdatedTranslations((prev) => ({
      ...prev,
      [original]: value
    }));
  };

  const handleSaveTranslations = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const payload = {
        translations: updatedTranslations,
        language_subtag: defaultLanguageSubtag
      };
      await axios.put(`http://localhost:8000/api/forms/${formId}/translations/`, payload, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      onHide();
    } catch (error) {
      console.error('Error saving translations:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Update Translations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Original String</th>
              <th>{defaultLanguageDescription} Updated Text</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={index}>
                <td>{label.original}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={updatedTranslations[label.original] || label.updated}
                    onChange={(e) => handleTranslationChange(label.original, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleSaveTranslations}>Save Translations</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateTranslationsModal;