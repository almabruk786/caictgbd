import { 
  format, 
  startOfToday, 
  endOfToday, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear,
  isWithinInterval,
  parseISO
} from 'date-fns';

export type DateRangePreset = 
  | 'today' 
  | 'thisWeek' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'last3Months' 
  | 'thisYear' 
  | 'all' 
  | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  preset: DateRangePreset;
}

export function getDateRangeFromPreset(preset: DateRangePreset): { startDate: string; endDate: string } {
  const now = new Date();
  
  switch (preset) {
    case 'today':
      return {
        startDate: format(startOfToday(), 'yyyy-MM-dd'),
        endDate: format(endOfToday(), 'yyyy-MM-dd')
      };
    case 'thisWeek':
      return {
        startDate: format(startOfWeek(now, { weekStartsOn: 6 }), 'yyyy-MM-dd'), // Saturday in Bangladesh
        endDate: format(endOfWeek(now, { weekStartsOn: 6 }), 'yyyy-MM-dd')
      };
    case 'thisMonth':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    case 'lastMonth': {
      const prevMonth = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(prevMonth), 'yyyy-MM-dd')
      };
    }
    case 'last3Months': {
      const threeMonthsAgo = subMonths(now, 3);
      return {
        startDate: format(startOfMonth(threeMonthsAgo), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    }
    case 'thisYear':
      return {
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(endOfYear(now), 'yyyy-MM-dd')
      };
    case 'all':
    default:
      return {
        startDate: '2020-01-01',
        endDate: '2030-12-31'
      };
  }
}

export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  try {
    const target = parseISO(dateStr);
    const start = parseISO(startDate);
    const end = parseISO(endDate + 'T23:59:59');
    return isWithinInterval(target, { start, end });
  } catch {
    return true;
  }
}

export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTimeDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}
