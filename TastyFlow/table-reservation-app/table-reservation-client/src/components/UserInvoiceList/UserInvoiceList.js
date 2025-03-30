import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';
import axios from 'axios';
import './UserInvoiceList.css';
import { FaUser, FaCalendarAlt, FaTable, FaClock, FaMoneyBillWave, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const [state, setState] = useState({
    invoice: null,
    loading: true,
    error: null,
    isSending: false
  });

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoice/admin/${invoiceId}`);
        setState(prev => ({
          ...prev,
          invoice: response.data,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load invoice details.'
        }));
      }
    };

    fetchInvoiceDetail();
  }, [invoiceId]);

  const sendInvoice = async () => {
    try {
      setState(prev => ({ ...prev, isSending: true }));
      const response = await axios.post(
        `http://localhost:5000/api/users/send-invoice/${invoiceId}`,
        { userId: state.invoice.userId._id }
      );
      toast.success('Invoice sent successfully!');
      setState(prev => ({ ...prev, isSending: false }));
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    const invoiceHTML = `
     <html>
        <head>
          <title>Invoice - ${state.invoice.invoiceNumber}</title>
          <style>
            /* Print-specific styles */
            @page {
              size: auto;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.2;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .invoice-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              padding: 5px;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 5px;
            }
            .invoice-header h2 {
              font-size: 14px;
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
              border-top: 1px dashed #000;
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
              padding: 3px 0;
              text-align: left;
              border-bottom: 1px dashed #000;
            }
            .food-details th {
              font-weight: bold;
              background-color: #f0f0f0;
            }
            .tax-summary {
              margin-bottom: 5px;
              margin-top: 0.5rem;
              border-top: 1px dashed black;
              padding-top: 0.5rem;
            }
            .tax-summary .total {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              margin-bottom: 3px;
            }
            .final-total {
              font-size: 16px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              margin-bottom: 5px;
              padding-top: 5px;
              border-top: 2px solid #000;
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
              <p>Invoice No: ${state.invoice.invoiceNumber}</p>
              <p>Date: ${new Date(state.invoice.invoiceDate).toLocaleDateString()}</p>
            </div>

            <div class="company-info">
              <h3>Restaurant Details</h3>
              <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
              <p>Phone: (909) 91-49101</p>
            </div>

            <div class="user-details">
              <h5>Bill To:</h5>
              <p><strong>Name:</strong> ${state.invoice.userId.name}</p>
              <p><strong>Contact:</strong> ${state.invoice.userId.contact}</p>
            </div>

            <div class="food-details">
              <h5>Items Purchased</h5>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.invoice.foods.map((food, index) => `
                    <tr>
                      <td>${food.name}</td>
                      <td>${food.quantity}</td>
                      <td>${food.price.toFixed(2)}</td>
                      <td style="text-align: right;">${(food.quantity * food.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="tax-summary">
              <div class="total"><span>Total:</span> <span>₹${state.invoice.totalAmount.toFixed(2)}</span></div>
               ${state.invoice.discount > 0 ? `
                <div class="total">
                  <span>Discount:</span>
                  <span>-₹${state.invoice.discount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total"><span>CGST (2.5%):</span> <span>₹${state.invoice.cgst.toFixed(2)}</span></div>
              <div class="total"><span>SGST (2.5%):</span> <span>₹${state.invoice.sgst.toFixed(2)}</span></div>
              <div class="total"><span>Round-off:</span> <span>₹${state.invoice.roundOff.toFixed(2)}</span></div>

            </div>

            <div class="final-total">
              <div>Total Payable:</div>
              <div>₹${state.invoice.finalAmount == null ? state.invoice.totalAmount.toFixed(2) : state.invoice.finalAmount.toFixed(2)}</div>
            </div>

            ${
              state.invoice.reservedTableInfo
                ? `
              <div class="reservation-details">
                <h5>Reservation Details</h5>
                <p><strong>Table No:</strong> ${state.invoice.reservedTableInfo.tableNumber}</p>
                <p><strong>Reservation Slot:</strong> ${state.invoice.reservedTableInfo.slotTime}</p>
                <p><strong>Reservation Fee:</strong> ₹100 (included in total)</p>
              </div>
            `
                : ''
            }

            <div class="footer">
          Thank you for dining with us!<br>
          ${new Date().toLocaleString()}
        </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (state.loading) return <div className="invoice-detail-loading">Loading invoice...</div>;
  if (state.error) return <div className="invoice-detail-error">{state.error}</div>;

  return (
    <div className="invoice-detail-container">
      <Sidebar />
      
      <main className="invoice-detail-content">
        <header className="invoice-detail-header">
          <h1>Invoice Details</h1>
          <div className="invoice-detail-meta">
            <span>Invoice: {state.invoice.invoiceNumber}</span>
            <span>Date: {state.invoice.invoiceDate ? new Date(state.invoice.invoiceDate).toLocaleDateString() : ''}</span>
          </div>
        </header>

        <div className="invoice-detail-view">
          <section className="invoice-detail-summary">
            <div className="invoice-detail-summary-grid">
              <div className="invoice-detail-summary-item">
                <label>Total Amount</label>
                <p>₹{state.invoice.totalAmount.toFixed(2)}</p>
              </div>
              <div className="summary-item discount">
                <label>Discount</label>
                <p>-₹{state.invoice.discount.toFixed(2)}</p>
              </div>
              
              <div className="invoice-detail-summary-item">
                <label>CGST (2.5%)</label>
                <p>₹{state.invoice.cgst.toFixed(2)}</p>
              </div>
              
              <div className="invoice-detail-summary-item">
                <label>SGST (2.5%)</label>
                <p>₹{state.invoice.sgst.toFixed(2)}</p>
              </div>
              
              <div className="invoice-detail-summary-item">
                <label>Round Off</label>
                <p>₹{state.invoice.roundOff.toFixed(2)}</p>
              </div>

              {state.invoice.reservedTableInfo && (
                <div className="summary-item discount">
                  <label>Table Reservation</label>
                  <p>-₹100.00</p>
                </div>
              )}
              <div className="summary-item total">
                <label>Final Amount</label>
                <p>
  {(state.invoice.finalAmount || state.invoice.totalAmount).toFixed(2)}
</p>
              </div>
            </div>
          </section>

          <section className="invoice-detail-user-section">
            <h2 className="section-title">
              Customer Information
            </h2>
            <div className="detail-card">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div>
                    <div className="detail-label">Name</div>
                    <div className="detail-value">{state.invoice.userId.name}</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="detail-label">Email</div>
                    <div className="detail-value">{state.invoice.userId.email}</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaPhone />
                  </div>
                  <div>
                    <div className="detail-label">Contact</div>
                    <div className="detail-value">{state.invoice.userId.contact}</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaIdCard />
                  </div>
                  <div>
                    <div className="detail-label">User ID</div>
                    <div className="detail-value user-id">{state.invoice.userId._id}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="invoice-detail-items">
            <h2>Order Items</h2>
            <div className="invoice-detail-items-table">
              <div className="invoice-detail-table-header">
                <div>SI <br/> No.</div>
                <div>Item</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Amount</div>
              </div>
              
              {state.invoice.foods.length > 0 ? (
                state.invoice.foods.map((food, index) => (
                  <div key={index} className="invoice-detail-table-row">
                    <div>{index + 1}</div>
                    <div>{food.name}</div>
                    <div>₹{(food.price || 0).toFixed(2)}</div>
                    <div>{food.quantity}</div>
                    <div>₹{(food.quantity * food.price).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="invoice-detail-empty-state">No food items available</div>
              )}
            </div>
          </section>

          {state.invoice.reservedTableInfo && (
            <section className="invoice-detail-reservation-section">
              <h2>Reservation Details</h2>
              <div className="detail-card">
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaTable />
                    </div>
                    <div>
                      <div className="detail-label">Table No</div>
                      <div className="detail-value">{state.invoice.reservedTableInfo.tableNumber}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaClock />
                    </div>
                    <div>
                      <div className="detail-label">Time Slot</div>
                      <div className="detail-value">{state.invoice.reservedTableInfo.slotTime}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <div className="detail-label">Date</div>
                      <div className="detail-value">
                        {new Date(state.invoice.reservedTableInfo.date).toLocaleDateString("en-US", {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <div className="detail-label">Reservation Fee</div>
                      <div className="detail-value">₹100 (included in total)</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="invoice-detail-actions">
            <button
              type="button"
              onClick={printInvoice}
              className="invoice-detail-action-btn invoice-detail-print-btn"
              disabled={state.loading || state.error}
            >
              Print Invoice
            </button>
            <button
              type="button"
              onClick={sendInvoice}
              className="invoice-detail-action-btn invoice-detail-send-btn"
              disabled={state.isSending || state.loading || state.error}
            >
              {state.isSending ? (
                <span className="invoice-detail-loader">
                  <span className="invoice-detail-loader-dot"></span>
                  <span className="invoice-detail-loader-dot"></span>
                  <span className="invoice-detail-loader-dot"></span>
                </span>
              ) : (
                'Send Invoice'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceDetail;