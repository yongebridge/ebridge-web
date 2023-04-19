import { Dropdown, Menu, Row } from 'antd';
import { useMemo } from 'react';
import { switchNetwork } from '../../utils/network';
import { ChainId, NetworkType } from 'types';
import { getIconByChainId, getNameByChainId } from 'utils/chain';
import IconFont from 'components/IconFont';
import styles from './styles.module.less';
import clsx from 'clsx';
import useMediaQueries from 'hooks/useMediaQueries';

export default function Network({
  networkList,
  overlayClassName,
  onChange,
  className,
  chainId,
}: {
  overlayClassName?: string | undefined;
  networkList: NetworkType[];
  onChange?: (i: NetworkType['info']) => void;
  className?: string;
  chainId?: ChainId;
}) {
  const menu = useMemo(() => {
    return (
      <Menu
        selectedKeys={chainId ? [chainId.toString()] : ['']}
        items={networkList.map((i) => {
          return {
            key: i.info.chainId,
            label: i.title,
            onClick: () => (onChange || switchNetwork)(i.info),
          };
        })}
      />
    );
  }, [chainId, networkList, onChange]);

  const iconProps = useMemo(() => {
    if (!chainId) return undefined;
    return getIconByChainId(chainId);
  }, [chainId]);

  const isXS = useMediaQueries('xs');
  const name = getNameByChainId(chainId);
  const isLong = name?.length > 10;

  const IconName = useMemo(() => {
    const props = { nameSize: 14, marginRight: 16 };
    if (isLong) {
      props.nameSize = 12;
      if (isXS) props.marginRight = 4;
      else props.marginRight = 10;
    }
    return (
      <Row className="flex-row-center network-row" style={{ fontSize: props.nameSize }}>
        <IconFont type={iconProps?.type || ''} style={{ marginRight: props.marginRight }} />
        <div className="network-name">{name || 'Wrong Network'}</div>
      </Row>
    );
  }, [iconProps?.type, isLong, isXS, name]);
  return (
    <Dropdown
      className={clsx(styles.dropdown, 'cursor-pointer', className)}
      overlayClassName={clsx(styles['dropdown-overlay'], overlayClassName)}
      overlay={menu}
      trigger={['click']}
      getPopupContainer={(triggerNode) => triggerNode}>
      <Row className="flex-row-center">
        {IconName}
        <div className="network-icon">
          <IconFont type="Search" />
        </div>
      </Row>
    </Dropdown>
  );
}
