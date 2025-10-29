// src/pages/admin/Reports.js
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';

const Reports = () => {
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const casesQuery = query(
        collection(db, 'cases'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(casesQuery);
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCases(casesData);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filteredCases = cases.filter(caseItem => {
      const caseDate = caseItem.createdAt?.toDate?.() || new Date();
      return caseDate >= startDate && caseDate <= endDate;
    });

    const reportData = {
      dateRange: `${dateRange.start} to ${dateRange.end}`,
      totalCases: filteredCases.length,
      newCases: filteredCases.filter(c => c.status === 'new').length,
      inProgressCases: filteredCases.filter(c => c.status === 'inProgress').length,
      closedCases: filteredCases.filter(c => c.status === 'closed').length,
      casesByTopic: {},
      casesByCounsellor: {},
      filteredCases: filteredCases
    };

    // Analyze by topic
    filteredCases.forEach(caseItem => {
      const topic = caseItem.caseTopic || 'general';
      reportData.casesByTopic[topic] = (reportData.casesByTopic[topic] || 0) + 1;
    });

    // Analyze by counsellor
    filteredCases.forEach(caseItem => {
      const counsellor = caseItem.assignedCounsellorId || 'unassigned';
      reportData.casesByCounsellor[counsellor] = (reportData.casesByCounsellor[counsellor] || 0) + 1;
    });

    setReports(prev => [reportData, ...prev]);
  };

  const exportToPDF = (report) => {
    const doc = new jsPDF();
    
    // Add header with TEARS Foundation branding
    doc.setFillColor(41, 128, 185); // Blue color
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('TEARS Foundation', 105, 12, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Case Management Report', 105, 20, { align: 'center' });
    
    // Report details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Report Period: ${report.dateRange}`, 14, 47);
    
    let yPosition = 60;
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.text('SUMMARY STATISTICS', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Cases: ${report.totalCases}`, 20, yPosition);
    yPosition += 7;
    doc.text(`New Cases: ${report.newCases}`, 20, yPosition);
    yPosition += 7;
    doc.text(`In Progress Cases: ${report.inProgressCases}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Closed Cases: ${report.closedCases}`, 20, yPosition);
    
    yPosition += 15;
    
    // Cases by Topic
    doc.setFontSize(14);
    doc.text('CASES BY TOPIC', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    Object.entries(report.casesByTopic).forEach(([topic, count]) => {
      doc.text(`${topic}: ${count}`, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Cases by Counsellor
    doc.setFontSize(14);
    doc.text('CASES BY COUNSELLOR', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    Object.entries(report.casesByCounsellor).forEach(([counsellor, count]) => {
      const label = counsellor === 'unassigned' ? 'Unassigned' : counsellor;
      doc.text(`${label}: ${count}`, 20, yPosition);
      yPosition += 6;
    });
    
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`tears-report-${report.dateRange.replace(/ /g, '-')}.pdf`);
  };

  const exportToCSV = (report) => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Date Range', report.dateRange],
      ['Total Cases', report.totalCases],
      ['New Cases', report.newCases],
      ['In Progress Cases', report.inProgressCases],
      ['Closed Cases', report.closedCases],
      [''],
      ['Cases by Topic:', '']
    ];

    // Add topics
    Object.entries(report.casesByTopic).forEach(([topic, count]) => {
      rows.push([topic, count]);
    });

    rows.push(['', ''], ['Cases by Counsellor:', '']);

    // Add counsellors
    Object.entries(report.casesByCounsellor).forEach(([counsellor, count]) => {
      rows.push([counsellor, count]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tears-report-${report.dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      <div style={{marginBottom: 'var(--spacing-6)'}}>
        <h1>Reports & Analytics</h1>
        <p>Generate and export case reports</p>
      </div>

      {/* Report Generator */}
      <div className="card" style={{marginBottom: 'var(--spacing-6)'}}>
        <div className="card-header">
          <h3>Generate Report</h3>
        </div>
        <div className="card-body">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-4)', alignItems: 'end'}}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>
            <div>
              <button
                onClick={generateReport}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      {reports.map((report, index) => (
        <div key={index} className="card" style={{marginBottom: 'var(--spacing-4)'}}>
          <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Report: {report.dateRange}</h3>
            <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
              <button
                onClick={() => exportToPDF(report)}
                className="btn btn-primary"
                style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => exportToCSV(report)}
                className="btn btn-secondary"
                style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}
              >
                📊 Export CSV
              </button>
            </div>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)'}}>
              <div className="text-center">
                <h4>Total Cases</h4>
                <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--primary-blue)'}}>
                  {report.totalCases}
                </p>
              </div>
              <div className="text-center">
                <h4>New Cases</h4>
                <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>
                  {report.newCases}
                </p>
              </div>
              <div className="text-center">
                <h4>In Progress</h4>
                <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--warning-yellow)'}}>
                  {report.inProgressCases}
                </p>
              </div>
              <div className="text-center">
                <h4>Closed Cases</h4>
                <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>
                  {report.closedCases}
                </p>
              </div>
            </div>

            {/* Cases by Topic */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)'}}>
              <div>
                <h4>Cases by Topic</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'}}>
                  {Object.entries(report.casesByTopic).map(([topic, count]) => (
                    <div key={topic} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-2)',
                      backgroundColor: 'var(--secondary-gray-light)',
                      borderRadius: 'var(--radius)'
                    }}>
                      <span style={{textTransform: 'capitalize'}}>
                        {topic.replace(/_/g, ' ')}
                      </span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4>Cases by Counsellor</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'}}>
                  {Object.entries(report.casesByCounsellor).map(([counsellor, count]) => (
                    <div key={counsellor} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-2)',
                      backgroundColor: 'var(--secondary-gray-light)',
                      borderRadius: 'var(--radius)'
                    }}>
                      <span>
                        {counsellor === 'unassigned' ? 'Unassigned' : 
                         counsellor.length > 10 ? counsellor.substring(0, 10) + '...' : counsellor}
                      </span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reports;