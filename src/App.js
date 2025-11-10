import React, { useState, useEffect } from 'react';
import './App.css';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import FileUpload from './components/FileUpload';
import AnimatedLogo from './components/AnimatedLogo';
import { motion } from 'framer-motion'; // Import motion

// Animation settings for the cards
const bentoCardAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 100, delay: 0.2 }
};

const bentoHover = {
  scale: 1.03,
  transition: { type: "spring", stiffness: 300 }
};

function App() {
  // (Keep all existing state and logic)
  const [fullData, setFullData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState('');
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);

  const handleDataParsed = (parsedData, headerFields) => {
    setFullData(parsedData);
    setHeaders(headerFields);
    setBarData(null); setPieData(null);
    setSelectedDimension(''); setSelectedMeasure('');
  };

  useEffect(() => {
    // Wait until we have all 3 pieces of information
    if (!fullData.length || !selectedDimension || !selectedMeasure) {
      return;
    }

    // 1. Group and Sum Logic (groupBy/sum)
    const groupedData = fullData.reduce((acc, row) => {
      const dimension = row[selectedDimension];
      const measure = parseFloat(row[selectedMeasure]) || 0;

      if (dimension) {
        if (!acc[dimension]) {
          acc[dimension] = 0;
        }
        acc[dimension] += measure;
      }
      return acc;
    }, {});

    // --- START: NEW Top 10 Logic ---

    // 2. Sort the data (descending) and convert to array
    const sortedData = Object.entries(groupedData)
      .sort(([, a], [, b]) => b - a);

    // 3. Get Top 10 and sum the rest
    const topN = 10;
    const top10Data = sortedData.slice(0, topN);
    const otherData = sortedData.slice(topN);

    let otherSum = 0;
    if (otherData.length > 0) {
      otherSum = otherData.reduce((acc, [, value]) => acc + value, 0);
    }

    // 4. Create final labels and data for the charts
    const finalLabels = top10Data.map(([label]) => label);
    const finalDataValues = top10Data.map(([, value]) => value);

    if (otherSum > 0) {
      finalLabels.push("Other");
      finalDataValues.push(otherSum);
    }

    // --- END: NEW Top 10 Logic ---

    // 5. Format for Chart.js (Bar Chart uses ALL data, Pie Chart uses final data)
    const allLabels = Object.keys(groupedData);
    const allDataValues = Object.values(groupedData);

    const newBarData = {
      labels: allLabels, // Bar chart shows everything
      datasets: [{
        label: `Total ${selectedMeasure} by ${selectedDimension}`,
        data: allDataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    };

    const newPieData = {
      labels: finalLabels, // Pie chart shows Top 10 + Other
      datasets: [{
        label: 'Sales by Category',
        data: finalDataValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#E7E9ED', '#8B4513', '#2ECC71', '#F1C40F'
        ],
      }],
    };

    // 6. Update state
    setBarData(newBarData);
    setPieData(newPieData);

  }, [fullData, selectedDimension, selectedMeasure]);

  // --- Render (JSX) with motion.div ---
  return (
    <div className="App">
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      <motion.div 
        className="App-header bento-card"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="header-content">
          <AnimatedLogo />
          <h1>Interactive Data Dashboard</h1>
        </div>
      </motion.div>
      
      <motion.div 
        className="upload-container bento-card"
        {...bentoCardAnimation}
        whileHover={bentoHover}
      >
        <FileUpload onDataParsed={handleDataParsed} />
      </motion.div>

      {headers.length > 0 && (
        <motion.div 
          className="controls-container bento-card"
          {...bentoCardAnimation}
          whileHover={bentoHover}
        >
          <div className="control-group">
            <label htmlFor="dimension-select" className="control-label">Analyze by (Dimension):</label>
            <select id="dimension-select" value={selectedDimension} onChange={(e) => setSelectedDimension(e.target.value)}>
              <option value="">-- Select Category --</option>
              {headers.map(header => <option key={header} value={header}>{header}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="measure-select" className="control-label">Show values of (Measure):</label>
            <select id="measure-select" value={selectedMeasure} onChange={(e) => setSelectedMeasure(e.target.value)}>
              <option value="">-- Select Value --</option>
              {headers.map(header => <option key={header} value={header}>{header}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      {!barData && headers.length === 0 && (
        <motion.div className="upload-prompt bento-card" {...bentoCardAnimation}>
          <i className="fas fa-cloud-upload-alt upload-icon"></i>
          
          <h3 className="prompt-title">Steps to Begin Analysis</h3>
          <ul className="prompt-list">
            <li>File Format: Please ensure your file is in <strong>CSV format</strong> (.csv).</li>
            <li>File Structure: The file must contain clear <strong>column headers</strong> in the first row.</li>
            <li>Next Step: After uploading, you must select the <strong>Dimension</strong> (text) and <strong>Measure</strong> (numeric) columns from the menus that will appear.</li>
          </ul>
        </motion.div>
      )}

      {!barData && headers.length > 0 && (
        <motion.div className="upload-prompt bento-card" {...bentoCardAnimation}>
          <p>Please select which columns you want to analyze.</p>
        </motion.div>
      )}

      {barData && pieData && (
        <>
          <motion.div className="chart-wrapper-1 bento-card" {...bentoCardAnimation} whileHover={bentoHover}>
            <BarChart data={barData} />
          </motion.div>
          <motion.div className="chart-wrapper-2 bento-card" {...bentoCardAnimation} whileHover={bentoHover}>
            <PieChart data={pieData} />
          </motion.div>
        </>
      )}

      <footer className="app-footer">
        <p>Made with ❤️ by Mohammed Eslam</p>
        <div className="footer-links">
          {/* WhatsApp Link */}
          <a href="https://wa.me/201050586075" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          {/* LinkedIn Link */}
          <a href="https://www.linkedin.com/in/mohammed-maklad-469557381/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i>
          </a>
          {/* GitHub Link */}
          <a href="https://github.com/Mohamed-Eslam777" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
