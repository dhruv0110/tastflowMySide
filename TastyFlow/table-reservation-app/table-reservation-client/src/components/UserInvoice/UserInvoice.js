import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./UserInvoice.css";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserInvoice = () => {
    const { userId } = useParams();
    const [user, setUser] = useState('');
    const [userInvoice, setUserInvoice] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigate = useNavigate();

    // Fetch user details
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

    // Fetch user invoices
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
                setLoading(false); // Set loading to false once data is fetched
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

    // Navigate to specific invoice detail or edit page
    const navigateToInvoiceDetail = (invoiceId) => {
        navigate(`/admin/invoices/${invoiceId}`);
    };

    const navigateToEditInvoice = (invoiceId) => {
        navigate(`/admin/invoices/edit/${invoiceId}`);
    };

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div className="user-invoice">
                <h3 className="user-name">{user.name}'s Invoices</h3>
                <div className="user-invoice-form flex-col">
                    <div className="invoice-table">
                        {/* Show loading message or invoices */}
                        {loading ? (
                            <p>Loading invoices...</p>
                        ) : userInvoice.length > 0 ? (
                            <>
                                {/* Table Header */}
                                <div className="invoice-table-format title">
                                    <b>Invoice Number</b>
                                    <b>Date</b>
                                    <b>View</b>
                                    <b>Edit</b>
                                </div>

                                {/* Invoice List */}
                                {userInvoice.map((invoice) => (
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
                                ))}
                            </>
                        ) : (
                            <p className="no-reviews">No invoices available for this user.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInvoice;
