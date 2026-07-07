import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import BookCover from '../../components/BookCover';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Tag } from 'lucide-react';

export default function ShopCart() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();
  const shipping = total >= 300000 ? 0 : 30000;
  const finalTotal = total + shipping;

  if (cart.length === 0) return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag size={36} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
      <p className="text-gray-400 mb-6">Hãy chọn thêm sách bạn yêu thích nhé!</p>
      <Link to="/shop/books"
        className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
        <ArrowLeft size={18} /> Tiếp tục mua sắm
      </Link>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/shop/books" className="text-orange-500 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Tiếp tục mua
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-black text-gray-900">Giỏ hàng ({cart.length} sản phẩm)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
              <BookCover title={item.title} author={item.author} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-snug mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-400 mb-2">{item.author}</p>
                <p className="text-base font-extrabold text-orange-500 mb-3">
                  {Number(item.price).toLocaleString('vi-VN')}₫
                </p>
                <div className="flex items-center justify-between">
                  {/* Qty control */}
                  <div className="flex items-center gap-1 bg-gray-50 rounded-xl border border-gray-200 p-0.5">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-white rounded-lg transition">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-white rounded-lg transition disabled:opacity-40">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {(Number(item.price) * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                    <button onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-black text-gray-900 text-base mb-4">Tóm tắt đơn hàng</h2>

            {/* Voucher */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <Tag size={14} className="absolute left-3 top-3 text-gray-400" />
                <input placeholder="Nhập mã giảm giá"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <button className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                Áp dụng
              </button>
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cart.reduce((s,i)=>s+i.quantity,0)} sản phẩm)</span>
                <span className="font-semibold">{total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                  {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="bg-orange-50 text-orange-700 text-xs rounded-xl p-3">
                  Mua thêm <strong>{(300000 - total).toLocaleString('vi-VN')}₫</strong> để được miễn phí vận chuyển!
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-base">
                <span>Tổng cộng</span>
                <span className="text-orange-500">{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button onClick={() => navigate('/shop/checkout')}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition mt-5 flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
              Đặt hàng ngay <ArrowRight size={18} />
            </button>
            <Link to="/shop/books"
              className="w-full mt-3 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
