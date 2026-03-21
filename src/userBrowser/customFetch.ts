type TeamsFetchOptions = RequestInit;

interface TeamsFetchResponse {
    status?: number;
    body?: string;
    error?: string;
}

export function _teamsFetch(
    url: string,
    options: TeamsFetchOptions = {}
): Promise<TeamsFetchResponse> {
    return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).slice(2);

        function handler(event: MessageEvent) {
            if (event.source !== window) return;
            if (event.data?.id === id) {
                window.removeEventListener("message", handler);
                resolve(event.data.response as TeamsFetchResponse);
            }
        }

        window.addEventListener("message", handler);

        window.postMessage(
            {
                type: "RUN_FETCH",
                id,
                url,
                options,
            },
            "*",
        );
    });
}