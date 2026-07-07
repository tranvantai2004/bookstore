import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import shopApi from '../shopApi';
import { useCart } from '../CartContext';
import BookCover from '../../components/BookCover';
import { ShoppingCart, ArrowRight, Star, Zap, Shield, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function BookCard({ book }) {
  const { addToCart } = useCart();
  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(book);
    toast.success('Đã thêm vào giỏ!', { duration: 1500 });
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
      <div className="relative p-5 bg-gradient-to-b from-gray-50 to-white flex justify-center">
        <BookCover title={book.title} author={book.author} size="lg" imageUrl={book.image} />
        {book.stock <= 5 && book.stock > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Sắp hết</span>
        )}
        <button onClick={handleAdd} disabled={book.stock === 0}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-orange-600 whitespace-nowrap disabled:bg-gray-300">
          + Thêm vào giỏ
        </button>
      </div>
      <div className="px-4 pb-4">
        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-0.5">{book.title}</p>
        <p className="text-xs text-gray-400 mb-2 truncate">{book.author}</p>
        <div className="flex gap-0.5 mb-2">
          {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s<=4?'text-orange-400 fill-orange-400':'text-gray-200 fill-gray-200'} />)}
          <span className="text-xs text-gray-400 ml-1">(24)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-orange-500">{Number(book.price).toLocaleString('vi-VN')}₫</span>
            <span className="text-xs text-gray-300 line-through ml-1">{Math.round(Number(book.price)*1.2).toLocaleString('vi-VN')}₫</span>
          </div>
          <span className="text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">-20%</span>
        </div>
      </div>
    </div>
  );
}

export default function ShopHome() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activecat, setActiveCat] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    shopApi.get('/books/').then(r => setBooks(r.data.results || r.data));
    shopApi.get('/books/categories/').then(r => setCategories(r.data.results || r.data));
  }, []);

  const filtered = activecat ? books.filter(b => b.category === Number(activecat)) : books;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 rounded-3xl overflow-hidden p-8 md:p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-500/20 to-transparent" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-orange-500/30">
            <Zap size={12} /> HOT DEAL HÔM NAY
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            Khám phá thế giới<br />
            <span className="text-orange-400">tri thức không giới hạn</span>
          </h1>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Hàng nghìn đầu sách chất lượng, giao hàng nhanh toàn quốc. Giảm đến 50% cho thành viên mới.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/shop/books"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">
              Mua sách ngay <ArrowRight size={18} />
            </Link>
            <Link to="/shop/books"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition border border-white/20">
              Xem danh mục
            </Link>
          </div>
        </div>
        {/* Floating book covers decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex gap-3 rotate-3">
          {books.slice(0, 3).map(b => (
            <div key={b.id} className="transform hover:-translate-y-2 transition-transform duration-200" style={{transform: `rotate(${Math.random()*6-3}deg)`}}>
              <BookCover title={b.title} author={b.author} size="md" imageUrl={b.image} />
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Truck size={20} />, title: 'Miễn phí vận chuyển', sub: 'Đơn từ 300.000₫', color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: <Zap size={20} />, title: 'Giao hàng nhanh', sub: 'Trong 2-3 ngày', color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: <Shield size={20} />, title: 'Chất lượng đảm bảo', sub: 'Sách chính hãng', color: 'text-green-500', bg: 'bg-green-50' },
          { icon: <RefreshCw size={20} />, title: 'Đổi trả dễ dàng', sub: 'Trong vòng 7 ngày', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center ${f.color} shrink-0`}>{f.icon}</div>
            <div>
              <p className="text-sm font-bold text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">Danh mục sách</h2>
          <Link to="/shop/books" className="text-orange-500 text-sm font-semibold flex items-center gap-1 hover:underline">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button onClick={() => setActiveCat('')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              !activecat ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}>
            Tất cả
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id.toString())}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                activecat === c.id.toString() ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}>
              {c.name} <span className="opacity-60 font-normal">({c.book_count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Books grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">
            {activecat ? categories.find(c=>c.id.toString()===activecat)?.name : 'Sách nổi bật'}
          </h2>
          <span className="text-sm text-gray-400">{filtered.length} cuốn sách</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">Không có sách nào trong danh mục này</div>
        )}
      </div>
    </div>
  );
}
