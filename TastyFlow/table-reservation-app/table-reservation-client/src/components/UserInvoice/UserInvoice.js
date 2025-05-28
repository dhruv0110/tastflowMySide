import React, { useEffect, useState, useCallback } from 'react';
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

    const fetchUserDetails = useCallback(async () => {
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
    }, [userId]);

    const fetchUserInvoice = useCallback(async () => {
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
    }, [userId]);

    useEffect(() => {
        fetchUserDetails();
        fetchUserInvoice();
    }, [fetchUserDetails, fetchUserInvoice]);

    const navigateToInvoiceDetail = (invoiceId) => {
        navigate(`/admin/invoices/${invoiceId}`);
    };

    const navigateToEditInvoice = (invoiceId) => {
        navigate(`/admin/invoices/edit/${invoiceId}`);
    };

    return (
        <div className="ui-container">
            <Sidebar />
            <main className="ui-content">
                <header className="ui-header">
                    <h1 className="ui-title">{user.name}'s Invoices</h1>
                    <p className="ui-subtitle">View and manage all invoices for this user</p>
                </header>

                {loading ? (
                    <div className="ui-loading">Loading invoice data...</div>
                ) : (
                    <div className="ui-view">
                        <div className="ui-table-container">
                            {userInvoice.length > 0 ? (
                                <>
                                    <div className="ui-table-header">
                                        <div className="ui-header-item">
                                            <span>INVOICE</span>
                                        </div>
                                        <div className="ui-header-item">
                                            <span>DATE</span>
                                        </div>
                                        <div className="ui-header-item">
                                            <span>AMOUNT</span>
                                        </div>
                                        <div className="ui-header-item" style={{"textAlign": "center"}}>
                                            <span>ACTIONS</span>
                                        </div>
                                    </div>

                                    {userInvoice.map((invoice) => (
                                        <div key={invoice._id} className="ui-table-row">
                                            <div className="ui-row-item">
                                                <span className="ui-invoice-number">{invoice.invoiceNumber}</span>
                                            </div>
                                            <div className="ui-row-item">
                                                <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>
                                            <div className="ui-row-item ui-amount">
                                                <span>₹{(invoice.finalAmount || invoice.totalAmount).toFixed(2)}</span>
                                            </div>
                                            <div className="ui-row-item ui-actions">
                                                <button
                                                    onClick={() => navigateToInvoiceDetail(invoice._id)}
                                                    className="ui-view-btn"
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => navigateToEditInvoice(invoice._id)}
                                                    className="ui-edit-btn"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="ui-empty-state">
                                    No invoices found for this user.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserInvoice;