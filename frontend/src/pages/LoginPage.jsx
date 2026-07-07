import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch { toast.error('Sai tên đăng nhập hoặc mật khẩu'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[55%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold">BookStore</p>
              <p className="text-gray-500 text-xs">Seller Central</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Quản lý cửa hàng<br />
            <span className="text-orange-500">sách thông minh</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Nền tảng quản lý toàn diện: đơn hàng, kho sách, khách hàng và doanh thu trong một giao diện.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { icon: <ShoppingBag size={20} />, num: '500+', label: 'Đầu sách' },
            { icon: <Users size={20} />, num: '200+', label: 'Khách hàng' },
            { icon: <TrendingUp size={20} />, num: '99%', label: 'Hài lòng' },
          ].map(item => (
            <div key={item.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-orange-500 mb-3">{item.icon}</div>
              <p className="text-2xl font-bold text-white">{item.num}</p>
              <p className="text-gray-400 text-sm mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">BookStore</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-7">Nhập thông tin tài khoản của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập</label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
                  placeholder="admin" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm disabled:opacity-60 mt-2">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-orange-500 font-semibold hover:underline">Đăng ký ngay</Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin</span> / <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
