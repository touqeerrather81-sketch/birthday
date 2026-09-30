export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Homepage: normal birthday website
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return env.ASSETS.fetch(request);
    }

    // Get token from URL
    // Example: /test123
    const token = url.pathname
      .split("/")
      .filter(Boolean)[0];

    // No token
    if (!token) {
      return new Response("Invalid or missing birthday link.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      });
    }

    // Check whether token has already been used
    const used = await env.tokens.get(token);

    if (used) {
      return new Response(
        "This birthday link has already been used.",
        {
          status: 410,
          headers: {
            "Content-Type": "text/plain; charset=UTF-8"
          }
        }
      );
    }

    // Mark token as used
    await env.tokens.put(token, "used");

    // Serve the birthday website
    const pageUrl = new URL("/index.html", request.url);

    return env.ASSETS.fetch(
      new Request(pageUrl, request)
    );
  }
};