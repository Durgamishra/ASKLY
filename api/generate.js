const axios = require("axios");

module.exports = async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(
            "https://backend-askly-beige.vercel.app/",
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
