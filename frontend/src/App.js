import React, { useState } from "react";

function App() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
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
        <p style={{ marginTop: "20px" }}>
          Selected File: {fileName}
        </p>
      )}
    </div>
  );
}

export default App;