import React from 'react';
import { Collapse, Form } from 'react-bootstrap';

const Question = ({ question, index, handleQuestionChange, handleDeleteQuestion, toggleSettings, openSettings }) => {
  return (
    <div className="mb-2" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '4px', padding: '10px' }}>
      <div style={{ cursor: 'grab', backgroundColor: '#d1ecf1', padding: '5px', borderRadius: '4px' }}>
        <i className="fas fa-grip-vertical"></i> Drag to reorder
      </div>
      <input
        type="text"
        className="form-control mb-2"
        value={question.type}
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
          onChange={() => handleQuestionChange(index, 'required', !question.required)}
        />
        <label className="form-check-label">Required</label>
      </div>
      <button type="button" className="btn btn-secondary" onClick={() => toggleSettings(index)}>Settings</button>
      <Collapse in={openSettings[index]}>
        <div className="mt-3">
          <div className="mb-3">
            <label className="form-label">Data column name:</label>
            <input type="text" className="form-control" value={question.name} onChange={(e) => handleQuestionChange(index, 'name', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Guidance hint:</label>
            <input type="text" className="form-control" value={question.guidance_hint} onChange={(e) => handleQuestionChange(index, 'guidance_hint', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Default response:</label>
            <input type="text" className="form-control" value={question.default} onChange={(e) => handleQuestionChange(index, 'default', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Appearance (advanced):</label>
            <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
              <option value="select">Select</option>
              <option value="multiline">Multiline</option>
              <option value="numbers">Numbers</option>
              <option value="other">Other</option>
            </Form.Select>
          </div>
        </div>
      </Collapse>
      <button type="button" className="btn btn-danger" onClick={() => handleDeleteQuestion(index)}>Delete Question</button>
    </div>
  );
};

export default Question;