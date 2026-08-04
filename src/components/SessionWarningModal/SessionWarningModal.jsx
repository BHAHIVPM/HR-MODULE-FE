import './SessionWarningModal.css';

function SessionWarningModal({ onStay, onLogout }) {
  return (
    <div className="session-modal-overlay">
      <div className="session-modal">
        <h3>Session Expiring</h3>
        <p>You've been inactive. You'll be logged out in 2 minutes.</p>
        <div className="session-modal-actions">
          <button onClick={onStay}>Stay Logged In</button>
          <button className="secondary" onClick={onLogout}>Logout Now</button>
        </div>
      </div>
    </div>
  );
}

export default SessionWarningModal;