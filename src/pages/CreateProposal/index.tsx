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
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';

const CreateProposal = observer((props) => {
    const { theme, user } = useStores();
    const history = useHistory();
    const [formData, updateFormData] = React.useState({
        title: '',
        description: '',
        vote_type: '',
        author_alias: '',
    });

    const [loading, setLoading] = React.useState<boolean>(false);

    function handleChange(e) {
        updateFormData({
            ...formData,

            // Trimming any whitespace
            [e.target.name]: e.target.value.trim()
        });
    };

    // console.log(formData);

    async function createProposal(event) {

        event.preventDefault();
        setLoading(true);

        try {
            const result = await user.createProposal(formData.title, formData.description, formData.vote_type, formData.author_alias);
            if (result?.code) {
                const message = extractError(result)
                notify('error', message, 10, result.txhash, true)
                setLoading(false);
            } else {
                notify('success', 'Proposal created successfully', 10, '', true)
                await sleep(3000)
                setLoading(false);
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
                        <Button
                            loading={loading}
                            disabled={!formData.title || !formData.description || !formData.vote_type}
                            className='g-button'
                        >Create Proposal
                        </Button>
                    </div>
                </div>
                <div className='card-proposal'>

                    <div className='form-title'>
                        <label htmlFor="title">Title</label>
                        <input onChange={handleChange} id='title' name='title' type="text" />
                    </div>
                    <div className="form-proposal">
                        <label htmlFor="vote_type">Proposal Type</label>
                        <label htmlFor="author_alias">Proposer Name: </label>

                        <select onChange={handleChange} name="vote_type" id="proposal">
                            <option value="SEFI Rewards Pool">SEFI Rewards Pool</option>
                            <option value="SEFI Community Spending">SEFI Community Spending</option>
                            <option value="SecretSwap Parameter Change">SecretSwap Parameter Change</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            onChange={handleChange}
                            id='author_alias'
                            name='author_alias'
                            type="text"
                        />
                    </div>
                    <div className='form-description'>
                        <label htmlFor="description">Description</label>
                        <textarea
                            // maxLength={250}
                            onChange={handleChange}
                            name="description"
                            id="description"
                            cols={60}
                            rows={20}
                        />
                    </div>
                </div>

            </form>

        </ProposalLayout>
    )
})

export default CreateProposal;