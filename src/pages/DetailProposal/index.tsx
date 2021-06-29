import ProposalLayout from 'components/ProposalLayout'
import VoteModal from 'components/VoteModal'
import { observer } from 'mobx-react'
import React from 'react'
import { Button } from 'semantic-ui-react'
import { useStores } from 'stores'
import './style.scss';

export const DetailProposal = observer((props)=>{
    const {theme} = useStores(); 
    const [proposal,setProposal] = React.useState({
        status:'active',
        status_message:'Below Quorum',
        id:'24',
        type:'SEFI Community Spending',
        title:'Designated Secrettipbot Development Proposal',
        proposer:'axyh4eoi3490812zxkwie',
        description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",

    })

    return (
        <ProposalLayout>
            <div className={`proposal-detail ${theme.currentTheme}`}>
                <div className='vote-row'>
                    <div className='proposal-id'>
                        <p>#{proposal.id}</p>
                        <h3>{proposal.type}</h3>
                    </div>
                    <VoteModal id={proposal.id} title={proposal.title}>
                        <Button className='button-vote g-button'>Vote</Button>
                    </VoteModal>
                </div>
                <div className={`proposal-status status-${proposal.status}`}>
                    {proposal.status_message}
                </div>
                <div className='proposal-content'>
                    <div className='title'>                       
                        <h1></h1>
                        <span>Propose by {proposal.proposer}</span>
                    </div>
                    <div className='description'>
                        <span>Description</span>
                        <p>{proposal.description}</p>
                    </div>
                </div>
            </div>
        </ProposalLayout>
    )
})