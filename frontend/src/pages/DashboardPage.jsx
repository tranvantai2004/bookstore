import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { ShoppingCart, DollarSign, TrendingUp, Package, ArrowUpRight, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';

const chartData = [
  { day: 'T2', revenue: 850000, orders: 3 },
  { day: 'T3', revenue: 1200000, orders: 5 },
  { day: 'T4', revenue: 980000, orders: 4 },
  { day: 'T5', revenue: 1450000, orders: 6 },
  { day: 'T6', revenue: 1100000, orders: 4 },
  { day: 'T7', revenue: 1800000, orders: 8 },
  { day: 'CN', revenue: 1350000, orders: 5 },
];

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <span className={color}>{icon}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={11} /> {sub}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';
const fmtShort = (n) => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? (n/1000).toFixed(0) + 'K' : n;

const STATUS_CFG = {
  pending:   { label: 'Chờ xử lý',  icon: <AlertCircle size={14} />, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
  confirmed: { label: 'Xác nhận',   icon: <CheckCircle size={14} />, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  shipping:  { label: 'Đang giao',  icon: <Truck size={14} />,       color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  completed: { label: 'Hoàn thành', icon: <CheckCircle size={14} />, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
  cancelled: { label: 'Đã hủy',     icon: <XCircle size={14} />,     color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/orders/dashboard/').then(r => setStats(r.data)).finally(() => setLoading(false));
    } else setLoading(false);
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="loader"></div></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xin chào, <span className="font-semibold text-orange-500">{user?.first_name || user?.username}</span> 👋</p>
        </div>
        <div className="text-sm text-gray-400 bg-white border border-gray-200 px-4 py-2 rounded-lg">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {user?.role === 'admin' && stats ? (<>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ShoppingCart size={20} />} label="Tổng đơn hàng" value={stats.total_orders} sub="+12%" color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={<DollarSign size={20} />} label="Doanh thu" value={fmt(stats.total_revenue)} sub="+8%" color="text-green-600" bg="bg-green-50" />
          <StatCard icon={<TrendingUp size={20} />} label="Đơn hôm nay" value={stats.orders_today} sub="+3" color="text-orange-600" bg="bg-orange-50" />
          <StatCard icon={<Clock size={20} />} label="DT 30 ngày" value={fmt(stats.revenue_last_30_days)} sub="+15%" color="text-violet-600" bg="bg-violet-50" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">Doanh thu 7 ngày</h2>
                <p className="text-xs text-gray-400 mt-0.5">Biểu đồ doanh thu theo ngày</p>
              </div>
              <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={11} /> +12.5%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [fmt(v), 'Doanh thu']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5}
                  fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="font-semibold text-gray-900">Số đơn / ngày</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tuần này</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status cards */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(stats.orders_by_status || {}).map(([status, count]) => {
              const cfg = STATUS_CFG[status];
              return (
                <div key={status} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4`}>
                  <div className={`${cfg.color} mb-3`}>{cfg.icon}</div>
                  <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                  <p className={`text-xs font-medium mt-1 ${cfg.color} opacity-80`}>{cfg.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </>) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Chào mừng đến BookStore!</h2>
          <p className="text-sm text-gray-500">Dùng menu bên trái để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
