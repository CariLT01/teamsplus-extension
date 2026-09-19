import { useNotificationStore } from "../stores/NotificationStore";
import { NotificationComponent } from "./NotificationComponent";

export function NotificationRenderer() {
    const notifications = useNotificationStore((state) => state.notifications);

    return (
        <div className="fixed top-4 right-4 z-[999999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {notifications.map((v) => (
                <NotificationComponent
                    key={v.id}
                    id={v.id}
                    type={v.type}
                    title={v.title}
                    message={v.message}
                />
            ))}
        </div>
    );
}