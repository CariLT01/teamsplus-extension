
export type NotificationType = "error" | "warning" | "info";

export type Notification = {
    id: number,
    title: string,
    message: string,
    type: NotificationType
};