import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Row, Col, Collapse, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Question from './Question';
import QuestionTypeModal from './QuestionTypeModal';

const CreateForm = () => {
  const location = useLocation();
  const { projectId } = location.state || {};
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([{ type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [], parameters: '', hint: '', default: '', appearance: '', guidance_hint: '', hxl: '' }]);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [openSettings, setOpenSettings] = useState({});

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      const label = value;
      const name = label.toLowerCase().replace(/\s+/g, '_');
      newQuestions[index]['label'] = label;
      newQuestions[index]['name'] = name;
    } else if (field === 'parameters') {
      const [start, end, step] = value.split(';').map(param => param.split('=')[1]);
      newQuestions[index]['parameters'] = `start=${start};end=${end};step=${step}`;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [], parameters: '', hint: '', default: '', appearance: '', guidance_hint: '', hxl: '' }]);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    questions.forEach((question, index) => {
      if (!question.label.trim()) {
        newErrors[index] = 'Label for Question cannot be empty.';
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/projects/${projectId}/create_form/`, { name, questions }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      alert('Form created and files generated successfully');
      console.log('File URL:', response.data.file_url);
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const reorderedQuestions = Array.from(questions);
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);
    setQuestions(reorderedQuestions);
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((question, index) => (
                    <Draggable key={index} draggableId={String(index)} index={index}>
                      {(provided) => (
                        <Question
                          provided={provided}
                          question={question}
                          index={index}
                          handleQuestionChange={handleQuestionChange}
                          handleDeleteQuestion={handleDeleteQuestion}
                          errors={errors}
                          openSettings={openSettings}
                          setOpenSettings={setOpenSettings}
                          handleShowModal={setShowModal}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button type="button" className="btn btn-secondary" onClick={handleAddQuestion}>Add Question</button>
        </div>
        <button type="submit" className="btn btn-primary">Create Form</button>
      </form>

      <QuestionTypeModal show={showModal} onHide={() => setShowModal(false)} currentQuestionIndex={currentQuestionIndex} setQuestions={setQuestions} questions={questions} />
    </div>
  );
};

export default CreateForm;