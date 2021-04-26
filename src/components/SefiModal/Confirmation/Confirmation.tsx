import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { RightArrow } from 'components/Base/components/Icons/tsx_svg_icons';
import { useStores } from 'stores';
const Confirmation = (props:{
  data:SefiData
})=>{
  const {theme} = useStores();
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
          <strong className='percentage-confirm align-center'>23.08%</strong>
          <span className='align-right align-center'> <RightArrow stroke='#5F5F6B' height='21px' width='27px'/> </span>
          <p className='confirm-card__content'>Stake SEFI to participate in governance of Secret DeFi.</p>
        </div> 

    </>
  )
}

export default Confirmation;