import { create } from "zustand";

type DialogButton = {
    text: string;
    primary: boolean;
};

type DialogContent = {
    title: string;
    content: string;
    buttons: DialogButton[];
    id: number;
    image: string;
};

interface MessageDialogQueue {
    dialogs: DialogContent[];
    finishedDialogs: { [k: number]: string };

    addDialog: (dialog: DialogContent) => void;
    popDialog: () => void;
    addFinishedDialog: (id: number, result: string) => void;
};

export const useMessageDialogQueue = create<MessageDialogQueue>((set) => {
    return {
        dialogs: [],
        finishedDialogs: {},

        addDialog: (dialog) => {
            set(state => {
                return {
                    dialogs: [dialog, ...state.dialogs]
                };
            })
        },
        popDialog: () => {
            set(state => {
                const diag = state.dialogs.pop();

                return {
                    dialogs: [...state.dialogs]
                };
            })
        },
        addFinishedDialog: (id, result) => {
            set(state => {
                state.finishedDialogs[id] = result;
                return {
                    finishedDialogs: {...state.finishedDialogs}
                };
            })
        }
    };
}) 