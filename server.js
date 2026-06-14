const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// health check route (important for debugging)
app.get("/", (req, res) => {
    res.send("Askly frontend running on Vercel 🚀");
});

// API route
app.post("/api/generate", async (req, res) => {
    try {
        const response = await axios.post(
            "https://backend-askly-enf76s0ed-durgamishras-projects.vercel.app/generate",
            req.body
        );

        res.json(response.data);

    } catch (error) {
        console.error("Error:", error.message);

        res.status(500).json({
            response: "Backend connection failed"
        });
    }
});

// VERY IMPORTANT for Vercel
module.exports = app;
