export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    return new Response(
      "WORKER IS WORKING\nPath: " + url.pathname,
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );
  }
};