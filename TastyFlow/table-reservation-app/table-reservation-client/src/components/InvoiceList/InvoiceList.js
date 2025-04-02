import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./InvoiceList.css";
import axios from 'axios';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/invoice/admin/all-invoice');
        setInvoices(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const navigateToInvoiceDetail = (invoiceId) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const navigateToEditInvoice = (invoiceId) => {
    navigate(`/admin/invoices/edit/${invoiceId}`);
  };

  return (
    <div className="invoice-list-container">
      <Sidebar />
      
      <main className="invoice-list-content">
        <header className="invoice-list-header">
          <h1>Invoice Management</h1>
          <p className="invoice-list-subtitle">View and manage all customer invoices</p>
        </header>

        {loading ? (
          <div className="invoice-list-loading">Loading invoice data...</div>
        ) : (
          <div className="invoice-list-view">
            <div className="invoice-list-table-container">
              <div className="invoice-list-table-header">
                <div className="invoice-list-header-item">
                  <span>INVOICE</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>DATE</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>AMOUNT</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>ACTIONS</span>
                </div>
              </div>

              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice._id} className="invoice-list-table-row">
                    <div className="invoice-list-row-item">
                      <span className="invoice-number">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="invoice-list-row-item">
                      <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="invoice-list-row-item amount">
                      <span>₹{(invoice.finalAmount || invoice.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="invoice-list-row-item actions">
                      <button
                        onClick={() => navigateToInvoiceDetail(invoice._id)}
                        className="invoice-list-view-btn"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => navigateToEditInvoice(invoice._id)}
                        className="invoice-list-edit-btn"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="invoice-list-empty-state">
                  No invoices found in the system.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceListPage;