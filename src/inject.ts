// Declare custom property on the global Window interface

import { ExtensionStorageProvider } from "./storage/ExtensionStorageProvider";

((): void => {

  // Store reference to native fetch
  const originalFetch: typeof window.fetch = window.fetch;

  // Override window.fetch
  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    
    // Resolve URL string safely
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    }


    console.log("[DEBUG] Passed through URL: ", url);

    // Resolve HTTP method safely (defaults to GET)
    let method = 'GET';
    if (init?.method) {
      method = init.method;
    } else if (input instanceof Request && input.method) {
      method = input.method;
    }
    method = method.toUpperCase();

    // Check interception conditions
    const isTargetEndpoint =
      url.includes('/properties') && url.includes('name=consumptionhorizon');

    if (await ExtensionStorageProvider.loadKey("stealthRead") && method === 'PUT' && isTargetEndpoint) {
      console.log('Intercepted outgoing read receipt payload');

      // Return synthetic Response object matching standard Fetch API
      return new Response(
        JSON.stringify({ status: 'success', message: 'Intercepted' }),
        {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        }
      );
    }

    // Pass through all other requests to standard fetch implementation
    return originalFetch.apply(this, [input, init]);
  };
})();