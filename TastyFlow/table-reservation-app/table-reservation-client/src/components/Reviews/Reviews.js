import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Reviews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faCalendarAlt, 
  faExclamationCircle, 
  faSearch,
  faPaperPlane,
  faHistory,
  faUser,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useMessages } from '../../context/MessageContext';
import { Howl } from 'howler';

const Reviews = () => {
  const { messages, loading, newMessageNotification } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [NewMessageNotification, setNewMessageNotification] = useState(false);

  const notificationSound = new Howl({
    src: ['/sounds/notification.mp3']
  });

  const handleReplyClick = (messageId) => {
    setReplyingTo(replyingTo === messageId ? null : messageId);
    setReplyContent('');
  };

  const handleViewHistory = (message) => {
    setSelectedMessage(message);
    setShowHistory(true);
  };

  const handleSendReply = async (messageId) => {
    if (!replyContent.trim()) {
      setErrorMessage('Reply content cannot be empty');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/message/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({
          messageId,
          replyContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      notificationSound.play();
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply:', error);
      setErrorMessage(error.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = messages.filter(message => 
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="reviews-admin-container">
      <Sidebar />
      
      <main className="reviews-content">
        <div className="reviews-header">
          <div>
            <h1>Customer Messages</h1>
            <p>Manage and respond to customer inquiries</p>
          </div>
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        <div className="reviews-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div>
              <h3>{messages.length}</h3>
              <p>Total Messages</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon today">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div>
              <h3>{messages.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length}</h3>
              <p>Today's Messages</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-reviews">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="no-reviews">
            <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
            <p>{searchTerm ? 'No matching messages found' : 'No messages available'}</p>
          </div>
        ) : (
          <div className="reviews-list-container">
            <div className="reviews-list-header">
              <span className="user-col">User</span>
              <span className="email-col">Email</span>
              <span className="date-col">Date</span>
              <span className="message-col">Message</span>
              <span className="action-col">Actions</span>
            </div>
            
            <div className="reviews-list">
              {filteredMessages.map((message) => (
                <div key={message._id} className={`review-card ${message.status === 'pending' ? 'unread' : ''}`}>
                  <div className="user-info">
                    <div className="avatar">
                      {message.firstName.charAt(0)}{message.lastName.charAt(0)}
                    </div>
                    <div className="user-details">
                      <h4>{message.firstName} {message.lastName}</h4>
                      <p className="email-mobile">{message.email}</p>
                    </div>
                  </div>
                  <div className="email">{message.email}</div>
                  <div className="date">
                    {new Date(message.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="message-container">
                    <div className="message-content">
                      {message.message}
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="history-btn"
                      onClick={() => handleViewHistory(message)}
                    >
                      <FontAwesomeIcon icon={faHistory} /> History
                    </button>
                    {replyingTo === message._id ? (
                      <div className="reply-section">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type your reply here..."
                          rows="3"
                        />
                        <div className="reply-actions">
                          <button 
                            className="cancel-btn"
                            onClick={() => setReplyingTo(null)}
                            disabled={isSending}
                          >
                            Cancel
                          </button>
                          <button 
  className="send-reply-btn"
  onClick={() => handleSendReply(message._id)}
  disabled={isSending}
>
  {isSending ? (
    <span className="reviews-loader">
      <span className="reviews-loader-dot"></span>
      <span className="reviews-loader-dot"></span>
      <span className="reviews-loader-dot"></span>
    </span>
  ) : (
    <>
      <FontAwesomeIcon icon={faPaperPlane} /> Send
    </>
  )}
</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="reply-btn"
                        onClick={() => handleReplyClick(message._id)}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} /> Reply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && selectedMessage && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>Reply History for {selectedMessage.firstName} {selectedMessage.lastName}</h3>
                <button 
                  className="close-modal" 
                  onClick={() => setShowHistory(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-content">
                {selectedMessage.replies && selectedMessage.replies.length > 0 ? (
                  <div className="history-list">
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="history-item">
                        <div className="history-meta">
                          <span className="history-date">
                            {new Date(reply.date).toLocaleString()}
                          </span>
                          {reply.adminName && (
                            <span className="history-admin">
                              <FontAwesomeIcon icon={faUser} /> {reply.adminName}
                            </span>
                          )}
                        </div>
                        <div className="history-content">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <p>No reply history found for this message.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reviews;