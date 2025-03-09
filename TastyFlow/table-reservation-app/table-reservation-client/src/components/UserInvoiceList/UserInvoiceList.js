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
            /* Add your print styles here */
            @page {
              size: A4;
              margin: 20mm;
              border: 1px solid rgba(158, 156, 156, 0.82);
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              margin: 0;
              padding: 1rem;
            }
            .invoice-container {
              width: 100%;
              margin: 0 auto;
            }
            .invoice-header { 
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .company-info h3 {
            margin-top: 0;
              margin-bottom: 5px;
              font-size: 18px;
            }
            .company-info p, .invoice-info p {
              font-size: 12px;
              margin: 2px 0;
            }
              .invoice-info{
            width: 40%;
            }
            .extra{
              width: 20%;
            }
            .company-info {
            text-align: justify;
              width: 50%;
              }
            .invoice-info h4 {
              font-size: 20px;
              margin: 0;
            }
            .invoice-info p {
              margin: 5px 0;
            }
            .user-details {
              margin: 20px 0;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .food-details {
              margin: 20px 0;
            }
            .food-details table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .food-details th, .food-details td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .food-details th {
              background-color: #f4f4f4;
            }
                  .final-total {
        position: fixed;
        bottom: 20px;
        background-color: #fff;
        font-size: 1.5rem;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        margin-bottom: 5rem;
      }
            .total-summary {
              margin-top: 20px;
              display: flex;
              flex-direction: column;
              font-size: 14px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              width: 98.8%;
              margin-bottom: 10px;
            }
            .final-total {
              display: flex;
              justify-content: space-between;
              width: 95%;
              margin-bottom: 10px;
              font-size: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="invoice-info">
                <h4>Invoice No. ${invoice.invoiceNumber}</h4>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>ID:</strong> ${invoice._id}</p>
              </div>
              <div class="extra"></div>
              <div class="company-info">
                <h3>TastyFlow</h3>
                <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
                <p>Phone: (909)991-49101</p>
                <p>Email: tastyflow@gmail.com</p>
              </div>
            </div>

            <div class="user-details">
              <h5>Bill To:</h5>
              ${invoice.userId ? `
                <p><strong>Name:</strong> ${invoice.userId.name}</p>
                <p><strong>Email:</strong> ${invoice.userId.email}</p>
                <p><strong>Contact:</strong> ${invoice.userId.contact}</p>
                <p><strong>Id:</strong> ${invoice.userId._id}</p>
              ` : '<p>No user data available</p>'}
            </div>

            <div class="food-details">
              <h5>Items Purchased</h5>
              <table>
                <thead>
                  <tr>
                    <th>SI Number</th>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: center;">Unit Price</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.foods.map((food, index) => `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td>${food.name}</td>
                      <td style="text-align: center;">${food.quantity}</td>
                      <td style="text-align: center;">${food.price}</td>
                      <td style="text-align: right;">${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="total-summary"> 
              <div class="total">
                <div>CGST (2.5%):</div>
                <div>${invoice.cgst}</div>
              </div>
              <div class="total">
                <div>SGST (2.5%):</div>
                <div>${invoice.sgst}</div>
              </div>
              <div class="total">
                <div>Round-off:</div>
                <div>${invoice.roundOff}</div>
              </div>
            </div>

            <div class="final-total">
              <div>Total:</div>
              <div>${invoice.totalAmount.toFixed(2)}</div>
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
        <h1 className='header'>View Invoice</h1>
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

            <h4>Foods Items:</h4>
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
