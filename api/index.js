import { createRequestHandler } from "@react-router/node";

let requestHandler;

export default async function handler(req, res) {
  try {
    if (!requestHandler) {
      const build = await import("../build/server/index.js");
      requestHandler = createRequestHandler(build);
    }

    // Convert Node.js IncomingMessage (req) to Web API Request
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      init.body = Buffer.concat(buffers);
    }

    const webRequest = new Request(url.href, init);
    const webResponse = await requestHandler(webRequest);

    // Send Status and Headers back to Node res
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    // Safely send body text/data without arrayBuffer null crashes
    const responseText = await webResponse.text();
    res.end(responseText);
  } catch (error) {
    console.error("Vercel Function Error Details:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>500 Internal Server Error</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;">
          <h2>Serverless Function Diagnostic Log</h2>
          <p style="color: #ef4444; font-weight: bold;">Error: ${error.message}</p>
          <pre style="background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto; color: #94a3b8;">${error.stack}</pre>
        </body>
      </html>
    `);
  }
}
