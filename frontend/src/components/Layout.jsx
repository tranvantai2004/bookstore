import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShoppingCart, Users, LayoutDashboard, User, LogOut, Bell, Search, ChevronDown, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
    { to: '/books', icon: <BookOpen size={18} />, label: 'Sách' },
    { to: '/orders', icon: <ShoppingCart size={18} />, label: 'Đơn hàng' },
    { to: '/customers', icon: <Users size={18} />, label: 'Khách hàng' },
  ];

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">BookStore</p>
              <p className="text-gray-500 text-xs mt-0.5">Seller Central</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Quản lý</p>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Tài khoản</p>
            <NavLink to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
              <User size={18} /> Hồ sơ
            </NavLink>
          </div>
        </nav>

        {/* Bottom user */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{user?.first_name || user?.username}</p>
              <p className="text-gray-500 text-xs truncate">{user?.role === 'admin' ? 'Admin' : 'Nhân viên'}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Tìm kiếm..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="w-px h-5 bg-gray-200"></div>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {initial}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.first_name || user?.username}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
