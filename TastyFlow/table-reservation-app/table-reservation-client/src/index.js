import React from 'react';
import ReactDOM from 'react-dom/client'; // Note the change in import
import App from './App';
import "./App.css"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
