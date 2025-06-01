import { create } from 'zustand';

interface EventLog {
  id: string;
  timestamp: Date;
  type: 'receive' | 'forward' | 'error';
  eventType: string;
  message: string;
}

interface DebugStore {
  isDebugMode: boolean;
  eventLogs: EventLog[];
  toggleDebugMode: () => void;
  addEventLog: (log: Omit<EventLog, 'id' | 'timestamp'>) => void;
  clearEventLogs: () => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
  isDebugMode: false,
  eventLogs: [],
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  addEventLog: (log) => set((state) => ({
    eventLogs: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...log
      },
      ...state.eventLogs.slice(0, 99) // Keep last 100 logs
    ]
  })),
  clearEventLogs: () => set({ eventLogs: [] })
}));