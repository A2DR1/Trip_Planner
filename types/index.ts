export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverEmoji: string;
  coverColor: string;
  members: string[];
  memberNames: Record<string, string>;
  budget: Budget;
  createdBy: string;
  createdAt: string;
}

export interface Budget {
  total: number;
  currency: string;
  categories: Record<string, number>;
}

export interface Activity {
  id: string;
  title: string;
  location: string;
  time: string;
  notes: string;
  emoji: string;
  day: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  splitAmong: string[];
  date: string;
  emoji: string;
}

export interface DayItinerary {
  date: string;
  activities: Activity[];
}
