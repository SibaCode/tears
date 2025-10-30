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
    doc.setFillColor(41, 128, 185);
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-8)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: 'var(--spacing-2)'
          }}>
            Reports & Analytics
          </h1>
          <p style={{
            color: 'var(--text-gray)',
            fontSize: 'var(--font-size-base)',
            margin: 0
          }}>
            Generate comprehensive case reports and analytics
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-gray)',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border-gray)',
          backgroundColor: 'var(--secondary-gray-light)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            margin: 0
          }}>
            Generate Report
          </h2>
        </div>
        
        <div style={{padding: 'var(--spacing-6)'}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: 'var(--spacing-4)',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                color: 'var(--text-dark)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Start Date
              </label>
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-sm)'
                }}
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                color: 'var(--text-dark)',
                marginBottom: 'var(--spacing-2)'
              }}>
                End Date
              </label>
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-sm)'
                }}
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>
            
            <div>
              <button
                style={{
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: '500',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  minWidth: '140px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-blue-dark)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-blue)'}
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      {reports.map((report, index) => (
        <div key={index} style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)',
          marginBottom: 'var(--spacing-4)'
        }}>
          {/* Report Header */}
          <div style={{
            padding: 'var(--spacing-4)',
            borderBottom: '1px solid var(--border-gray)',
            backgroundColor: 'var(--secondary-gray-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: '600',
                color: 'var(--text-dark)',
                margin: 0,
                marginBottom: 'var(--spacing-1)'
              }}>
                Report: {report.dateRange}
              </h3>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)'
              }}>
                Generated on {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
              <button
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: '500',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-blue-dark)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-blue)'}
                onClick={() => exportToPDF(report)}
              >
                Export PDF
              </button>
              <button
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: 'transparent',
                  color: 'var(--primary-blue)',
                  border: '1px solid var(--primary-blue)',
                  borderRadius: 'var(--radius)',
                  fontWeight: '500',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-blue)';
                  e.target.style.color = 'var(--white)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--primary-blue)';
                }}
                onClick={() => exportToCSV(report)}
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div style={{padding: 'var(--spacing-6)'}}>
            {/* Summary Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-4)',
              marginBottom: 'var(--spacing-6)'
            }}>
              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--secondary-gray-light)',
                borderRadius: 'var(--radius)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Total Cases
                </div>
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '600',
                  color: 'var(--primary-blue)'
                }}>
                  {report.totalCases}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--secondary-gray-light)',
                borderRadius: 'var(--radius)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  New Cases
                </div>
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '600',
                  color: '#e74c3c'
                }}>
                  {report.newCases}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--secondary-gray-light)',
                borderRadius: 'var(--radius)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  In Progress
                </div>
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '600',
                  color: '#f39c12'
                }}>
                  {report.inProgressCases}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--secondary-gray-light)',
                borderRadius: 'var(--radius)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Closed Cases
                </div>
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '600',
                  color: '#27ae60'
                }}>
                  {report.closedCases}
                </div>
              </div>
            </div>

            {/* Breakdown Sections */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-6)'
            }}>
              {/* Cases by Topic */}
              <div>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  Cases by Topic
                </h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'}}>
                  {Object.entries(report.casesByTopic).map(([topic, count]) => (
                    <div key={topic} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border-gray)',
                      borderRadius: 'var(--radius)'
                    }}>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-dark)',
                        textTransform: 'capitalize'
                      }}>
                        {topic.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--primary-blue)'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cases by Counsellor */}
              <div>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  Cases by Counsellor
                </h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'}}>
                  {Object.entries(report.casesByCounsellor).map(([counsellor, count]) => (
                    <div key={counsellor} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border-gray)',
                      borderRadius: 'var(--radius)'
                    }}>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-dark)'
                      }}>
                        {counsellor === 'unassigned' ? 'Unassigned' : 
                         counsellor.length > 8 ? counsellor.substring(0, 8) + '...' : counsellor}
                      </span>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--primary-blue)'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {reports.length === 0 && (
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)',
          padding: 'var(--spacing-12)',
          textAlign: 'center'
        }}>
          <div style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)', color: 'var(--text-light)'}}>
            📊
          </div>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: 'var(--spacing-2)'
          }}>
            No Reports Generated
          </h3>
          <p style={{
            color: 'var(--text-gray)',
            margin: 0
          }}>
            Select a date range and generate your first report to view analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;