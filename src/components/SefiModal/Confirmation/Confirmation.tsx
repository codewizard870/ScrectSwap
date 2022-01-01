import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData'
import '../styles.scss';
import { RightArrow } from 'components/Base/components/Icons/tsx_svg_icons';
import { useStores } from 'stores';
import { apyString, RewardsToken } from 'components/Earn/EarnRow';
const Confirmation = (props:{
  data:SefiData
})=>{
  const {theme} = useStores();

  let scrt_sefi_apy_string,sefi_apy_string = '0%'
  const sefi_apy:RewardsToken = props.data.apys.find((t)=>t.rewardsContract===globalThis.config.SEFI_STAKING_CONTRACT)
  const scrt_sefi_apy:RewardsToken = props.data.apys.find((t)=>t.lockedAsset==='LP-sSCRT-SEFI')

  try {
    sefi_apy_string = apyString(sefi_apy)
    scrt_sefi_apy_string = apyString(scrt_sefi_apy)
  } catch (error) {
    console.error(error)
  }

  return(
    <>
      <div className="m-small">
        <p className="span-2 congrats_title">Congratulations !</p>
      </div>
      <div className="m-small">
        <p className={`span-2 congrats_msg ${theme.currentTheme}`}>You have claimed <strong>{props.data.unclaimed} SEFI</strong> to your address!</p>
      </div>
      <button className={`earn-sefi__btn m-small ${theme.currentTheme}`}> Earn with SEFI</button>
      <div className={`sefi-grid__container-confirm ${theme.currentTheme}`}>
        <strong className='align-center'>Stake SEFI</strong>
        <strong className='percentage-confirm align-center'>{sefi_apy_string}</strong>
        <span className='align-right align-center'> <RightArrow stroke='#5F5F6B' height='21px' width='27px'/> </span>
        <p className='confirm-card__content'>Stake SEFI to participate in governance of Secret DeFi.</p>
      </div>
      <div className={`sefi-grid__container-confirm ${theme.currentTheme}`}>
        <strong className='align-center'>Provide LP</strong>
        <strong className='percentage-confirm align-center'>{scrt_sefi_apy_string}</strong>
        <span className='align-right align-center'> <RightArrow stroke='#5F5F6B' height='21px' width='27px'/> </span>
        <p className='confirm-card__content'>Provide liquidity to SCRT-SEFI pair to earn rewards and trading fees.</p>
      </div>
    </>
  )
}

export default Confirmation;