import moment from 'moment';
import { DetailProposal } from 'pages/DetailProposal';
import React, { useEffect } from 'react';
import { Route, Link } from 'react-router-dom';
import { Button, Message } from 'semantic-ui-react';
import Theme from "themes";
import './style.scss';
import { useStores } from 'stores'

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
        negative: null,
        positive: null,
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

    const totalTally = parseFloat(tally.positive + tally.negative) / (Math.pow(10, 6));
    const totalLocked = props.totalLocked;
    const voted = Math.round(totalTally / totalLocked * 100);

    const positiveVotes = Math.round((((tally.positive / (Math.pow(10, 6))) * 100) / (totalTally)));
    const negativeVotes = Math.round((((tally.negative / (Math.pow(10, 6))) * 100) / (totalTally)));

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

    useEffect(() => {
        showProposalResult();
        getTally();
    }, [])

    return (
        <Link to={`/proposal/${props.id}`} style={{ textDecoration: 'none' }}>
            <div className={`proposal-row ${props.theme.currentTheme}`}>
                <p>{props.index + 1}</p>
                <p className='title'>{props.title}</p>
                {
                    !showResults ?
                        <div>
                            <p>{moment.unix(props.endTime).format('ddd D MMM, HH:mm')}</p>
                            <span>Voting End Time</span>
                        </div>
                        :
                        <div className={belowQuorum ? 'vote-result-failed' : "vote-result"}>
                            {belowQuorum ?
                                <div>
                                    <p>Below Quorum</p>
                                    <span>Voted</span>
                                </div>
                                : null
                            }
                            {
                                isNaN(negativeVotes) ? null :
                                    <div className="negative-results">
                                        <p> {voted + '%'}</p>
                                        <span>Voted</span>
                                    </div>
                            }
                            {
                                isNaN(positiveVotes) ? null :
                                    <div className="positive-results">
                                        <p> {result + '%'}</p>
                                        <span>{props.status === 'passed' ? 'Yes' : 'No'}</span>
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
