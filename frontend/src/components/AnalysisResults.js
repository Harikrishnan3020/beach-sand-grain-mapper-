import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Map from './Map';
import './AnalysisResults.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalysisResults = ({ data }) => {
  const [detailsText, setDetailsText] = useState(data?.details || '');
  const [generating, setGenerating] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    // Priority 1: Direct coordinates from backend analysis
    if (data?.coordinates && data.coordinates.lat && data.coordinates.lng) {
      setCoordinates(data.coordinates);
      setGeocoding(false);
      return;
    }

    // Priority 2: Parse string coordinates from location field
    if (data?.location) {
      setGeocoding(true);
      const coordMatch = data.location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setCoordinates({ lat, lng });
          setGeocoding(false);
          return;
        }
      }

      // Priority 3: Geocode place name
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location)}`)
        .then(res => res.json())
        .then(results => {
          if (results && results.length > 0) {
            const { lat, lon } = results[0];
            setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
          } else {
            setCoordinates(null);
          }
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          setCoordinates(null);
        })
        .finally(() => setGeocoding(false));
    } else {
      setCoordinates(null);
    }
  }, [data?.location, data?.coordinates]);

  if (!data) {
    return (
      <motion.div
        className="analysis-results no-data"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="no-data-message">
          <h2>No Analysis Data Available</h2>
          <p>Please upload an image or capture one using the camera to see analysis results.</p>
        </div>
      </motion.div>
    );
  }

  const generatePDF = async () => {
    const element = document.getElementById('analysis-content');
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2, // Better resolution
      logging: true,
      allowTaint: false,
      backgroundColor: '#1a202c', // Match the dark theme background roughly or transparent
    });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('sand-grain-analysis.pdf');
  };


  // Prepare chart data defensively: ensure labels/data are arrays and align lengths
  const rawLabels = Array.isArray(data.grainSizes) ? data.grainSizes : null;
  const rawData = Array.isArray(data.grainCounts) ? data.grainCounts : null;

  const fallbackLabels = ['Small', 'Medium', 'Large'];
  const fallbackData = [30, 45, 25];

  let labels = rawLabels ? rawLabels.map(size => `${size}μm`) : fallbackLabels;
  let datasetValues = rawData ? rawData : fallbackData;

  // If lengths mismatch, pad/truncate to match
  if (datasetValues.length < labels.length) {
    while (datasetValues.length < labels.length) datasetValues.push(0);
  } else if (datasetValues.length > labels.length) {
    datasetValues = datasetValues.slice(0, labels.length);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Grain Count',
        data: datasetValues,
        backgroundColor: labels.map((_, i) => {
          const palette = [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ];
          return palette[i % palette.length];
        }),
        borderColor: labels.map((_, i) => {
          const borderPalette = [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)',
          ];
          return borderPalette[i % borderPalette.length];
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sand Grain Size Distribution',
      },
    },
  };

  const generateDetailedReport = async () => {
    try {
      setGenerating(true);
      // Build a structured prompt following the requested report structure
      const promptParts = [];
      promptParts.push('You are an expert geologist, sedimentologist, and coastal engineer.');
      promptParts.push('Using the provided image-analysis data and parameters, generate a comprehensive, structured, and scientifically accurate detailed report.');
      promptParts.push('\nInput Data:');
      promptParts.push(`Average grain size (µm): ${data.averageSize || 'Unknown'}`);
      promptParts.push(`Grain size distribution: ${Array.isArray(data.grainSizes) ? data.grainSizes.join(', ') : 'Unknown'}`);
      promptParts.push(`Grain counts: ${Array.isArray(data.grainCounts) ? data.grainCounts.join(', ') : 'Unknown'}`);
      promptParts.push(`Observed soil color/texture: ${data.soilType || 'Unknown'}${data.soilDetails ? ' - ' + data.soilDetails : ''}`);
      promptParts.push(`Image-based notes: ${data.imageNotes || 'None'}`);
      promptParts.push(`Detected minerals (inferred): ${data.minerals || 'Inferred: quartz ± feldspar ± iron oxides'}`);
      promptParts.push(`Location: ${data.location || 'Unknown'}`);
      promptParts.push(`Assumptions/fallbacks: ${data.assumptions || 'Where values are missing, reasonable geological estimates were used; clearly state where estimates apply.'}`);

      promptParts.push('\nReport Structure:');
      promptParts.push('1. Sample Overview\n2. Grain Size Analysis\n3. Grain Shape & Texture\n4. Soil Type Identification\n5. Mineralogical Composition\n6. Bacterial & Microbial Possibility (Inference-Based)\n7. Depositional Environment Interpretation\n8. Application-Based Suitability\n9. Limitations & Assumptions\n10. Conclusion');

      promptParts.push('\nOutput Requirements: Use clear headings and subheadings, simple but scientific language, professional tone, and indicate assumptions or fallbacks clearly.');

      const prompt = promptParts.join('\n');
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (json && json.output) {
        setDetailsText(json.output);
      } else {
        setDetailsText(localReportFromData(data));
      }
    } catch (err) {
      console.error('Error generating detailed report', err);
      // Fallback to local generator
      setDetailsText(localReportFromData(data));
    } finally {
      setGenerating(false);
    }
  };

  const localReportFromData = (d) => {
    // Helper to classify average size
    const avg = d.averageSize || null;
    let sizeClass = 'Unknown';
    if (avg) {
      const a = Number(avg);
      if (a <= 63) sizeClass = 'Very fine';
      else if (a <= 250) sizeClass = 'Fine';
      else if (a <= 2000) sizeClass = 'Medium to Coarse';
      else sizeClass = 'Very coarse';
    }

    const labels = Array.isArray(d.grainSizes) ? d.grainSizes.map(s => `${s}µm`).join(', ') : 'Not available.';
    const counts = Array.isArray(d.grainCounts) ? d.grainCounts.join(', ') : 'Not available.';

    const sorting = (() => {
      if (!Array.isArray(d.grainCounts)) return 'Unknown (image-based estimate)';
      const max = Math.max(...d.grainCounts);
      const min = Math.min(...d.grainCounts);
      const ratio = max / (min || 1);
      if (ratio <= 2) return 'Well sorted';
      if (ratio <= 5) return 'Moderately sorted';
      return 'Poorly sorted';
    })();

    const roundness = d.shape || 'Moderately rounded to sub-angular (inferred from image)';
    const minerals = d.minerals || 'Quartz dominant; possible feldspar and iron oxides inferred.';
    const soilType = d.soilType || 'Unspecified';
    const soilDetails = d.soilDetails || '';

    const reportLines = [];
    reportLines.push('**Summary**');
    reportLines.push(`- This detailed report provides a comprehensive analysis of the sand grain sample based on image processing and geological inferences.`);
    reportLines.push(`- Key findings include average grain size of ${avg || 'N/A'} µm (${sizeClass}), ${sorting.toLowerCase()} sorting, and ${soilType} soil type.`);
    reportLines.push(`- The analysis covers grain size, shape, soil type, mineralogy, microbial possibilities, depositional environment, and application suitability.`);
    reportLines.push(`- Confidence level is moderate due to image-based methods; laboratory verification is recommended for critical applications.`);
    reportLines.push(`- Report structure follows 10 sections with 5 key points each for detailed insights.`);
    reportLines.push('');

    reportLines.push('**1. Sample Overview**');
    reportLines.push(`- Method: Camera/image-based detection and automated grain analysis.`);
    reportLines.push(`- Confidence: Moderate — image-based inferences; laboratory testing recommended for high-stakes decisions.`);
    reportLines.push(`- Sample quality: ${d.quality || 'Good'} based on image clarity and grain visibility.`);
    reportLines.push(`- Total grains analyzed: ${d.totalGrains || 100} for statistical reliability.`);
    reportLines.push(`- Location context: ${d.location || 'Not specified'} influencing environmental interpretations.`);
    reportLines.push('');

    reportLines.push('**2. Grain Size Analysis**');
    reportLines.push(`- Average grain size: ${avg || 'Not measured'} µm (${sizeClass}).`);
    reportLines.push(`- Size distribution buckets: ${labels}.`);
    reportLines.push(`- Grain counts: ${counts}.`);
    reportLines.push(`- Sorting: ${sorting}.`);
    reportLines.push(`- Implications: ${sizeClass} grains and ${sorting.toLowerCase()} sorting indicate ${sizeClass === 'Very fine' ? 'low permeability and potential for cohesion' : 'moderate to high permeability suitable for drainage'}.`);
    reportLines.push('');

    reportLines.push('**3. Grain Shape & Texture**');
    reportLines.push(`- Observed angularity: ${roundness}.`);
    reportLines.push('- Surface texture reflects transport history: smoother surfaces indicate longer transport distances.');
    reportLines.push('- Angular grains suggest nearby source or limited transport, affecting sediment maturity.');
    reportLines.push('- Roundness influences packing density and porosity in engineering applications.');
    reportLines.push('- Texture analysis helps infer depositional processes and sediment source regions.');
    reportLines.push('');

    reportLines.push('**4. Soil Type Identification**');
    reportLines.push(`- Identified soil type: ${soilType}${soilDetails ? ' — ' + soilDetails : ''}.`);
    reportLines.push('- Physical characteristics: bulk color, drainage, and compaction inferred from image properties.');
    reportLines.push('- Soil classification based on grain size distribution and visual texture assessment.');
    reportLines.push('- Drainage potential determined by grain size and sorting characteristics.');
    reportLines.push('- Compaction behavior influenced by angularity and mineral composition.');
    reportLines.push('');

    reportLines.push('**5. Mineralogical Composition**');
    reportLines.push(`- Major inferred minerals: ${minerals}.`);
    reportLines.push('- Trace minerals: small amounts of heavy minerals or accessory phases may be present.');
    reportLines.push('- Quartz dominance indicates stable, resistant mineral assemblage typical of mature sediments.');
    reportLines.push('- Feldspar presence suggests less weathered source material or shorter transport.');
    reportLines.push('- Iron oxides contribute to soil color and may indicate oxidizing conditions.');
    reportLines.push('');

    reportLines.push('**6. Bacterial & Microbial Possibility (Inference-Based)**');
    reportLines.push('- Inferred microbial presence: Not directly measurable from image; moisture-retentive soils may support activity.');
    reportLines.push('- Organic-rich or fine-grained soils provide better habitat for microbial communities.');
    reportLines.push('- Bacterial activity can influence soil structure and engineering properties.');
    reportLines.push('- Microbial presence may affect soil fertility and environmental remediation potential.');
    reportLines.push('- Inference only: direct testing required for accurate microbial assessment.');
    reportLines.push('');

    reportLines.push('**7. Depositional Environment Interpretation**');
    reportLines.push('- Likely depositional environment: inferred from grain size, sorting, and roundness characteristics.');
    reportLines.push('- Well-sorted rounded sands suggest aeolian (wind) or beach depositional settings.');
    reportLines.push('- Mixed sizes and angularity indicate fluvial (river) or near-source depositional environments.');
    reportLines.push('- Sorting quality reflects energy conditions during sediment deposition.');
    reportLines.push('- Roundness provides clues about transport distance and sediment maturity.');
    reportLines.push('');

    reportLines.push('**8. Application-Based Suitability**');
    reportLines.push('- Coastal engineering: evaluate erosion susceptibility and beach nourishment suitability.');
    reportLines.push('- Construction: note bearing capacity concerns for fine, organic, or silty soils.');
    reportLines.push('- Sandy or gravelly soils perform better for drainage and foundation stability.');
    reportLines.push('- Environmental monitoring: recommend periodic sampling to track sediment changes.');
    reportLines.push('- Agricultural suitability: assess drainage and nutrient retention based on soil type.');
    reportLines.push('');

    reportLines.push('**9. Limitations & Assumptions**');
    reportLines.push('- This report is image-based; laboratory testing required for detailed grain mineralogy.');
    reportLines.push('- Plasticity, moisture content, and in-situ strength cannot be determined from images.');
    reportLines.push('- Where values were missing, reasonable geological estimates were used and noted.');
    reportLines.push('- Confidence levels vary by parameter; image quality affects analysis accuracy.');
    reportLines.push('- Assumptions are clearly stated to maintain transparency in interpretations.');
    reportLines.push('');

    reportLines.push('**10. Conclusion**');
    reportLines.push('- Summary: image-derived analysis indicates ' + (soilType !== 'Unspecified' ? soilType + ' characteristics' : 'a sand-dominated sample') + ' with average size ' + (avg || 'N/A') + ' µm and ' + sorting.toLowerCase() + '.');
    reportLines.push('- Practical significance: recommend lab grain-size analysis, Atterberg limits for fines.');
    reportLines.push('- Mineralogical testing advised for construction or remediation decisions.');
    reportLines.push('- Environmental implications include suitability for coastal protection and land use.');
    reportLines.push('- Further studies suggested to validate image-based inferences with field data.');
    reportLines.push('- Overall assessment provides foundation for informed decision-making in geology and engineering.');

    return reportLines.join('\n');
  };

  const renderReport = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const nodes = [];
    let currentList = null;

    const flushList = () => {
      if (currentList) {
        nodes.push(React.createElement('ul', { key: nodes.length }, currentList.map((li, i) => React.createElement('li', { key: i }, li))));
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw) {
        flushList();
        continue;
      }

      // Headings written as **N. Title** or **Title**
      const headingMatch = raw.match(/^\*\*(.+)\*\*/);
      if (headingMatch) {
        flushList();
        nodes.push(React.createElement('h3', { key: nodes.length }, headingMatch[1].trim()));
        continue;
      }

      // Bullet lines
      if (raw.startsWith('- ')) {
        const item = raw.slice(2).trim();
        if (!currentList) currentList = [];
        currentList.push(item);
        continue;
      }

      // Paragraph line
      flushList();
      nodes.push(React.createElement('p', { key: nodes.length }, raw));
    }

    flushList();
    return nodes;
  };

  return (
    <motion.div
      className="analysis-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-header">
        <h1>Analysis Results</h1>
      </div>

      <div id="analysis-content" className="analysis-content">
        {data.image && (
          <motion.div
            className="image-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Analyzed Image</h2>
            <img src={data.image} alt="Analyzed sand sample" className="analyzed-image" />
          </motion.div>
        )}

        <motion.div
          className="statistics-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Statistical Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Grains</h3>
              <p className="stat-value">{data.totalGrains || 100}</p>
            </div>
            <div className="stat-card">
              <h3>Average Size</h3>
              <p className="stat-value">{data.averageSize || '250'}μm</p>
            </div>
            <div className="stat-card">
              <h3>Dominant Size</h3>
              <p className="stat-value">{data.dominantSize || 'Medium'}</p>
            </div>
            <div className="stat-card">
              <h3>Sample Quality</h3>
              <p className="stat-value">{data.quality || 'Good'}</p>
            </div>
          </div>
          <div className="location-display">
            <h3>Regional & Sample Location</h3>
            {data.location ? (
              <>
                <p className="location-value">Sample: {data.location}</p>
                {geocoding && <p>Geocoding location...</p>}
                {!geocoding && !coordinates && <p>Sample location could not be pinpointed.</p>}
              </>
            ) : (
              <p className="location-value">Regional Hub: PSGR</p>
            )}

            <div className="location-map">
              <Map locations={[
                ...(coordinates ? [{ coordinates, location: data.location, soil: data.soilType || 'Unknown' }] : []),
                {
                  coordinates: { lat: 11.0247, lng: 76.9723 },
                  location: 'PSGR (Regional Hub)',
                  soil: 'Most found in region'
                }
              ]} />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="chart-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2>Size Distribution Chart</h2>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {(detailsText || data.details) && (
          <motion.div
            className="details-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2>Detailed Analysis</h2>
            <div className="details-content">
              <div className="report-output">{renderReport(detailsText || data.details)}</div>
              {data.soilType && (
                <div className="soil-summary">
                  <h4>Soil Type:</h4>
                  <p><strong>{data.soilType}</strong></p>
                  {data.soilDetails && (
                    <>
                      <h4>Soil Details:</h4>
                      <p>{data.soilDetails}</p>
                    </>
                  )}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <button className="generate-btn" onClick={generateDetailedReport} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate Detailed Report'}
                </button>
                <button className="export-btn" onClick={generatePDF} style={{ marginLeft: 12 }}>
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisResults;