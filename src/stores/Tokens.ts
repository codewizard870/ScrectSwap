import { ITokenInfo, TOKEN_USAGE } from './interfaces';
import { IStores } from './index';
import * as services from 'services';
import { ListStoreConstructor } from './core/ListStoreConstructor';
import { computed } from 'mobx';

export class Tokens extends ListStoreConstructor<ITokenInfo> {
  constructor(stores: IStores) {
    super(stores, () => services.getTokensInfo({ page: 0, size: 1000 }), {
      pollingInterval: 30000,
      isLocal: true,
      paginationData: { pageSize: 100 },
      sorter: 'totalLockedUSD, asc',
      //sorter: 'none',
      //sorters: {}
      sorters: {
        totalLockedUSD: 'asc',
      },
    });
  }
  //
  @computed get totalLockedUSD() {
    return this.data.reduce((acc, v) => acc + Number(v.totalLockedUSD), 0);
  }

  tokensUsage(usage: TOKEN_USAGE) {
    return this.data.filter(token => {
//      console.log(token.display_props.usage.includes(usage))
      return token.display_props.usage.includes(usage);
    });
  }
}
