import { extractError, notify } from '../../blockchain-bridge/scrt/utils';
import { useHistory } from "react-router-dom";
import ProposalLayout from 'components/ProposalLayout'; 
import { observer } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Select } from 'semantic-ui-react';
import { useStores } from 'stores';
import './style.scss';
import { sleep } from 'utils';

const CreateProposal = observer((props)=>{
    const {theme,user} = useStores();
    const history = useHistory();
    const [formData, updateFormData] = React.useState({
        title:'',
        description:'',
        type:''

    });

    function handleChange(e){
        updateFormData({
          ...formData,
      
          // Trimming any whitespace
          [e.target.name]: e.target.value.trim()
        });
      };

    async function createProposal(event){
        event.preventDefault();        
        try {
            const result = await user.createProposal(formData.title,formData.description);
            if(result?.code){
                const message = extractError(result)
                notify('error',message,10,result.txhash,true)
            }else{
                notify('success','Proposal created successfully',10,'',true)
                await sleep(3000)
                history.push('/governance')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <ProposalLayout width='1168px'>
            <form onSubmit={createProposal} className={`create-proposal ${theme.currentTheme}`} action="">
                <div className='title-section'>
                    <h1>Create proposal</h1>
                    <div className='title-section__buttons'>
                        <Button className='g-button--outline'><Link to='/governance'>Cancel</Link></Button>
                        <Button disabled={!formData.title || !formData.description || !formData.type} className='g-button'>Create Proposal</Button>
                    </div>
                </div>
                <div className='card-proposal'>
                    <div className='form-title'>
                        <label htmlFor="type">Proposal Type</label>
                        <label htmlFor="title">Title</label>
                        <select onChange={handleChange} name="proposal-type" id="proposal-type">
                            <option value="1">SEFI Rewards pool</option>
                            <option value="2">SEFI Community Spending</option>
                            <option value="3">SecretSwap Parameter Change</option>
                            <option value="4">Other</option>
                        </select>
                        <input onChange={handleChange} id='title' name='title' type="text" />
                    </div>
                    <div className='form-description'>
                        <label htmlFor="description">Description</label>
                        <textarea 
                            // maxLength={250}
                            onChange={handleChange}
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