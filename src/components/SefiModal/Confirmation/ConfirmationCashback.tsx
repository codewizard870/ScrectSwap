import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { RightArrow } from 'components/Base/components/Icons/tsx_svg_icons';
const GeneralState = (props:{
  data:SefiData
})=>{
  return(
    <>
       <div className="m-small">
            <p className="span-2 congrats_title">Congratulations !</p> 
        </div>
        <div className="m-small">
          <p className="span-2 congrats_msg">You have claimed <strong>400 SEFI</strong> from your cashback tokens! 
          The more you swap, the more SEFI you can claim.</p>
        </div>
        <div className="m-small">
          <a className="span-2" href="#">Learn more about cashback token</a>
        </div>
        <button className='earn-sefi__btn m-small'> Earn with SEFI</button>  
        <div className="sefi-grid__container-confirm">
          <strong className='align-center'>Stake SEFI</strong>
          <strong className='percentage-confirm align-center'>23.08%</strong>
          <span className='align-right align-center'> <RightArrow stroke='#5F5F6B' height='21px' width='27px'/> </span>
          <p className='confirm-card__content'>Stake SEFI to participate in governance of Secret DeFi.</p>
        </div>
        <div className="sefi-grid__container-confirm">
          <strong className='align-center'>Provide LP</strong>
          <strong className='percentage-confirm align-center'>23.08%</strong>
          <span className='align-right align-center'> <RightArrow stroke='#5F5F6B' height='21px' width='27px'/> </span>
          <p className='confirm-card__content'>Provide liquidity to SCRT-SEFI pair to earn rewards and trading fees.</p>
        </div>

    </>
  )
}

export default GeneralState;