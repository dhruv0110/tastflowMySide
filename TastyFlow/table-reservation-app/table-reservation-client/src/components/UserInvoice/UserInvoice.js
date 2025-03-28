import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./UserInvoice.css";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserInvoice = () => {
    const { userId } = useParams();
    const [user, setUser] = useState('');
    const [userInvoice, setUserInvoice] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/admin/getuser/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
            } else {
                toast.error("Error fetching user details");
            }
        } catch (error) {
            toast.error("An error occurred while fetching user details");
        }
    };

    const fetchUserInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/invoice/admin/invoices/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUserInvoice(data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            toast.error("An error occurred while fetching invoices");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
        fetchUserInvoice();
    }, [userId]);

    const navigateToInvoiceDetail = (invoiceId) => {
        navigate(`/admin/invoices/${invoiceId}`);
    };

    const navigateToEditInvoice = (invoiceId) => {
        navigate(`/admin/invoices/edit/${invoiceId}`);
    };

    return (
        <div className="user-invoice-main-container">
            <Sidebar />
            <div className="user-invoice-content">
                <h3 className="user-invoice-title">{user.name}'s Invoices</h3>
                <div className="user-invoice-form-container">
                    <div className="user-invoice-table-container">
                        {loading ? (
                            <p className="user-invoice-loading">Loading invoices...</p>
                        ) : userInvoice.length > 0 ? (
                            <>
                                <div className="user-invoice-table-header">
                                    <span className="user-invoice-table-heading">Invoice Number</span>
                                    <span className="user-invoice-table-heading">Date</span>
                                    <span className="user-invoice-table-heading">View</span>
                                    <span className="user-invoice-table-heading">Edit</span>
                                </div>

                                {userInvoice.map((invoice) => (
                                    <div key={invoice._id} className="user-invoice-table-row">
                                        <span className="user-invoice-table-data">{invoice.invoiceNumber}</span>
                                        <span className="user-invoice-table-data">
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => navigateToInvoiceDetail(invoice._id)}
                                            className="user-invoice-view-btn"
                                        >
                                            View Invoice
                                        </button>
                                        <button
                                            onClick={() => navigateToEditInvoice(invoice._id)}
                                            className="user-invoice-edit-btn"
                                        >
                                            Edit Invoice
                                        </button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="user-invoice-empty">No invoices available for this user.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInvoice;