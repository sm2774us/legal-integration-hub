export interface DailyAlertTrend {
  date: string;
  displayDate: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
}

export function generate30DayTrendData(): DailyAlertTrend[] {
  const result: DailyAlertTrend[] = [];
  const now = new Date('2026-09-25T00:00:00Z');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const displayDate = `${month} ${day}`;

    // Synthetic trend simulation with noticeable peaks around major deal dates
    let criticalBase = Math.floor(Math.random() * 3);
    let warningBase = Math.floor(2 + Math.random() * 5);
    let infoBase = Math.floor(4 + Math.random() * 8);

    // Peak near Sept 20-24 (Apex $4.8B M&A CFIUS filings)
    if (i <= 5 && i >= 1) {
      criticalBase += Math.floor(2 + Math.random() * 3);
      warningBase += Math.floor(4 + Math.random() * 5);
    }

    result.push({
      date: dateStr,
      displayDate,
      critical: criticalBase,
      warning: warningBase,
      info: infoBase,
      total: criticalBase + warningBase + infoBase
    });
  }

  return result;
}
