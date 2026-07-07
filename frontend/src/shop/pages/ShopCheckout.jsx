import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import BookCover from '../../components/BookCover';
import shopApi from '../shopApi';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, MapPin, Phone, User, Mail, CreditCard } from 'lucide-react';

export default function ShopCheckout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const shopUser = JSON.parse(localStorage.getItem('shop_user') || 'null');

  const [form, setForm] = useState({
    full_name: shopUser ? `${shopUser.first_name || ''} ${shopUser.last_name || ''}`.trim() : '',
    phone: shopUser?.phone || '',
    email: shopUser?.email || '',
    address: '',
    note: '',
    payment: 'cod',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const shipping = total >= 300000 ? 0 : 30000;
  const finalTotal = total + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopUser) { toast.error('Vui lòng đăng nhập để đặt hàng!'); navigate('/shop/login'); return; }
    if (cart.length === 0) { toast.error('Giỏ hàng trống!'); return; }
    setLoading(true);
    try {
      // Tìm hoặc tạo customer record từ thông tin form
      let custId;
      try {
        const searchRes = await shopApi.get(`/orders/customers/?search=${form.phone}`);
        const found = (searchRes.data.results || searchRes.data).find(c => c.phone === form.phone);
        if (found) {
          custId = found.id;
        } else {
          const newCust = await shopApi.post('/orders/customers/', {
            full_name: form.full_name,
            phone: form.phone,
            email: form.email,
            address: form.address,
          });
          custId = newCust.data.id;
        }
      } catch {
        // Nếu không tìm/tạo được customer, tạo mới
        const newCust = await shopApi.post('/orders/customers/', {
          full_name: form.full_name || shopUser.username,
          phone: form.phone || '0000000000',
          email: form.email,
          address: form.address,
        });
        custId = newCust.data.id;
      }

      // Tạo order
      const orderRes = await shopApi.post('/orders/', {
        customer: custId,
        note: `${form.note ? form.note + ' | ' : ''}Địa chỉ: ${form.address} | Thanh toán: ${
          form.payment === 'cod' ? 'COD' : form.payment === 'bank' ? 'Chuyển khoản' : 'MoMo'
        }`,
        items: cart.map(i => ({ book: i.id, quantity: i.quantity })),
      });

      setOrderId(orderRes.data.id);
      clearCart();
      setDone(true);
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.detail || 'Đặt hàng thất bại, vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={52} className="text-green-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Đặt hàng thành công! 🎉</h1>
      <p className="text-gray-500 mb-1">Mã đơn hàng: <strong className="text-orange-500">#{String(orderId).padStart(4,'0')}</strong></p>
      <p className="text-gray-400 text-sm mb-8">Chúng tôi sẽ liên hệ xác nhận và giao hàng trong 2-3 ngày làm việc.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/shop/orders" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
          Xem đơn hàng
        </Link>
        <Link to="/shop" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
          Về trang chủ
        </Link>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Giỏ hàng trống!</p>
      <Link to="/shop/books" className="text-orange-500 hover:underline font-semibold">Mua sắm ngay</Link>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/shop/cart" className="text-orange-500 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Giỏ hàng
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-black text-gray-900">Thanh toán</h1>
      </div>

      {!shopUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-amber-600 text-sm font-medium">
            ⚠️ Bạn chưa đăng nhập.
            <Link to="/shop/login" className="text-orange-500 font-bold hover:underline ml-1">Đăng nhập</Link>
            {' '}để theo dõi đơn hàng sau khi đặt.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shipping info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" /> Thông tin giao hàng
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="0901234567"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ giao hàng <span className="text-red-400">*</span></label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="Số nhà, đường, phường, quận, tỉnh"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                  placeholder="Ghi chú thêm về đơn hàng (không bắt buộc)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 resize-none" rows={2} />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-orange-500" /> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'cod',  label: 'Thanh toán khi nhận hàng (COD)', sub: 'Trả tiền mặt khi nhận hàng', emoji: '💵' },
                  { value: 'bank', label: 'Chuyển khoản ngân hàng', sub: 'Vietcombank / MB Bank / Techcombank', emoji: '🏦' },
                  { value: 'momo', label: 'Ví MoMo', sub: 'Thanh toán qua ứng dụng MoMo', emoji: '💜' },
                ].map(p => (
                  <label key={p.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      form.payment === p.value ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'
                    }`}>
                    <input type="radio" name="payment" value={p.value}
                      checked={form.payment === p.value}
                      onChange={e => setForm({...form, payment: e.target.value})} className="sr-only" />
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${form.payment === p.value ? 'text-orange-700' : 'text-gray-900'}`}>{p.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.payment === p.value ? 'border-orange-500' : 'border-gray-300'
                    }`}>
                      {form.payment === p.value && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-base hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-60">
              {loading ? 'Đang xử lý...' : `Đặt hàng — ${finalTotal.toLocaleString('vi-VN')}₫`}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-black text-gray-900 mb-4">Đơn hàng ({cart.length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <BookCover title={item.title} author={item.author} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    {(Number(item.price) * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span><span>{total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Vận chuyển</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              <div className="flex justify-between font-black text-orange-500 text-base pt-2 border-t border-gray-100">
                <span>Tổng</span><span>{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
