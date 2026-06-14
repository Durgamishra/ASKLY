// ===============================
// Boot
// ===============================

initPreload();

const textarea = document.querySelector(".ai-textarea");
const submitBtn = document.querySelector(".ai-submit");

// ===============================
// Elements
// ===============================

const thinkingState = document.getElementById("thinkingState");
const outputState = document.getElementById("outputState");
const typedTextElement = document.getElementById("typedText");
const cursor = document.getElementById("cursor");

const copyBtn = document.getElementById("copyBtn");
const copyIcon = document.getElementById("copyIcon");
const copyTextLabel = document.getElementById("copyText");

let typeoutTimeout;

// ===============================
// Auto Resize Textarea
// ===============================

textarea.addEventListener("input", function () {

    this.style.height = "24px";

    const newHeight = Math.min(this.scrollHeight, 150);
    this.style.height = newHeight + "px";

    if (this.scrollHeight > 150) {
        this.style.overflowY = "auto";
    } else {
        this.style.overflowY = "hidden";
    }

    if (this.value.trim().length > 0) {
        submitBtn.classList.add("active");
    } else {
        submitBtn.classList.remove("active");
    }
});

// ===============================
// Typing Effect
// ===============================

function typeText(text, index = 0) {

    if (index < text.length) {

        typedTextElement.textContent += text.charAt(index);

        let delay = Math.random() * 20 + 10;

        const char = text.charAt(index);

        if (char === "." || char === "\n") {
            delay += 200;
        } else if (char === ",") {
            delay += 100;
        }

        typeoutTimeout = setTimeout(() => {
            typeText(text, index + 1);
        }, delay);

    } else {

        cursor.classList.add("hidden");
        copyBtn.classList.add("visible");
    }
}

// ===============================
// Output Controller
// ===============================

function startAIResponseSequence(text) {

    clearTimeout(typeoutTimeout);

    thinkingState.classList.remove("hidden");
    outputState.classList.remove("visible");

    typedTextElement.textContent = "";

    cursor.classList.remove("hidden");
    copyBtn.classList.remove("visible");

    setTimeout(() => {

        thinkingState.classList.add("hidden");
        outputState.classList.add("visible");

        setTimeout(() => {
            typeText(text);
        }, 200);

    }, 1200);
}