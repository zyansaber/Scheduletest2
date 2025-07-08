
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#8884d8", "#FF8042"];

const groupDataByChassisStatus = (data, year) => {
  const filtered = data.filter((item) => {
    const dateStr = item["Forecast Production Date"];
    if (!dateStr) return false;
    const parts = dateStr.split("/");
    return parts[2] === String(year);
  });

  const withChassis = filtered.filter(item => item["Chassis No"]);
  const withoutChassis = filtered.filter(item => !item["Chassis No"]);

  return {
    pieData: [
      { name: "With Chassis", value: withChassis.length },
      { name: "No Chassis", value: withoutChassis.length }
    ],
    noChassisDealers: withoutChassis.reduce((acc, item) => {
      const dealer = item["Dealer"] || "Unknown";
      acc[dealer] = (acc[dealer] || 0) + 1;
      return acc;
    }, {})
  };
};

const YearPie = ({ year, data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dealerData, setDealerData] = useState({});
  const { pieData, noChassisDealers } = useMemo(() => groupDataByChassisStatus(data, year), [data, year]);

  const handleClick = (entry) => {
    if (entry.name === "No Chassis") {
      setDealerData(noChassisDealers);
      setShowTooltip(true);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="text-md font-bold mb-2">Forecast {year}</h3>
      <PieChart width={300} height={250}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          onClick={handleClick}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {showTooltip && (
        <div className="mt-2 p-2 border bg-gray-50 rounded max-h-40 overflow-auto">
          <h4 className="font-semibold text-sm">No Chassis Dealers</h4>
          <ul className="text-sm">
            {Object.entries(dealerData).map(([dealer, count]) => (
              <li key={dealer}>{dealer}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ForecastYearBreakdown = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <YearPie year={2025} data={data} />
      <YearPie year={2026} data={data} />
    </div>
  );
};

export default ForecastYearBreakdown;
