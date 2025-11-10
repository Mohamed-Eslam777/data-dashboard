import React, { useState, useEffect } from 'react';
import './App.css';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import FileUpload from './components/FileUpload';
import AnimatedLogo from './components/AnimatedLogo';

function App() {
  // --- State ---
  // Raw data from CSV
  const [fullData, setFullData] = useState([]);
  // Column names (e.g., ['Category', 'Sales', 'Date'])
  const [headers, setHeaders] = useState([]);
  
  // User's selections
  const [selectedDimension, setSelectedDimension] = useState('');
  const [selectedMeasure, setSelectedMeasure] = useState('');

  // Formatted data for charts
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);

  // --- Handlers ---
  // 1. Called by FileUpload.js
  const handleDataParsed = (parsedData, headerFields) => {
    setFullData(parsedData);
    setHeaders(headerFields);
    // Reset everything on new file upload
    setBarData(null);
    setPieData(null);
    setSelectedDimension('');
    setSelectedMeasure('');
  };

  // --- Data Processing (The "Smart" Part) ---
  // This effect runs whenever the user changes their column selection
  useEffect(() => {
    // Wait until we have all 3 pieces of information
    if (!fullData.length || !selectedDimension || !selectedMeasure) {
      return;
    }

    // 1. Group and Sum Logic (groupBy/sum)
    const groupedData = fullData.reduce((acc, row) => {
      const dimension = row[selectedDimension];
      // Try to convert measure to a number, default to 0 if not a number
      const measure = parseFloat(row[selectedMeasure]) || 0;

      if (dimension) {
        if (!acc[dimension]) {
          acc[dimension] = 0;
        }
        acc[dimension] += measure;
      }
      return acc;
    }, {});

    // 2. Format for Chart.js
    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    const newBarData = {
      labels: labels,
      datasets: [{
        label: `Total ${selectedMeasure} by ${selectedDimension}`,
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };

    const newPieData = {
      labels: labels,
      datasets: [{
        label: 'Sales by Category',
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#E7E9ED', '#8B4513'
          // Chart.js will auto-cycle colors if data is longer
        ],
      }],
    };

    // 3. Update state to render charts
    setBarData(newBarData);
    setPieData(newPieData);

  }, [fullData, selectedDimension, selectedMeasure]);



  // --- Render (JSX) ---
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <AnimatedLogo />
          <h1>Interactive Data Dashboard</h1>
        </div>
      </header>
      
      <FileUpload onDataParsed={handleDataParsed} />

      {/* ----- NEW: Control Selectors ----- */}
      {headers.length > 0 && (
        <div className="controls-container" data-aos="fade-in">
          <div className="control-group">
            <label htmlFor="dimension-select" className="control-label">
              Analyze by (Dimension):
            </label>
            <select 
              id="dimension-select"
              value={selectedDimension} 
              onChange={(e) => setSelectedDimension(e.target.value)}
            >
              <option value="">-- Select Category --</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="measure-select" className="control-label">
              Show values of (Measure):
            </label>
            <select 
              id="measure-select"
              value={selectedMeasure} 
              onChange={(e) => setSelectedMeasure(e.target.value)}
            >
              <option value="">-- Select Value --</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ----- Chart Display ----- */}
      {!barData && headers.length === 0 && (
        <div className="upload-prompt" data-aos="fade-in">
          <p>Please upload a CSV file to start.</p>
        </div>
      )}

      {!barData && headers.length > 0 && (
        <div className="upload-prompt" data-aos="fade-in">
          <p>Please select which columns you want to analyze.</p>
        </div>
      )}

      {barData && pieData && (
        <div className="chart-container">
          <div className="chart-wrapper" data-aos="fade-right">
            <BarChart data={barData} />
          </div>
          <div className="chart-wrapper" data-aos="fade-left">
            <PieChart data={pieData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
