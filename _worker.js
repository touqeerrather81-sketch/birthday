export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Homepage
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const response = await env.ASSETS.fetch(request);

      const headers = new Headers(response.headers);
      headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      );
      headers.set("Pragma", "no-cache");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    // Get the one-time token from the URL
    // Example:
    // https://birthday-4al.pages.dev/AYESHA2026

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    const token = decodeURIComponent(parts[0] || "").trim();

    // No token
    if (!token) {
      return new Response("Invalid or missing birthday link.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      });
    }

    // Check KV
    const alreadyUsed = await env.tokens.get(token);

    // Link was already opened
    if (alreadyUsed) {
      return new Response(
        "This birthday link has already been used.",
        {
          status: 410,
          headers: {
            "Content-Type": "text/plain; charset=UTF-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
          }
        }
      );
    }

    // Mark the link as USED immediately
    await env.tokens.put(token, "used");

    // Open the original birthday page
    const pageUrl = new URL(request.url);

    pageUrl.pathname = "/index.html";

    // Send the token/name to index.html
    pageUrl.search = "?name=" + encodeURIComponent(token);

    const pageRequest = new Request(pageUrl, request);

    const response = await env.ASSETS.fetch(pageRequest);

    // Prevent browser from restoring/caching the birthday page
    const headers = new Headers(response.headers);

    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};