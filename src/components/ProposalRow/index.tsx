import moment from 'moment';
import { DetailProposal } from 'pages/DetailProposal';
import React, { useEffect } from 'react';
import { Route, Link } from 'react-router-dom';
import { Button, Message } from 'semantic-ui-react';
import Theme from "themes";
import './style.scss';
import { useStores } from 'stores'
import SpinnerLineHor from 'ui/Spinner/SpinnerLineHor';
import LoaderCentered from '../../ui/Spinner/LoaderCentered';

export const ProposalRow = (props: {
    theme: Theme,
    index: number,
    address: string,
    title: string,
    endTime: number,
    status?: string,
    id: string,
    finalized: boolean,
    valid: boolean,
    currentStatus: string,
    totalLocked: number
}) => {

    const [showResults, setShowResult] = React.useState(false);

    let { user } = useStores();

    const [tally, setTally] = React.useState({
        negative: 0,
        positive: 0,
    });

    const getTally = async () => {
        const ended = ['failed', 'passed'].includes(props.status);
        if (!(ended && props.valid)) return;

        try {
            const result = await user.tally(props.address);
            setTally(result);
        } catch (err) {
            console.error(err?.message);
            setShowResult(false);
        }
    }

    const totalTally = tally.positive + tally.negative;

    const voted = Math.round((totalTally / props.totalLocked) * 100);

    const positiveVotes = Math.round((tally.positive / totalTally) * 100);
    const negativeVotes = Math.round((tally.negative / totalTally) * 100);

    const result = props.status === 'passed' ? positiveVotes : negativeVotes;

    const belowQuorum = props.status === 'failed' && props.valid === false;

    const showProposalResult = () => {
        if (props.currentStatus === 'active' || props.currentStatus === 'tally in progress') {
            setShowResult(false);
        } else {
            setShowResult(true);
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let colorResult = '#D94C48';
    if (props.currentStatus === 'failed') {
        colorResult = '#D94C48';
    } else if (props.currentStatus === 'passed') {
        colorResult = 'green';
    }

    useEffect(() => {
        showProposalResult();
        getTally();
    }, [])

    return (
        <Link to={`/proposal/${props.id}`} style={{ textDecoration: 'none' }}>
            <div className={`proposal-row ${props.theme.currentTheme}`}>
                <p>{props.index}</p>
                <p className='title'>{props.title}</p>
                {
                    !showResults ?
                        <div>
                            <p>{moment.unix(props.endTime).format('ddd D MMM, HH:mm')}</p>
                            <span>Voting End Time</span>
                        </div>
                        :
                        <div className='vote-results'>
                            {belowQuorum ?
                                <div>
                                    <p>Below Quorum</p>
                                    <span>Voted</span>
                                </div>
                                :
                                <div className="vote-end">
                                    <div className="voted">
                                        {isNaN(negativeVotes) || !props.totalLocked
                                            ? <LoaderCentered />
                                            :
                                            <p>
                                                {voted + '%'}
                                            </p>
                                        }
                                        <span>Voted</span>
                                    </div>

                                    <div className="result">
                                        {isNaN(result)
                                            ? <LoaderCentered />
                                            :
                                            <p style={{ color: colorResult }}>
                                                {result + '%'}
                                            </p>
                                        }
                                        <span>
                                            {props.status === 'passed' ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            }
                        </div>
                }
                {
                    belowQuorum ?
                        <div className={`proposal-status status-failed`}>
                            Failed
                        </div>
                        :
                        <div className={`proposal-status status-${(props.currentStatus)}`}>
                            {capitalizeFirstLetter(props.currentStatus)}
                        </div>

                }
            </div>
        </Link>
    )
}
