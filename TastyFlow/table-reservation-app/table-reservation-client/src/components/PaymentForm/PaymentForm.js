import React, { useState } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import Confetti from "react-confetti";
import confetti from "canvas-confetti";
import "./PaymentForm.css";

const PaymentForm = ({ clientSecret, onSuccess, onError, tableNumber, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    showIcon: true, // Ensure the card icon is shown
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
    <div className="payment-form-container">
      {paymentSuccess && <Confetti />}

      <div className="payment-header">
        <h2 className="payment-form-title">
          Secure Payment <FaLock className="lock-icon" />
        </h2>
        <p className="payment-subtitle">Enter your card details to confirm your reservation.</p>
      </div>

      <div className="reservation-details">
        <div className="detail-item">
          <span>Table:</span>
          <strong>Table {tableNumber}</strong>
        </div>
        <div className="detail-item">
          <span>Amount:</span>
          <strong>₹{amount}</strong>
        </div>
      </div>

      {!paymentSuccess ? (
        <>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="input-group">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                <CardNumberElement options={cardNumberOptions} />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Expiration Date</label>
                <div className="card-input-wrapper">
                  <CardExpiryElement options={{ style: inputStyle }} />
                </div>
              </div>

              <div className="input-group">
                <label>CVC</label>
                <div className="card-input-wrapper">
                  <CardCvcElement options={{ style: inputStyle }} />
                </div>
              </div>
            </div>

            {errorMessage && <div className="payment-form-error">{errorMessage}</div>}

            <button type="submit" disabled={!stripe || loading} className="payment-form-button">
              {loading ? <span className="spinner"></span> : "Pay Now"}
            </button>
          </form>

          <div className="payment-notice">
            <p>⚠️ A minimum payment of ₹100 is required. This amount will be deducted from your final bill.</p>
          </div>

          <div className="non-refundable-notice">
            <FaCheckCircle className="notice-icon" />
            <span>This amount is non-refundable if you unreserve the table.</span>
          </div>
        </>
      ) : (
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          <span>Payment Successful! Your table has been reserved.</span>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;