const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {

    try {

        const response = await axios.post(
            "https://backend-askly-enf76s0ed-durgamishras-projects.vercel.app/generate",
            req.body
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            response: "Backend connection failed"
        });
    }
});

app.listen(3000, () => {
    console.log(
        "Frontend Server Running: http://localhost:3000"
    );
});
