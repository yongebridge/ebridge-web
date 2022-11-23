import { Input, InputProps, Row } from 'antd';
import { useState } from 'react';
import { parseInputChange } from 'utils/input';
import { isValidPositiveNumber } from 'utils/reg';
import styles from './styles.module.less';
export default function InputRow({ value: propsValue, onChange, className }: InputProps) {
  const [value, setValue] = useState<string>('');
  return (
    <Row className={styles['input-row']}>
      <Input
        className={className}
        placeholder="0.0"
        value={propsValue !== undefined ? propsValue : value}
        onChange={(e) => {
          const { value } = e.target;
          if (value && !isValidPositiveNumber(value)) return;
          propsValue === undefined && setValue(parseInputChange(value));
          onChange?.(e);
        }}
      />
    </Row>
  );
}
