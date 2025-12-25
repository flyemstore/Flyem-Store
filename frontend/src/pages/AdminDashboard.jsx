import React, { useEffect, useState } from "react";
import api from "../api/index";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const savedUser = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!savedUser || !savedUser.isAdmin) {
        setLoading(false);
        return;
      }

      try {
        // --- 1. FETCH DATA ---
        const [orders, products, users] = await Promise.all([
            api.request("/orders"),
            api.request("/products"),
            api.request("/users") 
        ]);

        // --- 2. CALCULATE TOTALS ---
        const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? (order.totalPrice || 0) : 0), 0);
        
        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length || 0,
          revenue: totalRevenue, 
        });

        // --- 3. GENERATE CHART DATA (Last 7 Days) ---
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dailyRevenue = last7Days.map(date => {
            // Find orders for this specific day that are PAID
            const dayOrders = orders.filter(o => 
                o.createdAt && 
                o.createdAt.startsWith(date) && 
                (o.isPaid || o.paymentMethod === "COD") // Count COD orders too if you want
            );
            const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            
            const dateObj = new Date(date);
            const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            return { name: label, revenue: dayTotal };
        });

        setChartData(dailyRevenue);

      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, unit = "" }) => (
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">{title}</p>
      <h3 className="text-3xl font-black mt-2 text-gray-800">
        {unit}{typeof value === 'number' ? value.toLocaleString() : "0"}
      </h3>
    </div>
  );

  if (loading) return <div className="p-20 text-center text-gray-500 uppercase text-sm font-bold">Loading Real Analytics...</div>;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live store analytics.</p>
      </div>
      
      {/* STATISTICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Revenue" value={stats.revenue} unit="₹" />
        <StatCard title="Active Products" value={stats.totalProducts} />
        <StatCard title="Users" value={stats.totalUsers} />
      </div>

      {/* REVENUE GRAPH */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold uppercase text-gray-800 mb-6">Revenue Trends (Last 7 Days)</h2>
          
          {/* 👇 FIX: Wrapper needs strict height to prevent negative dimension error */}
          <div className="w-full h-96 min-h-[400px]"> 
            
            {chartData && chartData.length > 0 ? (
              // 👇 FIX: Use 99% width to prevent resize-loop bugs in some browsers
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#999' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#999' }} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#000', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#000000" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm font-bold uppercase">
                  Not enough data to display graph yet
              </div>
            )}
          </div>
      </div>
    </div>
  );
}