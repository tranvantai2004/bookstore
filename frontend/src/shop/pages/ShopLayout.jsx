import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { BookOpen, ShoppingCart, Search, User, Home, Package, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShopLayout() {
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQ, setSearchQ] = useState('');

  const shopUser = JSON.parse(localStorage.getItem('shop_user') || 'null');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop/books?search=${encodeURIComponent(searchQ)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('shop_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Đã đăng xuất');
    navigate('/shop');
  };

  const navLinks = [
    { to: '/shop', label: 'Trang chủ', icon: <Home size={16} /> },
    { to: '/shop/books', label: 'Tất cả sách', icon: <BookOpen size={16} /> },
    { to: '/shop/orders', label: 'Đơn hàng', icon: <Package size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-gray-400 text-xs py-1.5 px-4 text-center">
        🎉 Miễn phí vận chuyển cho đơn hàng từ 300.000₫ — Giao hàng toàn quốc
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link to="/shop" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-black text-gray-900 text-base leading-none">BookStore</p>
                <p className="text-orange-500 text-xs font-medium">Cửa hàng sách online</p>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Tìm kiếm sách, tác giả..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-24 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
                <button type="submit"
                  className="absolute right-1.5 top-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                  Tìm
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 shrink-0">
              <Link to="/shop/cart" className="relative p-2.5 hover:bg-orange-50 rounded-xl transition group">
                <ShoppingCart size={22} className="text-gray-600 group-hover:text-orange-500 transition" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {shopUser ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(shopUser.first_name?.[0] || shopUser.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-24 truncate">
                      {shopUser.first_name || shopUser.username}
                    </span>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{shopUser.first_name} {shopUser.last_name}</p>
                      <p className="text-xs text-gray-400">{shopUser.email}</p>
                    </div>
                    <Link to="/shop/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                      <Package size={15} /> Đơn hàng của tôi
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full">
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/shop/login"
                  className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
                  <User size={15} /> Đăng nhập
                </Link>
              )}
            </div>
          </div>

          <nav className="flex gap-1 pb-2 overflow-x-auto">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  location.pathname === l.to
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {l.icon} {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="text-white font-bold">BookStore</span>
            </div>
            <p className="text-sm leading-relaxed">Cửa hàng sách trực tuyến uy tín, đa dạng đầu sách, giao hàng toàn quốc.</p>
          </div>
          {[
            { title: 'Danh mục', links: ['Văn học', 'Kỹ thuật', 'Kinh tế', 'Thiếu nhi'] },
            { title: 'Hỗ trợ', links: ['Hướng dẫn mua', 'Chính sách đổi trả', 'Vận chuyển', 'Liên hệ'] },
            { title: 'Về chúng tôi', links: ['Giới thiệu', 'Tuyển dụng', 'Blog', 'Đối tác'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-orange-400 transition">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 py-4 text-center text-xs">
          © 2026 BookStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
