import { MessageDialog } from "./components/MessageDialog";
import { MessageDialogRenderer } from "./components/MessageDialogRenderer";
import { NotificationRenderer } from "./components/NotificationRenderer";

export function OverlayApp() {
    return (
        <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
            <NotificationRenderer />
            <MessageDialogRenderer></MessageDialogRenderer>
        </div>
    );
}