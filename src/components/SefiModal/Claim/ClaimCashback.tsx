import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
const Claim = (props:{
  data:SefiData
})=>{
  return(
    <>
      <div className="sefi-grid__container background_free claim-sefi__item">
        <div className="item left">secret12xq...ge26mxlsak</div>
        <div className="item right">
          <img className="small-icon" src="/static/key.svg" alt="key"/>
          <img className="small-icon" src="/static/keplr.svg" alt="keplr"/>
        </div>
      </div>
      <div className="displayed-center">
        <div className="displayed-center__item">
          <img src="/static/scrt.svg" alt="scrt"/>
        </div>
        <p className="displayed-center__item">You can burn 400 cashback tokens to claim</p>
        <h1 className="displayed-center__item">400 SEFI</h1>
        <span className="displayed-center__item">The more you trade, the more cashback tokens you get.</span>
        <a className="displayed-center__item" href="#">Learn more about cashback tokens</a>
        <button className="displayed-center__item claim-button"> Claim</button>
      </div>
    </>
  )
}

export default Claim;