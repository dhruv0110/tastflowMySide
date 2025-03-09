import React, { useState, useEffect } from "react";
import "./Invoice.css"; // Import your invoice CSS styles
import axios from "axios"; // Axios to make HTTP requests
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words"; // Convert numbers to words

const Invoice = ({ invoiceId, user }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false); // Track sending status

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/invoice/admin/${invoiceId}`
        );
        setInvoice(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching invoice data.");
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const printInvoice = () => {
    const printWindow = window.open("", "", "height=800,width=1200");
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
              position: relative;
              padding-bottom: 150px; /* Space for fixed total section */
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
            .invoice-info {
              width: 40%;
            }
            .extra {
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
            .total-summary {
              position: fixed;
              bottom: 60px; /* Position above the final total */
              left: 0;
              right: 0;
              background-color: #fff;
              padding: 10px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              z-index: 1000; /* Ensure it stays on top */
            }
            .total {
              display: flex;
              justify-content: space-between;
              width: 98.8%;
              margin-bottom: 10px;
            }
            .final-total {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background-color: #fff;
              padding: 10px;
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
              font-size: 1.2rem;
              z-index: 1000; /* Ensure it stays on top */
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

            <!-- Empty line for spacing -->
            <div style="height: 20px;"></div>

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
              <div>${toWords(invoice.totalAmount)} Only</div>
              <div><strong>Total:</strong> ${invoice.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write the invoice HTML to the new window and print
    printWindow.document.write(invoiceHTML);
    printWindow.document.close(); // Needed for IE
    printWindow.print(); // Trigger the print dialog
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p>{error}</p>;

  const sendInvoice = async () => {
    try {
      setIsSending(true); // Set sending status to true
      const response = await axios.post(
        `http://localhost:5000/api/users/send-invoice/${invoiceId}`,
        { userId: user }
      );
      setIsSending(false); // Reset sending status after success
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
    }
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <div className="invoice-info">
          <h4>Invoice No. {invoice.invoiceNumber}</h4>
          <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>ID:</strong> {invoice._id}</p>
        </div>
        <div className="company-info">
          <h3>TastyFlow</h3>
          <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
          <p>Phone: (909)91-49101</p>
          <p>Email: tastyflow@gmail.com</p>
        </div>
      </div>  

      <div className="user-details">
        <h5>Bill To:</h5>
        {user ? (
          <div>
             <p><strong>Name:</strong> {invoice.userId.name}</p>
                <p><strong>Email:</strong> {invoice.userId.email}</p>
                <p><strong>Contact:</strong> {invoice.userId.contact}</p>
                <p><strong>Id:</strong> {user}</p>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      <div className="food-details">
        <h5>Items Purchased</h5>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>SI Number</th>
              <th style={{ textAlign: "center" }}>Description</th>
              <th style={{ textAlign: "center" }}>Quantity</th>
              <th style={{ textAlign: "center" }}>Unit Price</th>
              <th style={{ textAlign: "center" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.foods.map((food, index) => (
              <tr key={food.foodId}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{food.name}</td>
                <td style={{ textAlign: "center" }}>{food.quantity}</td>
                <td style={{ textAlign: "right" }}>{food.price}.00</td>
                <td style={{ textAlign: "right" }}>
                  {(food.quantity * food.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty line for spacing */}
      <div style={{ height: "20px" }}></div>

      <div className="total-summary">
        <div className="total">
          <div>CGST (2.5%)</div>
          <div style={{marginRight:"9px"}}>{invoice.cgst.toFixed(2)}</div>
        </div>
        <div className="total">
          <div>SGST (2.5%)</div>
          <div style={{marginRight:"9px"}}>{invoice.sgst.toFixed(2)}</div>
        </div>
      </div>

      <div className="total">
        <div>Round-off:</div>
        <div style={{marginRight:"9px"}}>{invoice.roundOff.toFixed(2)}</div>
      </div>
      <hr />
      <div className="final-total">
        <div>Total</div>
        <div style={{marginRight:"9px"}}>{invoice.totalAmount.toFixed(2)}</div>
      </div>
      <hr />

      <div className="button-container">
        <button className="print-invoice-btn" onClick={printInvoice}>
          Print Invoice
        </button>
        <button
          className="send-invoice-btn"
          onClick={sendInvoice}
          disabled={isSending} // Disable the button while sending
        >
          {isSending ? 'Sending...' : 'Send Invoice'}
        </button>
      </div>

      <div className="invoice-footer">
        <p>Thank you for your business!</p>
        <p>TastyFlow - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Invoice;