import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, Package, Grid, List, Star, Link } from 'lucide-react';
import BookCover from '../components/BookCover';

const EMPTY = { title: '', author: '', description: '', price: '', stock: '', category: '', image: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid');

  const fetchBooks = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (catFilter) p.append('category', catFilter);
    api.get(`/books/?${p}`).then(r => setBooks(r.data.results || r.data));
  };

  useEffect(() => { fetchBooks(); }, [search, catFilter]);
  useEffect(() => { api.get('/books/categories/').then(r => setCategories(r.data.results || r.data)); }, []);

  const openEdit = (b) => {
    setForm({ title: b.title, author: b.author, description: b.description, price: b.price, stock: b.stock, category: b.category, image: b.image || '' });
    setEditId(b.id);
    setModal(true);
  };
  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) await api.put(`/books/${editId}/`, form);
      else await api.post('/books/', form);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm sách thành công!');
      setModal(false); fetchBooks();
    } catch { toast.error('Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa sách này?')) return;
    try { await api.delete(`/books/${id}/`); toast.success('Đã xóa'); fetchBooks(); }
    catch { toast.error('Xóa thất bại'); }
  };

  const stars = (n = 4) => Array.from({length: 5}, (_, i) => (
    <Star key={i} size={10} className={i < n ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'} />
  ));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Danh sách sách</h1>
          <p className="text-sm text-gray-500 mt-0.5">{books.length} đầu sách trong kho</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <Grid size={16} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <List size={16} />
            </button>
          </div>
          {user?.role === 'admin' && (
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
              <Plus size={16} /> Thêm sách
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên sách, tác giả..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-w-44">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map(book => (
            <div key={book.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden group cursor-pointer">
              {/* Cover area */}
              <div className="relative p-4 pb-3 bg-gradient-to-b from-gray-50 to-white flex justify-center">
                <BookCover title={book.title} author={book.author} size="lg" imageUrl={book.image} />
                {book.stock <= 5 && book.stock > 0 && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    Sắp hết
                  </span>
                )}
                {book.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    Hết hàng
                  </span>
                )}
                {user?.role === 'admin' && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(book)}
                      className="p-2.5 bg-white text-orange-500 rounded-xl hover:bg-orange-50 transition shadow-lg">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(book.id)}
                      className="p-2.5 bg-white text-red-500 rounded-xl hover:bg-red-50 transition shadow-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="px-3 pb-3">
                <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mb-0.5">{book.title}</p>
                <p className="text-xs text-gray-400 mb-1.5 truncate">{book.author}</p>
                <div className="flex items-center gap-0.5 mb-2">{stars(4)}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-orange-500">
                    {Number(book.price).toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs text-gray-400">{book.stock} còn</span>
                </div>
                <span className="inline-block mt-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {book.category_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Sách', 'Danh mục', 'Giá bán', 'Tồn kho', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-orange-50/20 transition group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover title={book.title} author={book.author} size="sm" imageUrl={book.image} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug">{book.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{book.category_name}</span>
                  </td>
                  <td className="px-5 py-3 font-extrabold text-orange-500 text-sm">
                    {Number(book.price).toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${book.stock > 20 ? 'bg-green-500' : book.stock > 5 ? 'bg-orange-400' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, (book.stock / 60) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6">{book.stock}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      book.stock > 5 ? 'bg-green-50 text-green-700' :
                      book.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {book.stock > 5 ? 'Còn hàng' : book.stock > 0 ? 'Sắp hết' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user?.role === 'admin' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                        <button onClick={() => openEdit(book)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(book.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {books.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20 mt-2">
          <Package size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Không có sách nào</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={editId ? 'Chỉnh sửa sách' : 'Thêm sách mới'} onClose={() => setModal(false)}>
          {/* Preview cover */}
          {(form.image || form.title) && (
            <div className="flex justify-center mb-5">
              <BookCover
                title={form.title}
                author={form.author}
                size="lg"
                imageUrl={form.image || null}
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên sách <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tác giả <span className="text-red-400">*</span></label>
              <input value={form.author} onChange={e => setForm({...form, author: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá (₫) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tồn kho <span className="text-red-400">*</span></label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục <span className="text-red-400">*</span></label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" required>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ảnh bìa sách
                <span className="text-gray-400 font-normal text-xs ml-2">(dán link URL)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link size={15} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="url"
                    value={form.image}
                    onChange={e => setForm({...form, image: e.target.value})}
                    placeholder="https://example.com/anh-bia-sach.jpg"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                  />
                </div>
              </div>
              {form.image && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-8 h-11 object-cover rounded shadow"
                    onError={e => { e.target.style.display='none'; }}
                  />
                  <span>Xem trước ảnh bìa</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 resize-none" rows={3} />
            </div>
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
