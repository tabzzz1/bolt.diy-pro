import { format, isAfter, isThisWeek, isThisYear, isToday, isYesterday, subDays } from 'date-fns';
import type { Locale } from 'date-fns';
import type { ChatHistoryItem } from '~/lib/persistence';

type Bin = { category: string; items: ChatHistoryItem[] };

/**
 * 固定日期分类标签（Today / Yesterday / Past 30 Days）使用常量 key，
 * 由调用方（Menu.client.tsx）通过 i18n t() 翻译。
 * 动态格式（星期名、月份名）通过 date-fns locale 直接格式化为本地语言。
 */
export function binDates(_list: ChatHistoryItem[], locale?: Locale) {
  const list = _list.toSorted((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const binLookup: Record<string, Bin> = {};
  const bins: Array<Bin> = [];

  list.forEach((item) => {
    const category = dateCategory(new Date(item.timestamp), locale);

    if (!(category in binLookup)) {
      const bin = {
        category,
        items: [item],
      };

      binLookup[category] = bin;

      bins.push(bin);
    } else {
      binLookup[category].items.push(item);
    }
  });

  return bins;
}

function dateCategory(date: Date, locale?: Locale) {
  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisWeek(date)) {
    // e.g., "Mon" (en) / "周一" (zh)
    return format(date, 'EEE', { locale });
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  if (isAfter(date, thirtyDaysAgo)) {
    return 'Past 30 Days';
  }

  if (isThisYear(date)) {
    // e.g., "Jan" (en) / "1月" (zh)
    return format(date, 'LLL', { locale });
  }

  // e.g., "Jan 2023" (en) / "1月 2023" (zh)
  return format(date, 'LLL yyyy', { locale });
}
