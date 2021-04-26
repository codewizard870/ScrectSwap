import React from 'react';
import {Loader,Dimmer} from 'semantic-ui-react'
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { useStores } from 'stores';

const Loading = (props:{
  unclaimed:number
})=>{
  const {theme} = useStores();
  return(
    <>
      <div className="sefi-grid__container loading-sefi">
        <h1 className={`item left ${theme.currentTheme}`}>{props.unclaimed} SEFI</h1>
        <div className="item right loader-container">
            <Loader active inline inverted/>
        </div>
      </div>
      <div className={`sefi-grid__container background_free loading-sefi ${theme.currentTheme}`}>
        <span className={`item ${theme.currentTheme}`}>Confirm this transaction in your wallet</span>
      </div>
    </>
  )
}

export default Loading;