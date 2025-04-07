import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './TableShow.css';

function SlotTable(props) {
  const { slotNumber } = useParams();
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [addingTable, setAddingTable] = useState(false);
  const socket = useSocket();

  const fetchTables = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotNumber}`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      props.showAlert('Error fetching tables', 'error');
    }
  }, [slotNumber, props]);

  useEffect(() => {
    fetchTables();
    
    if (socket) {
      socket.emit('joinRoom', slotNumber);
      socket.on('slotUpdated', handleSlotUpdate);
      
      return () => {
        socket.off('slotUpdated', handleSlotUpdate);
      };
    }
  }, [socket, slotNumber, fetchTables]);

  const handleSlotUpdate = (data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => {
        // If we have the full slot data from the reservation
        if (data.slot) {
          return prevTables.map(table => 
            table._id === data.slot._id ? data.slot : table
          );
        }
        
        // Fallback to manual update
        return prevTables.map(table => {
          if (table.number === data.tableNumber) {
            return {
              ...table,
              reserved: data.action === 'reserved',
              reservedBy: data.reservedBy || null
            };
          }
          return table;
        });
      });
    }
  };

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
      await axios.delete(`http://localhost:5000/api/slot/${slotNumber}/delete`, { 
        data: { number }
      });
      props.showAlert('Table deleted', 'success');
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      props.showAlert('Error deleting table', 'error');
    }
  };

  const unreserveTable = async (number) => {
    try {
      setLoadingTable(number);
      await axios.post(
        `http://localhost:5000/api/slot/${slotNumber}/admin/unreserve`, 
        { number }, 
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      props.showAlert('Table unreserved', 'success');
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
          <div className="input-group">
            <input 
              type="number" 
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table number"
              className="table-input"
              min="1"
            />
            <input 
              type="number" 
              value={tableCapacity}
              onChange={(e) => setTableCapacity(e.target.value)}
              placeholder="Seat capacity"
              className="table-input"
              min="1"
            />
          </div>
          <button onClick={addTable} className="add-button" disabled={addingTable}>
            {addingTable ? <CustomSpinner /> : 'Add Table'}
          </button>
        </div>

        <div className='table-list'>
          {sortedTables.map(table => (
            <div key={table._id} className={`table-item ${table.reserved ? 'reserved' : ''}`}>
              <div className='table-main-info'>
                <div className='table-number'>Table {table.number}</div>
                <div className='table-capacity'>{table.capacity} seats</div>
              </div>
              
              <div className='table-actions'>
                {table.reserved && (
                  <div className='reserved-info'>
                    <div className='reserved-label'>Reserved by:</div>
                    <div>{table.reservedBy?.name || 'Loading...'}</div>
                    <div>{table.reservedBy?.contact || 'Loading...'}</div>
                  </div>
                )}
                
                <div className='action-buttons'>
                  {table.reserved && (
                    <button
                      onClick={() => unreserveTable(table.number)}
                      className='unreserve-button'
                      disabled={loadingTable === table.number}
                    >
                      {loadingTable === table.number ? (
                        <CustomSpinner small />
                      ) : (
                        'Unreserve'
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteTable(table.number)}
                    className='delete-button'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SlotTable;