import { extractError, notify } from '../../blockchain-bridge/scrt/utils';
import React, { ReactChild, useEffect } from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { useStores } from 'stores'
import { ExitIcon } from 'ui/Icons/ExitIcon'
import { useHistory } from "react-router-dom";
import './style.scss';

const VoteModal = (props: {
    id: string,
    title: string,
    children: ReactChild,
    address: string,

}) => {
    const { theme, user } = useStores();
    const [open, setOpen] = React.useState(false);
    const [salt, setSalt] = React.useState('');

    // let randomString = Math.random().toString(36).substr(2, 16);
    // setSalt(randomString);

    function randomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        setSalt(result);
    }

    useEffect(() => {
        randomString(16);
    }, [])

    const vote = async (choice: number) => {
        try {
            const result = await user.createVote(choice, props.address, salt);
            console.log(result);
            setOpen(false);
            if (result?.code) {
                const message = extractError(result)
                notify('error', message, 10, result.txhash, true);
            } else {
                notify('success', 'Vote Registered', 10, '', true)
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }


    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            className={`vote-modal ${theme.currentTheme}`}
            trigger={props.children}
        >
            <Modal.Content>
                <div className='space-between'>
                    <span><strong>Vote</strong></span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
                        <ExitIcon />
                    </span>
                </div>
                <div className='proposal-id'>
                    <span>#{props.id}</span>
                </div>
                <div className='center title'>
                    <h1>{props.title}</h1>
                </div>
                <div className='center'>
                    <Button onClick={() => vote(0)} className='vote-no'>No</Button>
                    <Button onClick={() => vote(1)} className='vote-yes'>Yes</Button>
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default VoteModal;