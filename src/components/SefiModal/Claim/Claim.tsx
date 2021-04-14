import React from 'react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';

const Claim = (props:{
  data:SefiData,
  onClaim:CallableFunction
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
      <div className="sefi-grid__container background_free claim-sefi__item">
        <div className="item left">
          <img src="/static/address-icon.svg" alt="" />
          <span>secret12xq...ge26mxlsak</span>
        </div>
        <div className="item right">
          <img className="small-icon" src="/static/meta-mask.svg" alt="keplr"/>
        </div>
      </div>
      <div className="displayed-center">
        <div className="displayed-center__item">
          <img src="/static/scrt.svg" alt="scrt"/>
        </div>
        <p className="displayed-center__item">You earned</p>
        <h1 className="displayed-center__item">{props.data.unclaimed} SEFI</h1>
        <span className="displayed-center__item">Claim your SEFI to participate in governance and yield opportunities</span>
        <a className="displayed-center__item" href="#">Read more about SEFI</a>
        <button onClick={()=>{props.onClaim()}} className="displayed-center__item claim-button"> Claim</button>
      </div>
    </>
  )
}

export default Claim;