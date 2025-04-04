import React, { useState, useRef, useEffect } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { FaLock, FaCheckCircle, FaCreditCard, FaCalendarAlt, FaShieldAlt, FaTimes } from "react-icons/fa";
import Confetti from "react-confetti";
import confetti from "canvas-confetti";
import "./PaymentForm.css";
import visacard from "./Image/VISA-logo.png";
import mastercard from "./Image/mastercard-logo.png";
import amex from "./Image/amex-card1708.jpg";
import rupay from "./Image/Rupay-Logo.png";

const PaymentForm = ({ clientSecret, onSuccess, onError, tableNumber, amount, slot, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const formRef = useRef();

  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const inputStyle = {
    base: {
      color: "#333",
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      "::placeholder": { color: "#a0a0a0" },
      iconColor: "#555",
      backgroundColor: "#fff",
    },
    invalid: { color: "#ff4135", iconColor: "#ff4135" },
  };

  const cardNumberOptions = {
    style: inputStyle,
    showIcon: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    const cardExpiry = elements.getElement(CardExpiryElement);
    const cardCvc = elements.getElement(CardCvcElement);

    if (!cardNumber || !cardExpiry || !cardCvc) {
      setErrorMessage("Card details are missing.");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      onError(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setPaymentSuccess(true);
      triggerConfetti();
      onSuccess(paymentIntent);
    }

    setLoading(false);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="pf-fullscreen-container">
      <div className="pf-form-wrapper" ref={formRef}>
        {paymentSuccess && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        
        <button className="pf-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="pf-left-panel">
          <div className="pf-header">
            <h2 className="pf-title">
              Secure Payment <FaLock className="pf-lock-icon" />
            </h2>
            <p className="pf-subtitle">Complete your reservation with a secure payment</p>
          </div>

          <div className="pf-reservation-summary">
            <h3>Reservation Summary</h3>
            <div className="pf-summary-details">
              <div className="pf-detail-item">
                <span>Table Number:</span>
                <strong>{tableNumber}</strong>
              </div>
              <div className="pf-detail-item">
                <span>Timing:</span>
                <strong>{ { 1: "5:00 to 7:00 PM", 2: "7:00 to 9:00 PM", 3: "9:00 to 11:00 PM" }[slot] || "N/A" }</strong>
              </div>
              <div className="pf-detail-item">
                <span>Reservation Fee:</span>
                <strong>₹{amount}</strong>
              </div>
            </div>
          </div>

          <div className="pf-security-badges">
            <div className="pf-badge">
              <FaShieldAlt className="pf-badge-icon" />
              <span>256-bit SSL Security</span>
            </div>
            <div className="pf-badge">
              <FaLock className="pf-badge-icon" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </div>

        <div className="pf-right-panel">
          {!paymentSuccess ? (
            <>
              <form onSubmit={handleSubmit} className="pf-form">
                <div className="pf-input-group">
                  <label>
                    <FaCreditCard className="pf-input-icon" /> Card Number
                  </label>
                  <div className="pf-card-input-wrapper">
                    <CardNumberElement options={cardNumberOptions} />
                  </div>
                </div>

                <div className="pf-input-row">
                  <div className="pf-input-group">
                    <label>
                      <FaCalendarAlt className="pf-input-icon" /> Expiry Date
                    </label>
                    <div className="pf-card-input-wrapper">
                      <CardExpiryElement options={{ style: inputStyle }} />
                    </div>
                  </div>

                  <div className="pf-input-group">
                    <label>CVC / CVV</label>
                    <div className="pf-card-input-wrapper">
                      <CardCvcElement options={{ style: inputStyle }} />
                    </div>
                  </div>
                </div>

                {errorMessage && <div className="pf-error">{errorMessage}</div>}

                <button type="submit" disabled={!stripe || loading} className="pf-button">
                  {loading ? <span className="pf-spinner"></span> : `Pay ₹${amount}`}
                </button>
              </form>

              <div className="pf-notices">
                <div className="pf-notice">
                  <p>⚠️ A minimum payment of ₹100 is required. This amount will be deducted from your final bill.</p>
                </div>

                <div className="pf-non-refundable-notice">
                  <FaCheckCircle className="pf-notice-icon" />
                  <span>This amount is non-refundable if you cancel the reservation.</span>
                </div>
              </div>

              <div className="pf-accepted-cards">
                <p>We accept:</p>
                <div className="pf-card-brands">
                  <img src={visacard} alt="Visa" className="pf-card-brand-icon" />
                  <img src={mastercard} alt="Mastercard" className="pf-card-brand-icon" />
                  <img src={amex} alt="American Express" className="pf-card-brand-icon" />
                  <img src={rupay} alt="RuPay" className="pf-card-brand-icon" />
                </div>
              </div>
            </>
          ) : (
            <div className="pf-success-container">
              <div className="pf-success-message">
                <FaCheckCircle className="pf-success-icon" />
                <h3>Payment Successful!</h3>
                <p>Your table #{tableNumber} has been reserved.</p>
                <p>A confirmation has been sent to your email.</p>
              </div>
              <div className="pf-success-details">
                <div className="pf-detail-item">
                  <span>Transaction ID:</span>
                  <strong>TX-{Math.random().toString(36).substring(2, 10).toUpperCase()}</strong>
                </div>
                <div className="pf-detail-item">
                  <span>Amount Paid:</span>
                  <strong>₹{amount}</strong>
                </div>
                <div className="pf-detail-item">
                  <span>Payment Method:</span>
                  <strong>Credit Card</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;