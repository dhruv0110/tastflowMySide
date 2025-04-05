import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import "./AdminTable.css";

const AdminTable = () => {
  return (
    <div className="at-container">
      <Sidebar />
      <main className="at-content">
        <header className="at-header">
          <h1 className="at-title">
            <FontAwesomeIcon icon={faTable} className="at-title-icon" />
            Table Management
          </h1>
          <p className="at-subtitle">Manage restaurant tables by time slots</p>
        </header>

        <div className="at-slots-grid">
          {[1, 2, 3].map(slot => (
            <Link 
              to={`/admin/slot/${slot}`} 
              key={slot}
              className="at-slot-card"
            >
              <div className="at-slot-content">
                <FontAwesomeIcon icon={faCalendarAlt} className="at-slot-icon" />
                <h3>Slot {slot}</h3>
                <p>Manage tables for this time period</p>
              </div>
              <div className="at-slot-hover">
                View Tables
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminTable;