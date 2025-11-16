import { ReactNode } from "react";
import { create } from "zustand";

type ContextMenuOption = {
    text: string;
    icon: ReactNode;
    callback: () => void;
}

interface ContextMenuStore {
    positionX: number;
    positionY: number;
    visible: boolean;
    options: ContextMenuOption[];
    setVisible: (v: boolean) => void;
}

export const useContextMenuStore = create<ContextMenuStore>((set) => ({
    positionX: 0,
    positionY: 0,
    visible: false,
    options: [],

    setVisible: (v: boolean) => {
        set({visible: v});
    }
}));

export function openContextMenu(options: ContextMenuOption[], ele: HTMLElement) {

    const rect = ele.getBoundingClientRect();

    const x = rect.left;
    const y = rect.top;

    useContextMenuStore.setState({
        positionX: x,
        positionY: y,
        visible: true,
        options: options
    });
}