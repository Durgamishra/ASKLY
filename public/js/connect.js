async function generateResponse(prompt) {
    try {

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const data = await response.json();

        if (!data || !data.response) {
            throw new Error("Invalid response");
        }

        startAIResponseSequence(data.response);

    } catch (error) {

        console.error(error);

        startAIResponseSequence(
            "❌ Unable to connect to the AI backend."
        );
    }
}
