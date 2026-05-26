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
  const [quiz, setQuiz] = useState("");
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

  const generateQuiz = async () => {
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
From the following study notes:

${pdfText.slice(0, 1000)}

Generate:

1. 5 multiple-choice quiz questions with 4 options each
2. 5 viva/oral exam questions

Keep it simple and student-friendly.
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    setQuiz(response.text());

  } catch (error) {
    console.error(error);
    alert(error.message);

  } finally {
    setLoading(false);
  }
};

return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "35px",
        borderRadius: "20px",
        width: "90%",
        maxWidth: "900px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "10px",
        }}
      >
        📚 AI Study Buddy
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Upload your notes PDF and instantly generate summaries, quizzes and viva questions
      </p>

      <div style={{ textAlign: "center" }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
      </div>

      {fileName && (
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            color: "#444",
          }}
        >
          <strong>Selected File:</strong> {fileName}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={generateSummary}
          disabled={loading}
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>

        <button
          onClick={generateQuiz}
          disabled={loading}
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Generate Quiz & Viva
        </button>
      </div>

      {summary && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "left",
          }}
        >
          <h2>📝 AI Summary</h2>
          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {quiz && (
        <div
          style={{
            marginTop: "25px",
            backgroundColor: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "left",
          }}
        >
          <h2>🎯 Quiz & Viva Questions</h2>
          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {quiz}
          </p>
        </div>
      )}
    </div>
  </div>
);
}

export default App;