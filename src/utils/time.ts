import Moment from 'moment';

const getMillisecond = (time: any) => {
  const { seconds } = time || {};
  const tim = seconds || time;
  if (String(tim).length <= 10) {
    return tim * 1000;
  }
  if (typeof tim !== 'number') {
    return Number(tim);
  }
  return tim;
};
export function formatTime(t: string | number, formats = 'YYYY-MM-DD') {
  if (t && typeof t === 'string' && !t.includes('T') && !t.includes('-'))
    return Moment(getMillisecond(t)).format(formats);
  return Moment(t).format(formats);
}
