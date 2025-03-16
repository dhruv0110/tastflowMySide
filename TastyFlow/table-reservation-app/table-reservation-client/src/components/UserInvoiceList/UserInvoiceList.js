import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './UserInvoiceList.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoice/admin/${invoiceId}`);
        setInvoice(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setLoading(false);
        setError('Failed to load invoice details.');
      }
    };

    fetchInvoiceDetail();
  }, [invoiceId]);

  const sendInvoice = async () => {
    try {
      setIsSending(true);
      const response = await axios.post(
        `http://localhost:5000/api/users/send-invoice/${invoiceId}`,
        { userId: invoice.userId._id }
      );
      toast.success('Invoice sent successfully!');
      setIsSending(false);
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
      setIsSending(false);
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    const invoiceHTML = `
     <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            /* Print-specific styles */
            @page {
              size: auto; /* Auto size for thermal paper */
              margin: 0; /* No margin to maximize space */
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px; /* Smaller font size for compact layout */
              line-height: 1.2; /* Tight line spacing */
              margin: 0;
              padding: 0;
              color: #000; /* Black text for thermal printers */
              background: #fff; /* White background */
            }
            .invoice-container {
              width: 100%;
              max-width: 80mm; /* Adjust for 58mm or 80mm paper */
              margin: 0 auto;
              padding: 5px; /* Minimal padding */
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 5px;
            }
            .invoice-header h2 {
              font-size: 14px; /* Slightly larger for headings */
              margin: 0;
              color: #000;
            }
            .invoice-header p {
              font-size: 10px;
              margin: 3px 0;
              color: #000;
            }
            .company-info {
              text-align: center;
              margin-bottom: 5px;
            }
            .company-info h3 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .company-info p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .user-details {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000; /* Dashed border for separation */
              border-bottom: 1px dashed #000;
            }
            .user-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .user-details p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .food-details {
              margin-bottom: 5px;
            }
            .food-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .food-details table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
            }
            .food-details th,
            .food-details td {
              padding: 3px;
              text-align: left;
              border-bottom: 1px dashed #000; /* Dashed border for table rows */
            }
            .food-details th {
              font-weight: bold;
              background-color: #f0f0f0; /* Light gray background for headers */
            }
            .tax-summary {
              margin-bottom: 5px;
            }
            .tax-summary .total {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 3px;
            }
            .final-total {
              font-size: 12px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 2px solid #000; /* Solid border for emphasis */
            }
            .reservation-details {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .reservation-details h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .reservation-details p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #000;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <h2>TastyFlow</h2>
              <p>Invoice No: ${invoice.invoiceNumber}</p>
              <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>

            <div class="company-info">
              <h3>Restaurant Details</h3>
              <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
              <p>Phone: (909) 91-49101</p>
            </div>

            <div class="user-details">
              <h5>Bill To:</h5>
              <p><strong>Name:</strong> ${invoice.userId.name}</p>
              <p><strong>Contact:</strong> ${invoice.userId.contact}</p>
            </div>

            <div class="food-details">
              <h5>Items Purchased</h5>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.foods.map((food, index) => `
                    <tr>
                      <td>${food.name}</td>
                      <td>${food.quantity}</td>
                      <td>${food.price.toFixed(2)}</td>
                      <td>${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="tax-summary">
              <div class="total"><span>CGST (2.5%):</span> <span>₹${invoice.cgst.toFixed(2)}</span></div>
              <div class="total"><span>SGST (2.5%):</span> <span>₹${invoice.sgst.toFixed(2)}</span></div>
              <div class="total"><span>Round-off:</span> <span>₹${invoice.roundOff.toFixed(2)}</span></div>
            </div>

            <div class="final-total">
              <div>Total Payable:</div>
              <div>₹${invoice.totalAmount.toFixed(2)}</div>
            </div>

            ${
              invoice.reservedTableInfo
                ? `
              <div class="reservation-details">
                <h5>Reservation Details</h5>
                <p><strong>Table No:</strong> ${invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee:</strong> ₹100 (included in total)</p>
              </div>
            `
                : ''
            }

            <div class="footer">
              <p>Thank you for dining with us!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="invoice-detail">
        <h1 className="header">View Invoice</h1>
        {invoice && (
          <div className="edit-container">
            <div className="form-section">
              <p>Invoice Number: {invoice.invoiceNumber}</p>
            </div>

            <div className="tax-details">
              <div className="tax-item">
                <label>Total Amount:</label>
                <p>{invoice.totalAmount}</p>
              </div>

              <div className="tax-item">
                <label>CGST:</label>
                <p>{invoice.cgst}</p>
              </div>

              <div className="tax-item">
                <label>SGST:</label>
                <p>{invoice.sgst}</p>
              </div>

              <div className="tax-item">
                <label>Round Off:</label>
                <p>{invoice.roundOff}</p>
              </div>

              <div className="tax-item">
                <label>Date:</label>
                <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
            </div>

            <h4>User Details:</h4>
            <div className="user-details">
              <p><strong>Name:</strong> {invoice.userId.name}</p>
              <p><strong>Email:</strong> {invoice.userId.email}</p>
              <p><strong>Contact:</strong> {invoice.userId.contact}</p>
              <p><strong>User ID:</strong> {invoice.userId._id}</p>
            </div>

            <h4>Food Items:</h4>
            <div className="user-invoice-form flex-col">
              <div className="invoice-table-format title">
                <b>SI Number</b>
                <b>Name</b>
                <b>Quantity</b>
                <b>Amount</b>
                <b>Total</b>
              </div>
              {invoice.foods.length > 0 ? (
                invoice.foods.map((food, index) => (
                  <div key={index} className="invoice-table-format">
                    <p>{index + 1}</p>
                    <p>{food.name}</p>
                    <p>{food.quantity}</p>
                    <p>{food.price.toFixed(2)}</p>
                    <p>{(food.quantity * food.price).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p>No food items available</p>
              )}
            </div>

            {/* Conditionally render Reservation Details */}
            {invoice.reservedTableInfo && (
              <div className="reservation-details">
              <h4>Reservation Details</h4>
              <p><strong>Table No:</strong> {invoice.reservedTableInfo.tableNumber}</p>
              <p><strong>Reservation Slot:</strong> {invoice.reservedTableInfo.slotTime}</p>
              <p>
                <strong>Reservation Date & Time:</strong>{" "}
                {new Date(invoice.reservedTableInfo.date).toLocaleString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                  hour12: true, // Use 12-hour format (AM/PM)
                })}
              </p>
              <p><strong>Reservation Fee Deduction:</strong> ₹100 (included in total)</p>
            </div>
            )}

            <div className="button-container">
              <button
                className="print-invoice-btn"
                onClick={printInvoice}
                disabled={loading || error}
              >
                Print Invoice
              </button>
              <button
                className="send-invoice-btn"
                onClick={sendInvoice}
                disabled={isSending || loading || error}
              >
                {isSending ? 'Sending...' : 'Send Invoice'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;