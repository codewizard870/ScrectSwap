import cogoToast from 'cogo-toast';
import { BaseContainer, PageContainer } from 'components'
import { Box } from 'grommet'
import { observer } from 'mobx-react';
import React from 'react'
import { Button, Loader } from 'semantic-ui-react';
import { useStores } from 'stores';
import "./style.scss";

export const Cashback =observer((props)=>{
    const {theme,user} = useStores();
    const [loading,setLoading]=React.useState(false);
    const hasCashback = user?.balanceCSHBK != '0';
    
    function notify(type: 'success' | 'error' | 'errorWithHash', msg: string, hideAfterSec: number = 120, txHash?: string) {
      let cogoType: string = type;
      if (type === 'error') {
        msg = msg.replaceAll('Failed to decrypt the following error message: ', '');
        msg = msg.replace(/\. Decryption error of the error message:.+?/, '');
      }

      let onClick = () => {
        hide();
      };
      if (type === 'errorWithHash') {
        cogoType = 'warn';
        onClick = () => {
          const url = `https://secretnodes.com/secret/chains/secret-2/transactions/${txHash}`;
          const win = window.open(url, '_blank');
          win.focus();
          hide();
        };
      }

      const { hide } = cogoToast[cogoType](msg, {
        toastContainerID:'notifications_container', 
        hideAfter: hideAfterSec,
        onClick,
      });
      // NotificationManager[type](undefined, msg, closesAfterMs);
    }
    const burnSEFI = async () => {
      try {
        if(user?.balanceCSHBK){
          try {
            setLoading(true)
            const expected_sefi = user.expectedSEFIFromCSHBK;
            const cashbak = user.balanceCSHBK;
            await user.ConvertCHSBKToSEFI(); 
            notify('success',`You have claimed ${cashbak} CSHBK into ${expected_sefi} SEFI tokens!`)
            setLoading(false)
            console.log("You've claimed CSHBK")
          } catch (error) {
            notify('error',`An error happended when converting CSHBK to SEFI`)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    return(
      <BaseContainer>
        <PageContainer>
          <Box className="cashback-container">
            <h1 className={`trade-more__title ${theme.currentTheme}`}>Trade more, earn more.</h1>
            <div className={`cashback-container__card ${theme.currentTheme}`}>
              <div className="congratulations-container">
                {
                  (user.isUnconnected == 'true')
                  ? <>
                      <h1 className='connect_wallet'>PLEASE CONNECT YOUR WALLET</h1>
                      <p>You haven't traded recently on </p>
                      <h3><strong>secret</strong>swap</h3>
                      <p>You have earned</p>
                      <h2>0.0 CSHBK </h2>
                    </> 
                  : (hasCashback)
                    ? <>
                        <h1>Congratulations</h1>
                        <p>For trading on</p>
                        <h3><strong>secret</strong>swap</h3>
                        <p>You have earned</p>
                        <h2>{user.balanceCSHBK} CSHBK </h2>
                        <p>that you can trade for</p>
                        <h2>{user.expectedSEFIFromCSHBK} SEFI</h2>
                      </>
                    : <>
                      <h1>Too Bad !</h1> 
                      <p>You haven't traded recently on </p>
                      <h3><strong>secret</strong>swap</h3>
                      <p>You have earned</p>
                      <h2>{user.balanceCSHBK} CSHBK </h2>
                    </>
                }
                
              </div>
              <div className="call-toAction__container">
                <img src="/static/robot-cashback.png" alt="Rockstart robot"  />
                <Button 
                  loading={loading}
                  disabled={!hasCashback}
                  className="redeem-sefi__button" 
                  onClick={burnSEFI}>
                    Redem for SEFI 
                </Button>
              </div>
            </div>
            <div className={`additional-info__container ${theme.currentTheme}`}>
              <div className='additional-info__row'>
                <p>Total Cashback Received</p>
                <strong>0.013055 CSHBK</strong>
              </div>
              <div className='additional-info__row'>
                <p>SEFI Earned from Cashback</p>
                <strong>0.006018 SEFI</strong>
              </div>
            </div>
          </Box>
      </PageContainer>
    </BaseContainer>
    )
  }
)
