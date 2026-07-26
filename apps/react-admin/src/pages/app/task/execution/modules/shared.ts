/** 执行状态 → antd Tag color */
export function statusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
    case 'CONTINUED_AS_NEW':
      return 'processing';
    case 'FAILED':
    case 'TIMED_OUT':
      return 'error';
    case 'CANCELLED':
    case 'TERMINATED':
      return 'default';
    default:
      return 'default';
  }
}

/** 由 startedAt / closedAt 推导耗时展示 */
export function formatDuration(startedAt: string, closedAt: string | null): string {
  if (!closedAt) return '—';
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
