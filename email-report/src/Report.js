import React from 'react';
import { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import './Report.css'

const API_KEY = "1b834e07-c68b-4bf6-96dd-ab7cdc62f07";

async function fetchEmailData(databaseName, collectionName, filters, limit, offset) {
  const url = "https://datacube.uxlivinglab.online/db_api/get_data/";
  const payload = {
    api_key: API_KEY,
    db_name: databaseName,
    coll_name: collectionName,
    operation: "fetch",
    filters: filters,
    limit: limit,
    offset: offset,
    payment: false,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in dataRetrieval:", error);
    throw error;
  }
}

async function generateReport() {
  try {
    const data = await fetchEmailData("emaildatabase", "emaildata", {}, 10000, 0);

    const totalEmailsTested = data.data.length;

    const statusCounts = data.data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const emailsTestedLast7Days = data.data.filter(item => {
      const checkedDate = new Date(item.checked_on);
      const today = new Date();
      const diffTime = today - checkedDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    const emailsTestedLast30Days = data.data.filter(item => {
      const checkedDate = new Date(item.checked_on);
      const today = new Date();
      const diffTime = today - checkedDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;

    return {
      totalEmailsTested,
      statusCounts,
      emailsTestedLast7Days,
      emailsTestedLast30Days
    };
  } catch (error) {
    console.error("Error generating report:", error);
  }
}

generateReport().then(report => console.log(report));


const Report = () => {
    const [report, setReport] = useState(null);
  
    useEffect(() => {
      const getData = async () => {
        const data = await generateReport();
        setReport(data);
      };

      getData();
    }, []);


    if (!report) {
        return <div>Loading...</div>; 
      }
  
    return (
      <div className="report-container">
        <h1>Dowell Email Report</h1>
        <div className="report-section">
          <h2>Total Email Tested</h2>
          <div className="circle">{report.totalEmailsTested}</div>
        </div>
        <div className="report-section">
          <h2>Status Count</h2>
          <div className="circle-container">
             <Tooltip title={<span style={{ fontSize: '18px' }}>Valid</span>} arrow>
              <div className="circle">{report.statusCounts['valid']}</div>
            </Tooltip>
            <Tooltip title={<span style={{ fontSize: '18px' }}>Invalid</span>} arrow>
              <div className="circle">{report.statusCounts['invalid']}</div>
            </Tooltip>
            <Tooltip title={<span style={{ fontSize: '18px' }}>Do not Mail</span>} arrow>
              <div className="circle">{report.statusCounts['do_not_mail']}</div>
            </Tooltip>
            <Tooltip title={<span style={{ fontSize: '18px' }}>Catch All</span>} arrow>
              <div className="circle">{report.statusCounts['catch-all']}</div>
            </Tooltip>
            <Tooltip title={<span style={{ fontSize: '18px' }}>Unknown</span>} arrow>
              <div className="circle">{report.statusCounts['unknown']}</div>
            </Tooltip>
            <Tooltip title={<span style={{ fontSize: '18px' }}>Abuse</span>} arrow>
              <div className="circle">{report.statusCounts['abuse']}</div>
            </Tooltip>
          </div>
        </div>
        <div className="report-section">
          <h2>Email Tested in Last 7 Days</h2>
          <div className="circle">{report.emailsTestedLast7Days}</div>
        </div>
        <div className="report-section">
          <h2>Email Tested in Last 30 Days</h2>
          <div className="circle">{report.emailsTestedLast30Days}</div>
        </div>
      </div>
    );
  };
  
  export default Report;

