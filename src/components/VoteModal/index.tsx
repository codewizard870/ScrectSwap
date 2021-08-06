import { extractError, notify } from '../../blockchain-bridge/scrt/utils';
import React, { ReactChild, useEffect } from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { useStores } from 'stores'
import { ExitIcon } from 'ui/Icons/ExitIcon'
import SpinnerCircle from '../../ui/Spinner/SpinnerCircle';
import { useHistory } from "react-router-dom";
import './style.scss';

const VoteModal = (props: {
    id: string,
    title: string,
    children: ReactChild,
    address: string,
    onVoteEmmited: Function,
    getHasVote: Function

}) => {
    const { theme, user } = useStores();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [salt, setSalt] = React.useState('');

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

        setLoading(true)

        try {
            const result = await user.createVote(choice, props.address, salt);
            console.log(result);
            setOpen(false);
            if (result?.code) {
                const message = extractError(result)
                notify('error', message, 10, result.txhash, true);
                setLoading(false);
            } else {
                notify('success', 'Vote Registered', 10, '', true);
                await props.onVoteEmmited();
                await props.getHasVote();
                setLoading(false);
            }
        } catch (error) {
            console.log('Error:', error);
            setLoading(false);
        }
    }

    // const wrapperFunction = (choice: number) => {
    //     vote(choice);
    //     setOpen(false);
    // }

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
                    {loading ? <SpinnerCircle /> :
                        <>
                            <Button
                                // loading={loading}
                                onClick={() => vote(1)}
                                className='vote-no'
                            >No
                            </Button>
                            <Button
                                // loading={loading}
                                onClick={() => vote(0)}
                                className='vote-yes'
                            >Yes
                            </Button>
                        </>
                    }
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default VoteModal;
