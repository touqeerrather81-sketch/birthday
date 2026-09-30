export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Token URL se nikalo
    const token = url.pathname.split("/").filter(Boolean)[0];

    // Root URL par instructions
    if (!token) {
      return new Response("Invalid or missing birthday link.", {
        status: 404,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Check whether token already exists
    const used = await env.tokens.get(token);

    if (used) {
      return new Response(
        "This birthday link has already been used.",
        {
          status: 410,
          headers: { "Content-Type": "text/plain; charset=UTF-8" }
        }
      );
    }

    // Token ko immediately used mark karo
    await env.tokens.put(token, "used");

    // Original birthday page serve karo
    const newUrl = new URL(request.url);
    newUrl.pathname = "/index.html";

    const newRequest = new Request(newUrl, request);

    return env.ASSETS.fetch(newRequest);
  }
};