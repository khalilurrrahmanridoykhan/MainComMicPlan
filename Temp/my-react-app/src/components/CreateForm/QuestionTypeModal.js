import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const QuestionTypeModal = ({ show, onHide, onSelectType }) => {
  const questionTypes = [
    'select_one',
    'text',
    'integer',
    'date',
    'time',
    'datetime',
    'geopoint',
    'geotrace',
    'geoshape',
    'decimal',
    'select_multiple',
    'image',
    'audio',
    'video',
    'note',
    'barcode',
    'acknowledge',
    'rating',
    'range'
  ];

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Question Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {questionTypes.map((type) => (
            <Col key={type} xs={6} md={3} className="mb-2">
              <div
                className="list-group-item"
                onClick={() => onSelectType(type)}
                style={{ cursor: 'pointer' }}
              >
                {type}
              </div>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionTypeModal;