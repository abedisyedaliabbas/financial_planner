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
    const xlsx = await loadXLSX();
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Data');
    xlsx.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Excel export requires xlsx package. Please install dependencies: npm install');
  }
};

// Export multiple sheets to Excel
export const exportMultipleSheets = async (sheets, filename = 'financial_report') => {
  try {
    const xlsx = await loadXLSX();
    const wb = xlsx.utils.book_new();
    sheets.forEach(sheet => {
      const ws = xlsx.utils.json_to_sheet(sheet.data);
      xlsx.utils.book_append_sheet(wb, ws, sheet.name);
    });
    xlsx.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Excel export requires xlsx package. Please install dependencies: npm install');
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
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
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


