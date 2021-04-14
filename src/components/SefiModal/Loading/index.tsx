import React from 'react';
import {Loader,Dimmer} from 'semantic-ui-react'
import {SefiData} from '../types/SefiData' 
import '../styles.scss';

const Loading = (props:{
  data:SefiData
})=>{
  return(
    <>
      <div className="sefi-grid__container loading-sefi">
        <h1 className="item left">{props.data.unclaimed} SEFI</h1>
        <div className="item right loader-container">
            <Loader active inline inverted/>
        </div>
      </div>
      <div className="sefi-grid__container background_free loading-sefi">
        <span className="item">Confirm this transaction in your wallet</span>
      </div>
    </>
  )
}

export default Loading;