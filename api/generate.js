const axios = require("axios");

module.exports = async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(
            "https://backend-askly-six.vercel.app/generate",
            { prompt }
        );

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Backend Error:", error.response?.data || error.message);

        res.status(500).json({
            response: "Backend connection failed"
        });
    }
};
