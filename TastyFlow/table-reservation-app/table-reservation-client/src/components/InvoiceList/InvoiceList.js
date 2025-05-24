import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Select, Input, message } from 'antd';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./InvoiceList.css";

const { Option } = Select;

// Helper components
const StatusBadge = ({ status }) => {
  const statusColors = {
    paid: '#4CAF50',
    unpaid: '#F44336',
    partially_paid: '#FF9800',
    overdue: '#D32F2F',
    cancelled: '#9E9E9E'
  };

  const displayStatus = status || 'unpaid';

  return (
    <span 
      style={{
        backgroundColor: statusColors[displayStatus] || '#9E9E9E',
        color: 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        textTransform: 'capitalize',
        fontWeight: '500'
      }}
    >
      {displayStatus.replace('_', ' ')}
    </span>
  );
};

const PaymentModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  paymentData, 
  setPaymentData, 
  selectedInvoice,
  loading 
}) => {
  const calculateDueAmount = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const amount = invoice.finalAmount || invoice.totalAmount || 0;
    return Math.max(0, amount - totalPaid);
  };

  return (
    <Modal
      title={`Record Payment for Invoice #${selectedInvoice?.invoiceNumber || ''}`}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Record Payment"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <div className="payment-modal-content">
        <div className="payment-form-group">
          <label>Amount Due: ₹{selectedInvoice ? calculateDueAmount(selectedInvoice).toFixed(2) : '0.00'}</label>
        </div>
        <div className="payment-form-group">
          <label>Payment Amount</label>
          <Input
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
          />
        </div>
        <div className="payment-form-group">
          <label>Payment Method</label>
          <Select
            value={paymentData.paymentMethod}
            onChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
            style={{ width: '100%' }}
          >
            <Option value="cash">Cash</Option>
            <Option value="card">Credit/Debit Card</Option>
            <Option value="upi">UPI</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>
        <div className="payment-form-group">
          <label>Reference/Note</label>
          <Input
            value={paymentData.reference}
            onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
            placeholder="Payment reference or note"
          />
        </div>
      </div>
    </Modal>
  );
};

const StatusModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  newStatus, 
  setNewStatus, 
  selectedInvoice,
  loading 
}) => {
  return (
    <Modal
      title={`Update Status for Invoice #${selectedInvoice?.invoiceNumber || ''}`}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Update Status"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <div className="status-modal-content">
        <div className="status-form-group">
          <label>Current Status: <StatusBadge status={selectedInvoice?.status} /></label>
        </div>
        <div className="status-form-group">
          <label>New Status</label>
          <Select
            value={newStatus}
            onChange={(value) => setNewStatus(value)}
            style={{ width: '100%' }}
          >
            <Option value="unpaid">Unpaid</Option>
            <Option value="paid">Paid</Option>
            <Option value="partially_paid">Partially Paid</Option>
            <Option value="overdue">Overdue</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </div>
    </Modal>
  );
};

const InvoiceListPage = () => {
  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    reference: '',
  });
  const [newStatus, setNewStatus] = useState('unpaid');
  const navigate = useNavigate();

  // Helper functions
  const calculateDueAmount = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const amount = invoice.finalAmount || invoice.totalAmount || 0;
    return Math.max(0, amount - totalPaid);
  };

  // API calls
  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoice/admin/all-invoice');
      const invoicesWithStatus = response.data.map(invoice => ({
        ...invoice,
        status: invoice.status || 'unpaid'
      }));
      setInvoices(invoicesWithStatus);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async () => {
    try {
      if (!selectedInvoice) {
        message.error('No invoice selected');
        return;
      }

      if (!paymentData.amount || isNaN(paymentData.amount) || parseFloat(paymentData.amount) <= 0) {
        message.error('Please enter a valid payment amount');
        return;
      }

      const dueAmount = calculateDueAmount(selectedInvoice);
      if (parseFloat(paymentData.amount) > dueAmount) {
        message.warning(`Payment amount (₹${paymentData.amount}) exceeds due amount (₹${dueAmount.toFixed(2)})`);
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/invoice/admin/${selectedInvoice._id}/record-payment`,
        {
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          receivedBy: '680a48f89926f3832ce1525a'
        }
      );

      const updatedInvoices = invoices.map(inv => 
        inv._id === selectedInvoice._id ? { ...response.data.invoice, status: response.data.invoice.status || 'unpaid' } : inv
      );
      setInvoices(updatedInvoices);
      message.success('Payment recorded successfully');
      setPaymentModalVisible(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      message.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      if (!selectedInvoice) {
        message.error('No invoice selected');
        return;
      }

      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/invoice/admin/${selectedInvoice._id}/status`,
        { status: newStatus }
      );

      const updatedInvoices = invoices.map(inv => 
        inv._id === selectedInvoice._id ? { ...response.data.invoice, status: response.data.invoice.status || 'unpaid' } : inv
      );
      setInvoices(updatedInvoices);
      message.success('Invoice status updated successfully');
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const navigateToInvoiceDetail = (invoiceId) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const navigateToEditInvoice = (invoiceId) => {
    navigate(`/admin/invoices/edit/${invoiceId}`);
  };

  // Modal handlers
  const showPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: calculateDueAmount(invoice).toFixed(2),
      paymentMethod: 'cash',
      reference: '',
    });
    setPaymentModalVisible(true);
  };

  const showStatusModal = (invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status || 'unpaid');
    setStatusModalVisible(true);
  };

  // Effects
  useEffect(() => {
    fetchInvoices();
  }, []);

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
                  <span>INVOICE #</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>DATE</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>STATUS</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>AMOUNT</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>DUE</span>
                </div>
                <div className="invoice-list-header-item" style={{"textAlign": "center"}}>
                  <span>ACTIONS</span>
                </div>
              </div>

              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice._id} className="invoice-list-table-row">
                    <div className="invoice-list-row-item">
                      <span className="invoice-number">#{invoice.invoiceNumber}</span>
                    </div>
                    <div className="invoice-list-row-item">
                      <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="invoice-list-row-item">
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="invoice-list-row-item amount">
                      <span>₹{(invoice.finalAmount || invoice.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="invoice-list-row-item amount">
                      <span style={{ 
                        color: calculateDueAmount(invoice) > 0 ? '#F44336' : '#4CAF50',
                        fontWeight: calculateDueAmount(invoice) > 0 ? '600' : 'normal'
                      }}>
                        ₹{calculateDueAmount(invoice).toFixed(2)}
                      </span>
                    </div>
                    <div className="invoice-list-row-item actions">
                      <div className="action-buttons">
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
                        <button
                          onClick={() => showPaymentModal(invoice)}
                          className="invoice-list-pay-btn"
                          disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => showStatusModal(invoice)}
                          className="invoice-list-status-btn"
                        >
                          Update Status
                        </button>
                      </div>
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

      <PaymentModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onSubmit={recordPayment}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
        selectedInvoice={selectedInvoice}
        loading={loading}
      />

      <StatusModal
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onSubmit={updateStatus}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        selectedInvoice={selectedInvoice}
        loading={loading}
      />
    </div>
  );
};

export default InvoiceListPage;