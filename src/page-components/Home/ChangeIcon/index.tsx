import clsx from 'clsx';
import CommonImage from 'components/CommonImage';
import { changeEnd, changeWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import { useThrottleCallback } from 'hooks';
import Change from 'assets/images/change.svg';
import styles from './styles.module.less';
const time = 500;
export default function ChangeIcon() {
  const { dispatch } = useWalletActions();
  const onChange = useThrottleCallback(() => {
    dispatch(changeWallet());
    setTimeout(() => {
      dispatch(changeEnd());
    }, time);
  }, [dispatch, changeWallet]);
  return (
    <div className={clsx('flex-center', styles['change-body'])}>
      <CommonImage
        priority
        className={clsx('cursor-pointer', styles['change-icon'])}
        src={Change}
        onClick={() => onChange()}
      />
    </div>
  );
}
