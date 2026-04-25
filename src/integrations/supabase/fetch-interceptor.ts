// Global fetch interceptor that attaches the Supabase access token to
// same-origin server function calls (e.g. /api/* used by createServerFn).
// This must be installed once on the client so that server functions
// guarded by requireSupabaseAuth receive an Authorization header.
import { supabase } from "./client";

let installed = false;

export function installSupabaseAuthFetch() {
  if (installed) return;
  if (typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // Determine the URL string for same-origin check.
      let urlStr: string | null = null;
      if (typeof input === "string") urlStr = input;
      else if (input instanceof URL) urlStr = input.toString();
      else if (input instanceof Request) urlStr = input.url;

      const isSameOrigin =
        !!urlStr &&
        (urlStr.startsWith("/") ||
          (urlStr.startsWith(window.location.origin) && !urlStr.startsWith("//")));

      if (!isSameOrigin) return originalFetch(input as RequestInfo, init);

      // Don't override an Authorization header that the caller already set.
      const existingHeaders = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (existingHeaders.has("authorization")) {
        return originalFetch(input as RequestInfo, init);
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return originalFetch(input as RequestInfo, init);

      existingHeaders.set("Authorization", `Bearer ${token}`);

      // Rebuild init / Request with the merged headers.
      if (input instanceof Request) {
        const newReq = new Request(input, { headers: existingHeaders });
        return originalFetch(newReq, init);
      }
      return originalFetch(input as RequestInfo, { ...(init ?? {}), headers: existingHeaders });
    } catch {
      return originalFetch(input as RequestInfo, init);
    }
  };
}
