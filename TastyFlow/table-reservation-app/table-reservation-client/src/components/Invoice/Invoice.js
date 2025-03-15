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
            /* Print-specific styles */
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .invoice-container {
              width: 100%;
              margin: 0;
              padding: 0;
              border: none;
              box-shadow: none;
              background: #fff;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #007bff;
              page-break-after: avoid; /* Prevent header from breaking across pages */
            }
            .invoice-info h4 {
              font-size: 18px;
              color: #007bff;
              margin: 0 0 10px 0;
            }
            .invoice-info p, .company-info p {
              font-size: 12px;
              margin: 2px 0;
              color: #000;
            }
            .company-info h3 {
              font-size: 16px;
              color: #000;
              margin: 0 0 10px 0;
            }
            .user-details {
              margin: 20px 0;
              padding: 10px;
              border-top: 1px solid #000;
              page-break-after: avoid; /* Prevent user details from breaking across pages */
            }
            .user-details h5 {
              font-size: 14px;
              color: #000;
              margin: 0 0 10px 0;
            }
            .food-details {
              margin: 20px 0;
              page-break-inside: avoid; /* Prevent table from breaking across pages */
            }
            .food-details h5 {
              font-size: 14px;
              color: #000;
              margin: 0 0 10px 0;
            }
            .food-details table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              page-break-inside: auto; /* Allow table rows to break across pages */
            }
            .food-details th, .food-details td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .food-details th {
              background-color: #f4f4f4;
              color: #000;
              font-weight: bold;
            }
            .food-details td {
              color: #000;
            }
            .tax-summary {
              margin: 20px 0;
              page-break-inside: avoid; /* Prevent tax summary from breaking across pages */
            }
            .tax-summary .total {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 12px;
              color: #000;
            }
            .final-total {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px solid #007bff;
              font-size: 14px;
              font-weight: bold;
              color: #000;
              page-break-before: avoid; /* Prevent final total from breaking across pages */
            }
            .reserved-table-info {
              margin: 20px 0;
              padding: 10px;
              border: 1px solid #ddd;
              background-color: #f9f9f9;
              page-break-inside: avoid; /* Prevent reservation details from breaking across pages */
            }
            .reserved-table-info h5 {
              font-size: 14px;
              color: #000;
              margin: 0 0 10px 0;
            }
            .reserved-table-info p {
              font-size: 12px;
              color: #000;
              margin: 5px 0;
            }
            .reserved-table-info p:last-child {
              font-style: italic;
              color: #666;
            }
            .button-container {
              display: none; /* Hide buttons in print view */
            }
            .invoice-footer {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px solid #007bff;
              text-align: center;
              font-size: 12px;
              color: #000;
              page-break-before: avoid; /* Prevent footer from breaking across pages */
            }
            .invoice-footer p {
              margin: 5px 0;
            }
            .invoice-footer p:last-child {
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="invoice-info">
                <h4>Invoice No. ${invoice.invoiceNumber}</h4>
                <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Invoice ID:</strong> ${invoice._id}</p>
              </div>
              <div class="company-info">
                <h3>TastyFlow</h3>
                <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
                <p>Phone: (909) 91-49101 | Email: tastyflow@gmail.com</p>
                <p>GSTIN: 12ABCDE1234F1GH</p>
              </div>
            </div>

            <div class="user-details">
              <h5>Bill To:</h5>
              ${invoice.userId ? `
                <p><strong>Name:</strong> ${invoice.userId.name}</p>
                <p><strong>Email:</strong> ${invoice.userId.email}</p>
                <p><strong>Contact:</strong> ${invoice.userId.contact}</p>
                <p><strong>Customer ID:</strong> ${invoice.userId._id}</p>
              ` : '<p>No user data available</p>'}
            </div>

            <div class="food-details">
              <h5>Order Summary</h5>
              <table>
                <thead>
                  <tr>
                    <th style="text-align: center;">S.No.</th>
                    <th style="text-align: center;">Item</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: center;">Unit Price (₹)</th>
                    <th style="text-align: right;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.foods.map((food, index) => `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td>${food.name}</td>
                      <td style="text-align: center;">${food.quantity}</td>
                      <td style="text-align: right;">${food.price}.00</td>
                      <td style="text-align: right;">${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Tax Summary -->
            <div class="tax-summary">
              <div class="total">
                <div>CGST (2.5%)</div>
                <div>${invoice.cgst.toFixed(2)}</div>
              </div>
              <div class="total">
                <div>SGST (2.5%)</div>
                <div>${invoice.sgst.toFixed(2)}</div>
              </div>
              <div class="total">
                <div>Round-off:</div>
                <div>${invoice.roundOff.toFixed(2)}</div>
              </div>
            </div>

            <div class="final-total">
              <div>Total Amount in Words:</div>
              <div>${toWords(invoice.totalAmount)} Only</div>
            </div>
            <div class="final-total">
              <div><strong>Total Amount Payable (₹):</strong></div>
              <div>${invoice.totalAmount.toFixed(2)}</div>
            </div>
            <hr />

            ${invoice.reservedTableInfo ? `
              <div class="reserved-table-info">
                <h5>Reservation Details</h5>
                <p><strong>Table Reserved:</strong> Table ${invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee Deduction:</strong> ₹100 (included in the total amount)</p>
                <p style="font-style: italic; color: #666;">
                  Thank you for choosing TastyFlow for your dining experience. Your reservation ensures a seamless and enjoyable time with us.
                </p>
              </div>
            ` : ''}

            <div class="invoice-footer">
              <p>Thank you for dining with us! We look forward to serving you again.</p>
              <p><strong>TastyFlow</strong> - All Rights Reserved</p>
              <p style="font-size: 0.8rem; color: #666;">
                For any inquiries, please contact us at tastyflow@gmail.com or call (909) 91-49101.
              </p>
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
      {/* Header */}
      <div className="invoice-header">
        <div className="invoice-info">
          <h4>Invoice No. {invoice.invoiceNumber}</h4>
          <p><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>Invoice ID:</strong> {invoice._id}</p>
        </div>
        <div className="company-info">
          <h3>TastyFlow</h3>
          <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
          <p>Phone: (909) 91-49101 | Email: tastyflow@gmail.com</p>
          <p>GSTIN: 12ABCDE1234F1GH</p>
        </div>
      </div>

      {/* User Details */}
      <div className="user-details">
        <h5>Bill To:</h5>
        {user ? (
          <div>
            <p><strong>Name:</strong> {invoice.userId.name}</p>
            <p><strong>Email:</strong> {invoice.userId.email}</p>
            <p><strong>Contact:</strong> {invoice.userId.contact}</p>
            <p><strong>Customer ID:</strong> {user}</p>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      {/* Food Details */}
      <div className="food-details">
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
      <div className="tax-summary">
        <div className="total">
          <div>CGST (2.5%)</div>
          <div>{invoice.cgst.toFixed(2)}</div>
        </div>
        <div className="total">
          <div>SGST (2.5%)</div>
          <div>{invoice.sgst.toFixed(2)}</div>
        </div>
        <div className="total">
          <div>Round-off:</div>
          <div>{invoice.roundOff.toFixed(2)}</div>
        </div>
      </div>

      {/* Final Total */}
      <div className="final-total">
        <div>Total Amount in Words:</div>
        <div>{toWords(invoice.totalAmount)} Only</div>
      </div>
      <div className="final-total">
        <div><strong>Total Amount Payable (₹):</strong></div>
        <div>{invoice.totalAmount.toFixed(2)}</div>
      </div>
      <hr />

      {/* Reservation Details */}
      {invoice.reservedTableInfo && (
        <div className="reserved-table-info">
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
      <div className="button-container">
        <button className="print-invoice-btn" onClick={printInvoice}>
          Print Invoice
        </button>
        <button
          className="send-invoice-btn"
          onClick={sendInvoice}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send Invoice'}
        </button>
      </div>

      {/* Footer */}
      <div className="invoice-footer">
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