const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const gTTS = require("gtts");
const { translate } = require("@vitalets/google-translate-api");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Serve `index.html`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 Serve `style.css`
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

// 🔹 Translate text
app.post("/translate-text", async (req, res) => {
    const { text, from_language, to_language } = req.body;

    if (!text) {
        return res.status(400).json({ error: "No text provided for translation." });
    }

    try {
        const translation = await translate(text, { from: from_language, to: to_language });
        
        // Convert text-to-speech
        const audioFile = "translated_audio.mp3";
        const tts = new gTTS(translation.text, to_language);
        tts.save(audioFile, (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to generate audio." });
            }
            res.json({ translated_text: translation.text, audio_file: audioFile });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Serve audio file
app.get("/get-audio", (req, res) => {
    const filename = "translated_audio.mp3";
    res.download(filename, (err) => {
        if (err) res.status(500).json({ error: "Failed to serve audio." });
    });
});

// Start server
app.listen(5000, () => {
    console.log("Server is running on http://127.0.0.1:5000");
});
