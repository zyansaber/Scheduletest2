
import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const ForecastYearBreakdown = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [popupData, setPopupData] = useState([]);

  const chartData = useMemo(() => {
    const counts = {
      "2025_WithChassis": 0,
      "2025_NoChassis": 0,
      "2026_WithChassis": 0,
      "2026_NoChassis": 0,
    };

    const dealerBreakdown = {
      "2025_NoChassis": {},
      "2026_NoChassis": {}
    };

    data.forEach((item) => {
      const forecastDate = item["Forecast Production Date"];
      if (!forecastDate) return;
      const year = forecastDate.split("/")[2];
      const hasChassis = item["Chassis"] && item["Chassis"].trim() !== "";

      if (year === "2025") {
        hasChassis ? counts["2025_WithChassis"]++ : counts["2025_NoChassis"]++;
        if (!hasChassis) {
          const dealer = item["Dealer"] || "Unknown";
          dealerBreakdown["2025_NoChassis"][dealer] = (dealerBreakdown["2025_NoChassis"][dealer] || 0) + 1;
        }
      } else if (year === "2026") {
        hasChassis ? counts["2026_WithChassis"]++ : counts["2026_NoChassis"]++;
        if (!hasChassis) {
          const dealer = item["Dealer"] || "Unknown";
          dealerBreakdown["2026_NoChassis"][dealer] = (dealerBreakdown["2026_NoChassis"][dealer] || 0) + 1;
        }
      }
    });

    return {
      chart: [
        { name: "2025 With Chassis", value: counts["2025_WithChassis"], key: "2025_WithChassis" },
        { name: "2025 No Chassis", value: counts["2025_NoChassis"], key: "2025_NoChassis" },
        { name: "2026 With Chassis", value: counts["2026_WithChassis"], key: "2026_WithChassis" },
        { name: "2026 No Chassis", value: counts["2026_NoChassis"], key: "2026_NoChassis" },
      ],
      dealerBreakdown,
    };
  }, [data]);

  const handleClick = (entry) => {
    if (entry.name.includes("No Chassis")) {
      const breakdown = chartData.dealerBreakdown[entry.key];
      if (breakdown) {
        const rows = Object.entries(breakdown).map(([dealer, count]) => ({ dealer, count }));
        setPopupData(rows);
        setOpen(true);
      }
    }
  };

  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold mb-2">Forecast Year Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData.chart}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
          >
            {chartData.chart.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Chassis Dealer Breakdown</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto mt-4">
            <table className="min-w-full text-sm text-left border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Dealer</th>
                  <th className="px-4 py-2 border">Count</th>
                </tr>
              </thead>
              <tbody>
                {popupData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{row.dealer}</td>
                    <td className="px-4 py-2 border">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForecastYearBreakdown;
