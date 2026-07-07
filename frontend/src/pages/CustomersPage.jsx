import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, X, Users, Phone, Mail, MapPin } from 'lucide-react';

const EMPTY = { full_name: '', email: '', phone: '', address: '' };
const COLORS = [
  'from-orange-400 to-red-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = () => {
    const p = search ? `?search=${search}` : '';
    api.get(`/orders/customers/${p}`).then(r => setCustomers(r.data.results || r.data));
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const openEdit = (c) => { setForm({ full_name: c.full_name, email: c.email, phone: c.phone, address: c.address }); setEditId(c.id); setModal(true); };
  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) await api.put(`/orders/customers/${editId}/`, form);
      else await api.post('/orders/customers/', form);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm thành công!');
      setModal(false); fetchCustomers();
    } catch { toast.error('Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} khách hàng</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
          <Plus size={16} /> Thêm khách hàng
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, SĐT, email..."
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c, i) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {c.full_name?.split(' ').pop()?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">KH #{String(c.id).padStart(3,'0')}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(c)}
                  className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {c.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} className="text-gray-300 shrink-0" /> {c.phone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} className="text-gray-300 shrink-0" /> {c.email}
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="text-gray-300 shrink-0" /> {c.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Chưa có khách hàng</p>
        </div>
      )}

      {modal && (
        <Modal title={editId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['full_name','Họ tên','text',true],['email','Email','email',false],['phone','Số điện thoại','text',true],['address','Địa chỉ','text',false]].map(([k,l,t,req]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l} {req && <span className="text-red-400">*</span>}</label>
                <input type={t} value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required={req} />
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60">
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
