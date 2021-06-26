import React from 'react';
import { Button } from 'semantic-ui-react';
import Theme from "themes";
import './style.scss';

export const ProposalRow = (props:{
    theme:Theme,
    index:number,
    title:string,
    endTime:Date,
    status:string,

})=>{
    return (
        <div className={`proposal-row ${props.theme.currentTheme}`}>
            <p>{props.index}</p>
            <p className='title'>{props.title}</p>
            <div>
                <p>{props.endTime.toString()}</p>
                <span>Voting End Time</span>
            </div>
            <div className={`proposal-status status-${props.status}`}>
                {props.status}
            </div>
        </div>
    )
}