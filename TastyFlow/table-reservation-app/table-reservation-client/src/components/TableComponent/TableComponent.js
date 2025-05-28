import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSocket } from '../../context/SocketContext';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import './TableComponent.css';
import { Howl } from 'howler';
import { message } from 'antd';

const stripePromise = loadStripe('pk_test_51PM6qtRwUTaEqzUvS6OJGM3YihHTBzBe1X4lPiFacZgFvyHU6E27K7n9qzkmzJoi2V0JH66T7fCpL9MgQCVYerTD00lU9wNdOf');

const reserveSound = new Howl({ src: ['/sounds/success.mp3'] });
const unreserveSound = new Howl({ src: ['/sounds/success.mp3'] });
const tableChangedSound = new Howl({ src: ['/sounds/notification.mp3'] });

const TableComponent = () => {
  const [tables, setTables] = useState([]);
  const [userId, setUserId] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('1');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchUserDetails();
    fetchTables();
    
    if (socket) {
      socket.emit('joinRoom', `slot_${slotFilter}`);
      socket.emit('joinRoom', `user_${userId}`);
      
      socket.on('slotUpdated', handleSlotUpdate);
      socket.on('tableAdded', handleTableAdded);
      socket.on('tableDeleted', handleTableDeleted);
      socket.on('tableStatusChanged', handleTableStatusChanged);
      socket.on('reservationChanged', handleReservationChanged);
      
      return () => {
        socket.off('slotUpdated', handleSlotUpdate);
        socket.off('tableAdded', handleTableAdded);
        socket.off('tableDeleted', handleTableDeleted);
        socket.off('tableStatusChanged', handleTableStatusChanged);
        socket.off('reservationChanged', handleReservationChanged);
        socket.emit('leaveRoom', `slot_${slotFilter}`);
        socket.emit('leaveRoom', `user_${userId}`);
      };
    }
  }, [socket, slotFilter, userId]);

  const handleReservationChanged = (data) => {
    tableChangedSound.play();
    message.info(`Your table has been changed to Table ${data.newReservation.tableNumber}`);
    
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.number === data.newReservation.tableNumber) {
          return { ...table, reserved: true, reservedBy: { _id: userId } };
        }
        if (table._id === data.oldReservationId) {
          return { ...table, reserved: false, reservedBy: null };
        }
        return table;
      });
    });
  };

  const handleTableStatusChanged = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => {
        if (data.disabled) {
          return prevTables.filter(table => table.number !== data.tableNumber);
        } else {
          const exists = prevTables.some(table => table.number === data.tableNumber);
          if (!exists) {
            fetchSingleTable(data.tableNumber);
          }
          return prevTables;
        }
      });
    }
  };

  const fetchSingleTable = async (tableNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotFilter}`);
      const table = response.data.find(t => t.number === tableNumber);
      if (table && !table.disabled) {
        setTables(prevTables => {
          const exists = prevTables.some(t => t.number === tableNumber);
          if (!exists) {
            return [...prevTables, table].sort((a, b) => a.number - b.number);
          }
          return prevTables;
        });
      }
    } catch (error) {
      console.error('Error fetching single table:', error);
    }
  };

  const handleSlotUpdate = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => {
        if (data.slot?.disabled) {
          return prevTables.filter(table => table.number !== data.tableNumber);
        }
        
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

  const handleTableAdded = (data) => {
    if (data.slotNumber.toString() === slotFilter && !data.table.disabled) {
      setTables(prevTables => [...prevTables, data.table].sort((a, b) => a.number - b.number));
    }
  };
  
  const handleTableDeleted = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => prevTables.filter(table => table.number !== data.tableNumber));
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        'http://localhost:5000/api/users/getuser',
        {},
        { headers: { 'auth-token': token } }
      );
      setUserId(response.data._id);
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Error fetching user details');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotFilter}`);
      setTables(response.data.filter(table => !table.disabled));
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Error fetching tables');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    message.success('Payment successful!');
    setPaymentIntent(paymentIntent);
    setShowPaymentForm(false);

    try {
      await axios.post(
        `http://localhost:5000/api/slot/${selectedSlot}/reserve`,
        { 
          number: selectedTableNumber,
          paymentIntentId: paymentIntent.id,
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      reserveSound.play();
      message.success('Table reserved successfully');
    } catch (error) {
      console.error('Error reserving table:', error);
      message.error('Error reserving table');
    }
  };

  const handlePaymentError = (error) => {
    message.error(`Payment failed: ${error}`);
    setShowPaymentForm(false);
  };

  const toggleReservation = async (number, isReserved, reservedBy) => {
    if (isReserved && reservedBy !== userId) {
      message.error('You do not have permission to unreserve this table');
      return;
    }
  
    setLoadingTable(number);
    setSelectedSlot(slotFilter);
  
    if (!isReserved) {
      setSelectedTableNumber(number);
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const { data } = await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/create-payment-intent`,
          { amount: 100 },
          { headers: { 'auth-token': token } }
        );
        setPaymentIntent({ clientSecret: data.clientSecret, tableNumber: number });
        setShowPaymentForm(true);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        message.error('Error creating payment intent');
      } finally {
        setLoadingTable(null);
      }
    } else {
      try {
        await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/unreserve`,
          { number },
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
        unreserveSound.play();
        message.success('Table unreserved successfully');
      } catch (error) {
        console.error('Error unreserving table:', error);
        message.error('Error unreserving table');
      } finally {
        setLoadingTable(null);
      }
    }
  };

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  const filteredTables = sortedTables.filter(table => 
    (!capacityFilter || table.capacity === parseInt(capacityFilter))
  );

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
                onClick={() => toggleReservation(table.number, table.reserved, table.reservedBy?._id)}
                className={`table-button-button ${
                  table.reserved ? 'reserved' : ''
                } ${loadingTable === table.number ? 'loading' : ''}`}
                disabled={
                  loadingTable === table.number ||
                  (table.reserved && table.reservedBy?._id !== userId)
                }
              >
                {loadingTable === table.number ? <CustomSpinner /> : `Table ${table.number}`}
              </button>

              {table.reserved && (
                <div className="table-button-reserved">
                  {table.reservedBy?._id === userId ? 'Your Reservation' : 'Reserved'}
                </div>
              )}
            </div>
          ))}
        </div>

        {showPaymentForm && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={paymentIntent?.clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              tableNumber={selectedTableNumber}
              slot={selectedSlot}
              amount={100}
              onClose={() => setShowPaymentForm(false)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default TableComponent;