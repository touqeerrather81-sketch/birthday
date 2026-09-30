export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Token URL se nikalo
    const token = url.pathname.split("/").filter(Boolean)[0];

    // Root URL par
    if (!token) {
      return new Response("Invalid or missing birthday link.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
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
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        }
      );
    }

    // Immediately mark as used
    await env.tokens.put(token, "used");

    // Birthday page
    const newUrl = new URL(request.url);
    newUrl.pathname = "/index.html";

    const newRequest = new Request(newUrl, request);

    const response = await env.ASSETS.fetch(newRequest);

    // Browser ko page cache/restore karne se rokna
    const newResponse = new Response(response.body, response);

    newResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    newResponse.headers.set("Pragma", "no-cache");

    return newResponse;
  }
};