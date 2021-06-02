import cogoToast from 'cogo-toast';
import { BaseContainer, PageContainer } from 'components'
import { ArrowDown } from 'components/Base/components/Icons/tsx_svg_icons';
import { Box } from 'grommet'
import { observer } from 'mobx-react';
import { unlockJsx } from 'pages/Pool/utils';
import { storeTxResultLocally } from 'pages/Swap/utils';
import React from 'react'
import { Button } from 'semantic-ui-react';
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
    function extractError(result: any) {
      if (result?.raw_log && result.raw_log.includes('Operation fell short of expected_return')) {
        return 'Swap fell short of expected return (slippage error)';
      }
      if (result?.raw_log) {
        return result.raw_log;
      }
      console.error(result);
      return `Unknown error`;
    }
    async function createCSHBKViewingKey() {
      try {
        await user.keplrWallet.suggestToken(user.chainId, process.env.CSHBK_CONTRACT);
        await user.updateCSHBKBalance();
      } catch (e) {
        console.error("Error at creating new viewing key ",e)
      }
      
    }
    const burnSEFI = async () => {
      if(user?.balanceCSHBK){
        try {
          setLoading(true)
          const expected_sefi = user.expectedSEFIFromCSHBK;
          const cashbak = user.balanceCSHBK;
          const result = await user.ConvertCHSBKToSEFI(); 

          if (result?.code) {
            const error = extractError(result);
            storeTxResultLocally(result);
            throw new Error(error);
          }
          notify('success',`You have burned ${cashbak} CSHBK and got ${expected_sefi} SEFI tokens!`)
          setLoading(false)
          console.log("You've claimed CSHBK")
        } catch (error) {
          notify('error',`Error redeeming : ${error.message}`)
          setLoading(false)
          console.error(error)
        }
      }
    }

    saveMaxValue(Math.round(user?.ratioCSHBK+1))

    const topRightChart = 614;
    const topLeftChart = 14;
    const topLeftLabel = 52;
    const topRightLabel = 680;
    const maxLimit= getMaxValue();

    const sefi_earned = localStorage.getItem('total_sefi_earned')
    const cb_received = parseFloat(localStorage.getItem('total_cb_received') || '0.0') + parseFloat(user?.balanceCSHBK)
    
    const rateCSHBK = user?.ratioCSHBK || 0.8 //Default value .60 meantime it loads 
    const fontColor = theme.currentTheme=='light'?'#5F5F6B':'white'

    let minLimit = parseFloat((maxLimit / 5).toFixed(2));
    const midValue =( minLimit * 3).toFixed(2);
    let ratioColor,xPositionChart,xPositionLabel,xPositionArrow;
    // Calculating X positions base on Rate CSHBK
    if(rateCSHBK >= maxLimit){
      //Equal or HIGHER than minimun limit
      xPositionChart= topRightChart
      xPositionLabel= topRightLabel
      xPositionArrow= topRightLabel;

    }else if(rateCSHBK <= minLimit){
      //Equal or LOWER than minimun limit
      xPositionChart =topLeftChart
      xPositionArrow=topLeftLabel - 5;
      xPositionLabel =topLeftLabel

    }else{
      //Calculations
      const b= (topRightChart-topLeftChart)/4
      const a= b/minLimit
      const bLabel=(topRightLabel-topLeftLabel)/4
      const aLabel=bLabel/minLimit
      xPositionChart = parseFloat((a * rateCSHBK - b).toFixed(2))+topLeftChart;
      xPositionLabel = parseFloat((aLabel * rateCSHBK - bLabel).toFixed(2))+topLeftLabel;
      xPositionArrow = xPositionLabel-5;
    }

    //Calculating color of rate value
    if(rateCSHBK > minLimit && rateCSHBK < maxLimit){
      ratioColor='#c7b517'
    }else if(rateCSHBK > minLimit){
      ratioColor='#79CC81'
    }else{
      ratioColor='#FF726E'
    }

    const balanceCSHBK = parseFloat(parseFloat(user.balanceCSHBK || '0.0').toFixed(2))
    
    return(
      <BaseContainer>
        <PageContainer>
          <Box className="cashback-container">
            <h1 className={`trade-more__title ${theme.currentTheme}`}>Trade more. Earn More.</h1>
            <div className={`box-shadow ${theme.currentTheme}`}>
              <div className={`cashback-container__card ${theme.currentTheme}`}>
                <div className="congratulations-container">
                  {
                    (user.isUnconnected == 'true')
                    ? <>
                        <h1 className='connect_wallet'>PLEASE CONNECT YOUR WALLET</h1>
                        <p>You haven't traded recently on </p>
                        <SecretSwapLogo fill={(theme.currentTheme == 'light')?'#1b1b1b':'#ffffff'}/> 
                        <p>You currently have</p>
                        <h2>0 CSHBK </h2>
                      </> 
                    : (user?.balanceCSHBK == 'Unlock')
                      ? <>
                          <p>Welcome newcomer to</p>
                          <h2>CASHBACK</h2>
                          <p>To get started</p>
                          <p>Click below to create a</p>
                          <h2>
                            <span role="img" aria-label={'view'} className="view-token-button" onClick={createCSHBKViewingKey}>
                              🔍 VIEWING KEY
                            </span>
                          </h2>
                        </>
                      : (hasCashback)
                        ? <>
                            <h1>Congratulations</h1>
                            <p>For trading on</p>
                            <SecretSwapLogo fill={(theme.currentTheme == 'light')?'#1b1b1b':'#ffffff'}/> 
                            <p>You have earned</p>
                            <h2> {balanceCSHBK} CSHBK </h2>
                            <p>that you can trade for</p>
                            <h2>{user.expectedSEFIFromCSHBK} SEFI</h2>
                          </>
                        : <>
                          <h1>Keep Trading!</h1> 
                          <p>You haven't traded recently on </p>
                          <SecretSwapLogo fill={(theme.currentTheme == 'light')?'#1b1b1b':'#ffffff'}/> 
                          <p>You currently have</p>
                          <h2>0 CSHBK </h2>
                        </>
                  }
                  
                </div>
                <div className="call-toAction__container">
                  <img  src=
                      {
                        (isNaN(balanceCSHBK) || balanceCSHBK == 0)
                          ?"/static/cashback_logo_gray.png"
                          :"/static/cashback_logo.png"
                      } alt="Cashback logo"  />
                  <Button 
                    loading={loading}
                    disabled={isNaN(balanceCSHBK) || balanceCSHBK == 0 || user?.balanceCSHBK == 'Unlock'}
                    className="redeem-sefi__button" 
                    onClick={burnSEFI}>
                      Redeem for SEFI 
                  </Button>
                </div>
              </div>
              <div className={`rate-bar__container ${theme.currentTheme}`}>
                <div className='rate-labels__container'>
                    <svg width="742" height="94" viewBox="0 0 742 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text className='current-rate' x={xPositionLabel} textAnchor='middle' y='15%' >Current</text>
                        <text className='current-rate' x={xPositionLabel} textAnchor='middle' y='35%' >Rate</text>
                        <text className='chart-value' x={xPositionLabel} textAnchor='middle' y='65%' fill={ratioColor}>{rateCSHBK}</text>
                        <Arrow x={xPositionArrow} y='80' stroke={fontColor} width='10px'/>
                    </svg>
                </div>
                <div className="rate-svg__container">
                  <svg width="634" height="94" viewBox="0 0 634 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text fill="#FF726E" x={topLeftChart} y='10' textAnchor='middle'>Bad</text>
                    <text fill="#79CC81" x={topRightChart - 5 } y='10' textAnchor='middle'>Good</text>
                    <rect x="4" y="21" width="624" height="22" rx="11" fill="url(#paint0_linear)"/>
                    <path d={`M${xPositionChart} 21V43`} stroke={fontColor}/>
                    <path d="M14 53V73" stroke={fontColor}/>
                    <path d="M160.5 53V63" stroke={fontColor}/>
                    <path d="M321 53V73" stroke={fontColor}/>
                    <path d="M481.5 53V63" stroke={fontColor}/>
                    <path d="M614 53V73" stroke={fontColor}/>
                    <text fill={fontColor} x={topLeftChart} y='90' textAnchor='middle'>{minLimit}</text>
                    <text fill={fontColor} x={topRightChart } y='90' textAnchor='middle'>{maxLimit}</text>
                    <text fill={fontColor} x={(topRightChart-topLeftChart)/2 + topLeftChart} y='90' textAnchor='middle'>{midValue}</text>
                    <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="10.9999" x2="624" y2="11.0001" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF726E"/>
                    <stop offset="0.507078" stopColor="#F8EC99"/>
                    <stop offset="1" stopColor="#79CC81"/>
                    </linearGradient>
                    </defs>
                  </svg>
                </div>
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

const MAX_VALUE_KEY = 'maxValue'
function saveMaxValue(maxValue:number){
  const localValue = localStorage.getItem(MAX_VALUE_KEY)
  const localMaxValue = parseFloat(localValue)
  
  if(!localValue || (maxValue > localMaxValue)){
    if(!isNaN(maxValue)){
      localStorage.setItem(MAX_VALUE_KEY,maxValue.toString())
    }else if(isNaN(localMaxValue)){
      localStorage.setItem(MAX_VALUE_KEY,'1')
    }
  }
}

function getMaxValue():number{
  const localValue = localStorage.getItem(MAX_VALUE_KEY)
  if(localValue){
    return parseFloat(localValue)
  }else{
    return 1;
  }
}

const SecretSwapLogo = ({fill})=>(
  <div style={{margin:'1rem 0'}}>
    <svg  width="200" height="30" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.24302 23.4334C6.71863 23.4334 5.21682 23.185 3.74888 22.6995C2.29224 22.2252 1.03885 21.5138 0 20.6105L1.73894 17.6859C2.84554 18.4763 3.92955 19.0635 5.00227 19.4813C6.05241 19.8765 7.11384 20.0798 8.15269 20.0798C9.07861 20.0798 9.80129 19.9104 10.3433 19.5603C10.8853 19.2103 11.1337 18.7248 11.1337 18.0472C11.1337 17.4036 10.8288 16.9181 10.1965 16.6245C9.56416 16.3309 8.5479 15.9808 7.14771 15.5743C5.96207 15.2356 4.9571 14.9307 4.12151 14.6371C3.28592 14.3435 2.6197 13.9935 2.08898 13.6096C1.58085 13.2369 1.20822 12.7966 0.982389 12.2997C0.756552 11.7916 0.632338 11.2157 0.632338 10.5043C0.632338 9.57838 0.813013 8.75408 1.17435 7.99753C1.5244 7.26356 2.03253 6.61993 2.67616 6.10051C3.31979 5.58108 4.07634 5.17458 4.95711 4.91487C5.83787 4.64386 6.77508 4.49707 7.80264 4.49707C9.15765 4.49707 10.4449 4.67774 11.6419 5.08424C12.8275 5.47946 13.9341 6.1118 14.9165 7.00385L13.042 9.8268C12.1161 9.138 11.2241 8.60729 10.3546 8.30241C9.47383 7.96365 8.61565 7.82816 7.76876 7.82816C6.97834 7.82816 6.32341 7.99753 5.78141 8.30241C5.2394 8.64116 4.99098 9.16059 4.99098 9.87197C4.99098 10.2107 5.05873 10.4591 5.17165 10.6624C5.29586 10.8769 5.5104 11.0576 5.77011 11.227C6.04111 11.3964 6.41375 11.5319 6.85413 11.69C7.31709 11.8367 7.88168 11.9948 8.5479 12.1529C9.80129 12.4917 10.874 12.7966 11.7661 13.1353C12.6581 13.4741 13.3921 13.8241 13.9567 14.2419C14.5213 14.6597 14.9391 15.134 15.2101 15.6873C15.4811 16.2293 15.6053 16.8729 15.6053 17.652C15.6053 19.4248 14.9391 20.8476 13.6179 21.8752C12.3081 22.9253 10.5127 23.4334 8.24302 23.4334Z" fill={fill}/>
      <path d="M37.4215 15.3146H22.8776C23.126 16.6696 23.8036 17.7649 24.8763 18.5779C25.9603 19.3683 27.2927 19.7635 28.8849 19.7635C30.9287 19.7635 32.5999 19.0973 33.9097 17.731L36.2358 20.4072C35.4003 21.4121 34.3614 22.1574 33.0854 22.6655C31.8095 23.1737 30.3754 23.4334 28.7832 23.4334C26.7394 23.4334 24.944 23.0382 23.397 22.2139C21.8501 21.4009 20.6418 20.2717 19.8063 18.8263C18.9481 17.381 18.5303 15.7324 18.5303 13.9144C18.5303 12.0964 18.9481 10.493 19.7611 9.02503C20.5741 7.57968 21.7259 6.4505 23.1825 5.63749C24.6392 4.82448 26.2878 4.41797 28.1057 4.41797C29.9237 4.41797 31.5272 4.81318 32.9499 5.60361C34.3614 6.39404 35.468 7.52322 36.2923 8.96857C37.0827 10.4139 37.4779 12.0964 37.4779 13.9821C37.4779 14.3322 37.4667 14.75 37.4215 15.3146ZM24.5827 9.14924C23.6229 9.96225 23.0357 11.0688 22.8325 12.4239H33.3564C33.1758 11.0801 32.5999 10.0074 31.6514 9.16053C30.6916 8.32494 29.5285 7.90714 28.0945 7.90714C26.7168 7.89585 25.5425 8.31364 24.5827 9.14924Z" fill={fill}/>
      <path d="M44.751 22.1787C43.2266 21.3657 42.0409 20.2365 41.1828 18.7912C40.3246 17.3458 39.8955 15.6972 39.8955 13.8792C39.8955 12.05 40.3359 10.4126 41.1828 8.96729C42.0409 7.52194 43.2266 6.39275 44.751 5.60233C46.2754 4.78932 48.0143 4.38281 49.9452 4.38281C51.7745 4.38281 53.3666 4.75544 54.7442 5.48941C56.1219 6.24596 57.1607 7.30739 57.8495 8.68499L54.5071 10.6272C53.9651 9.76901 53.3215 9.11408 52.5085 8.70758C51.718 8.2672 50.8373 8.06394 49.8775 8.06394C48.2514 8.06394 46.9077 8.58337 45.8463 9.65609C44.7849 10.7062 44.2429 12.1177 44.2429 13.8792C44.2429 15.6295 44.7623 17.0522 45.8237 18.1024C46.8739 19.1638 48.2176 19.6945 49.8662 19.6945C50.8034 19.6945 51.6842 19.48 52.4972 19.0509C53.2876 18.6105 53.9538 17.9894 54.4958 17.1313L57.8382 19.0735C57.1268 20.4736 56.0654 21.5351 54.6878 22.2916C53.3102 23.0482 51.718 23.4208 49.9113 23.4208C47.9917 23.3869 46.2754 22.9917 44.751 22.1787Z" fill={fill}/>
      <path d="M72.3693 4.64355V8.78765C71.9966 8.73119 71.6579 8.68603 71.3643 8.68603C69.6705 8.68603 68.3607 9.19416 67.4009 10.1653C66.4411 11.1476 65.9894 12.5704 65.9894 14.4336V23.4444H61.6533V4.84681H65.7861V7.55685C67.0169 5.62594 69.2188 4.64355 72.3693 4.64355Z" fill={fill}/>
      <path d="M93.61 15.3146H79.0661C79.3145 16.6696 79.992 17.7649 81.0648 18.5779C82.1488 19.3683 83.4812 19.7635 85.0734 19.7635C87.1172 19.7635 88.7884 19.0973 90.0982 17.731L92.4243 20.4072C91.5887 21.4121 90.5499 22.1574 89.2739 22.6655C87.9979 23.1737 86.5639 23.4334 84.9717 23.4334C82.9279 23.4334 81.1325 23.0382 79.5855 22.2139C78.0386 21.4009 76.8303 20.2717 75.9947 18.8263C75.1366 17.381 74.7188 15.7324 74.7188 13.9144C74.7188 12.0964 75.1365 10.493 75.9496 9.02503C76.7626 7.57968 77.9143 6.4505 79.371 5.63749C80.8276 4.82448 82.4762 4.41797 84.2942 4.41797C86.1122 4.41797 87.7156 4.81318 89.1384 5.60361C90.5499 6.39404 91.6565 7.52322 92.4808 8.96857C93.2712 10.4139 93.6664 12.0964 93.6664 13.9821C93.7003 14.3322 93.6664 14.75 93.61 15.3146ZM80.7938 9.14924C79.8339 9.96225 79.2468 11.0688 79.0435 12.4239H89.5675C89.3868 11.0801 88.8109 10.0074 87.8624 9.16053C86.9026 8.32494 85.7396 7.90714 84.3055 7.90714C82.9166 7.89585 81.7536 8.31364 80.7938 9.14924Z" fill={fill}/>
      <path d="M109.238 22.1796C108.729 22.5974 108.108 22.9136 107.374 23.1168C106.641 23.3201 105.873 23.4217 105.048 23.4217C103.005 23.4217 101.435 22.8797 100.328 21.8183C99.2218 20.7568 98.6572 19.2099 98.6572 17.1548V8.21164H95.6084V4.76763H98.6572V0.533203H102.993V4.76763H107.962V8.23422H102.993V17.0757C102.993 17.9678 103.219 18.6679 103.659 19.1421C104.1 19.6164 104.743 19.8535 105.579 19.8535C106.561 19.8535 107.352 19.6051 107.996 19.0857L109.238 22.1796Z" fill={fill}/>
      <path d="M120.514 23.3253C119.053 23.3253 117.662 23.1051 116.34 22.6645C115.019 22.224 113.987 21.6676 113.245 20.9952L114.045 19.604C114.787 20.23 115.738 20.7517 116.897 21.1691C118.079 21.5864 119.308 21.7951 120.583 21.7951C122.415 21.7951 123.76 21.4937 124.618 20.8908C125.499 20.288 125.939 19.4533 125.939 18.3868C125.939 17.6216 125.696 17.0188 125.209 16.5783C124.745 16.1377 124.166 15.8131 123.47 15.6044C122.775 15.3958 121.812 15.1755 120.583 14.9436C119.146 14.6886 117.987 14.4104 117.106 14.109C116.224 13.8075 115.471 13.3206 114.845 12.6482C114.219 11.9759 113.906 11.0484 113.906 9.86595C113.906 8.42842 114.497 7.24594 115.68 6.31851C116.885 5.36789 118.589 4.89258 120.792 4.89258C121.951 4.89258 123.099 5.05488 124.235 5.37948C125.371 5.70408 126.299 6.13302 127.018 6.6663L126.218 8.05745C125.476 7.52417 124.629 7.11842 123.679 6.84019C122.728 6.56196 121.754 6.42285 120.757 6.42285C119.065 6.42285 117.79 6.73585 116.932 7.36187C116.074 7.98789 115.645 8.81099 115.645 9.83117C115.645 10.6427 115.888 11.2803 116.375 11.744C116.862 12.1845 117.453 12.5207 118.149 12.7526C118.868 12.9613 119.865 13.1931 121.14 13.4482C122.554 13.7032 123.69 13.9814 124.548 14.2829C125.429 14.5611 126.171 15.0248 126.774 15.674C127.377 16.3232 127.678 17.2159 127.678 18.352C127.678 19.8591 127.052 21.0647 125.8 21.969C124.548 22.8732 122.786 23.3253 120.514 23.3253Z" fill={fill}/>
      <path d="M158.137 5.03169L151.25 23.1862H149.616L143.495 7.43143L137.339 23.1862H135.739L128.853 5.03169H130.522L136.574 21.2386L142.764 5.03169H144.26L150.416 21.2038L156.537 5.03169H158.137Z" fill={fill}/>
      <path d="M167.759 4.89258C170.008 4.89258 171.736 5.47223 172.941 6.63152C174.147 7.76763 174.75 9.4486 174.75 11.6744V23.1862H173.08V19.9518C172.501 21.0183 171.654 21.853 170.542 22.4559C169.429 23.0355 168.095 23.3253 166.542 23.3253C164.525 23.3253 162.925 22.85 161.743 21.8994C160.583 20.9488 160.004 19.6968 160.004 18.1433C160.004 16.6362 160.537 15.419 161.603 14.4915C162.693 13.5409 164.42 13.0656 166.785 13.0656H173.011V11.6049C173.011 9.91232 172.547 8.6255 171.62 7.74444C170.715 6.86338 169.382 6.42285 167.62 6.42285C166.414 6.42285 165.255 6.63152 164.142 7.04886C163.053 7.46621 162.125 8.02267 161.36 8.71825L160.49 7.46621C161.395 6.6547 162.484 6.02868 163.76 5.58815C165.035 5.12444 166.368 4.89258 167.759 4.89258ZM166.785 21.8994C168.293 21.8994 169.568 21.5516 170.611 20.856C171.678 20.1605 172.478 19.1519 173.011 17.8303V14.422H166.82C165.035 14.422 163.736 14.7466 162.925 15.3958C162.137 16.045 161.743 16.9376 161.743 18.0737C161.743 19.2562 162.183 20.1952 163.064 20.8908C163.945 21.5632 165.186 21.8994 166.785 21.8994Z" fill={fill}/>
      <path d="M191.027 4.89258C192.719 4.89258 194.249 5.28674 195.617 6.07506C196.985 6.86338 198.052 7.95311 198.817 9.34426C199.605 10.7354 199.999 12.3236 199.999 14.109C199.999 15.8943 199.605 17.4941 198.817 18.9084C198.052 20.2996 196.985 21.3893 195.617 22.1776C194.249 22.9428 192.719 23.3253 191.027 23.3253C189.427 23.3253 187.978 22.9544 186.679 22.2124C185.381 21.4473 184.372 20.3923 183.653 19.0475V29.9333H181.914V5.03169H183.584V9.30949C184.303 7.91833 185.311 6.84019 186.61 6.07506C187.931 5.28674 189.404 4.89258 191.027 4.89258ZM190.922 21.7603C192.313 21.7603 193.565 21.4357 194.678 20.7865C195.791 20.1373 196.661 19.233 197.287 18.0737C197.936 16.9144 198.261 15.5929 198.261 14.109C198.261 12.6251 197.936 11.3035 197.287 10.1442C196.661 8.98488 195.791 8.08063 194.678 7.43143C193.565 6.78223 192.313 6.45762 190.922 6.45762C189.531 6.45762 188.279 6.78223 187.166 7.43143C186.076 8.08063 185.207 8.98488 184.558 10.1442C183.932 11.3035 183.619 12.6251 183.619 14.109C183.619 15.5929 183.932 16.9144 184.558 18.0737C185.207 19.233 186.076 20.1373 187.166 20.7865C188.279 21.4357 189.531 21.7603 190.922 21.7603Z" fill={fill}/>
    </svg>
  </div>

)

const Arrow = (props)=>(
  <svg {...props} width="9" height="6" viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 0H0L4.5 6L9 0Z" fill="#5F5F6B"/>
  </svg>
)