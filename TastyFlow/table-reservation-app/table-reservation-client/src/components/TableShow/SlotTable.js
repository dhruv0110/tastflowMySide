import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import { useParams } from 'react-router-dom'; 
import './TableShow.css';

function SlotTable(props) {
  const { slotNumber } = useParams(); 
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [addingTable, setAddingTable] = useState(false);

  const fetchTables = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotNumber}`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }, [slotNumber]); 

  useEffect(() => {
    fetchTables();
  }, [fetchTables]); 

  const addTable = async () => {
    if (!tableNumber || !tableCapacity) {
      props.showAlert('Table number and capacity required', 'error');
      return;
    }

    try {
      setAddingTable(true);
      await axios.post(`http://localhost:5000/api/slot/${slotNumber}/add`, {
        number: tableNumber,
        capacity: tableCapacity,
      });
      props.showAlert('Table added', 'success');
      fetchTables();
      setTableNumber('');
      setTableCapacity('');
    } catch (error) {
      console.error('Error adding table:', error);
      props.showAlert(error.response?.data?.message || 'Error adding table', 'error');
    } finally {
      setAddingTable(false);
    }
  };

  const deleteTable = async (number) => {
    try {
      // Send the delete request to the correct slot (slotNumber is obtained via useParams)
      await axios.delete(`http://localhost:5000/api/slot/${slotNumber}/delete`, { 
        data: { number } // Pass the number of the table to delete in the body
      });
      props.showAlert('Table deleted', 'success');
      fetchTables(); // Refresh the table list
    } catch (error) {
      console.error('Error deleting table:', error);
      props.showAlert('Error deleting table', 'error');
    }
  };
  
  
  
  

  const unreserveTable = async (number) => {
    try {
      setLoadingTable(number);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.post(`http://localhost:5000/api/slot/${slotNumber}/admin/unreserve`, 
        { number }, 
        {
          headers: { 'auth-token': token },
        }
      );
      props.showAlert('Table unreserved', 'success');
      fetchTables();
    } catch (error) {
      console.error('Error unreserving table:', error);
      props.showAlert('Error unreserving table', 'error');
    } finally {
      setLoadingTable(null);
    }
  };

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className='table-show'>
        <h1 className='header'>Manage Tables in Slot - {slotNumber}</h1>

        <div className='table-input-container'>
          <input 
            type="number" 
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Enter table number"
            className="table-input"
          />
          <input 
            type="number" 
            value={tableCapacity}
            onChange={(e) => setTableCapacity(e.target.value)}
            placeholder="Enter table capacity"
            className="table-input"
          />
          <button onClick={addTable} className="add-button" disabled={addingTable}>
            {addingTable ? <CustomSpinner /> : 'Add Table'}
          </button>
        </div>

        <div className='table-list'>
          {sortedTables.map(table => (
            <div key={table._id} className='table-item'>
              <button
                onClick={() => table.reserved && unreserveTable(table.number)}
                className={table.reserved ? 'unreserve-button' : 'reserve-button'}
                disabled={loadingTable === table.number}
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
                <div className='reserved-info'>
                  Reserved by: {table.reservedBy?.name || 'Unknown'} ({table.reservedBy?.contact || 'Unknown'})
                </div>
              )}

              <button
                onClick={() => deleteTable(table.number)}
                className='delete-button'
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SlotTable;
