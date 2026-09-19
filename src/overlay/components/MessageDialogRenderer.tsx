import { ReactNode } from "react";
import { useMessageDialogQueue } from "../stores/MessageDialogQueue";
import { MessageDialog } from "./MessageDialog";

export function MessageDialogRenderer() {
    
    const dialogs = useMessageDialogQueue(state => state.dialogs);
    const addFinishedDialog = useMessageDialogQueue(state => state.addFinishedDialog);
    const popDialog = useMessageDialogQueue(state => state.popDialog);

    let element: ReactNode = <></>

    if (dialogs.length > 0) {
        const diag = dialogs[0]!;


        element = <MessageDialog title={diag.title} content={diag.content} buttons={diag.buttons} onClick={(result) => {
            addFinishedDialog(diag.id, result);
            popDialog();
        }} imageSource={diag.image} key={diag.id}></MessageDialog>
    }

    return element;

}