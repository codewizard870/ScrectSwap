import { BaseContainer, PageContainer } from 'components'
import { Box } from 'grommet'
import { observer } from 'mobx-react';
import React from 'react'
import { useStores } from 'stores';
import "./style.scss";

export const Cashback =observer((props)=>{
    const {theme,user} = useStores();
    const hasCashback = user.balanceCSHBK != '0';

    const burnSEFI = async () => {
      try {
        await user.ConvertCHSBKToSEFI(); 
        console.log("You've claimed CSHBK")
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
                  (hasCashback)
                  ? <>
                    <h1>Congratulations</h1>
                    <p>For trading on</p>
                    <h3><strong>secret</strong>swap</h3>
                    <p>You have earned</p>
                    <h2>{user.balanceCSHBK} CSHBK </h2>
                    <p>that you can trade for</p>
                    <h2>5.246 SEFI</h2>
                  </>
                  : <>
                    <h1>Too Bad !</h1>
                    <p>You have traded recently on </p>
                    <h3><strong>secret</strong>swap</h3>
                    <p>You have earned</p>
                    <h2>{user.balanceCSHBK} CSHBK </h2>
                  </>
                }
              </div>
              <div>
                <img src="/static/robot.svg" alt="Rockstart robot"  />
                <button 
                  disabled={!hasCashback}
                  className="redeem-sefi__button" 
                  onClick={burnSEFI}>
                    Redem for SEFI
                </button>
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
