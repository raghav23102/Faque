import { createRequestHandler } from "@react-router/node";

let requestHandler;

export default async function handler(req, res) {
  try {
    if (!requestHandler) {
      const build = await import("../build/server/index.js");
      requestHandler = createRequestHandler(build);
    }

    // If req is already a Web Request (Vercel Edge/Web API environment)
    if (typeof req.get === "undefined" && req instanceof Request) {
      return requestHandler(req);
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

    // Send Web API Response back to Vercel Node res
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    if (webResponse.body) {
      const arrayBuffer = await webResponse.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Internal Server Error: ${error.message}`);
  }
}
