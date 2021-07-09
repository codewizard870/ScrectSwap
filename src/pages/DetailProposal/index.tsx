import ProposalLayout from 'components/ProposalLayout'
import VoteModal from 'components/VoteModal'
import moment from 'moment';
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
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
            <>
                <div className="proposal-container">

                    <div className={`proposal-detail ${theme.currentTheme}`}>
                        <div className='vote-row'>
                            <div className='proposal-id'>
                                <p>#{currentProposal.id}</p>
                            </div>
                        </div>
                        <div className='proposal-content'>
                            <div className='title'>
                                <h3>{currentProposal.title}</h3>
                            </div>
                            <div className="propsal-address">
                                <p>Porposal Address: </p> <p>{currentProposal.author_address}</p>
                            </div>
                            <div className='description'>
                                <h5>Description</h5>
                                <p>{currentProposal.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`cards ${theme.currentTheme}`}>

                        <div className="card card-info">
                            <div className="card-title"><h5>Information</h5></div>
                            <div className="card-row">
                                <div className="label"><p>Status</p></div>
                                <div className={`proposal-status small status-${currentProposal.status}`}>
                                    {currentProposal.status}
                                </div>
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Type</p></div>
                                <div className="title"><p>SEFI Community Spending</p></div>
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Proposed by</p></div>
                                <div className="title"><p>{currentProposal.author_alias}</p></div>
                            </div>
                            <VoteModal
                                id={currentProposal.id}
                                title={currentProposal.title}
                                address={currentProposal.address}
                            >
                                <Button
                                    className='button-vote g-button'
                                >Vote
                                </Button>
                            </VoteModal>
                        </div>

                        <div className="card card-results">
                            <h5 className="card-title">Results</h5>
                            <p className="description">Results will be available when voting ends.</p>
                            <div className="endTime">
                                <div className="label"><p>Voting End Time</p></div>
                                <div className="title">
                                    <p>{moment(currentProposal.end_date).format('ddd D MMM, h:mm a')}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </>


        </ProposalLayout>
    )
})