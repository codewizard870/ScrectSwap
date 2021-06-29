import React, { ReactChild } from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { useStores } from 'stores'
import { ExitIcon } from 'ui/Icons/ExitIcon'
import './style.scss';

const VoteModal = (props:{
    id:string,
    title:string,
    children:ReactChild
    
})=>{
    const {theme} = useStores();
    const [open, setOpen] = React.useState(false);

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
                <div className='center '>
                    <Button onClick={() => setOpen(false)} className='vote-no'>No</Button>
                    <Button onClick={() => setOpen(false)} className='vote-yes'>Yes</Button>
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default VoteModal;