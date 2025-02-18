import React from 'react';
import { Form } from 'react-bootstrap';

const QuestionSettings = ({ question, onChange }) => {
  const handleLabelChange = (e) => {
    onChange('label', e.target.value);
  };

  const handleRequiredChange = (e) => {
    onChange('required', e.target.checked);
  };

  const handleAppearanceChange = (e) => {
    onChange('appearance', e.target.value);
  };

  return (
    <div className="question-settings">
      <div className="mb-3">
        <label className="form-label">Label:</label>
        <input
          type="text"
          className="form-control"
          value={question.label}
          onChange={handleLabelChange}
        />
      </div>
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          checked={question.required}
          onChange={handleRequiredChange}
        />
        <label className="form-check-label">Required</label>
      </div>
      <div className="mb-3">
        <label className="form-label">Appearance:</label>
        <Form.Select value={question.appearance} onChange={handleAppearanceChange}>
          <option value="">Select</option>
          <option value="minimal">Minimal</option>
          <option value="autocomplete">Autocomplete</option>
          <option value="quick">Quick</option>
          <option value="horizontal">Horizontal</option>
          <option value="likert">Likert</option>
          <option value="compact">Compact</option>
          <option value="list-nolabel">List-nolabel</option>
        </Form.Select>
      </div>
    </div>
  );
};

export default QuestionSettings;