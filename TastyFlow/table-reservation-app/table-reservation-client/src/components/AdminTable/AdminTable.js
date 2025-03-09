import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./AdminTable.css";
import { Link } from "react-router-dom";

const AdminTable = () => {
  return (
    <div className="admin-page-section">
      <Sidebar />
      <div className="admin-page">
        <h1 className="header">Admin Table</h1>
        <div className="slot-btn">
          {/* Dynamically link to different slots */}
          <Link to="/admin/slot/1">
            <button className="btn order-btn" type="button">
              Slot 1
            </button>
          </Link>
          <Link to="/admin/slot/2">
            <button className="btn order-btn" type="button">
              Slot 2
            </button>
          </Link>
          <Link to="/admin/slot/3">
            <button className="btn order-btn" type="button">
              Slot 3
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;