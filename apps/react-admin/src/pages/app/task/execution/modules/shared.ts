/** 执行状态 → antd Tag color（与 Vue 端 STATUS_TAG_COLOR 对齐） */
export function statusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
    case 'RETRYING':
      return 'processing';
    case 'PENDING':
      return 'default';
    case 'CONTINUED_AS_NEW':
      return 'blue';
    case 'FAILED':
    case 'TERMINATED':
      return 'error';
    case 'TIMED_OUT':
      return 'warning';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

/** 执行状态 i18n key；未知状态回退原文 */
export function statusLabelKey(status: string): string {
  return `status${status}`;
}

/** 由 startedAt / closedAt 推导耗时展示 */
export function formatDuration(startedAt: string | null | undefined, closedAt: string | null): string {
  if (!startedAt || !closedAt) return '—';
  const start = Date.parse(startedAt);
  const end = Date.parse(closedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';
  const sec = Math.round((end - start) / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
