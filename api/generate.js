const axios = require("axios");

module.exports = async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(
            "https://backend-askly-enf76s0ed-durgamishras-projects.vercel.app/generate",
            { prompt }
        );

        res.status(200).json(response.data);

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            response: "Backend connection failed"
        });
    }
};
