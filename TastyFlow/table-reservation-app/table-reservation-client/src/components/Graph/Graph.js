import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./Graph.css";
import Sidebar from "../Sidebar/Sidebar";

const Graph = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoice/admin/all-invoice");
        processSalesData(response.data);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      }
    };

    fetchInvoices();
  }, []);

  const processSalesData = (invoices) => {
    const monthlySales = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${monthIndex}`;

      if (!monthlySales[key]) {
        monthlySales[key] = 0;
      }
      monthlySales[key] += invoice.totalAmount;
    });

    const chartData = Object.keys(monthlySales)
      .map((key) => {
        const [year, monthIndex] = key.split("-").map(Number);
        const month = new Date(year, monthIndex, 1).toLocaleString("default", { month: "short" });
        return {
          month: `${month} ${year}`,
          sales: monthlySales[key],
          year,
          monthIndex,
        };
      })
      .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);
    setSalesData(chartData);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="graph">
        <div className="chart-container">
          <h1 className="header">Monthly Sales Chart</h1>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#ff4135" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Graph;
