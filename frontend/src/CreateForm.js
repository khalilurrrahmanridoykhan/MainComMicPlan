import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const CreateForm = () => {
  const location = useLocation();
  const { projectId } = location.state;
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([{ type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [] }]);  // Initialize with one empty question
  const [showModal, setShowModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      const label = value;
      const name = label.toLowerCase().replace(/\s+/g, '_');
      newQuestions[index]['label'] = label;
      newQuestions[index]['name'] = name;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [] }]);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddSubQuestion = (questionIndex) => {
    const newQuestions = [...questions];
    const list_id = newQuestions[questionIndex].list_id;
    newQuestions[questionIndex].subQuestions.push({
      type: `select_one ${list_id}`,
      name: newQuestions[questionIndex].name,
      label: '',
      required: false,
      appearance: 'list-nolabel',
      options: [...newQuestions[questionIndex].options]  // Use the same options for sub-questions
    });
    setQuestions(newQuestions);
  };

  const handleSubQuestionChange = (questionIndex, subQuestionIndex, field, value) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      const label = value;
      const name = label.toLowerCase().replace(/\s+/g, '_');
      newQuestions[questionIndex].subQuestions[subQuestionIndex]['label'] = label;
      newQuestions[questionIndex].subQuestions[subQuestionIndex]['name'] = name;
    } else {
      newQuestions[questionIndex].subQuestions[subQuestionIndex][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    newQuestions[questionIndex].subQuestions.forEach(subQuestion => {
      subQuestion.options[optionIndex] = value;
    });
    setQuestions(newQuestions);
  };

  const handleAddSubOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    newQuestions[questionIndex].subQuestions.forEach(subQuestion => {
      subQuestion.options.push('');
    });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/projects/${projectId}/create_form/`, { name, questions }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      alert('Form created and files generated successfully');
      console.log('File URL:', response.data.file_url);  // Log the file URL
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  const handleShowModal = (index) => {
    setCurrentQuestionIndex(index);
    setShowModal(true);
  };

  const handleSelectType = (type) => {
    const newQuestions = [...questions];
    if (type === 'rating') {
      const list_id = generateRandomId();
      newQuestions[currentQuestionIndex] = {
        type: 'rating',
        name: '',
        label: '',
        required: false,
        list_id: list_id,
        options: ['Option 1', 'Option 2'],
        subQuestions: []
      };
    } else {
      newQuestions[currentQuestionIndex].type = type;
    }
    setQuestions(newQuestions);
    setShowModal(false);
  };

  const handleRequiredChange = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].required = !newQuestions[index].required;
    setQuestions(newQuestions);
  };

  const generateRandomId = (length = 7) => {
    return Math.random().toString(36).substring(2, 2 + length);
  };

  return (
    <div className="container mt-5">
      <h2>Create Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Questions:</label>
          {questions.map((question, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                className="form-control mb-2"
                value={question.type}
                onClick={() => handleShowModal(index)}
                placeholder={`Type for Question ${index + 1}`}
                readOnly
              />
              <input
                type="text"
                className="form-control mb-2"
                value={question.label}
                onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                placeholder={`Label for Question ${index + 1}`}
              />
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={question.required}
                  onChange={() => handleRequiredChange(index)}
                />
                <label className="form-check-label">Required</label>
              </div>
              {(question.type.startsWith('select_one') || question.type.startsWith('select_multiple')) && (
                <div className="mb-3">
                  <label className="form-label">Options:</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={() => handleAddOption(index)}>Add Option</button>
                </div>
              )}
              {question.type === 'rating' && (
                <div className="mb-3">
                  <label className="form-label">Options:</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => handleSubOptionChange(index, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={() => handleAddSubOption(index)}>Add Option</button>
                  <label className="form-label">Sub-Questions:</label>
                  {question.subQuestions.map((subQuestion, subIndex) => (
                    <div key={subIndex} className="mb-2">
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={subQuestion.type}
                        readOnly
                      />
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={subQuestion.label}
                        onChange={(e) => handleSubQuestionChange(index, subIndex, 'label', e.target.value)}
                        placeholder={`Label for Sub-Question ${subIndex + 1}`}
                      />
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={subQuestion.required}
                          onChange={() => handleRequiredChange(index)}
                        />
                        <label className="form-check-label">Required</label>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={() => handleAddSubQuestion(index)}>Add Sub-Question</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={handleAddQuestion}>Add Question</button>
        </div>
        <button type="submit" className="btn btn-primary">Create Form</button>
      </form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Question Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {[
              'audit',
              'select_one',
              'text',
              'integer',
              'date',
              'time',
              'datetime',
              'geopoint',
              'decimal',
              'select_multiple',
              'image',
              'audio',
              'video',
              'geotrace',
              'note',
              'barcode',
              'acknowledge',
              'rating'
            ].map((type) => (
              <li key={type} className="list-group-item" onClick={() => handleSelectType(type)} style={{ cursor: 'pointer' }}>
                {type}
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateForm;