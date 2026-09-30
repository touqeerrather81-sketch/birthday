export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Root URL -> normal birthday page
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url), request)
      );
    }

    // Token URL
    const token = url.pathname
      .split("/")
      .filter(Boolean)[0];

    if (!token) {
      return new Response("Invalid or missing birthday link.", {
        status: 404,
      });
    }

    // Check token
    const used = await env.tokens.get(token);

    if (used) {
      return new Response(
        "This birthday link has already been used.",
        {
          status: 410,
          headers: {
            "Content-Type": "text/plain; charset=UTF-8",
          },
        }
      );
    }

    // Mark as used
    await env.tokens.put(token, "used");

    // Show birthday page
    return env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url), request)
    );
  },
};