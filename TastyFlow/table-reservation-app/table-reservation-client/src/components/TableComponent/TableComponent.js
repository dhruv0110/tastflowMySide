import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../../components/PaymentForm/PaymentForm'; // Import the PaymentForm component
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import Modal from '../Modal/Modal'; // Import the Modal component
import './TableComponent.css';
import { toast } from 'react-toastify';
import { Howl } from 'howler'; // Import Howl from howler

const stripePromise = loadStripe('pk_test_51PM6qtRwUTaEqzUvS6OJGM3YihHTBzBe1X4lPiFacZgFvyHU6E27K7n9qzkmzJoi2V0JH66T7fCpL9MgQCVYerTD00lU9wNdOf'); // Replace with your Stripe Publishable Key

// Define sound files
const reserveSound = new Howl({
  src: ['/sounds/success.mp3'] // Path to your reserve sound file
});

const unreserveSound = new Howl({
  src: ['/sounds/success.mp3'] // Path to your unreserve sound file
});

const TableComponent = ({ showAlert }) => {
  const [tables, setTables] = useState([]);
  const [userId, setUserId] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('1');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    fetchTables();
  }, [slotFilter]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        'http://localhost:5000/api/users/getuser',
        {},
        {
          headers: { 'auth-token': token },
        }
      );
      setUserId(response.data._id);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showAlert('Error fetching user details', 'danger');
    }
  };

  const fetchTables = async () => {
    try {
      const endpoint = `http://localhost:5000/api/slot/${slotFilter}`;
      const response = await axios.get(endpoint);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      showAlert('Error fetching tables', 'danger');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    showAlert('Payment successful!', 'success');
    setPaymentIntent(paymentIntent);
    setIsModalOpen(false); // Close the modal on success

    // Reserve the table after successful payment
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/slot/${slotFilter}/reserve`,
        { 
          number: selectedTableNumber, // Use the correct table number
          paymentIntentId: paymentIntent.id,
        },
        { 
          headers: { 'auth-token': localStorage.getItem('token') } 
        }
      );
      reserveSound.play(); // Play reserve sound
      showAlert('Table reserved successfully', 'success');
      fetchTables(); // Refresh the table list
    } catch (error) {
      console.error('Error reserving table:', error);
      if (error.response) {
        console.error('Backend Error:', error.response.data);
      }
      showAlert('Error reserving table', 'danger');
    }
  };

  const handlePaymentError = (error) => {
    showAlert(`Payment failed: ${error}`, 'danger');
    setIsModalOpen(false); // Close the modal on error
  };

  const toggleReservation = async (number, isReserved, reservedBy) => {
    if (isReserved && reservedBy !== userId) {
      showAlert('You do not have permission to unreserve this table', 'danger');
      return;
    }
  
    setLoadingTable(number); // Show spinner on the clicked button
  
    if (!isReserved) {
      setSelectedTableNumber(number);
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const paymentIntentResponse = await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/create-payment-intent`,
          { amount: 100 },
          { headers: { 'auth-token': token } }
        );
  
        const { clientSecret } = paymentIntentResponse.data;
        setPaymentIntent({ clientSecret, tableNumber: number });
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        showAlert('Error creating payment intent', 'danger');
      } finally {
        setLoadingTable(null); // Hide spinner
      }
    } else {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/unreserve`,
          { number },
          { headers: { 'auth-token': token } }
        );
  
        unreserveSound.play();
        showAlert('Table unreserved successfully', 'success');
        fetchTables();
      } catch (error) {
        console.error('Error unreserving table:', error);
        showAlert('Error unreserving table', 'danger');
      } finally {
        setLoadingTable(null);
      }
    }
  };
  

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
                  toggleReservation(table.number, table.reserved, table.reservedBy?._id)
                }
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
                <div className="table-button-reserved">Reserved</div>
              )}
            </div>
          ))}
        </div>

        {/* Render Modal with PaymentForm */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={paymentIntent?.clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              tableNumber={selectedTableNumber} // Pass the selected table number
              amount={100} // Pass the amount (e.g., 100 INR)
            />
          </Elements>
        </Modal>
      </div>
    </div>
  );
};

export default TableComponent;