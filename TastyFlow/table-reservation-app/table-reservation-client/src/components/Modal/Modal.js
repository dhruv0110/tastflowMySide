import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('modal-overlays')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlays" onClick={handleOverlayClick}>
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
