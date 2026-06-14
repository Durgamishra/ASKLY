// ===============================
// Backend Call
// ===============================

async function generateResponse(prompt) {
    try {

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const data = await response.json();

        startAIResponseSequence(data.response);

    } catch (error) {

        console.error(error);

        startAIResponseSequence(
            "❌ Unable to connect to the AI backend."
        );
    }
}

// ===============================
// Send Prompt
// ===============================

async function sendPrompt() {

    const prompt = textarea.value.trim();

    if (!prompt) return;

    submitBtn.classList.add("loading");
    textarea.disabled = true;

    await generateResponse(prompt);

    submitBtn.classList.remove("loading");
    submitBtn.classList.remove("active");

    textarea.disabled = false;

    textarea.value = "";
    textarea.style.height = "24px";

    textarea.focus();
}

// ===============================
// Submit Button
// ===============================

submitBtn.addEventListener("click", sendPrompt);

// ===============================
// Enter Key Support
// ===============================

textarea.addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        if (textarea.value.trim()) {
            sendPrompt();
        }
    }
});

// ===============================
// Copy Function
// ===============================

function copyText() {

    const textToCopy = typedTextElement.textContent;

    navigator.clipboard.writeText(textToCopy)
        .then(() => {

            copyBtn.classList.add("success");

            copyTextLabel.textContent = "Copied!";

            copyIcon.innerHTML =
                '<polyline points="20 6 9 17 4 12"></polyline>';

            setTimeout(() => {

                copyBtn.classList.remove("success");

                copyTextLabel.textContent = "Copy";

                copyIcon.innerHTML = `
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                `;

            }, 2000);

        })
        .catch(err => {
            console.error(err);
        });
}

// ===============================
// Welcome Message
// ===============================

window.addEventListener("load", () => {

    typedTextElement.textContent =
        "👋 Welcome to Askly AI. Enter a prompt to begin.";

    outputState.classList.add("visible");
});
