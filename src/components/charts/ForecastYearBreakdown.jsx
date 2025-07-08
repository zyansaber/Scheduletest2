
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF4560", "#775DD0", "#FEB019", "#00E396", "#0090FF"
];

const ForecastYearBreakdown = ({ data }) => {
  const yearSummary = useMemo(() => {
    const summary = {};
    data.forEach((item) => {
      const chassis = item["Chassis"];
      const forecastDate = item["Forecast Production Date"];
      if (!forecastDate || !forecastDate.includes('/')) return;
      const year = forecastDate.split("/")[2];

      if (!summary[year]) {
        summary[year] = { count: 0, noChassisDealers: new Set() };
      }
      summary[year].count += 1;
      if (!chassis || chassis.trim() === "") {
        summary[year].noChassisDealers.add(item["Dealer"]);
      }
    });

    return Object.entries(summary).map(([year, { count, noChassisDealers }]) => ({
      name: year,
      value: count,
      dealers: Array.from(noChassisDealers)
    }));
  }, [data]);

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={yearSummary}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {yearSummary.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload.length) return null;
              const { name, value, payload: p } = payload[0];
              return (
                <div className="bg-white p-2 border rounded shadow text-sm">
                  <div><strong>{name}</strong></div>
                  <div>Total: {value}</div>
                  {p.dealers && p.dealers.length > 0 && (
                    <div className="mt-1">
                      <div className="font-semibold">No Chassis Dealers:</div>
                      <ul className="list-disc ml-4">
                        {p.dealers.slice(0, 10).map((dealer, i) => (
                          <li key={i}>{dealer}</li>
                        ))}
                      </ul>
                      {p.dealers.length > 10 && <div>...and {p.dealers.length - 10} more</div>}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastYearBreakdown;
