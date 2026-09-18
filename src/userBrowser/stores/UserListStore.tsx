import { create } from "zustand";
import { _teamsFetch } from "../customFetch";

type UserStruct = {
    name: string;
    email: string;
}

type UserListPage = {
    users: UserStruct[];
}

interface UserListStore {
    userListPages: UserListPage[];
    lastNextPage: string | null;
    lastNextPageForIndex: number;
    token: string;
}

export const useUserListStore = create<UserListStore>(() => {
    return {
        userListPages: [],
        lastNextPage: null,
        lastNextPageForIndex: -1,
        token: ""
    }
});

async function loadPage(url: string, index: number) {
    console.log("LOADING PAGE");
    const token = useUserListStore.getState().token;
    const response = await fetch(url, {
        headers: {
            Authorization: token
        },
        method: 'POST'
    });
    console.log(response.status);
    console.log(response.body);
}

function loadPagesFromBeginning(index: number) {
    loadPage("https://graph.microsoft.com/v1.0/users/", index);
}

function loadPagesUpTo(index: number) {
    
    
    loadPage("https://graph.microsoft.com/v1.0/users/", index);
}

export function getPage(index: number) : UserListPage {
    const currentUserListPages = useUserListStore.getState().userListPages;
    if (index >= currentUserListPages.length) {
        loadPagesUpTo(0);
    }
    return {users: []};
}