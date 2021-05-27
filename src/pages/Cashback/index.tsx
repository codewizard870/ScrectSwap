import cogoToast from 'cogo-toast';
import { BaseContainer, PageContainer } from 'components'
import { ArrowDown } from 'components/Base/components/Icons/tsx_svg_icons';
import { Box } from 'grommet'
import { observer } from 'mobx-react';
import React from 'react'
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';
import "./style.scss";

export const Cashback =observer((props)=>{
    const {theme,user} = useStores();
    const [loading,setLoading]=React.useState(false);
    const hasCashback = user?.balanceCSHBK != '0';
    const topRightChart = 514;
    const topLeftChart = 14;
    const topLeftLabel = 50.5;
    const topRightLabel = 575.5;
    const maxLimit=.80
    const minLimit=.40
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
          notify('error',"Error when burning CSHBK to SEFI")
          setLoading(false)
          console.error(error)
        }
      }
    }
    const sefi_earned = localStorage.getItem('total_sefi_earned')
    const cb_received = localStorage.getItem('total_cb_received')

    const rateCSHBK = user?.ratioCSHBK || .6 //Default value .60 meantime it loads 
    const fontColor = theme.currentTheme=='light'?'#5F5F6B':'white'
    let ratioColor,xPositionChart,xPositionLabel,xPositionArrow;
    // Calculating X positions base on Rate CSHBK
    if(rateCSHBK >= maxLimit){
      //Equal or HIGHER than minimun limit
      xPositionChart= topRightChart
      xPositionLabel= topRightLabel
      xPositionArrow=topRightLabel;

    }else if(rateCSHBK <= minLimit){
      //Equal or LOWER than minimun limit
      xPositionChart =topLeftChart
      xPositionLabel =topLeftLabel
      xPositionArrow=topLeftLabel;

    }else{
      //Calculations
      const lengthBar = maxLimit - minLimit;
      const relative_porcentage = ((rateCSHBK * 100)/lengthBar)-100;
      const pixels_one_percentage_chart = (topRightChart-topLeftChart)/100;
      const pixels_one_percentage_label = (topRightLabel-topLeftLabel)/100;
      xPositionChart = ((relative_porcentage * pixels_one_percentage_chart)+topLeftChart).toFixed(2);
      xPositionLabel = ((relative_porcentage * pixels_one_percentage_label)+topLeftLabel).toFixed(2);
      xPositionArrow = xPositionLabel-5;
    }

    //Calculating color of rate value
    if(rateCSHBK > 0.4 && rateCSHBK < 0.80){
      ratioColor='#c7b517'
    }else if(rateCSHBK > 0.4){
      ratioColor='#79CC81'
    }else{
      ratioColor='#FF726E'
    }
    const balanceCSHBK = parseFloat(user.balanceCSHBK || '0.0').toFixed(2)
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
                        <h2>{balanceCSHBK} CSHBK </h2>
                        <p>that you can trade for</p>
                        <h2>{user.expectedSEFIFromCSHBK} SEFI</h2>
                      </>
                    : <>
                      <h1>Too Bad !</h1> 
                      <p>You haven't traded recently on </p>
                      <h3><strong>secret</strong>swap</h3>
                      <p>You have earned</p>
                      <h2>0.0 CSHBK </h2>
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
            <div className={`rate-bar__container ${theme.currentTheme}`}>
              <div className='rate-labels__container'>
                  <svg width="631" height="94" viewBox="0 0 631 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x={xPositionLabel} textAnchor='middle' y='30%' fill={fontColor}>Current Rate</text>
                      <text x={xPositionLabel} textAnchor='middle' y='60%' fill={ratioColor}>{rateCSHBK}</text>
                      <ArrowDown x={xPositionArrow} y='25' stroke={fontColor} width='10px'/>
                  </svg>
              </div>
              <div className="rate-svg__container">
                <svg width="528" height="94" viewBox="0 0 528 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text fill="#FF726E" x={topLeftChart} y='10' textAnchor='middle'>Bad</text>
                  <text fill="#79CC81" x={topRightChart - 5 } y='10' textAnchor='middle'>Good</text>
                  <rect x="4" y="21" width="520" height="22" rx="11" fill="url(#paint0_linear)"/>
                  <path d={`M${xPositionChart} 21V43`} stroke={fontColor}/>
                  <path d="M14 53V73" stroke={fontColor}/>
                  <path d="M139 53V63" stroke={fontColor}/>
                  <path d="M264 53V73" stroke={fontColor}/>
                  <path d="M389 53V63" stroke={fontColor}/>
                  <path d="M514 53V73" stroke={fontColor}/>
                  <path d="M0.175641 88.572C0.175641 87.196 0.399641 86.124 0.847641 85.356C1.29564 84.58 2.07964 84.192 3.19964 84.192C4.31164 84.192 5.09164 84.58 5.53964 85.356C5.98764 86.124 6.21164 87.196 6.21164 88.572C6.21164 89.972 5.98764 91.06 5.53964 91.836C5.09164 92.612 4.31164 93 3.19964 93C2.07964 93 1.29564 92.612 0.847641 91.836C0.399641 91.06 0.175641 89.972 0.175641 88.572ZM5.13164 88.572C5.13164 87.876 5.08364 87.288 4.98764 86.808C4.89964 86.32 4.71164 85.928 4.42364 85.632C4.14364 85.336 3.73564 85.188 3.19964 85.188C2.65564 85.188 2.23964 85.336 1.95164 85.632C1.67164 85.928 1.48364 86.32 1.38764 86.808C1.29964 87.288 1.25564 87.876 1.25564 88.572C1.25564 89.292 1.29964 89.896 1.38764 90.384C1.48364 90.872 1.67164 91.264 1.95164 91.56C2.23964 91.856 2.65564 92.004 3.19964 92.004C3.73564 92.004 4.14364 91.856 4.42364 91.56C4.71164 91.264 4.89964 90.872 4.98764 90.384C5.08364 89.896 5.13164 89.292 5.13164 88.572ZM8.2388 93.072C8.0308 93.072 7.8548 93 7.7108 92.856C7.5668 92.712 7.4948 92.536 7.4948 92.328C7.4948 92.12 7.5668 91.944 7.7108 91.8C7.8548 91.656 8.0308 91.584 8.2388 91.584C8.4388 91.584 8.6068 91.656 8.7428 91.8C8.8868 91.944 8.9588 92.12 8.9588 92.328C8.9588 92.536 8.8868 92.712 8.7428 92.856C8.6068 93 8.4388 93.072 8.2388 93.072ZM9.96633 91.068V90.24L14.1783 84.408H15.4863V90.12H16.6863V91.068H15.4863V93H14.4063V91.068H9.96633ZM14.4543 85.548L11.2263 90.12H14.4543V85.548ZM17.7772 88.572C17.7772 87.196 18.0012 86.124 18.4492 85.356C18.8972 84.58 19.6812 84.192 20.8012 84.192C21.9132 84.192 22.6932 84.58 23.1412 85.356C23.5892 86.124 23.8132 87.196 23.8132 88.572C23.8132 89.972 23.5892 91.06 23.1412 91.836C22.6932 92.612 21.9132 93 20.8012 93C19.6812 93 18.8972 92.612 18.4492 91.836C18.0012 91.06 17.7772 89.972 17.7772 88.572ZM22.7332 88.572C22.7332 87.876 22.6852 87.288 22.5892 86.808C22.5012 86.32 22.3132 85.928 22.0252 85.632C21.7452 85.336 21.3372 85.188 20.8012 85.188C20.2572 85.188 19.8412 85.336 19.5532 85.632C19.2732 85.928 19.0852 86.32 18.9892 86.808C18.9012 87.288 18.8572 87.876 18.8572 88.572C18.8572 89.292 18.9012 89.896 18.9892 90.384C19.0852 90.872 19.2732 91.264 19.5532 91.56C19.8412 91.856 20.2572 92.004 20.8012 92.004C21.3372 92.004 21.7452 91.856 22.0252 91.56C22.3132 91.264 22.5012 90.872 22.5892 90.384C22.6852 89.896 22.7332 89.292 22.7332 88.572Z" fill={fontColor}/>
                  <path d="M255.14 88.572C255.14 87.196 255.364 86.124 255.812 85.356C256.26 84.58 257.044 84.192 258.164 84.192C259.276 84.192 260.056 84.58 260.504 85.356C260.952 86.124 261.176 87.196 261.176 88.572C261.176 89.972 260.952 91.06 260.504 91.836C260.056 92.612 259.276 93 258.164 93C257.044 93 256.26 92.612 255.812 91.836C255.364 91.06 255.14 89.972 255.14 88.572ZM260.096 88.572C260.096 87.876 260.048 87.288 259.952 86.808C259.864 86.32 259.676 85.928 259.388 85.632C259.108 85.336 258.7 85.188 258.164 85.188C257.62 85.188 257.204 85.336 256.916 85.632C256.636 85.928 256.448 86.32 256.352 86.808C256.264 87.288 256.22 87.876 256.22 88.572C256.22 89.292 256.264 89.896 256.352 90.384C256.448 90.872 256.636 91.264 256.916 91.56C257.204 91.856 257.62 92.004 258.164 92.004C258.7 92.004 259.108 91.856 259.388 91.56C259.676 91.264 259.864 90.872 259.952 90.384C260.048 89.896 260.096 89.292 260.096 88.572ZM263.204 93.072C262.996 93.072 262.82 93 262.676 92.856C262.532 92.712 262.46 92.536 262.46 92.328C262.46 92.12 262.532 91.944 262.676 91.8C262.82 91.656 262.996 91.584 263.204 91.584C263.404 91.584 263.572 91.656 263.708 91.8C263.852 91.944 263.924 92.12 263.924 92.328C263.924 92.536 263.852 92.712 263.708 92.856C263.572 93 263.404 93.072 263.204 93.072ZM270.031 86.388C269.855 85.5 269.307 85.056 268.387 85.056C267.675 85.056 267.143 85.332 266.791 85.884C266.439 86.428 266.267 87.328 266.275 88.584C266.459 88.168 266.763 87.844 267.187 87.612C267.619 87.372 268.099 87.252 268.627 87.252C269.451 87.252 270.107 87.508 270.595 88.02C271.091 88.532 271.339 89.24 271.339 90.144C271.339 90.688 271.231 91.176 271.015 91.608C270.807 92.04 270.487 92.384 270.055 92.64C269.631 92.896 269.115 93.024 268.507 93.024C267.683 93.024 267.039 92.84 266.575 92.472C266.111 92.104 265.787 91.596 265.603 90.948C265.419 90.3 265.327 89.5 265.327 88.548C265.327 85.612 266.351 84.144 268.399 84.144C269.183 84.144 269.799 84.356 270.247 84.78C270.695 85.204 270.959 85.74 271.039 86.388H270.031ZM268.399 88.176C268.055 88.176 267.731 88.248 267.427 88.392C267.123 88.528 266.875 88.74 266.683 89.028C266.499 89.308 266.407 89.652 266.407 90.06C266.407 90.668 266.583 91.164 266.935 91.548C267.287 91.924 267.791 92.112 268.447 92.112C269.007 92.112 269.451 91.94 269.779 91.596C270.115 91.244 270.283 90.772 270.283 90.18C270.283 89.556 270.123 89.068 269.803 88.716C269.483 88.356 269.015 88.176 268.399 88.176ZM272.812 88.572C272.812 87.196 273.036 86.124 273.484 85.356C273.932 84.58 274.716 84.192 275.836 84.192C276.948 84.192 277.728 84.58 278.176 85.356C278.624 86.124 278.848 87.196 278.848 88.572C278.848 89.972 278.624 91.06 278.176 91.836C277.728 92.612 276.948 93 275.836 93C274.716 93 273.932 92.612 273.484 91.836C273.036 91.06 272.812 89.972 272.812 88.572ZM277.768 88.572C277.768 87.876 277.72 87.288 277.624 86.808C277.536 86.32 277.348 85.928 277.06 85.632C276.78 85.336 276.372 85.188 275.836 85.188C275.292 85.188 274.876 85.336 274.588 85.632C274.308 85.928 274.12 86.32 274.024 86.808C273.936 87.288 273.892 87.876 273.892 88.572C273.892 89.292 273.936 89.896 274.024 90.384C274.12 90.872 274.308 91.264 274.588 91.56C274.876 91.856 275.292 92.004 275.836 92.004C276.372 92.004 276.78 91.856 277.06 91.56C277.348 91.264 277.536 90.872 277.624 90.384C277.72 89.896 277.768 89.292 277.768 88.572Z" fill={fontColor}/>
                  <path d="M504.164 88.572C504.164 87.196 504.388 86.124 504.836 85.356C505.284 84.58 506.068 84.192 507.188 84.192C508.3 84.192 509.08 84.58 509.528 85.356C509.976 86.124 510.2 87.196 510.2 88.572C510.2 89.972 509.976 91.06 509.528 91.836C509.08 92.612 508.3 93 507.188 93C506.068 93 505.284 92.612 504.836 91.836C504.388 91.06 504.164 89.972 504.164 88.572ZM509.12 88.572C509.12 87.876 509.072 87.288 508.976 86.808C508.888 86.32 508.7 85.928 508.412 85.632C508.132 85.336 507.724 85.188 507.188 85.188C506.644 85.188 506.228 85.336 505.94 85.632C505.66 85.928 505.472 86.32 505.376 86.808C505.288 87.288 505.244 87.876 505.244 88.572C505.244 89.292 505.288 89.896 505.376 90.384C505.472 90.872 505.66 91.264 505.94 91.56C506.228 91.856 506.644 92.004 507.188 92.004C507.724 92.004 508.132 91.856 508.412 91.56C508.7 91.264 508.888 90.872 508.976 90.384C509.072 89.896 509.12 89.292 509.12 88.572ZM512.227 93.072C512.019 93.072 511.843 93 511.699 92.856C511.555 92.712 511.483 92.536 511.483 92.328C511.483 92.12 511.555 91.944 511.699 91.8C511.843 91.656 512.019 91.584 512.227 91.584C512.427 91.584 512.595 91.656 512.731 91.8C512.875 91.944 512.947 92.12 512.947 92.328C512.947 92.536 512.875 92.712 512.731 92.856C512.595 93 512.427 93.072 512.227 93.072ZM515.803 88.488C515.355 88.312 515.011 88.056 514.771 87.72C514.531 87.384 514.411 86.976 514.411 86.496C514.411 86.064 514.519 85.676 514.735 85.332C514.951 84.98 515.271 84.704 515.695 84.504C516.127 84.296 516.647 84.192 517.255 84.192C517.863 84.192 518.379 84.296 518.803 84.504C519.235 84.704 519.559 84.98 519.775 85.332C519.999 85.676 520.111 86.064 520.111 86.496C520.111 86.96 519.987 87.368 519.739 87.72C519.491 88.064 519.151 88.32 518.719 88.488C519.215 88.64 519.607 88.908 519.895 89.292C520.191 89.668 520.339 90.124 520.339 90.66C520.339 91.18 520.211 91.636 519.955 92.028C519.699 92.412 519.335 92.712 518.863 92.928C518.399 93.136 517.863 93.24 517.255 93.24C516.647 93.24 516.111 93.136 515.647 92.928C515.191 92.712 514.835 92.412 514.579 92.028C514.323 91.636 514.195 91.18 514.195 90.66C514.195 90.124 514.339 89.664 514.627 89.28C514.915 88.896 515.307 88.632 515.803 88.488ZM519.055 86.628C519.055 86.14 518.895 85.764 518.575 85.5C518.255 85.236 517.815 85.104 517.255 85.104C516.703 85.104 516.267 85.236 515.947 85.5C515.627 85.764 515.467 86.144 515.467 86.64C515.467 87.088 515.631 87.448 515.959 87.72C516.295 87.992 516.727 88.128 517.255 88.128C517.791 88.128 518.223 87.992 518.551 87.72C518.887 87.44 519.055 87.076 519.055 86.628ZM517.255 88.968C516.663 88.968 516.179 89.108 515.803 89.388C515.427 89.66 515.239 90.072 515.239 90.624C515.239 91.136 515.419 91.548 515.779 91.86C516.147 92.172 516.639 92.328 517.255 92.328C517.871 92.328 518.359 92.172 518.719 91.86C519.079 91.548 519.259 91.136 519.259 90.624C519.259 90.088 519.075 89.68 518.707 89.4C518.339 89.112 517.855 88.968 517.255 88.968ZM521.789 88.572C521.789 87.196 522.013 86.124 522.461 85.356C522.909 84.58 523.693 84.192 524.813 84.192C525.925 84.192 526.705 84.58 527.153 85.356C527.601 86.124 527.825 87.196 527.825 88.572C527.825 89.972 527.601 91.06 527.153 91.836C526.705 92.612 525.925 93 524.813 93C523.693 93 522.909 92.612 522.461 91.836C522.013 91.06 521.789 89.972 521.789 88.572ZM526.745 88.572C526.745 87.876 526.697 87.288 526.601 86.808C526.513 86.32 526.325 85.928 526.037 85.632C525.757 85.336 525.349 85.188 524.813 85.188C524.269 85.188 523.853 85.336 523.565 85.632C523.285 85.928 523.097 86.32 523.001 86.808C522.913 87.288 522.869 87.876 522.869 88.572C522.869 89.292 522.913 89.896 523.001 90.384C523.097 90.872 523.285 91.264 523.565 91.56C523.853 91.856 524.269 92.004 524.813 92.004C525.349 92.004 525.757 91.856 526.037 91.56C526.325 91.264 526.513 90.872 526.601 90.384C526.697 89.896 526.745 89.292 526.745 88.572Z" fill={fontColor}/>
                  <defs>
                  <linearGradient id="paint0_linear" x1="14" y1="31.9999" x2="514" y2="32.0001" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF726E"/>
                  <stop offset="0.507078" stopColor="#F8EC99"/>
                  <stop offset="1" stopColor="#79CC81"/>
                  </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className={`additional-info__container ${theme.currentTheme}`}>
              <div className='additional-info__row'>
                <p>Total Cashback Received</p>
                <strong>{(cb_received)?cb_received:'0.0'} CSHBK</strong>
              </div>
              <div className='additional-info__row'>
                <p>SEFI Earned from Cashback</p>
                <strong>{(sefi_earned)?sefi_earned:'0.0'} SEFI</strong>
              </div>
            </div>
          </Box>
      </PageContainer>
    </BaseContainer>
    )
  }
)
