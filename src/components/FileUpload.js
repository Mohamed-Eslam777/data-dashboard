import React from 'react';
import Papa from 'papaparse';
import '../App.css'; // For styling the button

const FileUpload = ({ onDataParsed }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // We pass both the parsed data and headers up to the App component
          onDataParsed(results.data, results.meta.fields);
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
          alert("Error parsing the file. Please ensure it's a valid CSV.");
        }
      });
    }
  };

  return (
    <div className="upload-container" data-aos="fade-up">
      <label htmlFor="csv-upload" className="upload-label">
        Choose a CSV file
      </label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleChange}
      />
    </div>
  );
};

export default FileUpload;

