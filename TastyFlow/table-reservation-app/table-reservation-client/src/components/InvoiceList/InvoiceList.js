import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./InvoiceList.css"; // Changed to unique CSS file
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
    <div className="invoice-list-page-container">
      <Sidebar />
      <div className="invoice-list-page-content">
        <h1 className="invoice-list-page-header">User Invoices</h1>

        {loading ? (
          <p className="invoice-list-page-loading">Loading invoices...</p>
        ) : (
          <div className="invoice-list-page-table-container">
            <div className="invoice-list-page-table">
              <div className="invoice-list-page-table-header">
                <span>SI No.</span>
                <span>Date</span>
                <span>Amount</span>
                <span  style={{ textAlign: 'center' }}>View</span>
                <span  style={{ textAlign: 'center' }}>Edit</span>
              </div>

              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice._id} className="invoice-list-page-table-row">
                    <span>{invoice.invoiceNumber}</span>
                    <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                    <span>{invoice.finalAmount == null ? invoice.totalAmount.toFixed(2) : invoice.finalAmount.toFixed(2)}</span>
                    <button
                      onClick={() => navigateToInvoiceDetail(invoice._id)}
                      className="invoice-list-page-view-btn"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => navigateToEditInvoice(invoice._id)}
                      className="invoice-list-page-edit-btn"
                    >
                      Edit Invoice
                    </button>
                  </div>
                ))
              ) : (
                <p className="invoice-list-page-empty">No invoices available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceListPage;