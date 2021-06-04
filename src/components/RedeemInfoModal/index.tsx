import React from 'react'
import { Button, Icon, Modal, Popup } from 'semantic-ui-react'
import { useStores } from 'stores'
import './styles.scss'
export const RedeemtionFormulaModal=(
  props:{
    trigger:any
  }
)=>{
  const {theme,user} = useStores();
  const [open,setOpen]= React.useState(false);


  const balanceCashback=parseFloat(user?.balanceCSHBK || '0').toFixed(2) 
  const ratioCSHBK=user?.ratioCSHBK
  
  
  const sefiUSD = parseFloat(user.stores.tokens.allData.find(t => t.display_props.symbol === 'SEFI')?.price || '0.2');
  const scrtUSD = parseFloat(user.stores.tokens.allData.find(t => t.display_props.symbol === 'SSCRT')?.price || '3.8');
  const scrtFee = parseFloat((parseFloat(balanceCashback)*0.003).toFixed(3))
  const tradingSefiFee = parseFloat((scrtFee*scrtUSD / sefiUSD).toFixed(3))
  const expectedSefi= (ratioCSHBK * tradingSefiFee).toFixed(2)


  return(
    <Modal 
      onClose={() => {setOpen(false); }}
      onOpen={() =>{ setOpen(true)}}
      className={`modal-${theme.currentTheme}`}
      open={open}
      trigger={props.trigger}
      >
      <Modal.Header>
        <h2>You got <strong>{balanceCashback} CSHBK</strong> for trading <strong>{balanceCashback} SCRT</strong> .</h2>
        <div className='formula-fees__container'>
          <h2>Trading fees</h2>
          <span>=</span> 
          <h2>{balanceCashback}</h2>
          <span>x</span> 
          <h2 className='fee'>0.003 <InfoIcon content='Gas fee'/></h2> 
          <span>=</span> 
          <h2>{scrtFee} SCRT</h2>
          <span>=</span>
          <h2>{tradingSefiFee} SEFI</h2>
        </div>
      </Modal.Header>
      <Modal.Content>
            <h2 className='sefi-formula__title'>SEFI Redemption Formula</h2>
            <div className='sefi-formula__content'>
              <div>
                <p>Fee paid in SEFI</p>
                <h1>{tradingSefiFee}</h1>
              </div>
              <div>
                <span>X</span>
              </div>
              <div>
                <p>CHSBK Rate <InfoIcon content='CSHBK rate = accumulated SEFI / total CSHBK' /></p>
                <h1>{ratioCSHBK}</h1>
              </div>
              <div>
                <span>=</span>
              </div>
              <div>
                <p>Redeemable SEFI</p>
                <h1>{expectedSefi} SEFI</h1>
              </div>
            </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={()=>{setOpen(false)}} className='ok-button'>OK</Button>
      </Modal.Actions>
    </Modal>
  )
}

const InfoIcon =(props:{content:string})=>(
    <Popup 
      className="icon-info__popup" 
      position='top center'
      trigger={
        <Icon
          className="icon_info"
          name="info"
          circular
          size="tiny"
        />
      }
    >
      {props.content}
    </Popup>
)