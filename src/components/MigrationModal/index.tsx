import React from 'react';
import { Modal, Icon, Header, Button } from 'semantic-ui-react';
import { useStores } from 'stores';
import './modal.scss';


const MigrationModal = ({ setOpenModal, children, modalOpen }) => {

    const { theme } = useStores();

    return (
        <>
            <Modal
                trigger={children}
                open={modalOpen}
            // className="modalMigration"
            >
                <Header close icon='archive' content='Choose a Pool' />
                <Modal.Content>
                    <p>
                        Pool Examples
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={() => setOpenModal(false)}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='green' onClick={() => setOpenModal(false)}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    )
}

export default MigrationModal;
