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
  const formattedLines = happyHours
    .map((hour) => {
      if (!hour.day || !hour.start_time || !hour.end_time) return null;
      return {
        day: hour.day,
        order: dayOrder[hour.day] ?? 8,
        text: `${hour.day} • ${hour.start_time}-${hour.end_time}`,
      };
    })
    .filter((line): line is { day: string; order: number; text: string } => line !== null)
    .sort((a, b) => a.order - b.order)
    .map((line) => line.text);

  return [...new Set(formattedLines)].join('\n');
};

export default formatHappyHours;
