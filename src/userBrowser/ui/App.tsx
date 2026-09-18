import { useEffect } from "react";
import { PersonItem } from "./PersonItem";
import { getPage, useUserListStore } from "../stores/UserListStore";

export function UserBrowserApp() {

    const token = useUserListStore(state => state.token);

    useEffect(() => {
        console.log("TOKEN CHANGED");
        getPage(0);
    }, [token]);

    return (
        <div className="tailwind-root">
            <div className="pointer-events-auto fixed w-[40vw] h-[60vh] top-[50%] left-[50%] -translate-[50%] z-99 bg-white rounded-md border border-black/15 shadow-md py-2">
                <div className="flex flex-col h-full">
                    <div className="flex flex-col flex-grow-1 overflow-y-auto overflow-x-hidden w-full">
                        <div className="flex flex-col gap-1 items-center">
                            <h1 className="font-bold text-4xl text-black">
                                People List
                            </h1>
                            <span className="text-black/50">
                                You search for people...
                            </span>
                        </div>

                        {token == "" && <div className="w-100 items-center flex flex-col gap-2 py-4">
                            <span className="text-black/50">No token was successfully captured.<br></br>Cannot search for users without an access token.<br></br>Try reloading?</span>
                        </div>}
                        <PersonItem
                            name="Bob Robert"
                            email="bobrobert@gmail.com"
                        ></PersonItem>
                        <PersonItem
                            name="Bob Robert"
                            email="bobrobert@gmail.com"
                        ></PersonItem>
                        <PersonItem
                            name="Bob Robert"
                            email="bobrobert@gmail.com"
                        ></PersonItem>
                        <PersonItem
                            name="Bob Robert"
                            email="bobrobert@gmail.com"
                        ></PersonItem>
                        <PersonItem
                            name="Bob Robert"
                            email="bobrobert@gmail.com"
                        ></PersonItem>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <div className="flex items-center py-2 gap-2">
                            <button className="rounded-md bg-black/5 border border-black/15 px-2 py-2 hover:bg-black/10 transition-colors cursor-pointer">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#1f1f1f"
                                >
                                    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
                                </svg>
                            </button>
                            <span className="px-2 py-2 font-bold text-black text-3xl">5</span>
                            <button className="rounded-md bg-black/5 border border-black/15 px-2 py-2 hover:bg-black/10 transition-colors cursor-pointer">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#1f1f1f"
                                >
                                    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
