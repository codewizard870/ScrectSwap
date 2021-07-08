import ProposalLayout from 'components/ProposalLayout'
import VoteModal from 'components/VoteModal'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { Button } from 'semantic-ui-react'
import { useStores } from 'stores'
import './style.scss';

export const DetailProposal = observer((props) => {

    const { theme, user } = useStores();
    // console.log('Proposals:', user.proposals);

    const { id }: any = useParams();
    // console.log(useParams());

    const [currentProposal, setCurrentProposal] = React.useState({
        id: '',
        address: '',
        title: '',
        description: '',
        author_address: '',
        author_alias: '',
        end_date: 0,
        ended: false,
        valid: false,
        status: ''
    });

    const getProposal = (id: string) => {
        const proposal = user.proposals?.find(ele => ele?.id == id);
        // console.log(proposal);
        if (proposal) {
            setCurrentProposal(proposal);
        }
    }

    const [proposal, setProposal] = React.useState({
        status: 'active',
        status_message: 'Below Quorum',
        id: '24',
        type: 'SEFI Community Spending',
        title: 'Designated Secrettipbot Development Proposal',
        proposer: 'axyh4eoi3490812zxkwie',
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",

    })

    useEffect(() => {
        getProposal(id);
        // getProposal('60e5d55cabf2383e205a2ef1');
    }, [user.proposals]);

    return (
        <ProposalLayout>
            {!currentProposal
                ?
                <div>
                    <h1>Loading Page</h1>
                </div>
                :
                <div className={`proposal-detail ${theme.currentTheme}`}>
                    <div className='vote-row'>
                        <div className='proposal-id'>
                            <p>#{currentProposal.id}</p>
                            {/* <h3>{proposal.type}</h3> */}
                        </div>
                        <VoteModal id={currentProposal.id} title={currentProposal.title} address={currentProposal.address}>
                            <Button
                                className='button-vote g-button'>Vote</Button>

                        </VoteModal>
                    </div>
                    <div className={`proposal-status small status-${currentProposal.status}`}>
                        {currentProposal.status}
                    </div>
                    {/* <div className={`proposal-status small status-active`}>
                        {'Active'}
                    </div> */}
                    <div className='proposal-content'>
                        <div className="propsal-address">
                            <h5>Porposal Address: </h5>
                            <p>{currentProposal.author_address}</p>
                        </div>
                        <div className='title'>
                            <h3>{currentProposal.title}</h3>
                            <span>Porposed by: {currentProposal.author_alias}</span>
                        </div>
                        <div className='description'>
                            <h5>Description</h5>
                            <p>{currentProposal.description}</p>
                        </div>
                    </div>
                </div>
            }
        </ProposalLayout>
    )
})