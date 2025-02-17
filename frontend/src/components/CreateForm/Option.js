import React from 'react';

const Option = ({ option, onChange, index }) => {
  return (
    <div className="mb-2">
      <input
        type="text"
        className="form-control"
        value={option}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Option ${index + 1}`}
      />
    </div>
  );
};

export default Option;