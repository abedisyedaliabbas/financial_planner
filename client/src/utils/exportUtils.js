// Dynamic imports to handle missing packages gracefully
let XLSX, html2canvas, jsPDF;

const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
};

const loadHtml2Canvas = async () => {
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
  return html2canvas;
};

const loadJsPDF = async () => {
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default;
  }
  return jsPDF;
};

// Export data to Excel
export const exportToExcel = async (data, filename = 'financial_data') => {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Clean data - remove null/undefined values and convert to strings where needed
    const cleanedData = data.map(row => {
      const cleaned = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value === null || value === undefined) {
          cleaned[key] = '';
        } else if (typeof value === 'object') {
          cleaned[key] = JSON.stringify(value);
        } else {
          cleaned[key] = value;
        }
      });
      return cleaned;
    });

    const xlsx = await loadXLSX();
    const ws = xlsx.utils.json_to_sheet(cleanedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Data');
    xlsx.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel: ' + (error.message || 'Please ensure xlsx package is installed'));
  }
};

// Export multiple sheets to Excel
export const exportMultipleSheets = async (sheets, filename = 'financial_report') => {
  try {
    if (!sheets || sheets.length === 0) {
      alert('No data to export');
      return;
    }

    const xlsx = await loadXLSX();
    const wb = xlsx.utils.book_new();
    
    sheets.forEach(sheet => {
      if (!sheet.data || sheet.data.length === 0) {
        // Create empty sheet with headers if data is empty
        const emptyData = [{}];
        const ws = xlsx.utils.json_to_sheet(emptyData);
        xlsx.utils.book_append_sheet(wb, ws, sheet.name);
      } else {
        // Clean data before exporting
        const cleanedData = sheet.data.map(row => {
          const cleaned = {};
          Object.keys(row).forEach(key => {
            const value = row[key];
            if (value === null || value === undefined) {
              cleaned[key] = '';
            } else if (typeof value === 'object') {
              cleaned[key] = JSON.stringify(value);
            } else {
              cleaned[key] = value;
            }
          });
          return cleaned;
        });
        const ws = xlsx.utils.json_to_sheet(cleanedData);
        xlsx.utils.book_append_sheet(wb, ws, sheet.name);
      }
    });
    
    xlsx.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel: ' + (error.message || 'Please ensure xlsx package is installed'));
  }
};

// Download chart as image
export const downloadChartAsImage = async (chartId, filename = 'chart') => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    console.error('Chart element not found');
    return;
  }

  try {
    const h2c = await loadHtml2Canvas();
    const canvas = await h2c(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2
    });
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = imgData;
    link.click();
  } catch (error) {
    console.error('Error downloading chart:', error);
    alert('Chart download requires html2canvas package. Please install dependencies: npm install');
  }
};

// Export chart as PDF
export const exportChartAsPDF = async (chartId, filename = 'chart') => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    console.error('Chart element not found');
    return;
  }

  try {
    const h2c = await loadHtml2Canvas();
    const JsPDF = await loadJsPDF();
    const canvas = await h2c(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new JsPDF('landscape', 'mm', 'a4');
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting chart as PDF:', error);
    alert('PDF export requires html2canvas and jspdf packages. Please install dependencies: npm install');
  }
};

// Export data to CSV
export const exportToCSV = (data, filename = 'financial_data') => {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle null, undefined, and special characters
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error exporting to CSV: ' + error.message);
  }
};

// Format data for export
export const formatDataForExport = (data, fields) => {
  return data.map(item => {
    const formatted = {};
    fields.forEach(field => {
      formatted[field.label] = field.formatter 
        ? field.formatter(item[field.key])
        : item[field.key] || '';
    });
    return formatted;
  });
};


