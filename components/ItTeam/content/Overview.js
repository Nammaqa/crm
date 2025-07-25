import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Overview() {
  const [stats, setStats] = useState({ totalLaptops: 0, totalMobiles: 0 });

  useEffect(() => {
    fetch("/api/devices")
      .then((res) => res.json())
      .then((data) => {
        const totalLaptops = data.filter((item) => item.deviceType === "LAPTOP").length;
        const totalMobiles = data.filter((item) => item.deviceType === "MOBILE").length;
        setStats({ totalLaptops, totalMobiles });
      })
      .catch((err) => console.error("Failed to load devices", err));
  }, []);

  const chartData = [
    { name: "Laptops", value: stats.totalLaptops, fill: "#4CAF50" },
    { name: "Mobiles", value: stats.totalMobiles, fill: "#FFEB3B" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">IT Team Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-lg font-semibold">Total Laptops</div>
          <div className="text-3xl font-bold">{stats.totalLaptops}</div>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-lg font-semibold">Total Mobiles</div>
          <div className="text-3xl font-bold">{stats.totalMobiles}</div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">IT Assets Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}