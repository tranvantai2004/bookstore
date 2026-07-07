import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Package, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import BookCover from '../../components/BookCover';

const STATUS = {
  pending:   { label: 'Chờ xử lý',  icon: <Clock size={14} />,       cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Xác nhận',   icon: <CheckCircle size={14} />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipping:  { label: 'Đang giao',  icon: <Truck size={14} />,       cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  completed: { label: 'Hoàn thành', icon: <CheckCircle size={14} />, cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Đã hủy',     icon: <XCircle size={14} />,     cls: 'bg-red-50 text-red-700 border-red-200' },
};

const STEPS = ['pending','confirmed','shipping','completed'];

export default function ShopOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const shopUser = JSON.parse(localStorage.getItem('shop_user') || 'null');

  useEffect(() => {
    if (!shopUser) { setLoading(false); return; }
    api.get('/orders/')
      .then(r => {
        const all = r.data.results || r.data;
        // Lọc đơn của user hiện tại
        setOrders(all.filter(o => o.created_by === shopUser.id || o.created_by_username === shopUser.username));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (!shopUser) return (
    <div className="text-center py-20">
      <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</h2>
      <p className="text-gray-400 mb-6">Đăng nhập để xem lịch sử đơn hàng</p>
      <Link to="/shop/login" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
        Đăng nhập
      </Link>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>;

  if (orders.length === 0) return (
    <div className="text-center py-20">
      <Package size={48} className="text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
      <p className="text-gray-400 mb-6">Hãy đặt hàng ngay!</p>
      <Link to="/shop/books" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
        Mua sắm ngay
      </Link>
    </div>
  );

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-6">Đơn hàng của tôi ({orders.length})</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const isOpen = expanded === order.id;
          const stepIdx = STEPS.indexOf(order.status);
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Mã đơn</p>
                    <p className="font-black text-orange-500 text-sm">#{String(order.id).padStart(4,'0')}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-100" />
                  <div>
                    <p className="text-xs text-gray-400">Ngày đặt</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-400">Tổng tiền</p>
                    <p className="text-sm font-extrabold text-gray-900">{Number(order.total_price).toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${STATUS[order.status]?.cls}`}>
                    {STATUS[order.status]?.icon} {STATUS[order.status]?.label}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 p-5">
                  {order.status !== 'cancelled' && (
                    <div className="mb-6 overflow-x-auto">
                      <div className="flex items-center min-w-max">
                        {STEPS.map((step, i) => (
                          <div key={step} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                i <= stepIdx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {i < stepIdx ? '✓' : i + 1}
                              </div>
                              <p className={`text-xs font-medium mt-1 ${i <= stepIdx ? 'text-orange-600' : 'text-gray-400'}`}>
                                {STATUS[step]?.label}
                              </p>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className={`w-16 h-0.5 mx-2 mb-4 ${i < stepIdx ? 'bg-orange-500' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <BookCover title={item.book_title} size="sm" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.book_title}</p>
                          <p className="text-xs text-gray-400">x{item.quantity} × {Number(item.unit_price).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <span className="text-sm font-bold">{Number(item.subtotal).toLocaleString('vi-VN')}₫</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">Tổng cộng</span>
                    <span className="text-lg font-black text-orange-500">{Number(order.total_price).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
