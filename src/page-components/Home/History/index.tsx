import { Row, Tabs } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { request } from 'api';
import CommonPopover from 'components/CommonPopover';
import IconFont from 'components/IconFont';
import { NetworkList } from 'constants/index';
import { useWallet } from 'contexts/useWallet/hooks';
import useInterval from 'hooks/useInterval';
import useUrlSearchState from 'hooks/useUrlSearchState';
import { useCallback, useEffect, useMemo } from 'react';
import { usePrevious, useSetState } from 'react-use';
import { ChainId, CrossChainType, NetworkType } from 'types';
import { CrossChainItem } from 'types/api';
import { isELFChain } from 'utils/aelfUtils';
import { getChainIdToMap } from 'utils/chain';
import { parseCrossChainTransfers } from '../HomeContext/utils';
import Columns from './columns';
import { Content, NetworkSelect, StatusSelect, TablePagination } from './components';
import styles from './styles.module.less';
import CommonTable from 'components/CommonTable';
import { useLanguage } from 'i18n';
import { isPortkey } from 'utils/portkey';
type State = {
  fromChainId?: ChainId;
  toChainId?: ChainId;
  status?: number;
  page?: number;
  totalCount?: number;
  list?: CrossChainItem[];
};

const PageSize = 5;

const columns: ColumnsType<any> = [
  Columns.receiptID,
  Columns.sendAmount,
  // Columns.acceptedAmount,
  Columns.sendingAddress,
  Columns.receivingAddress,
  Columns.sendTime,
  Columns.receivingTime,
  Columns.sendTransaction,
  Columns.receiveTransaction,
  Columns.fromTo(),
];
const heterogeneousColumns: ColumnsType<any> = columns.slice(0, columns.length - 1).concat(Columns.fromTo(true));

const DefaultListState = {
  page: 1,
  totalCount: 0,
  list: [],
};
function Body({
  state,
  selectState,
  setSelect,
  setState,
  isHeterogeneous,
  networkList,
}: {
  state: State;
  selectState: State;
  setSelect: (v: any) => void;
  setState: (v: any) => void;
  isHeterogeneous?: boolean;
  networkList: NetworkType[];
}) {
  const { t } = useLanguage();
  const { page, totalCount, list } = state;
  const { fromChainId, toChainId } = selectState;
  return (
    <>
      <Row className="flex-row">
        <NetworkSelect
          value={fromChainId}
          networkList={networkList}
          placeholder={t('From')}
          onChange={(value) => {
            const tmpState: State = { fromChainId: value };
            if (toChainId && toChainId === value) tmpState.toChainId = fromChainId;
            setSelect(tmpState);
            setState(DefaultListState);
          }}
        />
        <NetworkSelect
          value={toChainId}
          networkList={networkList}
          placeholder={t('To')}
          onChange={(value) => {
            const tmpState: State = { toChainId: value };
            if (fromChainId && fromChainId === value) tmpState.fromChainId = toChainId;
            setSelect(tmpState);
            setState(DefaultListState);
          }}
        />
        <StatusSelect
          onChange={(value) => {
            setSelect({ status: value });
            setState(DefaultListState);
          }}
        />
      </Row>
      <CommonTable
        pagination={{ hideOnSinglePage: true, pageSize: PageSize }}
        rowKey={'id'}
        className={styles.table}
        columns={isHeterogeneous ? heterogeneousColumns : columns}
        dataSource={list}
        scroll={list?.length ? { x: true } : {}}
      />
      <TablePagination
        current={page ?? 1}
        onChange={(page: number) => setState({ page })}
        pageSize={PageSize}
        total={totalCount}
      />
    </>
  );
}

