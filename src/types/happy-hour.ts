export interface HappyHour {
  day: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface Deal {
  name: string | null;
  price: string | null;
  category?: string | null;
}
