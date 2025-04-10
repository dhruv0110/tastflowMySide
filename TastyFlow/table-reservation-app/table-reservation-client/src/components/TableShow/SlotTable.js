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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
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
      socket.emit('joinRoom', `slot_${slotNumber}`);
      socket.on('slotUpdated', handleSlotUpdate);
      socket.on('tableAdded', handleTableAdded);
      socket.on('tableDeleted', handleTableDeleted);
      
      return () => {
        socket.off('slotUpdated', handleSlotUpdate);
        socket.off('tableAdded', handleTableAdded);
        socket.off('tableDeleted', handleTableDeleted);
        socket.emit('leaveRoom', `slot_${slotNumber}`);
      };
    }
  }, [socket, slotNumber, fetchTables]);

  const handleSlotUpdate = (data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => {
        if (data.slot) {
          return prevTables.map(table => 
            table._id === data.slot._id ? data.slot : table
          );
        }
        
        return prevTables.map(table => {
          if (table.number === data.tableNumber) {
            return {
              ...table,
              reserved: data.action === 'reserved',
              reservedBy: data.reservedBy || null,
              disabled: data.action === 'tableDisabled' ? true : 
                       data.action === 'tableEnabled' ? false : table.disabled
            };
          }
          return table;
        });
      });
    }
  };

  const handleTableAdded = (data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => [...prevTables, data.table].sort((a, b) => a.number - b.number));
    }
  };
  
  const handleTableDeleted = (data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => prevTables.filter(table => table.number !== data.tableNumber));
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

  const confirmDelete = (number) => {
    setTableToDelete(number);
    setShowDeleteModal(true);
  };

  const deleteTable = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/slot/${slotNumber}/delete`, { 
        data: { number: tableToDelete }
      });
      props.showAlert('Table deleted successfully', 'success');
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      props.showAlert('Error deleting table', 'error');
    } finally {
      setShowDeleteModal(false);
      setTableToDelete(null);
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

  const toggleTableStatus = async (number) => {
    try {
      setLoadingTable(number);
      await axios.post(
        `http://localhost:5000/api/slot/${slotNumber}/toggle-status`, 
        { number }, 
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
    } catch (error) {
      console.error('Error toggling table status:', error);
      props.showAlert('Error updating table status', 'error');
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

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>Confirm Deletion</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete Table {tableToDelete}?</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="modal-cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-delete-btn"
                  onClick={deleteTable}
                >
                  Delete Table
                </button>
              </div>
            </div>
          </div>
        )}

        {tables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h2>No Tables Available</h2>
            <p>Get started by adding your first table to this slot</p>
            
            <div className='table-input-container empty-input-container'>
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
              <button onClick={addTable} className="add-button empty-add-button" disabled={addingTable}>
                {addingTable ? <CustomSpinner /> : 'Add First Table'}
              </button>
            </div>
          </div>
        ) : (
          <>
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
                <div key={table._id} className={`table-item ${table.reserved ? 'reserved' : ''} ${table.disabled ? 'disabled' : ''}`}>
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
                        onClick={() => confirmDelete(table.number)}
                        className='delete-button'
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => toggleTableStatus(table.number)}
                        className={`status-toggle ${table.disabled ? 'disabled' : 'enabled'}`}
                        disabled={loadingTable === table.number}
                      >
                        {loadingTable === table.number ? (
                          <CustomSpinner small />
                        ) : (
                          table.disabled ? 'Disabled' : 'Enabled'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SlotTable;