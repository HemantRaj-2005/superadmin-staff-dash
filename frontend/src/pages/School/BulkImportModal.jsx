// components/BulkImportModal.js
import React, { useState } from 'react';

const BulkImportModal = ({ onImport, onClose }) => {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!csvData.trim()) {
      alert('Please paste CSV data');
      return;
    }

    setLoading(true);
    
    try {
      const schools = parseCSV(csvData);
      await onImport(schools);
    } catch (error) {
      alert('Error parsing CSV data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    if (headers.length < 4) {
      throw new Error('CSV must have at least 4 columns: school_name, district, state, udise_code');
    }

    const schools = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= 4) {
        schools.push({
          school_name: values[0],
          district: values[1],
          state: values[2],
          udise_code: Number(values[3])
        });
      }
    }
    
    return schools;
  };

  const downloadTemplate = () => {
    const template = `school_name,district,state,udise_code
"Example School 1","North District","Example State",12345678901
"Example School 2","South District","Example State",12345678902
"Example School 3","East District","Example State",12345678903`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schools-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Import Schools</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Import Instructions</h3>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li>Prepare a CSV file with the following columns: school_name, district, state, udise_code</li>
                <li>UDISE code must be a unique 11-digit number</li>
                <li>Maximum 1000 schools per import</li>
                <li>All fields are required</li>
              </ul>
              <button
                type="button"
                onClick={downloadTemplate}
                className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition duration-200"
              >
                Download Template
              </button>
            </div>

            {/* CSV Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste CSV Data
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder={`school_name,district,state,udise_code
"Example School","North District","Example State",12345678901
"Another School","South District","Example State",12345678902`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste your CSV data here. First row should be headers.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !csvData.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Importing...' : 'Import Schools'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;