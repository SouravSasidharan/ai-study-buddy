import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [fileName, setFileName] = useState("");
  const [pdfText, setPdfText] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);

      const reader = new FileReader();

      reader.onload = async function () {
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
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>AI Study Buddy</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      {fileName && (
        <p>
          <strong>Selected File:</strong> {fileName}
        </p>
      )}

      {pdfText && (
        <div style={{ marginTop: "30px" }}>
          <h2>Extracted Text</h2>

          <p
            style={{
              maxWidth: "800px",
              margin: "auto",
              textAlign: "left",
            }}
          >
            {pdfText}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;