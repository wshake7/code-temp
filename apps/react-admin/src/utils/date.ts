import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/** 平台墙钟；无 offset 的 API 字符串按此时区解析。 */
export const PLATFORM_TIMEZONE = 'Asia/Shanghai';

type FormatDate = Date | number | string;

function hasExplicitOffset(raw: string) {
  const value = raw.trim();
  return /Z$/i.test(value) || /[+-]\d{2}:\d{2}$/.test(value);
}

/**
 * 有 offset / Instant 按物理时刻解析；无 offset 字符串当上海墙钟，再转到浏览器本地。
 */
function toDisplayDayjs(time: FormatDate) {
  const displayTz = dayjs.tz.guess();
  if (typeof time === 'number' || time instanceof Date) {
    return dayjs(time).tz(displayTz);
  }
  const raw = String(time);
  if (hasExplicitOffset(raw)) {
    return dayjs(raw).tz(displayTz);
  }
  return dayjs.tz(raw, PLATFORM_TIMEZONE).tz(displayTz);
}

export function formatDate(dateString: string | undefined) {
  if (!dateString) return '';
  const date = toDisplayDayjs(dateString);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '';
}

/** 格式化日期时间；空值返回 '-'。 */
export const formatDateTime = (
  timestamp?: number | string | { seconds: number } | null,
) => {
  if (!timestamp) return '-';
  try {
    let input: FormatDate;
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      input = timestamp.seconds * 1000;
    } else {
      input = timestamp;
    }
    const date = toDisplayDayjs(input);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '-';
  } catch {
    return '-';
  }
};

/** 平台时间字符串 → 毫秒；无法解析返回 NaN。 */
export function parsePlatformMillis(raw: string): number {
  const date = toDisplayDayjs(raw);
  return date.isValid() ? date.valueOf() : Number.NaN;
}

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_PICKER_FORMAT = 'HH:mm:ss';
