import React, { useState } from 'react'
import './styles.scss';
import { Link } from 'react-router-dom';
import CloseIcon from '../../../public/static/close.png';
import MigrationModal from 'components/MigrationModal';

const MessageDismiss = () => {

    const [visible, setVisible] = useState(true);

    const [modalOpen, setOpenModal] = useState(false);

    const handleDismiss = () => {
        setVisible(false);

        setTimeout(() => {
            setVisible(true)
        }, 2000);
    }
    return (
        <>
            {
                visible ?
                    <div className="messsage-body">
                        <div className="message-content">
                            <p className="header">SecretSwap X pool has been upgraded.</p>
                            <p className="subtitle">
                                <MigrationModal
                                    setOpenModal={setOpenModal}
                                    modalOpen={modalOpen}
                                >
                                    <a onClick={() => setOpenModal(true)}>
                                        Migrate your tokens
                                    </a>
                                </MigrationModal>
                                to continue to earn rewards
                            </p>
                        </div>
                        <div className="close-content">
                            <p onClick={() => handleDismiss()}>X</p>
                        </div>
                    </div>
                    : null
            }

            {/* {modalOpen && <MigrationModal setOpenModal={setOpenModal} />} */}
        </>
    )
}

export default MessageDismiss;
