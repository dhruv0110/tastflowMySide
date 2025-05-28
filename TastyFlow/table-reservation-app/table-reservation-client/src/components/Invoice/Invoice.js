import React, { useState, useEffect } from "react";
import "./Invoice.css"; // Import your invoice CSS styles
import axios from "axios"; // Axios to make HTTP requests
import { toWords } from "number-to-words"; // Convert numbers to words
import { message } from "antd";

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
            .tf-invoice-print-container {
              width: 100%;
              max-width: 80mm; /* Adjust for 58mm or 80mm paper */
              margin: 0 auto;
              padding: 5px; /* Minimal padding */
            }
            .tf-invoice-print-header {
              text-align: center;
              margin-bottom: 5px;
            }
            .tf-invoice-print-header h2 {
              font-size: 14px; /* Slightly larger for headings */
              margin: 0;
              color: #000;
            }
            .tf-invoice-print-header p {
              font-size: 10px;
              margin: 3px 0;
              color: #000;
            }
            .tf-invoice-print-company {
              text-align: center;
              margin-bottom: 5px;
            }
            .tf-invoice-print-company h3 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .tf-invoice-print-company p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .tf-invoice-print-user {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000; /* Dashed border for separation */
              border-bottom: 1px dashed #000;
            }
            .tf-invoice-print-user h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .tf-invoice-print-user p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .tf-invoice-print-food {
              margin-bottom: 5px;
            }
            .tf-invoice-print-food h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .tf-invoice-print-food table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
            }
            .tf-invoice-print-food th,
            .tf-invoice-print-food td {
              padding: 3px;
              text-align: left;
              border-bottom: 1px dashed #000; /* Dashed border for table rows */
            }
            .tf-invoice-print-food th {
              font-weight: bold;
              background-color: #f0f0f0; /* Light gray background for headers */
            }
            .tf-invoice-print-tax {
              margin-bottom: 5px;
            }
            .tf-invoice-print-tax .tf-invoice-print-total {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 3px;
            }
            .tf-invoice-print-final {
              font-size: 12px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 2px solid #000; /* Solid border for emphasis */
            }
            .tf-invoice-print-reservation {
              margin-bottom: 5px;
              padding: 5px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .tf-invoice-print-reservation h5 {
              font-size: 12px;
              margin: 0 0 3px 0;
              color: #000;
            }
            .tf-invoice-print-reservation p {
              font-size: 10px;
              margin: 2px 0;
              color: #000;
            }
            .tf-invoice-print-footer {
              text-align: center;
              font-size: 10px;
              color: #000;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="tf-invoice-print-container">
            <div class="tf-invoice-print-header">
              <h2>TastyFlow</h2>
              <p>Invoice No: ${invoice.invoiceNumber}</p>
              <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>

            <div class="tf-invoice-print-company">
              <h3>Restaurant Details</h3>
              <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
              <p>Phone: (909) 91-49101</p>
            </div>

            <div class="tf-invoice-print-user">
              <h5>Bill To:</h5>
              <p><strong>Name:</strong> ${invoice.userId.name}</p>
              <p><strong>Contact:</strong> ${invoice.userId.contact}</p>
            </div>

            <div class="tf-invoice-print-food">
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

            <div class="tf-invoice-print-tax">
              <div class="tf-invoice-print-total"><span>CGST (2.5%):</span> <span>₹${invoice.cgst.toFixed(2)}</span></div>
              <div class="tf-invoice-print-total"><span>SGST (2.5%):</span> <span>₹${invoice.sgst.toFixed(2)}</span></div>
              <div class="tf-invoice-print-total"><span>Round-off:</span> <span>₹${invoice.roundOff.toFixed(2)}</span></div>
              ${
                invoice.discount > 0
                ?
                `<div class="total"><span>Discount:</span> <span>₹${invoice.discount.toFixed(2)}</span></div>`
                :
                ''
              }
            </div>

            <div class="tf-invoice-print-final">
              <div>Total Payable:</div>
              <div>₹${invoice.totalAmount.toFixed(2)}</div>
            </div>

            ${
              invoice.reservedTableInfo
                ? `
              <div class="tf-invoice-print-reservation">
                <h5>Reservation Details</h5>
                <p><strong>Table No:</strong> ${invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee:</strong> ₹100 (included in total)</p>
              </div>
            `
                : ''
            }

            <div class="tf-invoice-print-footer">
              <p>Thank you for dining with us!</p>
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
      message.success(response.data.message);
    } catch (error) {
      message.error('Error sending invoice');
      console.error(error);
    }
  };

  return (
    <div className="tf-invoice-container">
      {/* Header */}
      <div className="tf-invoice-header">
        <div className="tf-invoice-info">
          <h4>Invoice No. {invoice.invoiceNumber}</h4>
          <p><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>Invoice ID:</strong> {invoice._id}</p>
        </div>
        <div className="tf-invoice-company">
          <h3>TastyFlow</h3>
          <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
          <p>Phone: (909) 91-49101 | Email: tastyflow@gmail.com</p>
          <p>GSTIN: 12ABCDE1234F1GH</p>
        </div>
      </div>

      {/* User Details */}
      <div className="tf-invoice-user">
        <h5>Bill To:</h5>
        {user ? (
          <div>
            <p><strong>Name:</strong> {invoice.userId.name}</p>
            <p><strong>Email:</strong> {invoice.userId.email}</p>
            <p><strong>Contact:</strong> {invoice.userId.contact|| "N/A"}</p>
            <p><strong>Customer ID:</strong> {user}</p>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      {/* Food Details */}
      <div className="tf-invoice-food">
        <h5>Order Summary</h5>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>S.No.</th>
              <th style={{ textAlign: "center" }}>Item</th>
              <th style={{ textAlign: "center" }}>Quantity</th>
              <th style={{ textAlign: "center" }}>Unit Price (₹)</th>
              <th style={{ textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.foods.map((food, index) => (
              <tr key={food.foodId}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{food.name}</td>
                <td style={{ textAlign: "center" }}>{food.quantity}</td>
                <td style={{ textAlign: "right" }}>{food.price}.00</td>
                <td style={{ textAlign: "right" }}>{(food.quantity * food.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Summary */}
      <div className="tf-invoice-tax">
        <div className="tf-invoice-total">
          <div>CGST (2.5%)</div>
          <div>{invoice.cgst.toFixed(2)}</div>
        </div>
        <div className="tf-invoice-total">
          <div>SGST (2.5%)</div>
          <div>{invoice.sgst.toFixed(2)}</div>
        </div>
        <div className="tf-invoice-total">
          <div>Round-off:</div>
          <div>{invoice.roundOff.toFixed(2)}</div>
        </div>
      </div>

      {/* Final Total */}
      <div className="tf-invoice-final">
        <div><strong>Total Amount Payable (₹):</strong></div>
        <div>{invoice.totalAmount.toFixed(2)}</div>
      </div>
      <div className="tf-invoice-final">
        <div>Total Amount in Words:</div>
        <div>{toWords(invoice.totalAmount)} Only</div>
      </div>
      <hr />

      {/* Reservation Details */}
      {invoice.reservedTableInfo && (
        <div className="tf-invoice-reservation">
          <h5>Reservation Details</h5>
          <p><strong>Table Reserved:</strong> Table {invoice.reservedTableInfo.tableNumber}</p>
          <p><strong>Reservation Slot:</strong> {invoice.reservedTableInfo.slotTime}</p>
          <p><strong>Reservation Fee Deduction:</strong> ₹100 (included in the total amount)</p>
          <p style={{ fontStyle: "italic", color: "#666" }}>
            Thank you for choosing TastyFlow for your dining experience. Your reservation ensures a seamless and enjoyable time with us.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="tf-invoice-buttons">
        <button className="tf-invoice-print-btn" onClick={printInvoice}>
          Print Invoice
        </button>
        <button
  className="tf-invoice-send-btn"
  onClick={sendInvoice}
  disabled={isSending}
>
  {isSending ? (
    <span className="tf-invoice-loader">
      <span className="tf-invoice-loader-dot"></span>
      <span className="tf-invoice-loader-dot"></span>
      <span className="tf-invoice-loader-dot"></span>
    </span>
  ) : (
    'Send Invoice'
  )}
</button>
      </div>

      {/* Footer */}
      <div className="tf-invoice-footer">
        <p>Thank you for dining with us! We look forward to serving you again.</p>
        <p><strong>TastyFlow</strong> - All Rights Reserved</p>
        <p style={{ fontSize: "0.8rem", color: "#666" }}>
          For any inquiries, please contact us at tastyflow@gmail.com or call (909) 91-49101.
        </p>
      </div>
    </div>
  );
};

export default Invoice;