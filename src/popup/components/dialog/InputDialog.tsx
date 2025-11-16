import { ReactNode, useRef } from "react";
import { Button } from "../Button";
import { useInputDialogStore } from "../../store/InputDialogStore";


export function InputDialog() {
    const visible = useInputDialogStore((state) => state.visible);
    const title = useInputDialogStore((state) => state.title);
    const callback = useInputDialogStore((state) => state.callback);
    const inputRef = useRef<HTMLInputElement>(null);
    const setVisible = useInputDialogStore((state) => state.setVisible);

    if (!visible) return null;

    const onSubmitButtonClicked = () => {
        if (inputRef.current == null ) return;
        setVisible(false);

        callback(inputRef.current.value);
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50">
            <div className="fixed px-2 py-2 bg-white shadow-lg border border-black/35 flex flex-col gap-4 items-center rounded-md top-[50%] left-[50%] -translate-[50%]">
                <h2 className="text-3xl">{title}</h2>
                <input
                    type="text"
                    className="w-[85%] px-2 py-1 border border-black/35 focus:border-black/50 rounded-md"
                    ref={inputRef}
                ></input>
                <Button
                    isSecondary={false}
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#1f1f1f"
                        >
                            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                        </svg>
                    }
                    onClick={onSubmitButtonClicked}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
