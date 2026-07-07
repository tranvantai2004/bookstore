import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Eye, X, Trash2, ShoppingBag } from 'lucide-react';

const STATUS = {
  pending:   { label: 'Chờ xử lý',  cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: 'Xác nhận',   cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  shipping:  { label: 'Đang giao',  cls: 'bg-violet-50 text-violet-700 border border-violet-200' },
  completed: { label: 'Hoàn thành', cls: 'bg-green-50 text-green-700 border border-green-200' },
  cancelled: { label: 'Đã hủy',     cls: 'bg-red-50 text-red-700 border border-red-200' },
};

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl w-full ${wide ? 'max-w-xl' : 'max-w-md'} shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [form, setForm] = useState({ customer: '', note: '', items: [{ book: '', quantity: 1 }] });
  const [loading, setLoading] = useState(false);

  const fetchOrders = () => {
    const p = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/orders/${p}`).then(r => setOrders(r.data.results || r.data));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);
  useEffect(() => {
    api.get('/books/').then(r => setBooks(r.data.results || r.data));
    api.get('/orders/customers/').then(r => setCustomers(r.data.results || r.data));
  }, []);

  const addItem = () => setForm({...form, items: [...form.items, { book: '', quantity: 1 }]});
  const removeItem = (i) => setForm({...form, items: form.items.filter((_, idx) => idx !== i)});
  const updateItem = (i, k, v) => { const items = [...form.items]; items[i][k] = v; setForm({...form, items}); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/orders/', form);
      toast.success('Tạo đơn thành công!');
      setModal(false);
      setForm({ customer: '', note: '', items: [{ book: '', quantity: 1 }] });
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.detail || 'Tạo đơn thất bại'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try { await api.patch(`/orders/${id}/`, { status }); toast.success('Đã cập nhật'); fetchOrders(); }
    catch { toast.error('Thất bại'); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} đơn hàng</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
          <Plus size={16} /> Tạo đơn hàng
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[['', 'Tất cả'], ...Object.entries(STATUS).map(([v, s]) => [v, s.label])].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              statusFilter === v
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
            }`}>{l}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Mã đơn', 'Khách hàng', 'Nhân viên', 'Tổng tiền', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-orange-50/20 transition group">
                <td className="px-5 py-4">
                  <span className="text-sm font-mono font-semibold text-orange-500">#{String(o.id).padStart(4,'0')}</span>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{o.customer_name}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{o.created_by_username}</td>
                <td className="px-5 py-4 text-sm font-bold text-gray-900">{Number(o.total_price).toLocaleString('vi-VN')}₫</td>
                <td className="px-5 py-4">
                  {user?.role === 'admin' ? (
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-full font-semibold cursor-pointer border-0 focus:outline-none ${STATUS[o.status]?.cls}`}>
                      {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2.5 py-1.5 rounded-full font-semibold ${STATUS[o.status]?.cls}`}>
                      {STATUS[o.status]?.label}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-gray-400">{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-5 py-4">
                  <button onClick={() => setViewOrder(o)}
                    className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewOrder && (
        <Modal title={`Đơn hàng #${String(viewOrder.id).padStart(4,'0')}`} onClose={() => setViewOrder(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">{viewOrder.customer_name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS[viewOrder.status]?.cls}`}>
                  {STATUS[viewOrder.status]?.label}
                </span>
              </div>
            </div>
            {viewOrder.note && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
                <span className="font-medium">Ghi chú: </span>{viewOrder.note}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chi tiết sản phẩm</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Sách','SL','Đơn giá','Tổng'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewOrder.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-gray-900 text-xs">{item.book_title}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{Number(item.unit_price).toLocaleString('vi-VN')}₫</td>
                        <td className="px-4 py-3 font-bold text-xs">{Number(item.subtotal).toLocaleString('vi-VN')}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Tổng cộng</span>
              <span className="text-xl font-bold text-orange-500">{Number(viewOrder.total_price).toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {modal && (
        <Modal title="Tạo đơn hàng mới" onClose={() => setModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Khách hàng <span className="text-red-400">*</span></label>
              <select value={form.customer} onChange={e => setForm({...form, customer: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required>
                <option value="">Chọn khách hàng</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Sản phẩm <span className="text-red-400">*</span></label>
                <button type="button" onClick={addItem} className="text-orange-500 text-sm font-medium hover:underline">+ Thêm</button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={item.book} onChange={e => updateItem(i, 'book', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required>
                      <option value="">Chọn sách</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title} — {Number(b.price).toLocaleString('vi-VN')}₫</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
              <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 resize-none" rows={2} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60">
                {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
