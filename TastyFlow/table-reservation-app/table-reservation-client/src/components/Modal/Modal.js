import React from 'react';
import './Modal.css'; // Add styles for the modal

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlays">
      <div className="modal-contents">
        <button className="modal-close-buttons" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;