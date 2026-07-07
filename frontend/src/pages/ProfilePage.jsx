import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, Phone, Shield, Save, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.patch('/users/profile/', form); toast.success('Cập nhật thành công!'); }
    catch { toast.error('Cập nhật thất bại'); }
    finally { setLoading(false); }
  };

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

      {/* Profile hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-400 text-sm">@{user?.username}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
              user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Shield size={11} />
              {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Mail size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{user?.email || '—'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
            <Phone size={16} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Điện thoại</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{user?.phone || '—'}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Edit2 size={16} className="text-orange-500" />
          <h3 className="font-semibold text-gray-900">Chỉnh sửa thông tin</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ</label>
              <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên</label>
              <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60">
            <Save size={15} />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
