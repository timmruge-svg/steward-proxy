const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());
app.options("*", cors());

app.post("/api/chat", (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";
    apiRes.on("data", (chunk) => { data += chunk; });
    apiRes.on("end", () => {
      try {
        res.status(apiRes.statusCode).json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: "Failed to parse response", raw: data });
      }
    });
  });

  apiReq.on("error", (e) => {
    console.error("Request error:", e.message);
    res.status(500).json({ error: e.message });
  });

  apiReq.write(body);
  apiReq.end();
});

app.get("/", (req, res) => {
  res.json({ status: "Steward proxy is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Steward proxy running on port ${PORT}`));
