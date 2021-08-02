import ProposalLayout from 'components/ProposalLayout'
import VoteModal from 'components/VoteModal'
import moment from 'moment';
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useParams, useHistory } from 'react-router'
import { Button, Message } from 'semantic-ui-react';
import { useStores } from 'stores'
import { sleep } from 'utils';
import { extractError, notify } from '../../blockchain-bridge/scrt/utils';
import axios from "axios";
import { numberFormatter } from '../../utils/formatNumber'
import './style.scss';

export const DetailProposal = observer((props) => {

    const { theme, user, tokens } = useStores();
    const history = useHistory();

    const { id }: any = useParams();

    const [proposal, setProposal] = React.useState({
        id: '',
        reveal_com: {
            revealers: [],
            number: 0
        },
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

    const contractAddress = proposal?.address;

    const [loading, setLoading] = React.useState<boolean>(false);

    const [proposals, setProposals] = React.useState([]);

    const [userResult, setUserResult] = React.useState({
        choice: null,
        voting_power: null
    });

    const [showAnswer, setShowAnswer] = React.useState<boolean>(false);

    const [showAllAnswers, setShowAllAnswers] = React.useState<boolean>(false);

    const [rollingHash, setRollingHash] = React.useState<string>('');

    const [isRevealer, setIsRevealer] = React.useState<boolean>(false);

    const [hasVote, setHasVote] = React.useState<boolean>(false);

    const [revealed, setRevealed] = React.useState({
        num_revealed: 0,
        required: 0,
        revelead: []
    });

    const [voteStatus, setVoteStatus] = React.useState({
        finalized: null,
        valid: null
    });

    const [tally, setTally] = React.useState({
        negative: 0,
        positive: 0,
    });

    const userProfileURL = 'https://secretnodes.com/secret/chains/secret-2/accounts';

    const showHideAnswer = () => {
        if (hasVote === true) {
            setShowAnswer(true);
        } else {
            setShowAnswer(false);
        }
    }

    const showHideAllAnswers = () => {
        if (voteStatus.finalized === true && voteStatus.valid === true || proposal.status === 'failed') {
            setShowAllAnswers(true);
        } else {
            setShowAllAnswers(false);
        }
    }

    const getProposal = (id: string) => {
        const proposal = proposals?.find(ele => ele?.id == id);
        if (proposal) {
            setProposal(proposal);
        }
    }

    const getAtuhorAddress = (): string => {
        if (proposal.author_address) {
            return (proposal?.author_address?.substring(0, 10) + '...' + proposal?.author_address?.substring(proposal?.author_address?.length - 3, proposal?.author_address?.length));
        } else {
            return '';
        }
    }

    async function FinalizeVote() {

        setLoading(true);

        try {
            const result = await user.sendFinalizeVote(contractAddress, rollingHash);
            if (result?.code) {
                const message = extractError(result)
                console.log(extractError(result));
                notify('error', message, 10, result.txhash, true);
                setLoading(false);
            } else {
                if (proposal.reveal_com.number === 1) {
                    sendVoteResults();
                    notify('success', 'Finalized Vote Sended', 10, '', true);
                    await sleep(3000);
                    setHasVote(true);
                    setLoading(false);
                    setShowAllAnswers(true);
                    console.log('Post Sended');
                } else {
                    notify('success', 'Finalized Vote Sended', 10, '', true);
                    await sleep(3000);
                    setHasVote(true);
                    setLoading(false);
                    console.log('Vote Counted');
                }
            }
        } catch (error) {
            console.error(error.message);
            setLoading(false);
        }
    }

    // console.log('Reveal Requeried', revealed.required);
    // console.log('Total Revealears', proposal.reveal_com.revealers.length);
    // console.log('Validate', proposal.reveal_com.revealers.length >= revealed.required);

    const sendVoteResults = async () => {
        try {
            const res = await axios.post(`${process.env.BACKEND_URL}/secret_votes/finalize/${contractAddress}`);
            console.log('Post Response Success: ', res);
        } catch (err) {
            console.log('Post Response Error:', err);
        }
    }

    const validateRevealer = () => {

        const revealers = proposal.reveal_com.revealers;
        // console.log(revealers);

        if (revealers.includes(user.address)) {
            setIsRevealer(true);
            // console.log('Includes');
        } else {
            // console.log('no includes')
            setIsRevealer(false);
        }
    }

    const getRollingHash = async () => {
        const result = await user.rollingHash(contractAddress);
        setRollingHash(result);
    }

    const getUserVote = async () => {
        if (!contractAddress) return;
        try {
            const result = await user.userVote(contractAddress);
            if (result) {
                setUserResult(result);
            }
        } catch (err) {
            console.error('User Vote Error:', err);
        }
    }

    const getHasVote = async () => {
        try {
            const result = await user.hasVote(contractAddress);
            setHasVote(result);
        } catch (err) {
            console.log('Has Vote Error:', err.message);
        }
    }

    const getRevealed = async () => {
        try {
            const result = await user.revealed(contractAddress);
            setRevealed(result);
        } catch (err) {
            console.log('Revealed Error:', err.message);
        }
    }

    const getTally = async () => {
        try {
            const result = await user.tally(contractAddress);
            setTally(result);
        } catch (err) {
            console.log('Tally Error:', err.message);
        }
    }

    const validateStatus = (status: string) => {

        let endDate = moment.unix(proposal.end_date)
        let now = moment();

        if (status === 'in progress' && endDate > now) {
            return 'active'
        } else if (status === 'in progress' && endDate <= now) {
            return 'tally in progress';
        } else if (status === 'failed' && voteStatus.valid === true) {
            return 'failed';
        } else if (status === 'failed' && voteStatus.valid === false) {
            return 'didnt reach quorum';
        } else if (status === 'passed') {
            return 'passed';
        }

        return '';
    }


    const getVoteStatus = async () => {
        try {
            const result = await user.voteInfo(contractAddress);
            setVoteStatus(result);
        } catch (err) {
            console.log('Vote Status:', err.message);
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const belowQuorum = proposal.status === 'failed' && voteStatus.valid === false;

    const totalVote = tally.positive + tally.negative;
    const positiveVotes = Math.round(((tally.positive / totalVote) * 100));
    const negativeVotes = Math.round(((tally.negative / totalVote) * 100));

    // console.log('Positive:', tally.positive);
    // console.log('Negative:', tally.negative);

    // console.log('Tally', tally)

    // console.log('Vote Status: ', voteStatus);

    // console.log(user.address);
    // console.log(proposal.reveal_com.revealers.includes(user.address));

    // console.log(validateRevealer());

    // console.log(proposals);
    // console.log(proposal);

    useEffect(() => {
        (async () => {
            const result = await user.getProposals();
            setProposals(result);
        })();
    }, [])

    useEffect(() => {
        getProposal(id);
    }, [proposals]);

    useEffect(() => {
        if (Object.keys(proposal).length > 0) {
            getVoteStatus();
            getRollingHash();
            validateRevealer();
            getUserVote();
            getHasVote();
            getTally();
            getRevealed();
        }
    }, [proposal]);

    useEffect(() => {
        showHideAllAnswers();
    }, [voteStatus]);

    useEffect(() => {
        showHideAnswer();
    }, [hasVote]);

    //QUERIES
    // console.log('Reveal Commite:', user.getRevealCommitte(proposal?.address))

    // All Vote Info: 
    // console.log('Vote Info:', user.voteInfo(proposal?.address));
    // Normal Vote
    // console.log('Has Vote:', user.hasVote(proposal?.address));
    // console.log('Choices:', user.getChoices(proposal?.address));
    // console.log('Number Of Voters:', user.getNumberOfVoters(proposal?.address));
    // console.log('Revealed:', user.revealed(proposal?.address));
    // console.log('Rollling Hash:', user.getRollingHash(proposal?.address));
    // console.log('Vote:', user.userVote(proposal?.address));


    // Tally: After Vote Finalized
    // console.log('Tally:', user.tally(proposal?.address));
    // console.log('vote', userResult)

    // console.log(showAnswer)
    // console.log(tally);

    function formatUserChoice() {
        const { choice } = userResult;
        if (choice == null) return (<>---</>);
        return choice == 0 ? 'Yes' : 'No';
    }

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
                                <p className="wrap-space">{proposal.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`cards ${theme.currentTheme}`}>
                        <div className="card card-info">
                            <div className="card-title"><h5>Information</h5></div>
                            <div className="card-row">
                                <div className="label"><p>Status</p></div>
                                {
                                    belowQuorum ?
                                        <div className={`proposal-status small status-failed`}>
                                            Failed
                                        </div>
                                        :
                                        <div className={`proposal-status small status-${validateStatus(proposal.status)}`}>
                                            {capitalizeFirstLetter(validateStatus(proposal.status))}
                                        </div>
                                }
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Type</p></div>
                                <div className="title"><p>{proposal.vote_type}</p></div>
                            </div>
                            <div className="card-row">
                                <div className="label"><p>Proposed by</p></div>
                                <div className="user-info">
                                    <div className="title"><p>{proposal.author_alias}</p></div>
                                    <div className="address">
                                        <a
                                            href={`${userProfileURL}/${proposal.author_address}`} target="_blank"
                                        >
                                            {getAtuhorAddress()}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="user-response">
                                {hasVote
                                    ?
                                    <div className="voting-power">
                                        <div><h3>{numberFormatter(userResult.voting_power, 2)}</h3></div>
                                        <div className="label"><p>My Voting Power</p></div>
                                    </div>
                                    :
                                    null
                                }
                                {hasVote
                                    ?
                                    <div className="vote-response">
                                        <div><h3>{formatUserChoice()}</h3></div>
                                        <div className="label"><p>My Vote</p></div>
                                    </div>
                                    :
                                    null
                                }
                            </div>
                            <VoteModal
                                id={proposal.id}
                                title={proposal.title}
                                address={proposal.address}
                                onVoteEmmited={getUserVote}
                            >
                                {
                                    moment.unix(proposal.end_date) < moment() ? null
                                        :
                                        <Button
                                            className='button-vote g-button'
                                        >Vote
                                        </Button>
                                }
                            </VoteModal>
                        </div>

                        <div className="card card-results">

                            <h5 className="card-title">Results</h5>
                            {proposal.status === 'failed' && voteStatus.valid === false ? <p>Votes Didn't Reach Quorum</p> : null}
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
                                        {
                                            isRevealer ?
                                                <Button
                                                    loading={loading}
                                                    onClick={() => FinalizeVote()}
                                                    disabled={
                                                        moment.unix(proposal.end_date) > moment()
                                                    }
                                                    className='button-finalize-vote g-button'
                                                >Finalize Vote
                                                </Button>
                                                : null
                                        }
                                    </>
                                    :
                                    <div className="closed-proposal">
                                        {tally?.negative ?
                                            <div className="voted">
                                                <div> <h3> {negativeVotes}%</h3></div>
                                                <div className="label"><p>No</p></div>
                                            </div>
                                            :
                                            <div className="voted">
                                                <div> <h3>0%</h3> </div>
                                                <div className="label"><p>No</p></div>
                                            </div>
                                        }
                                        {tally?.positive ?
                                            <div className="result">
                                                <div> <h3>{positiveVotes}%</h3></div>
                                                <div className="label"><p>Yes</p></div>
                                            </div>
                                            :
                                            <div className="result">
                                                <div><h3>0%</h3></div>
                                                <div className="label"><p>Yes</p></div>
                                            </div>
                                        }
                                    </div>
                            }

                        </div>
                    </div>
                </div>
            </>


        </ProposalLayout>
    )
})
