import { create } from 'zustand';
import { Trip, Activity, Expense } from '../types';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  activities: Activity[];
  expenses: Expense[];
  setTrips: (trips: Trip[]) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setActivities: (activities: Activity[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  subscribeToTrips: (uid: string) => () => void;
  subscribeToActivities: (tripId: string) => () => void;
  subscribeToExpenses: (tripId: string) => () => void;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => Promise<string>;
  addActivity: (tripId: string, activity: Omit<Activity, 'id'>) => Promise<void>;
  deleteActivity: (tripId: string, activityId: string) => Promise<void>;
  addExpense: (tripId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (tripId: string, expenseId: string) => Promise<void>;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  activeTrip: null,
  activities: [],
  expenses: [],

  setTrips: (trips) => set({ trips }),
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setActivities: (activities) => set({ activities }),
  setExpenses: (expenses) => set({ expenses }),

  subscribeToTrips: (uid) => {
    const q = query(collection(db, 'trips'), where('members', 'array-contains', uid));
    return onSnapshot(q, (snap) => {
      const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trip));
      set({ trips });
    });
  },

  subscribeToActivities: (tripId) => {
    const q = collection(db, 'trips', tripId, 'activities');
    return onSnapshot(q, (snap) => {
      const activities = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
      activities.sort((a, b) => a.time.localeCompare(b.time));
      set({ activities });
    });
  },

  subscribeToExpenses: (tripId) => {
    const q = collection(db, 'trips', tripId, 'expenses');
    return onSnapshot(q, (snap) => {
      const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      expenses.sort((a, b) => b.date.localeCompare(a.date));
      set({ expenses });
    });
  },

  addTrip: async (tripData) => {
    const ref = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  addActivity: async (tripId, activity) => {
    await addDoc(collection(db, 'trips', tripId, 'activities'), activity);
  },

  deleteActivity: async (tripId, activityId) => {
    await deleteDoc(doc(db, 'trips', tripId, 'activities', activityId));
  },

  addExpense: async (tripId, expense) => {
    await addDoc(collection(db, 'trips', tripId, 'expenses'), expense);
    // Update spent amount in trip budget
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      [`budget.categories.${expense.category}`]: expense.amount,
    });
  },

  deleteExpense: async (tripId, expenseId) => {
    await deleteDoc(doc(db, 'trips', tripId, 'expenses', expenseId));
  },
}));
