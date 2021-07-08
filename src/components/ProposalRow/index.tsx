import moment from 'moment';
import { DetailProposal } from 'pages/DetailProposal';
import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Theme from "themes";
import './style.scss';

export const ProposalRow = (props: {
    theme: Theme,
    index: number,
    title: string,
    endTime: Date,
    status?: string,
    id: string,
}) => {

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <Link to={`/proposal/${props.id}`} style={{ textDecoration: 'none' }}>
            <div className={`proposal-row ${props.theme.currentTheme}`}>
                <p>{props.index + 1}</p>
                <p className='title'>{props.title}</p>
                <div>
                    <p>{moment(props.endTime).format('ddd D MMM, h:mm a')}</p>
                    <span>Voting End Time</span>
                </div>
                <div className={`proposal-status status-${props.status}`}>
                    {capitalizeFirstLetter(props.status)}
                </div>
            </div>
        </Link>
    )
}