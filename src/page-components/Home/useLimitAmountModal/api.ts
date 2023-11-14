import { gql, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ChainId } from 'types';
import { LimitDataProps } from './constants';
import BigNumber from 'bignumber.js';
import moment from 'moment';

interface LimitDataByGqlProps {
  fromChainId: ChainId;
  toChainId: ChainId;
  symbol: string;
  limitType: 'Receipt' | 'Swap';
  defaultDailyLimit: number;
  refreshTime: string;
  currentDailyLimit: string;
  capacity: string;
  refillRate: string;
  isEnable: boolean;
  currentBucketTokenAmount: string;
  bucketUpdateTime: string;
}

const limitQuery = gql`
  query queryCrossChainLimitInfos($dto: GetCrossChainLimitInfoDto!) {
    queryCrossChainLimitInfos(dto: $dto) {
      totalRecordCount
      totalRecordCount
      dataList: data {
        id
        fromChainId
        toChainId
        symbol
        limitType
        defaultDailyLimit
        refreshTime
        currentDailyLimit
        capacity
        refillRate
        isEnable
        currentBucketTokenAmount
        bucketUpdateTime
      }
    }
  }
`;

export const getLimitData = async (params: {
  fromChainId: ChainId;
  toChainId: ChainId;
  symbol?: string;
}): Promise<LimitDataProps | undefined> => {
  try {
    const client = creatGqlClient();
    const result = await client.query<{
      queryCrossChainLimitInfos: {
        dataList: Array<LimitDataByGqlProps>;
      };
    }>({
      query: limitQuery,
      variables: {
        dto: {
          ...params,
          skipCount: 0,
        },
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log('getLimitData by gql :', result.data.queryCrossChainLimitInfos.dataList[0]);

    if (!result?.data?.queryCrossChainLimitInfos?.dataList?.length) {
      return;
    }

    const {
      refreshTime,
      currentDailyLimit,
      capacity,
      currentBucketTokenAmount,
      refillRate,
      bucketUpdateTime,
      defaultDailyLimit,
      isEnable,
    } = result.data.queryCrossChainLimitInfos.dataList[0];

    let currentCapcity = new BigNumber(currentBucketTokenAmount);
    let remain = new BigNumber(currentDailyLimit);
    const fillRate = new BigNumber(refillRate);
    const maxCapcity = new BigNumber(capacity);

    const utcRefreshTime = moment(refreshTime);
    const utcBucketUpdateTime = moment(bucketUpdateTime);
    const utcNow = moment.utc();
    const midnightToday = moment(utcNow.format('YYYY-MM-DD'));

    // Updated every day
    // if (utcRefreshTime.isBefore(midnightToday.subtract(1, 'd'))) {
    //   remain = new BigNumber(defaultDailyLimit);
    // }

    // test1 Updated hourly
    if (utcRefreshTime.isBefore(midnightToday.subtract(1, 'h'))) {
      remain = new BigNumber(defaultDailyLimit);
    }

    if (utcBucketUpdateTime.isBefore(utcNow)) {
      const differenceTime = new BigNumber(
        moment.duration(utcNow.valueOf() - utcBucketUpdateTime.valueOf()).asSeconds(),
      );
      const newCurrentCapcity = fillRate.times(differenceTime).plus(currentCapcity);
      currentCapcity = BigNumber.min(capacity, newCurrentCapcity);
    }

    return {
      fillRate,
      maxCapcity,
      remain,
      currentCapcity,
      isEnable,
    };
  } catch (e) {
    console.log('error: ', e);
  }
};

const creatGqlClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    queryDeduplication: false,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
      query: {
        fetchPolicy: 'network-only',
      },
      // ...defaultOptions,
    },
    link: new HttpLink({
      uri: '/AElfIndexer_eBridge/EbridgeIndexerPluginSchema/graphql',
    }),
  });
};
