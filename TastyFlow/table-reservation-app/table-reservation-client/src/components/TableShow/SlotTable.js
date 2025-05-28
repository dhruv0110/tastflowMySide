import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './TableShow.css';
import { message } from 'antd';

function SlotTable(props) {
  const { slotNumber } = useParams();
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [addingTable, setAddingTable] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [tableToChange, setTableToChange] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedNewTable, setSelectedNewTable] = useState('');
  const socket = useSocket();
 const fetchTables = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotNumber}`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Error fetching tables');
    }
  }, [slotNumber]);

  // ...


  const handleSlotUpdate = useCallback((data) => {
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
  }, [slotNumber]);

  const handleTableAdded = useCallback((data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => [...prevTables, data.table].sort((a, b) => a.number - b.number));
    }
  }, [slotNumber]);
  
  const handleTableDeleted = useCallback((data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => prevTables.filter(table => table.number !== data.tableNumber));
    }
  }, [slotNumber]);

  const handleTableChanged = useCallback((data) => {
    if (data.slotNumber.toString() === slotNumber) {
      setTables(prevTables => prevTables.map(table => {
        if (table.number === data.oldTableNumber) {
          return { ...table, reserved: false, reservedBy: null };
        }
        if (table.number === data.newTableNumber) {
          return { ...table, reserved: true, reservedBy: data.reservedBy };
        }
        return table;
      }));
    }
  }, [slotNumber]);

  useEffect(() => {
    fetchTables();
    
    if (socket) {
      socket.emit('joinRoom', `slot_${slotNumber}`);
      socket.on('slotUpdated', handleSlotUpdate);
      socket.on('tableAdded', handleTableAdded);
      socket.on('tableDeleted', handleTableDeleted);
      socket.on('tableChanged', handleTableChanged);
      
      return () => {
        socket.off('slotUpdated', handleSlotUpdate);
        socket.off('tableAdded', handleTableAdded);
        socket.off('tableDeleted', handleTableDeleted);
        socket.off('tableChanged', handleTableChanged);
        socket.emit('leaveRoom', `slot_${slotNumber}`);
      };
    }
  }, [socket, slotNumber, fetchTables, handleSlotUpdate, handleTableAdded, handleTableDeleted, handleTableChanged]);

  const addTable = async () => {
    if (!tableNumber || !tableCapacity) {
      message.error('Table number and capacity required');
      return;
    }

    try {
      setAddingTable(true);
      await axios.post(`http://localhost:5000/api/slot/${slotNumber}/add`, {
        number: tableNumber,
        capacity: tableCapacity,
      });
      message.success('Table added');
      fetchTables();
      setTableNumber('');
      setTableCapacity('');
    } catch (error) {
      console.error('Error adding table:', error);
      message.error(error.response?.data?.message || 'Error adding table');
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
      message.success('Table deleted successfully');
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      message.error('Error deleting table');
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
      message.success('Table unreserved');
    } catch (error) {
      console.error('Error unreserving table:', error);
      message.error('Error unreserving table');
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
      message.error('Error updating table status');
    } finally {
      setLoadingTable(null);
    }
  };

  const openChangeModal = async (table) => {
    try {
      setTableToChange(table);
      const response = await axios.get(
        `http://localhost:5000/api/slot/${slotNumber}/available-tables`,
        { params: { capacity: table.capacity, exclude: table.number } }
      );
      setAvailableTables(response.data);
      setShowChangeModal(true);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      message.error('Error fetching available tables');
    }
  };

  const changeTable = async () => {
    if (!selectedNewTable) {
      message.error('Please select a new table');
      return;
    }

    try {
      setLoadingTable(tableToChange.number);
      await axios.post(
        `http://localhost:5000/api/slot/${slotNumber}/change-table`,
        { 
          oldTableNumber: tableToChange.number,
          newTableNumber: selectedNewTable 
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      message.success('Table changed successfully');
      setShowChangeModal(false);
      setSelectedNewTable('');
      fetchTables();
    } catch (error) {
      console.error('Error changing table:', error);
      message.error(error.response?.data?.message || 'Error changing table');
    } finally {
      setLoadingTable(null);
    }
  };

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="table-management-container">
      <Sidebar />
      <div className='table-show'>
        <h1 className='header'>Manage Tables in Slot - {slotNumber}</h1>

        {/* Delete Confirmation Modal */}
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

        {/* Change Table Modal */}
        {showChangeModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>Change Table {tableToChange?.number}</h3>
              </div>
              <div className="modal-body">
                <p>Select a new table with same capacity ({tableToChange?.capacity} seats):</p>
                <select 
                  className="table-select"
                  value={selectedNewTable}
                  onChange={(e) => setSelectedNewTable(e.target.value)}
                >
                  <option value="">Select a table</option>
                  {availableTables.map(table => (
                    <option key={table.number} value={table.number}>
                      Table {table.number} ({table.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button 
                  className="modal-cancel-btn"
                  onClick={() => {
                    setShowChangeModal(false);
                    setSelectedNewTable('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="modal-confirm-btn"
                  onClick={changeTable}
                  disabled={!selectedNewTable || loadingTable === tableToChange?.number}
                >
                  {loadingTable === tableToChange?.number ? <CustomSpinner small /> : 'Change Table'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
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
            {/* Table Input Form */}
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

            {/* Tables List */}
            <div className='table-list'>
              {sortedTables.map(table => (
                <div key={table._id} className={`table-item ${table.reserved ? 'reserved' : ''} ${table.disabled ? 'disabled' : ''}`}>
                  <div className='table-main-info'>
                    <div className='table-number'>Table {table.number}</div>
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
                        <>
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
                          <button
                            onClick={() => openChangeModal(table)}
                            className='change-button'
                            disabled={loadingTable === table.number}
                          >
                            Change
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => confirmDelete(table.number)}
                        className='delete-button'
                      >
                        Delete
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