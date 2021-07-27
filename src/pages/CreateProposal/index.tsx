import { extractError, notify } from '../../blockchain-bridge/scrt/utils';
import { useHistory } from "react-router-dom";
import ProposalLayout from 'components/ProposalLayout';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, Popup } from 'semantic-ui-react';
import { useStores } from 'stores';
import './style.scss';
import { sleep } from 'utils';
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';

const CreateProposal = observer((props) => {
    const newRewardsContract = process.env.SEFI_STAKING_CONTRACT;
    const history = useHistory();

    const { theme, user } = useStores();
    const [formData, updateFormData] = React.useState({
        title: '',
        description: '',
        vote_type: '',
        author_alias: '',
    });
    const [loading, setLoading] = React.useState<boolean>(false);
    const [amounts, setAmounts] = React.useState({} as any);


    async function getBalance(contract) {
        const result = await user.getSnip20Balance(contract);
        if (result === 'Unlock') {
            return null;
        }
        return result;
    }

    function handleChange(e) {

        updateFormData({
            ...formData,
            // Trimming any whitespace
            [e.target.name]: e.target.value.trim()
        });
    };

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
          notify('error', error.toString(), 10, '', true);
        } finally {
          setLoading(false);
        }
    }

    useEffect(() => {
      (async () => {
          const balance = await getBalance(newRewardsContract);
          const minimumStake = await user.getMinimumStake();
          setAmounts({
            balance: parseInt(balance),
            minimumStake: parseInt(minimumStake)
          });
      })();
    }, [])

    useEffect(() => {
      (async () => {
      })();
    }, [])

    function isValid() {
      return !formData.title
        || !formData.description
        || !formData.vote_type
        || formData.description.length < 10
        || amounts.minimumStake > amounts.balance;
    }

    const [errors, setErrors] = useState([]);

    function formatErrors() {
      return errors.map((e, i) => {
        return (
          <p key={i}>{e.msg}</p>
        );
      });
    }

    function validate() {
      const result = [];

      // Validate minimum stake.
      if (amounts.minimumStake > amounts.balance) {
        const theMinimum = amounts.minimumStake / 1e6;
        result.push({
          type: 'minimumStake',
          msg: `You don't have the minimum staked SEFI to create a proposal. Minimum is ${theMinimum} SEFI.`
        });
      } else {
        const idx = errors.findIndex(it => it.type === 'minimumStake');
        if (idx !== -1) result.splice(idx, 1);
      }

      setErrors(result);
    }

    useEffect(() => {
      validate();
    }, [formData, amounts]);

    return (
        <ProposalLayout width='1168px'>
            <form onSubmit={createProposal} className={`create-proposal ${theme.currentTheme}`} action="">
                <div className='title-section'>
                    <h1>Create proposal</h1>
                    <div className='title-section__buttons'>
                        <Button
                            className='g-button--outline'>
                            <Link to='/governance'>Cancel</Link>
                        </Button>

                        <Popup
                          style={{ color: 'red' }}
                          content={formatErrors()}
                          disabled={errors.length <= 0}
                          trigger={<a>
                            <Button
                              loading={loading}
                              disabled={isValid()}
                              className='g-button'
                            >
                              Create Proposal
                            </Button>
                          </a>}
                        />
                    </div>
                </div>
                <div className='card-proposal'>

                    <div className='form-title'>
                        <label htmlFor="title">Title</label>
                        <input onChange={handleChange} id='title' name='title' type="text" autoComplete="off" />
                    </div>
                    <div className="form-proposal">
                        <label htmlFor="vote_type">Proposal Type</label>
                        <label htmlFor="author_alias">Proposer Name: </label>

                        <select onChange={handleChange} name="vote_type" id="proposal">
                            <option value="">-- Choose One --</option>
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
                            autoComplete="off"
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
