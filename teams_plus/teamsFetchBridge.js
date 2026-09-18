// hacky code
(function () {
    if (window.__teamsFetchInjected) return;
    window.__teamsFetchInjected = true;

    window.addEventListener("message", async (event) => {
        if (event.data?.type === "RUN_FETCH") {
            const { id, url, options } = event.data;

            try {
                const res = await fetch(url, {
                    ...options,
                    credentials: "include"
                });

                const text = await res.text();

                window.postMessage({
                    id,
                    response: { status: res.status, body: text }
                }, "*");
            } catch (err) {
                window.postMessage({
                    id,
                    response: { error: err.message }
                }, "*");
            }
        }
    });

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const [url, options] = args;

        if (options?.headers?.Authorization) {
            console.log("TOKEN:", options.headers.Authorization);
        }

        return originalFetch(...args);
    };

    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        this._method = method;
        return origOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
        if (!this._headers) this._headers = {};
        this._headers[key] = value;

        return origSetRequestHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        // BEFORE request is sent
        if (this._headers?.Authorization) {
            console.log("XHR TOKEN:", this._headers.Authorization);
            window.postMessage({type: "DELVE_TOKEN", token: this._headers.Authorization}, "*");
        }

        this.addEventListener("load", function () {
            try {
                if (this.responseType === "" || this.responseType === "text") {
                    console.log("XHR response:", this.responseText);
                }
            } catch (e) { }
        });

        return origSend.apply(this, arguments);
    };
})();