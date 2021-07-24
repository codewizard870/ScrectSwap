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
    currentStatus: string
}) => {

    const [showResults, setShowResult] = React.useState(false);

    let { user } = useStores();

    const [tally, setTally] = React.useState({
        negative: null,
        positive: null,
    });

    const getTally = async () => {
        try {
            const result = await user.tally(props.address);
            // console.log(result);
            setTally(result);
        } catch (err) {
            console.error(err?.message);
            setShowResult(false);
        }
    }

    const totalVote = tally.positive + tally.negative;
    const positiveVotes = Math.round(((tally.positive * 100) / (totalVote)));
    const negativeVotes = Math.round(((tally.negative * 100) / (totalVote)));

    const showProposalResult = () => {
        if (props.currentStatus != 'active') {
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
                        <div className="vote-result">
                            {
                                isNaN(negativeVotes) ? null :
                                    <div className="negative-results">
                                        <p> {negativeVotes.toString() + '%'}</p>
                                        <span>Yes</span>
                                    </div>
                            }
                            {
                                isNaN(positiveVotes) ? null :
                                    <div className="positive-results">
                                        <p> {positiveVotes.toString() + '%'}</p>
                                        <span>Yes</span>
                                    </div>
                            }
                        </div>
                }
                <div className={`proposal-status status-${(props.currentStatus)}`}>
                    {/* {capitalizeFirstLetter(validateStatus(props.status))} */}
                    {capitalizeFirstLetter(props.currentStatus)}
                </div>
            </div>
        </Link>
    )
}