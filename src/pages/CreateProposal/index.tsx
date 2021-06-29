import ProposalLayout from 'components/ProposalLayout'; 
import { observer } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';
import './style.scss';

const CreateProposal = observer((props)=>{
    const {theme} = useStores();
    return (
        <ProposalLayout width='710px'>
            <form className={`create-proposal ${theme.currentTheme}`} action="">
                <div className='title-section'>
                    <h1>Create proposal</h1>
                    <div className='title-section__buttons'>
                        <Button className='g-button--outline'><Link to='/governance'>Cancel</Link></Button>
                        <Button className='g-button'>Create Proposal</Button>
                    </div>
                </div>
                <div className='card-proposal'>
                    <div className='form-title'>
                        <label htmlFor="proposal-type">Proposal Type</label>
                        <label htmlFor="title">Title</label>
                        <select name="proposal-type" id="proposal-type">
                            <option value="0">Select one</option>
                            <option value="1">SEFI Rewards Pool</option>
                            <option value="2">SEFI Community Spending</option>
                            <option value="3">SEFI SecretSwap Parameter Change</option>
                            <option value="4">other</option>
                        </select>
                        <input id='title' name='title' type="text" />
                    </div>
                    <div className='form-description'>
                        <label htmlFor="description">Description</label>
                        <textarea 
                            // maxLength={250}
                            name="description" 
                            id="description" 
                            cols={60} 
                            rows={20}/>
                    </div>
                </div>
                   
                </form> 
            
        </ProposalLayout>
    )
})

export default  CreateProposal;