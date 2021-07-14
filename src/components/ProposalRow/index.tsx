import moment from 'moment';
import { DetailProposal } from 'pages/DetailProposal';
import React, { useEffect } from 'react';
import { Route, Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Theme from "themes";
import './style.scss';

export const ProposalRow = (props: {
    theme: Theme,
    index: number,
    title: string,
    endTime: number,
    status?: string,
    id: string,
    ended: boolean,
    valid: boolean,
}) => {

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const validateStatus = () => {

        let endDate = moment.unix(props.endTime)
        let now = moment();
        let result = ''

        if (props.status === 'in progress' && endDate > now) {
            return result = 'in progress'
        } else if (props.status === 'in progress' && endDate <= now) {
            return result = 'ended';
        } else if (props.status === 'failed' && props.valid === true) {
            return result = 'failed';
        } else if (props.status === 'passed' && props.valid === false) {
            return result = 'didnt reach quorum';
        } else if (props.status === 'passed') {
            return result = 'passed';
        }

        return result;
    }

    useEffect(() => {
        validateStatus();
    }, []);

    return (
        <Link to={`/proposal/${props.id}`} style={{ textDecoration: 'none' }}>
            <div className={`proposal-row ${props.theme.currentTheme}`}>
                <p>{props.index + 1}</p>
                <p className='title'>{props.title}</p>
                <div>
                    <p>{moment.unix(props.endTime).format('ddd D MMM, HH:mm')}</p>
                    <span>Voting End Time</span>
                </div>
                <div className={`proposal-status status-${capitalizeFirstLetter(props.status)}`}>
                    {capitalizeFirstLetter(props.status)}
                </div>
            </div>
        </Link>
    )
}