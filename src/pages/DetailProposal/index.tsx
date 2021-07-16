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

    const { theme, user, tokens } = useStores();
    // console.log('Proposals:', user.proposals);

    const { id }: any = useParams();
    // console.log(useParams());

    // Get Wallet Address
    // console.log(user.address);

    const [proposal, setProposal] = React.useState({
        id: '',
        address: '',
        title: '',
        description: '',
        vote_type: '',
        author_address: '',
        author_alias: '',
        end_date: 0,
        finalized: false,
        valid: false,
        status: ''
    });

    const [proposals, setProposals] = React.useState([]);

    const [userResult, setUserResult] = React.useState({
        choice: null,
        voting_power: ''
    });

    const [choice, setChoice] = React.useState('')
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [showAllAnswers, setShowAllAnswers] = React.useState(false);

    // console.log('Tally:', user.getTally(proposal.address));

    const showHideAnswer = () => {
        if (proposal.finalized === true) {
            setShowAnswer(true);
        } else {
            setShowAnswer(false);
        }
    }

    const showHideAllAnswers = () => {
        if (proposal.finalized === true) {
            setShowAllAnswers(true);
        } else {
            setShowAllAnswers(false);
        }
    }

    // console.log(userResult);

    const getProposal = (id: string) => {
        const proposal = proposals?.find(ele => ele?.id == id);
        // console.log(proposal);
        if (proposal) {
            setProposal(proposal);
        }
    }

    const getUserResponse = async () => {
        try {
            const result = await user.getUserVote(proposal?.address)
            setUserResult(result);
        } catch (err) {
            console.log(err.message);
        }
    }


    const getInfo = async () => {
        try {
            const result = await user.getRevealCommitte(proposal?.address);
            console.log(result);
        } catch (err) {
            console.log(err.message)
        }
    }

    // console.log('Reveal', getInfo());

    const transformChoice = (choiceSelected: number) => {
        choiceSelected === 0 ? setChoice('No') : ('Yes')
    }

    // console.log('Addresss:', proposal.address);
    // console.log('Author Adrress:', proposal.author_address);

    const getAtuhorAddress = (): string => {
        if (proposal.author_address) {
            return (proposal?.author_address?.substring(0, 10) + '...' + proposal?.author_address?.substring(proposal?.author_address?.length - 3, proposal?.author_address?.length));
        } else {
            return '';
        }
    }

    // console.log(proposals);

    // useEffect(() => {
    //     (async () => {
    //         const result = await getInfo();
    //         console.log(result);
    //     })();
    // }, [user.getRevealCommitteInfo(proposal?.address)])

    // useEffect(() => {
    //     getUserResponse();
    // }, [tokens.allData, user.getUserVote(proposal?.address)]);

    useEffect(() => {
        (async () => {
            const result = await user.getProposals();
            // console.log(result);
            setProposals(result);
        })();
    }, [])

    useEffect(() => {
        transformChoice(userResult.choice);
        getProposal(id);
    }, [proposals]);

    useEffect(() => {
        showHideAnswer();
        showHideAllAnswers();
    }, []);

    //QUERIES
    // console.log('User Vote:', user.getUserVote(proposal?.address));
    console.log('Reveal Commite:', user.getRevealCommitte(proposal?.address));

    // All Vote Info: 
    // console.log('Vote Info:', user.getVoteInfo(proposal?.address));
    // console.log('Has Vote:', user.getHasVote(proposal?.address));
    // console.log('Choices:', user.getChoices(proposal?.address));
    // console.log('Number Of Voters:', user.getNumberOfVoters(proposal?.address));
    // console.log('Revealed:', user.getRevealed(proposal?.address));
    // console.log('Rollling Hash:', user.getRollingHash(proposal?.address));
    // console.log('Vote:', user.getVote(proposal?.address));


    // Tally: After Vote Finalized
    // console.log('Tally:', user.getTally(proposal?.address));




    return (
        <ProposalLayout>
            <>
                <div className="proposal-container">

                    <div className={`proposal-detail ${theme.currentTheme}`}>
                        <div className='vote-row'>
                            <div className='proposal-id'>
                                <p>#{proposal.id}</p>
                            </div>
                        </div>
                        <div className='proposal-content'>
                            <div className='title'>
                                <h3>{proposal.title}</h3>
                            </div>
                            {/* <div className="proposal-address">
                                <p>Porposal Address: </p> <p>{proposal.author_address}</p>
                            </div> */}
                            <div className='description'>
                                <h5>Description</h5>
                                <p>{proposal.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`cards ${theme.currentTheme}`}>
                        <div className="card card-info">
                            <div className="card-title"><h5>Information</h5></div>
                            <div className="card-row">
                                <div className="label"><p>Status</p></div>
                                {/* <div className={`proposal-status small status-${proposal.status}`}>
                                    {proposal.status}
                                </div> */}
                                <div className={`proposal-status small status-${proposal.status}`}>
                                    {proposal.status}
                                </div>
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Type</p></div>
                                <div className="title"><p>{proposal.vote_type}</p></div>
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Proposed by</p></div>
                                <div className="user-info">
                                    <div className="title"><p>{proposal.author_alias}</p></div>
                                    <div className="address"><p>{getAtuhorAddress()}</p></div>
                                </div>
                            </div>
                            {
                                showAnswer ?
                                    <div className="user-response">
                                        <div className="voting-power">
                                            <div><h3>{userResult.voting_power}</h3></div>
                                            <div className="label"><p>My Voting Power</p></div>
                                        </div>
                                        <div className="vote-response">
                                            <div><h3>{choice}</h3></div>
                                            <div className="label"><p>My Vote</p></div>
                                        </div>
                                    </div>
                                    :
                                    <VoteModal
                                        id={proposal.id}
                                        title={proposal.title}
                                        address={proposal.address}
                                    >
                                        <Button
                                            className='button-vote g-button'
                                        >Vote
                                        </Button>
                                    </VoteModal>
                            }
                        </div>

                        <div className="card card-results">

                            <h5 className="card-title">Results</h5>
                            {
                                showAllAnswers === false
                                    ?
                                    <>
                                        <p className="description">Results will be available when voting ends.</p>
                                        <div className="endTime">
                                            <div className="label"><p>Voting End Time</p></div>
                                            <div className="title">
                                                <p>{moment.unix(proposal.end_date).format('ddd D MMM, HH:mm')}</p>
                                            </div>
                                        </div>
                                        <Button
                                            className='button-finalize-vote g-button'
                                        >Finalize Vote
                                        </Button>
                                    </>
                                    :
                                    <div className="closed-proposal">
                                        <div className="voted">
                                            <div><h3>78%</h3></div>
                                            <div className="label"><p>Voted</p></div>
                                        </div>
                                        <div className="result">
                                            <div><h3>67%</h3></div>
                                            <div className="label"><p>Yes</p></div>
                                        </div>
                                    </div>
                            }

                        </div>
                    </div>
                </div>
            </>


        </ProposalLayout>
    )
})