import { HappyHour } from '../types/happy-hour';

const formatHappyHours = (happyHours: HappyHour[] | null): string => {
  if (!happyHours || happyHours.length === 0) return 'No happy hours listed';

  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const dayGroups: Record<string, Set<string>> = {};
  
  happyHours.forEach((hour) => {
    if (!hour.day || !hour.start_time || !hour.end_time) return;
    
    if (!dayGroups[hour.day]) {
      dayGroups[hour.day] = new Set<string>();
    }
    dayGroups[hour.day]?.add(`${hour.start_time}-${hour.end_time}`);
  });

  const timeGroupings: Record<string, string[]> = {};
  
  Object.entries(dayGroups).forEach(([day, times]) => {
    const timeKey = Array.from(times).sort().join(', ');
    if (!timeGroupings[timeKey]) {
      timeGroupings[timeKey] = [];
    }
    timeGroupings[timeKey].push(day);
  });

  const formattedGroups = Object.entries(timeGroupings).map(([times, days]) => {
    days.sort((a, b) => {
      const aOrder = typeof a === 'string' ? (dayOrder[a] ?? 0) : 0;
      const bOrder = typeof b === 'string' ? (dayOrder[b] ?? 0) : 0;
      return aOrder - bOrder;
    });

    const ranges: string[] = [];

    if (days.length === 1) {
      const day = days[0];
      if (day) {
        ranges.push(`<span class="font-medium text-gray-100">${day}</span>`);
      }
    } else {
      let rangeStart: string | undefined = days[0];
      let prev: string | undefined = days[0];

      for (let i = 1; i < days.length; i++) {
        const current: string | undefined = days[i];
        
        if (!prev || !current) continue;

        const prevDayOrder: number = typeof prev === 'string' ? (dayOrder[prev] ?? 0) : 0;
        const currentDayOrder: number = typeof current === 'string' ? (dayOrder[current] ?? 0) : 0;

        if (currentDayOrder - prevDayOrder === 1) {
          prev = current;

          if (i === days.length - 1) {
            if (rangeStart && prev) {
              ranges.push(rangeStart === prev 
                ? `<span class="font-medium text-gray-100">${rangeStart}</span>` 
                : `<span class="font-medium text-gray-100">${rangeStart}-${prev}</span>`);
            }
          }
        } else {
          if (rangeStart && prev) {
            ranges.push(rangeStart === prev 
              ? `<span class="font-medium text-gray-100">${rangeStart}</span>` 
              : `<span class="font-medium text-gray-100">${rangeStart}-${prev}</span>`);
          }

          rangeStart = current;
          prev = current;

          if (i === days.length - 1) {
            if (current) {
              ranges.push(`<span class="font-medium text-gray-100">${current}</span>`);
            }
          }
        }
      }
    }

    return `${ranges.join(', ')} •  <span class="text-white">${times}</span>`;
  });

  return formattedGroups.join('\n');
};

export default formatHappyHours;
