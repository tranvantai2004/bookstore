import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import shopApi from '../shopApi';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, User, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ShopLogin() {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', password2: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      // Dùng axios trực tiếp không cần token
      const res = await axios.post(`${API_URL}/users/login/`, loginForm);
      localStorage.setItem('shop_access_token', res.data.access);
      localStorage.setItem('shop_refresh_token', res.data.refresh);
      // Lấy profile dùng shopApi (có token mới)
      const profile = await shopApi.get('/users/profile/');
      localStorage.setItem('shop_user', JSON.stringify(profile.data));
      const name = [profile.data.first_name, profile.data.last_name].filter(Boolean).join(' ') || profile.data.username;
      toast.success(`Xin chào, ${name}!`);
      navigate('/shop');
    } catch {
      toast.error('Sai tên đăng nhập hoặc mật khẩu');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.password2) { toast.error('Mật khẩu không khớp'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users/register/`, regForm);
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      setTab('login');
      setLoginForm({ username: regForm.username, password: '' });
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  const EyeToggle = () => (
    <button type="button" onClick={() => setShowPass(!showPass)}
      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <BookOpen size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Tài khoản khách hàng</h1>
        <p className="text-gray-400 text-sm mt-1">Đăng nhập để mua sách và theo dõi đơn hàng</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {[['login','Đăng nhập'],['register','Đăng ký']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>{l}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập <span className="text-red-400">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-gray-400" />
                <input value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="Nhập mật khẩu"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
                <EyeToggle />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => setTab('register')} className="text-orange-500 font-semibold hover:underline">Đăng ký ngay</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ</label>
                <input value={regForm.first_name} onChange={e => setRegForm({...regForm, first_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên</label>
                <input value={regForm.last_name} onChange={e => setRegForm({...regForm, last_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập <span className="text-red-400">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-gray-400" />
                <input value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
              <input value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={regForm.password}
                  onChange={e => setRegForm({...regForm, password: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
                <EyeToggle />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu <span className="text-red-400">*</span></label>
              <input type="password" value={regForm.password2} onChange={e => setRegForm({...regForm, password2: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => setTab('login')} className="text-orange-500 font-semibold hover:underline">Đăng nhập</button>
            </p>
          </form>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">
        Là quản trị viên?{' '}
        <Link to="/login" className="text-orange-500 hover:underline">Đăng nhập hệ thống</Link>
      </p>
    </div>
  );
}
