import { create } from 'zustand';

interface EventLog {
  id: string;
  timestamp: Date;
  type: 'receive' | 'forward' | 'error';
  eventType: string;
  message: string;
}

interface NotificationState {
  isNewSpecialReportAvailable: boolean;
  latestSpecialReportId: string | null;
  setSpecialReportAvailable: (id: string) => void;
  clearSpecialReportNotification: () => void;
}

interface DebugStore {
  isDebugMode: boolean;
  eventLogs: EventLog[];
  toggleDebugMode: () => void;
  addEventLog: (log: Omit<EventLog, 'id' | 'timestamp'>) => void;
  clearEventLogs: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isNewSpecialReportAvailable: false,
  latestSpecialReportId: null,
  setSpecialReportAvailable: (id: string) => set({
    isNewSpecialReportAvailable: true,
    latestSpecialReportId: id
  }),
  clearSpecialReportNotification: () => set({
    isNewSpecialReportAvailable: false
  })
}));

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