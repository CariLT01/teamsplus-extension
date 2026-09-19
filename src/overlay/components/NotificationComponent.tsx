import clsx from "clsx";
import { NotificationType } from "../notificationType";
import { useNotificationStore } from "../stores/NotificationStore";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    id: number;
    type: NotificationType;
    message: string;
    title: string;
}

export function NotificationComponent(props: Props) {
    const removeNotification = useNotificationStore((state) => state.removeNotification);

    let colorStyle = "";
    switch (props.type) {
        case "error":
            colorStyle = "bg-red-600/90 border-red-400/40 text-white";
            break;
        case "info":
            colorStyle = "bg-blue-600/90 border-blue-400/40 text-white";
            break;
        case "warning":
            colorStyle = "bg-amber-500/90 border-amber-300/40 text-white";
            break;
        default:
            colorStyle = "bg-slate-700/90 border-slate-500/40 text-white";
            console.error("Unknown notification type");
            break;
    }

    const notificationStyle = clsx(
        "relative text-xl font-bold pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border backdrop-blur-md transition-all duration-300 animate-fadeIn cursor-pointer",
        colorStyle
    );

    return (
        <div
            className={notificationStyle}
            onClick={() => removeNotification(props.id)}
            role="alert"
        >
            <div className="flex flex-col flex-1 gap-2 mr-2">
                <div className="flex items-center">
                    <span className="font-bold text-2xl flex-1">{props.title}</span>
                </div>

                <span className="flex-1">{props.message}</span>
            </div>

            <button
                className="cursor-pointer absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(props.id);
                }}
                aria-label="Close notification"
            >
                <CloseIcon fontSize="small" style={{ fill: "currentColor" }} />
            </button>
        </div>
    );
}