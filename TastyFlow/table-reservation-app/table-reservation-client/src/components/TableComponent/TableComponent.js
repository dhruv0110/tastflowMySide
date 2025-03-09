import React, { useState, useEffect } from "react";
import axios from "axios";
import CustomSpinner from "../CustomSpinner/CustomSpinner";
import "./TableComponent.css";

const TableComponent = ({ showAlert }) => {
  const [tables, setTables] = useState([]);
  const [userId, setUserId] = useState("");
  const [loadingTable, setLoadingTable] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState(""); // Filter by capacity
  const [slotFilter, setSlotFilter] = useState("1"); // State for Slot1 or Slot2

  // Fetch user details (assuming you are using a token for authentication)
  useEffect(() => {
    fetchUserDetails();
    fetchTables();
    // eslint-disable-next-line
  }, [slotFilter]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5000/api/users/getuser",
        {},
        {
          headers: { "auth-token": token },
        }
      );
      setUserId(response.data._id);
    } catch (error) {
      console.error("Error fetching user details:", error);
      showAlert("Error fetching user details", "danger");
    }
  };

  // Fetch tables for the selected slot (Slot1 or Slot2)
  const fetchTables = async () => {
    try {
      const endpoint = `http://localhost:5000/api/slot/${slotFilter}`; // Dynamically set the slot number
      const response = await axios.get(endpoint);
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      showAlert("Error fetching tables", "danger");
    }
  };

  const toggleReservation = (number, isReserved, reservedBy) => {
    if (isReserved && reservedBy !== userId) {
      showAlert("You do not have permission to unreserve this table", "danger");
      return;
    }
  
    // Show toast message immediately
    showAlert(isReserved ? "Table unreserved" : "Table reserved", "success");
  
    // Optimistically update UI
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.number === number
          ? { ...table, reserved: !isReserved, reservedBy: isReserved ? null : { _id: userId } }
          : table
      )
    );
  
    // Send API request in the background
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const endpoint = `http://localhost:5000/api/slot/${slotFilter}`;
    const url = isReserved ? `${endpoint}/unreserve` : `${endpoint}/reserve`;
  
    axios
      .post(url, { number }, { headers: { "auth-token": token } })
      .catch((error) => {
        console.error("Error toggling reservation:", error);
        showAlert("Error toggling reservation", "danger");
  
        // Revert UI if request fails
        setTables((prevTables) =>
          prevTables.map((table) =>
            table.number === number
              ? { ...table, reserved: isReserved, reservedBy: isReserved ? { _id: reservedBy } : null }
              : table
          )
        );
      });
  };
  
  
  

  // Sort tables by table number and filter by capacity
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  const filteredTables = sortedTables.filter((table) => {
    const matchesCapacity = capacityFilter
      ? table.capacity === parseInt(capacityFilter)
      : true;
    return matchesCapacity;
  });

  return (
    <div className="table-container">
      <div className="container">
        <div className="table-heading">
          <h1 className="header">Reserve Your Table</h1>
        </div>

        <div className="filter-indicator-container">
          <div className="slot-filter">
            <label htmlFor="slot">Filter by Slot: </label>
            <select
              id="slot"
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
            >
              <option value="1">5:00 TO 7:00</option>
              <option value="2">7:00 TO 9:00</option>
              <option value="3">9:00 TO 11:00</option>
            </select>
          </div>

          <div className="capacity-filter">
            <label htmlFor="capacity">Filter by Capacity: </label>
            <select
              id="capacity"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">All Capacities</option>
              <option value="2">2 People</option>
              <option value="4">4 People</option>
              <option value="6">6 People</option>
            </select>
          </div>

          <div className="indicator">
            <div className="indicator-item">
              <div className="grey"></div>
              <span>Un-Reserved</span>
            </div>
            <div className="indicator-item">
              <div className="red"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        <div className="table-button-container">
          {filteredTables.map((table) => (
            <div key={table.number} className="table-button">
              <button
                onClick={() =>
                  toggleReservation(
                    table.number,
                    table.reserved,
                    table.reservedBy?._id
                  )
                }
                className={`table-button-button ${
                  table.reserved ? "reserved" : ""
                } ${loadingTable === table.number ? "loading" : ""}`}
                disabled={
                  loadingTable === table.number ||
                  (table.reserved && table.reservedBy?._id !== userId)
                }
              >
                {loadingTable === table.number ? (
                  <div className="spinner-container">
                    <CustomSpinner />
                  </div>
                ) : (
                  `Table ${table.number}`
                )}
              </button>
              {table.reserved && (
                <div className="table-button-reserved">Reserved</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
