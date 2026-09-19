import { create } from "zustand";
import { Notification } from "../notificationType";

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        set((state) => ({
            notifications: [...state.notifications, notification],
        }));
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
}));