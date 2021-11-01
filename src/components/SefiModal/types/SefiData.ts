import BigNumber from "bignumber.js";
import { RewardsToken } from "components/Earn/EarnRow";

export interface SefiData{
  balance: string,
  cashback_balance:string,
  expected_sefi:number,
  apys:RewardsToken[],
  unclaimed:string,
  sefi_price:number,
  sefi_in_circulation:string,
  total_supply:string
}

export interface ClaimInfo {
  eth:{
    address:string,
    amount:BigNumber,
    isClaimed:boolean
  } | undefined,
  scrt:{
    address:string,
    amount:BigNumber,
    isClaimed:boolean
  } | undefined
}
