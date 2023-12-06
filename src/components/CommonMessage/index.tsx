import { message } from 'antd';

class CommonMessage {
  error(text: any) {
    if (/((You closed the prompt with out any action)|(Operation canceled))/.test(text)) {
      return message.error('Request rejected. eBridge needs your permission to continue.');
    }
    message.error(text);
  }
}

export default new CommonMessage();
