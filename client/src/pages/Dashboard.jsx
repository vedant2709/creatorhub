import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  createProduct, 
  getCreatorProducts, 
  deleteProduct,
  togglePublish,
  updateProduct
} from '../services/creator.service';
import { 
  PlusIcon, 
  BoxIcon, 
  ImageIcon, 
  SpinnerIcon,
  TrashIcon,
  DollarSignIcon,
  ChartLineIcon,
  FolderPlusIcon,
  GlobeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '../components/FontAwesomeIcons';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productTitle: '' });
  const [newProduct, setNewProduct] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    thumbnail: null,
    file: null,
    tags: ''
  });

  const isCreator = user?.role === 'creator';

  useEffect(() => {
    if (isCreator) {
      loadProducts();
    }
  }, [isCreator]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getCreatorProducts();
      // Handle both flat array and paginated response { products: [...] }
      const productList = Array.isArray(res.data) 
        ? res.products 
        : (res?.products || []);
      setProducts(productList);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProduct.file) {
        return toast.error('Product asset file is required');
      }

      const tagsArray = newProduct.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('tags', JSON.stringify(tagsArray));
      
      if (newProduct.thumbnail) {
        formData.append('thumbnail', newProduct.thumbnail);
      }
      
      formData.append('file', newProduct.file);
      
      const res = await createProduct(formData);
      toast.success('Product added successfully');
      
      // Update local state with new product
      const createdProduct = res.data;
      setProducts([createdProduct, ...products]);
      
      setShowAddForm(false);
      setNewProduct({ title: '', description: '', price: '', thumbnail: null, file: null, tags: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = editingProduct.tags_input.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const formData = new FormData();
      formData.append('title', editingProduct.title);
      formData.append('description', editingProduct.description);
      formData.append('price', editingProduct.price);
      formData.append('tags', JSON.stringify(tagsArray));
      
      if (editingProduct.newThumbnail) {
        formData.append('thumbnail', editingProduct.newThumbnail);
      }
      
      if (editingProduct.newFile) {
        formData.append('file', editingProduct.newFile);
      }
      
      const res = await updateProduct(editingProduct._id, formData);
      toast.success('Product updated successfully');
      
      setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      setEditingProduct(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      ...product,
      tags_input: product.tags?.join(', ') || '',
      newThumbnail: null,
      newFile: null
    });
    setShowAddForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await togglePublish(id);
      const updatedProduct = res.data;
      setProducts(products.map(p => p._id === id ? updatedProduct : p));
      toast.success(`Product ${updatedProduct.isPublished ? 'published' : 'moved to drafts'}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const confirmDelete = async () => {
    const { productId } = deleteModal;
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p._id !== productId));
      setDeleteModal({ isOpen: false, productId: null, productTitle: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product._id,
      productTitle: product.title
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section with User Profile */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2d32d3] to-[#4f46e5] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#1a1c1e]">
                  {isCreator ? 'Creator Studio' : 'Account Dashboard'}
                </h1>
                <p className="text-gray-500 font-medium">Managing assets for {user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
              >
                Marketplace
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/", { replace: true });
                }}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-all border border-red-100 shadow-sm shadow-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {isCreator ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                  <BoxIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">{products.length}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Products</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
                  <DollarSignIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">$0.00</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                  <ChartLineIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">0</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Sales</div>
              </div>
              <div className="bg-[#2d32d3] p-6 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-800 transition-all"
                   onClick={() => { setShowAddForm(true); setEditingProduct(null); }}>
                <PlusIcon className="text-white text-2xl mb-2" />
                <span className="text-white font-black text-sm uppercase tracking-wider">Add New Product</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col gap-8">
              {showAddForm && (
                <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl animate-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900">Create New Asset</h2>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 font-bold">Close</button>
                  </div>
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Title</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Cyberpunk Digital Art Pack"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          value={newProduct.title}
                          onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          required
                          placeholder="What's included in this digital asset?"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 transition-all"
                          value={newProduct.description}
                          onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                          <input
                            required
                            type="number"
                            placeholder="0.00"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tags</label>
                          <input
                            type="text"
                            placeholder="Art, Digital, 3D"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={newProduct.tags}
                            onChange={e => setNewProduct({...newProduct, tags: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Thumbnail Image</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <ImageIcon />
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="w-full pl-12 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              onChange={e => setNewProduct({...newProduct, thumbnail: e.target.files[0]})}
                            />
                          </div>
                          {newProduct.thumbnail && <p className="text-[10px] font-bold text-indigo-600 mt-1 ml-1 truncate">Selected: {newProduct.thumbnail.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Asset (File)</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <FolderPlusIcon />
                            </div>
                            <input
                              required
                              type="file"
                              className="w-full pl-12 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              onChange={e => setNewProduct({...newProduct, file: e.target.files[0]})}
                            />
                          </div>
                          {newProduct.file && <p className="text-[10px] font-bold text-indigo-600 mt-1 ml-1 truncate">Selected: {newProduct.file.name}</p>}
                        </div>
                      </div>
                      <div className="pt-4 md:col-span-2">
                        <button type="submit" className="w-full py-4 bg-[#2d32d3] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                          Publish to Marketplace
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {editingProduct && (
                <div className="bg-white p-8 rounded-3xl border-2 border-[#2d32d3] shadow-xl animate-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Edit Asset</h2>
                      <p className="text-sm text-gray-500 font-medium mt-1">Modifying: {editingProduct.title}</p>
                    </div>
                    <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
                  </div>
                  <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Title</label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                          value={editingProduct.title}
                          onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          required
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 transition-all"
                          value={editingProduct.description}
                          onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                          <input
                            required
                            type="number"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                            value={editingProduct.price}
                            onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tags</label>
                          <input
                            type="text"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={editingProduct.tags_input}
                            onChange={e => setEditingProduct({...editingProduct, tags_input: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Update Thumbnail (Optional)</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <ImageIcon />
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="w-full pl-12 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              onChange={e => setEditingProduct({...editingProduct, newThumbnail: e.target.files[0]})}
                            />
                          </div>
                          {editingProduct.newThumbnail ? (
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 ml-1 truncate">New: {editingProduct.newThumbnail.name}</p>
                          ) : (
                            <p className="text-[10px] font-bold text-gray-400 mt-1 ml-1">Leave empty to keep current</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Update Product Asset (Optional)</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <FolderPlusIcon />
                            </div>
                            <input
                              type="file"
                              className="w-full pl-12 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              onChange={e => setEditingProduct({...editingProduct, newFile: e.target.files[0]})}
                            />
                          </div>
                          {editingProduct.newFile ? (
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 ml-1 truncate">New: {editingProduct.newFile.name}</p>
                          ) : (
                            <p className="text-[10px] font-bold text-gray-400 mt-1 ml-1">Leave empty to keep current</p>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setEditingProduct(null)} className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all">
                          Cancel
                        </button>
                        <button type="submit" className="py-4 bg-[#2d32d3] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Grid */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900">Your Published Assets</h2>
                {loading ? (
                  <div className="flex justify-center py-20"><SpinnerIcon className="animate-spin text-[#2d32d3] text-4xl" /></div>
                ) : products.length === 0 ? (
                  <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <BoxIcon className="text-5xl text-gray-200 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-gray-400">No assets published yet</h3>
                    <p className="text-gray-400 text-sm mt-2">Click "Add New Product" to start selling your digital work.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="aspect-video relative overflow-hidden bg-gray-100">
                          <img 
                            src={product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'} 
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
                              product.isPublished 
                                ? 'bg-green-500/90 text-white' 
                                : 'bg-amber-500/90 text-white'
                            }`}>
                              {product.isPublished ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button 
                              onClick={() => handleTogglePublish(product._id)}
                              title={product.isPublished ? "Move to Drafts" : "Publish to Marketplace"}
                              className={`w-9 h-9 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-sm transition-all ${
                                product.isPublished 
                                  ? 'bg-white/90 text-amber-500 hover:bg-amber-500 hover:text-white' 
                                  : 'bg-white/90 text-[#2d32d3] hover:bg-[#2d32d3] hover:text-white'
                              }`}
                            >
                              {product.isPublished ? <EyeSlashIcon className="text-sm" /> : <GlobeIcon className="text-sm" />}
                            </button>
                            <button 
                              onClick={() => handleEditClick(product)}
                              title="Edit Product"
                              className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 flex items-center justify-center shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <PencilIcon className="text-sm" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product)}
                              title="Delete Product"
                              className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm text-red-500 flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all"
                            >
                              <TrashIcon className="text-sm" />
                            </button>
                          </div>
                          <div className="absolute bottom-4 left-4 bg-[#2d32d3] text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg">
                            ${product.price}
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-[#2d32d3] transition-colors">{product.title}</h4>
                          <p className="text-gray-500 text-sm mt-2 line-clamp-2 font-medium">{product.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Non-Creator View (Regular User) */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
              <div className="text-4xl font-black text-[#1a1c1e]">0</div>
              <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">My Assets</div>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
              <div className="text-4xl font-black text-[#1a1c1e]">0</div>
              <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">Downloads</div>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
              <div className="text-4xl font-black text-[#1a1c1e]">$0.00</div>
              <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">Spent</div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 text-3xl mb-6 mx-auto">
                <ExclamationTriangleIcon />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Asset?</h3>
              <p className="text-gray-500 font-medium px-4">
                Are you sure you want to delete <span className="text-gray-900 font-bold">"{deleteModal.productTitle}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 bg-gray-50/50 border-t border-gray-100">
              <button 
                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                className="flex-1 px-6 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-white hover:text-gray-700 transition-all border border-transparent hover:border-gray-200"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 rounded-2xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-100 uppercase tracking-widest"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;