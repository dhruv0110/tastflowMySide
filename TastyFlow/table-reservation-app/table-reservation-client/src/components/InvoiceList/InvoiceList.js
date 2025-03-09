import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Sidebar from '../../components/Sidebar/Sidebar';
import "./InvoiceList.css";
import axios from 'axios';

const List = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook to navigate to other pages

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
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="invoice-list">
        <form className="invoice-list-form flex-col">
          <h1 className="header">User Invoices</h1>

          {loading ? (
            <p>Loading invoices...</p>
          ) : (
            <div className="user-invoice-form flex-col">
              <div className="invoice-table">
                <div className="invoice-table-format title">
                  <b>SI Number</b>
                  <b>Date</b>
                  <b>View</b>
                  <b>Edit</b>
                </div>

                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice._id} className="invoice-table-format">
                      <p>{invoice.invoiceNumber}</p>
                      <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                      <div
                        onClick={() => navigateToInvoiceDetail(invoice._id)}
                        className="view-button"
                      >
                        View Invoice
                      </div>
                      <div
                        onClick={() => navigateToEditInvoice(invoice._id)}
                        className="edit-button"
                      >
                        Edit Invoice
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No invoices available.</p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default List;
