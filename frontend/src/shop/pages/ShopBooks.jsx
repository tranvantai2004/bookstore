import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import shopApi from '../shopApi';
import { useCart } from '../CartContext';
import BookCover from '../../components/BookCover';
import { Search, SlidersHorizontal, Star, ShoppingCart, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [catFilter, setCatFilter] = useState('');
  const [sort, setSort] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (catFilter) p.append('category', catFilter);
    if (sort) p.append('ordering', sort);
    shopApi.get(`/books/?${p}`).then(r => setBooks(r.data.results || r.data));
  }, [search, catFilter, sort]);

  useEffect(() => {
    shopApi.get('/books/categories/').then(r => setCategories(r.data.results || r.data));
  }, []);

  const handleAdd = (book) => {
    if (book.stock === 0) return toast.error('Sách đã hết hàng');
    addToCart(book);
    toast.success('Đã thêm vào giỏ!', { duration: 1500 });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sách, tác giả..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>
        {/* Category */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-w-44">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-w-44">
          <option value="">Sắp xếp mặc định</option>
          <option value="price">Giá tăng dần</option>
          <option value="-price">Giá giảm dần</option>
          <option value="-created_at">Mới nhất</option>
          <option value="title">Tên A-Z</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">Tìm thấy <strong>{books.length}</strong> cuốn sách</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
            <div className="relative p-4 bg-gradient-to-b from-gray-50 to-white flex justify-center">
              <BookCover title={book.title} author={book.author} size="lg" imageUrl={book.image} />
              {book.stock === 0 && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-t-2xl">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Hết hàng</span>
                </div>
              )}
            </div>
            <div className="px-3 pb-3">
              <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mb-0.5">{book.title}</p>
              <p className="text-xs text-gray-400 mb-1.5 truncate">{book.author}</p>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={9} className={s<=4?'text-orange-400 fill-orange-400':'text-gray-200 fill-gray-200'} />)}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-orange-500">{Number(book.price).toLocaleString('vi-VN')}₫</span>
                <span className="text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">-20%</span>
              </div>
              <button onClick={() => handleAdd(book)} disabled={book.stock === 0}
                className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-xl hover:bg-orange-600 transition disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-1.5">
                <ShoppingCart size={12} />
                {book.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {books.length === 0 && (
        <div className="text-center py-20 text-gray-400">Không tìm thấy sách nào</div>
      )}
    </div>
  );
}
