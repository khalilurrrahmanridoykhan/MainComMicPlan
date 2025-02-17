import React from 'react';

const SubQuestion = ({ subQuestion, onChange, onDelete }) => {
  const handleLabelChange = (e) => {
    onChange(subQuestion.index, 'label', e.target.value);
  };

  const handleRequiredChange = () => {
    onChange(subQuestion.index, 'required', !subQuestion.required);
  };

  return (
    <div className="sub-question mb-2">
      <input
        type="text"
        className="form-control mb-2"
        value={subQuestion.label}
        onChange={handleLabelChange}
        placeholder="Label for Sub-Question"
      />
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          checked={subQuestion.required}
          onChange={handleRequiredChange}
        />
        <label className="form-check-label">Required</label>
      </div>
      <button type="button" className="btn btn-danger" onClick={() => onDelete(subQuestion.index)}>Delete Sub-Question</button>
    </div>
  );
};

export default SubQuestion;