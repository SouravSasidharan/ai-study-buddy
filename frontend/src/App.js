import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const genAI = new GoogleGenerativeAI(
  process.env.REACT_APP_GEMINI_API_KEY
);

function App() {
  const [fileName, setFileName] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setFileName(file.name);
    setSummary("");

    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();

          const strings = content.items.map((item) => item.str);

          text += strings.join(" ");
        }

        setPdfText(text);

      } catch (error) {
        console.error("PDF Error:", error);
        alert("Error reading PDF");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const generateSummary = async () => {
    if (!pdfText) {
      alert("Please upload a PDF first");
      return;
    }

    try {
      setLoading(true);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
Summarize these study notes in short bullet points for students:

${pdfText.slice(0, 1000)}
`;

      const result = await model.generateContent(prompt);

      const response = await result.response;

      const text = response.text();

      setSummary(text);

    } catch (error) {
      console.error("FULL ERROR:", error);
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>AI Study Buddy</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      <br />
      <br />

      <button
        onClick={generateSummary}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {fileName && (
        <p>
          <strong>Selected File:</strong> {fileName}
        </p>
      )}

      {summary && (
        <div
          style={{
            marginTop: "30px",
            maxWidth: "800px",
            marginInline: "auto",
            textAlign: "left",
            whiteSpace: "pre-wrap",
          }}
        >
          <h2>AI Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;