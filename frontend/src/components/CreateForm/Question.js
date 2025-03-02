import React from 'react';
import { Collapse, Form } from 'react-bootstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Option from './Option';
import SubQuestion from './SubQuestion';

const Question = ({ question, index, handleQuestionChange, handleDeleteQuestion, toggleSettings, openSettings, handleAddOption, handleOptionChange, handleAddSubQuestion, handleSubQuestionChange, handleDeleteSubQuestion, handleShowModal, errors }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: '#f8f9fa',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '10px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-2">
      <div style={{ cursor: 'grab', backgroundColor: '#d1ecf1', padding: '5px', borderRadius: '4px' }} {...listeners}>
        <i className="fas fa-grip-vertical"></i> Drag to reorder
      </div>
      <input
        type="text"
        className="form-control mb-2"
        value={question.type}
        placeholder={`Type for Question ${index + 1}`}
        readOnly
        onClick={() => handleShowModal(index)} // Trigger the modal on click
      />
      <input
        type="text"
        className="form-control mb-2"
        value={question.label}
        onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
        placeholder={`Label for Question ${index + 1}`}
      />
      {errors[index] && <p className="text-danger">{errors[index]}</p>}
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
            {question.type === 'text' ? (
              <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
                <option value="select">Select</option>
                <option value="multiline">Multiline</option>
                <option value="numbers">Numbers</option>
                <option value="other">Other</option>
              </Form.Select>
            ) : question.type.startsWith('select_one') ? (
              <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
                <option value="select">Select</option>
                <option value="minimal">Minimal</option>
                <option value="autocomplete">Autocomplete</option>
                <option value="quick">Quick</option>
                <option value="horizontal-compact">Horizontal-compact</option>
                <option value="horizontal">Horizontal</option>
                <option value="likert">Likert</option>
                <option value="compact">Compact</option>
                <option value="quickcompact">Quickcompact</option>
                <option value="label">Label</option>
                <option value="list-nolabel">List-nolabel</option>
                <option value="other">Other</option>
              </Form.Select>
            ) : question.type.startsWith('select_multiple') ? (
              <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
                <option value="select">Select</option>
                <option value="minimal">Minimal</option>
                <option value="horizontal-compact">Horizontal-compact</option>
                <option value="horizontal">Horizontal</option>
                <option value="compact">Compact</option>
                <option value="label">Label</option>
                <option value="list-nolabel">List-nolabel</option>
                <option value="other">Other</option>
              </Form.Select>
            ) : question.type === 'date' ? (
              <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
                <option value="select">Select</option>
                <option value="month-year">Month-Year</option>
                <option value="year">Year</option>
                <option value="other">Other</option>
              </Form.Select>
            ) : question.type === 'image' ? (
              <Form.Select value={question.appearance} onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}>
                <option value="select">Select</option>
                <option value="signature">Signature</option>
                <option value="draw">Draw</option>
                <option value="annotate">Annotate</option>
                <option value="other">Other</option>
              </Form.Select>
            ) : question.type === 'file' ? (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={question.appearance}
                  onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}
                  placeholder="Enter appearance"
                />
                <div className="mb-3">
                  <label className="form-label">Accepted files:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question.accepted_files || ''}
                    onChange={(e) => handleQuestionChange(index, 'accepted_files', e.target.value)}
                    placeholder='e.g. ".pdf,.doc,.odt"'
                  />
                </div>
              </>
            ) : (
              <input
                type="text"
                className="form-control"
                value={question.appearance}
                onChange={(e) => handleQuestionChange(index, 'appearance', e.target.value)}
                placeholder="Enter appearance"
              />
            )}
          </div>
          {question.type === 'image' && (
            <div className="mb-3">
              <label className="form-label">Parameters: max-pixels</label>
              <input
                type="number"
                className="form-control"
                value={question.parameters?.split('=')[1] || '1024'}
                onChange={(e) => handleQuestionChange(index, 'parameters', `max-pixels=${e.target.value}`)}
                placeholder="max-pixels"
                min="1"
              />
            </div>
          )}
          {(question.type.startsWith('select_one') || question.type.startsWith('select_multiple')) && (
            <>
              <div className="mb-3">
                <label className="form-label">Parameters:</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={question.parameters?.includes('randomize=true') || false}
                    onChange={(e) => handleQuestionChange(index, 'parameters', `randomize=${e.target.checked};seed=${question.parameters?.split(';')[1]?.split('=')[1] || ''}`)}
                  />
                  <label className="form-check-label">Randomize</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Seed:</label>
                <input
                  type="number"
                  className="form-control"
                  value={question.parameters?.split(';')[1]?.split('=')[1] || ''}
                  onChange={(e) => handleQuestionChange(index, 'parameters', `randomize=${question.parameters?.includes('randomize=true')};seed=${e.target.value}`)}
                />
              </div>
            </>
          )}
          {question.type === 'rating' && (
            <div className="mb-3">
              <label className="form-label">cmp--rank-constraint-message:</label>
              <input
                type="text"
                className="form-control"
                value={question.constraint_message || 'Items cannot be selected more than once'}
                onChange={(e) => handleQuestionChange(index, 'constraint_message', e.target.value)}
                placeholder="Items cannot be selected more than once"
              />
            </div>
          )}
        </div>
      </Collapse>
      {(question.type.startsWith('select_one') || question.type.startsWith('select_multiple')) && (
        <div className="mb-3">
          <label className="form-label">Options:</label>
          {question.options.map((option, optionIndex) => (
            <Option key={optionIndex} option={option} index={optionIndex} onChange={(field, value) => handleOptionChange(index, optionIndex, field, value)} />
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => handleAddOption(index)}>Add Option</button>
        </div>
      )}
      {question.type === 'rating' && (
        <div className="mb-3">
          <label className="form-label">Options:</label>
          {question.options.map((option, optionIndex) => (
            <Option key={optionIndex} option={option} index={optionIndex} onChange={(field, value) => handleOptionChange(index, optionIndex, field, value)} />
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => handleAddOption(index)}>Add Option</button>
          <label className="form-label">Sub-Questions:</label>
          {question.subQuestions.map((subQuestion, subIndex) => (
            <SubQuestion key={subIndex} subQuestion={subQuestion} onChange={(subIndex, field, value) => handleSubQuestionChange(index, subIndex, field, value)} onDelete={(subIndex) => handleDeleteSubQuestion(index, subIndex)} error={errors[`${index}-${subIndex}`]} />
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => handleAddSubQuestion(index)}>Add Sub-Question</button>
        </div>
      )}
      <button type="button" className="btn btn-danger" onClick={() => handleDeleteQuestion(index)}>Delete Question</button>
    </div>
  );
};

export default Question;