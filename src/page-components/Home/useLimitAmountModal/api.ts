import { gql, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ChainId } from 'types';

export interface LimitDataByGqlProps {
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
}): Promise<LimitDataByGqlProps | undefined> => {
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

    return result.data.queryCrossChainLimitInfos.dataList[0];
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
