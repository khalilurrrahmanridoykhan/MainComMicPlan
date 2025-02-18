import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Question from './Question';
import QuestionTypeModal from './QuestionTypeModal';

const CreateForm = () => {
  const location = useLocation();
  const { projectId } = location.state || {};
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([{ id: '1', type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [], parameters: '', hint: '', default: '', appearance: '', guidance_hint: '', hxl: '' }]);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [openSettings, setOpenSettings] = useState({});

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      const label = value;
      let name = label.toLowerCase().replace(/[^a-z0-9-._:]/g, '_');
      if (!/^[a-z:_]/.test(name)) {
        name = `_${name}`;
      }
      newQuestions[index]['label'] = label;
      newQuestions[index]['name'] = name;
    } else if (field === 'parameters') {
      if (newQuestions[index].type === 'image') {
        newQuestions[index]['parameters'] = `max-pixels=${value.split('=')[1]}`;
      } else if (newQuestions[index].type === 'select_one' || newQuestions[index].type === 'select_multiple') {
        const [randomize, seed] = value.split(';').map(param => param.split('=')[1]);
        newQuestions[index]['parameters'] = `randomize=${randomize};seed=${seed}`;
      } else {
        newQuestions[index][field] = value;
      }
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: `${questions.length + 1}`, type: 'text', name: '', label: '', required: false, options: ['Option 1', 'Option 2'], subQuestions: [], parameters: '', hint: '', default: '', appearance: '', guidance_hint: '', hxl: '' }]);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
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
    const subQuestionIndex = newQuestions[questionIndex].subQuestions.length;
    const list_id = newQuestions[questionIndex].list_id;

    // Generate the constraint for the new sub-question
    let constraint = '';
    for (let i = 0; i < subQuestionIndex; i++) {
      if (constraint) {
        constraint += ' and ';
      }
      constraint += `\${_${subQuestionIndex + 1}th_choice} != \${_${i + 1}th_choice}`;
    }

    newQuestions[questionIndex].subQuestions.push({
      index: subQuestionIndex,
      type: `select_one ${list_id}`,
      name: '',
      label: '',
      required: false,
      appearance: 'list-nolabel',
      options: [],
      constraint: constraint
    });
    setQuestions(newQuestions);
  };

  const handleSubQuestionChange = (questionIndex, subQuestionIndex, field, value) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      const label = value;
      const name = label.toLowerCase().replace(/\s+/g, '_');
      newQuestions[questionIndex].subQuestions[subQuestionIndex] = {
        ...newQuestions[questionIndex].subQuestions[subQuestionIndex],
        label: label,
        name: name
      };
    } else {
      newQuestions[questionIndex].subQuestions[subQuestionIndex] = {
        ...newQuestions[questionIndex].subQuestions[subQuestionIndex],
        [field]: value
      };
    }
    setQuestions(newQuestions);
  };

  const handleDeleteSubQuestion = (questionIndex, subQuestionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].subQuestions.splice(subQuestionIndex, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) {
      newErrors['name'] = 'Form name cannot be empty.';
    }
    questions.forEach((question, index) => {
      if (!question.label.trim()) {
        newErrors[index] = 'Label for Question cannot be empty.';
      }
      if (question.type === 'rating') {
        question.subQuestions.forEach((subQuestion, subIndex) => {
          if (!subQuestion.label.trim()) {
            newErrors[`${index}-${subIndex}`] = `Label for Sub-Question ${subIndex + 1} cannot be empty.`;
          }
        });
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

  const toggleSettings = (index) => {
    setOpenSettings((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShowModal = (index) => {
    setCurrentQuestionIndex(index);
    setShowModal(true);
  };

  const handleSelectType = (type) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].type = type;
    setQuestions(newQuestions);
    setShowModal(false);
  };

  return (
    <div className="container mt-5">
      <h2>Create Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          {errors['name'] && <p className="text-danger">{errors['name']}</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Questions:</label>
          {questions.map((question, index) => (
            <Question
              key={question.id}
              question={question}
              index={index}
              handleQuestionChange={handleQuestionChange}
              handleDeleteQuestion={handleDeleteQuestion}
              toggleSettings={toggleSettings}
              openSettings={openSettings}
              handleAddOption={handleAddOption}
              handleOptionChange={handleOptionChange}
              handleAddSubQuestion={handleAddSubQuestion}
              handleSubQuestionChange={handleSubQuestionChange}
              handleDeleteSubQuestion={handleDeleteSubQuestion}
              handleShowModal={handleShowModal}
              errors={errors}
            />
          ))}
          <button type="button" className="btn btn-secondary" onClick={handleAddQuestion}>Add Question</button>
        </div>
        <button type="submit" className="btn btn-primary">Create Form</button>
      </form>

      <QuestionTypeModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelectType={handleSelectType}
      />
    </div>
  );
};

export default CreateForm;