function HeterogeneousHistory() {
  const [state, setState] = useSetState<State>(DefaultListState);
  const { page } = state;
  const [selectState, setSelect] = useSetState<State>();
  const { fromChainId, toChainId, status } = selectState;
  const { fromWallet, toWallet } = useWallet();
  const { account: fromAccount } = fromWallet || {};
  const { account: toAccount } = toWallet || {};
  const getReceiveList = useCallback(async () => {
    if (!(fromAccount || toAccount)) return setState({ list: [], totalCount: 0 });
    const skipCount = page ? (page - 1) * PageSize : 0;
    const req = await request.cross.getCrossChainTransfers({
      params: {
        fromAddress: fromAccount,
        toAddress: toAccount,
        toChainId: getChainIdToMap(toChainId),
        fromChainId: getChainIdToMap(fromChainId),
        status,
        skipCount,
        type: '1',
        MaxResultCount: PageSize,
      },
    });
    if (req.items) {
      if (Array.isArray(req.items) && req.items.length === 0 && req.totalCount > 0) {
        setState({ page: Math.ceil(req.totalCount / PageSize) });
      } else {
        const list = parseCrossChainTransfers(req);
        setState({ list, totalCount: req.totalCount });
      }
    }
  }, [fromAccount, fromChainId, page, setState, status, toAccount, toChainId]);
  const preFromAccount = usePrevious(fromAccount);
  const preToAccount = usePrevious(toAccount);
  useEffect(() => {
    if (preFromAccount !== fromAccount || preToAccount !== toAccount) setState(DefaultListState);
  }, [fromAccount, preFromAccount, preToAccount, setState, toAccount]);
  useInterval(getReceiveList, 10000, [getReceiveList]);
  return (
    <Body
      networkList={NetworkList}
      isHeterogeneous
      state={state}
      selectState={selectState}
      setSelect={setSelect}
      setState={setState}
    />
  );
}

const isomorphismNetworkList = NetworkList.filter((i) => isELFChain(i.info.chainId));

function HomogeneousHistory() {
  const [state, setState] = useSetState<State>(DefaultListState);
  const { page } = state;
  const [selectState, setSelect] = useSetState<State>();
  const { fromChainId, toChainId, status } = selectState;
  const { fromWallet, toWallet } = useWallet();
  const fromAddress = useMemo(() => {
    if (isELFChain(fromWallet?.chainId)) return fromWallet?.account;
    if (isELFChain(toWallet?.chainId)) return toWallet?.account;
  }, [fromWallet?.account, fromWallet?.chainId, toWallet?.account, toWallet?.chainId]);
  const getReceiveList = useCallback(async () => {
    if (!fromAddress) return setState({ list: [], totalCount: 0 });
    const skipCount = page ? (page - 1) * PageSize : 0;
    const req = await request.cross.getCrossChainTransfers({
      params: {
        fromAddress,
        toChainId: getChainIdToMap(toChainId),
        fromChainId: getChainIdToMap(fromChainId),
        status,
        skipCount,
        MaxResultCount: PageSize,
        type: '0',
      },
    });
    if (req.items) {
      if (Array.isArray(req.items) && req.items.length === 0 && req.totalCount > 0) {
        setState({ page: Math.ceil(req.totalCount / PageSize) });
      } else {
        const list = parseCrossChainTransfers(req);
        setState({ list, totalCount: req.totalCount });
      }
    }
  }, [fromAddress, fromChainId, page, setState, status, toChainId]);
  const preFromAddress = usePrevious(fromAddress);
  useEffect(() => {
    if (preFromAddress !== fromAddress) setState(DefaultListState);
  }, [fromAddress, preFromAddress, setState]);
  useInterval(getReceiveList, 10000, [getReceiveList]);
  return (
    <Body
      networkList={isomorphismNetworkList}
      state={state}
      selectState={selectState}
      setSelect={setSelect}
      setState={setState}
    />
  );
}

export default function History() {
  const [{ historyType }, setActiveKey] = useUrlSearchState();

  const { t } = useLanguage();
  return (
    <div className={styles.history}>
      <Tabs
        defaultActiveKey={CrossChainType.heterogeneous}
        activeKey={CrossChainType[historyType as CrossChainType] ? historyType : undefined}
        onChange={(v) => setActiveKey({ historyType: v })}>
        <Tabs.TabPane tab={t('Heterogeneous Chain Cross-Chain History')} key={CrossChainType.heterogeneous}>
          <HeterogeneousHistory />
        </Tabs.TabPane>
        {!isPortkey() && (
          <Tabs.TabPane tab={t('Homogeneous Chain Cross-Chain History')} key={CrossChainType.homogeneous}>
            <HomogeneousHistory />
          </Tabs.TabPane>
        )}
        <div className="tip-icon">
          <CommonPopover className="cursor-pointer" content={<Content />} placement="topRight">
            <IconFont type="QuestionCircleOutlined" />
          </CommonPopover>
        </div>
      </Tabs>
    </div>
  );
}
