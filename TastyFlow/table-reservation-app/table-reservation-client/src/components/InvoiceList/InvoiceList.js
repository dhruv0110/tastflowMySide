import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Select, Input, message } from 'antd';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./InvoiceList.css";

const { Option } = Select;

// Helper components
const StatusBadge = ({ status, dueDate }) => {
  const statusColors = {
    paid: '#4CAF50',
    unpaid: '#F44336',
    partially_paid: '#FF9800',
    cancelled: '#9E9E9E',
    overdue: '#FF5722'
  };

  const displayStatus = status || 'unpaid';
  const isOverdue = (status === 'unpaid' || status === 'partially_paid') && 
                   dueDate && new Date(dueDate) < new Date();

  return (
    <div className="status-badge-container">
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
      {isOverdue && !['paid', 'cancelled'].includes(status) && (
        <span className="overdue-badge">Overdue</span>
      )}
    </div>
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

const CancelModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  selectedInvoice,
  loading 
}) => {
  const calculatePaidAmount = (invoice) => {
    if (!invoice) return 0;
    return invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  return (
    <Modal
      title={`Cancel Invoice #${selectedInvoice?.invoiceNumber || ''}`}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Confirm Cancellation"
      cancelText="Go Back"
      okButtonProps={{ danger: true }}
      confirmLoading={loading}
    >
      <div className="cancel-modal-content">
        <div className="cancel-form-group">
          <p>You are about to cancel this invoice. This action cannot be undone.</p>
          <p><strong>Current Status:</strong> <StatusBadge status={selectedInvoice?.status} dueDate={selectedInvoice?.dueDate} /></p>
          <p><strong>Amount Paid:</strong> ₹{calculatePaidAmount(selectedInvoice).toFixed(2)}</p>
        </div>
        
        {selectedInvoice?.status === 'paid' && (
          <div className="cancel-warning">
            <p>Warning: This invoice has been fully paid. Cancelling will require issuing a refund.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    reference: '',
  });
  const navigate = useNavigate();

  const calculateDueAmount = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const amount = invoice.finalAmount || invoice.totalAmount || 0;
    return Math.max(0, amount - totalPaid);
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoice/admin/all-invoice');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('Failed to load invoices');
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
          receivedBy: '680a48f89926f3832ce1525a' // Replace with actual user ID
        }
      );

      setInvoices(prev => prev.map(inv => 
        inv._id === selectedInvoice._id ? response.data.invoice : inv
      ));
      message.success('Payment recorded successfully');
      setPaymentModalVisible(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      message.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const cancelInvoice = async () => {
    try {
      if (!selectedInvoice) {
        message.error('No invoice selected');
        return;
      }

      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/invoice/admin/${selectedInvoice._id}/cancel`,
        {
          cancellationReason: 'Cancelled by admin', // You can make this dynamic if needed
          userId: '680a48f89926f3832ce1525a'
        }
      );

      setInvoices(prev => prev.map(inv => 
        inv._id === selectedInvoice._id ? response.data.invoice : inv
      ));
      message.success('Invoice cancelled successfully');
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      message.error(error.response?.data?.message || 'Failed to cancel invoice');
    } finally {
      setLoading(false);
    }
  };

  const navigateToInvoiceDetail = (invoiceId) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const navigateToEditInvoice = (invoiceId) => {
    navigate(`/admin/invoices/edit/${invoiceId}`);
  };

  const showPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: calculateDueAmount(invoice).toFixed(2),
      paymentMethod: 'cash',
      reference: '',
    });
    setPaymentModalVisible(true);
  };

  const showCancelModal = (invoice) => {
    setSelectedInvoice(invoice);
    setCancelModalVisible(true);
  };

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
                      <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="invoice-list-row-item">
                      <StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
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
                      <div className="action-buttons-container">
                        <div className="action-buttons-grid">
                          <button
                            onClick={() => navigateToInvoiceDetail(invoice._id)}
                            className="invoice-list-view-btn"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => navigateToEditInvoice(invoice._id)}
                            className="invoice-list-edit-btn"
                            disabled={invoice.status === 'cancelled'}
                            title={invoice.status === 'cancelled' ? "Cannot edit cancelled invoices" : ""}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => showPaymentModal(invoice)}
                            className="invoice-list-pay-btn"
                            disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                            title={
                              invoice.status === 'paid' ? "Invoice already paid" : 
                              invoice.status === 'cancelled' ? "Cannot pay cancelled invoice" : ""
                            }
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => showCancelModal(invoice)}
                            className="invoice-list-cancel-btn"
                            disabled={invoice.status === 'cancelled'}
                            title={invoice.status === 'cancelled' ? "Invoice already cancelled" : ""}
                          >
                            Cancel Invoice
                          </button>
                        </div>
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

      <CancelModal
        visible={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onSubmit={cancelInvoice}
        selectedInvoice={selectedInvoice}
        loading={loading}
      />
    </div>
  );
};

export default InvoiceListPage;