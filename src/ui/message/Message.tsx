import React, { useState } from 'react'
import './styles.scss';
import { Link } from 'react-router-dom';

const MessageDismiss = () => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = (e) => {
    e.preventDefault();
    setVisible(false);
  };

  return (
    <>
      {
        visible ?
          <div className="messsage-body">
            <div className="message-content">
              <p className="header">SecretSwap SEFI STAKING pool has been upgraded.</p>
              <p className="subtitle">
                <Link to={"/migration"}>Migrate your tokens</Link> to continue earning.
              </p>
            </div>
            <div className="close-content">
              <a onClick={(e) => handleDismiss(e)}>
                <img src="/static/close.svg" alt="close icon" />
              </a>
            </div>
          </div>
          : null
      }
    </>
  );
}

export default MessageDismiss;
