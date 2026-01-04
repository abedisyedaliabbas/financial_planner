import React, { useState } from 'react';
import { FaDownload, FaFileExcel, FaFilePdf, FaFileAlt, FaImage } from 'react-icons/fa';
import './ExportButton.css';

const ExportButton = ({ 
  data, 
  filename = 'export', 
  chartId, 
  multipleSheets,
  onExport 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExcelExport = async () => {
    if (onExport) {
      await onExport('excel');
    } else if (multipleSheets) {
      const { exportMultipleSheets } = await import('../utils/exportUtils');
      exportMultipleSheets(multipleSheets, filename);
    } else if (data) {
      const { exportToExcel } = await import('../utils/exportUtils');
      exportToExcel(data, filename);
    }
    setShowMenu(false);
  };

  const handleCSVExport = async () => {
    if (onExport) {
      await onExport('csv');
    } else if (data) {
      const { exportToCSV } = await import('../utils/exportUtils');
      exportToCSV(data, filename);
    }
    setShowMenu(false);
  };

  const handleChartImage = async () => {
    if (chartId) {
      const { downloadChartAsImage } = await import('../utils/exportUtils');
      await downloadChartAsImage(chartId, filename);
    }
    setShowMenu(false);
  };

  const handleChartPDF = async () => {
    if (chartId) {
      const { exportChartAsPDF } = await import('../utils/exportUtils');
      await exportChartAsPDF(chartId, filename);
    }
    setShowMenu(false);
  };

  return (
    <div className="export-button-container">
      <button 
        className="btn btn-primary export-btn"
        onClick={() => setShowMenu(!showMenu)}
      >
        <FaDownload /> Export
      </button>
      {showMenu && (
        <div className="export-menu">
          {data && (
            <>
              <button onClick={handleExcelExport} className="export-menu-item">
                <FaFileExcel /> Export to Excel
              </button>
              <button onClick={handleCSVExport} className="export-menu-item">
                <FaFileAlt /> Export to CSV
              </button>
            </>
          )}
          {chartId && (
            <>
              <button onClick={handleChartImage} className="export-menu-item">
                <FaImage /> Download as Image
              </button>
              <button onClick={handleChartPDF} className="export-menu-item">
                <FaFilePdf /> Export as PDF
              </button>
            </>
          )}
        </div>
      )}
      {showMenu && (
        <div 
          className="export-menu-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;


