import { create } from "zustand";

interface UserInputDialogStore {
    title: string;
    visible: boolean;
    callback: (v: string) => void;
    setVisible: (v: boolean) => void;
}

export const useInputDialogStore = create<UserInputDialogStore>((set) => ({
    title: "",
    visible: false,
    callback: (v: string) => {},

    setVisible: (v: boolean) => {
        set({ visible: false });
    },
}));

export function createInputDialog(
    title: string,
    callback: (v: string) => void
) {
    console.log("Creating input dialog");
    useInputDialogStore.setState({
        title: title,
        visible: true,
        callback: callback,
    });
}
