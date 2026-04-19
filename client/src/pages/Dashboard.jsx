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
import { getDashboardStats, getAIInsights } from '../services/dashboard.service';
import { getMyOrders } from '../services/order.service';
import { getProductById, downloadProduct } from '../services/products.service';
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
  PencilIcon,
  StarIcon,
  TimesCircleIcon
} from '../components/FontAwesomeIcons';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // States
  const [products, setProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    topProducts: [],
    revenueByDate: {}
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
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
      loadStats();
    } else if (user) {
      loadUserDashboard();
    }
  }, [isCreator, user]);

  const loadUserDashboard = async () => {
    try {
      setOrdersLoading(true);
      const res = await getMyOrders();
      if (res?.success) {
        const orders = res.data || [];
        setUserOrders(orders);
        
        // Fetch details for paid products
        const paidOrders = orders.filter(o => o.status === 'paid');
        const productDetails = await Promise.all(
          paidOrders.map(async (order) => {
            try {
              const pRes = await getProductById(order.productId);
              return pRes?.data;
            } catch (err) {
              return { _id: order.productId, title: 'Unknown Product', price: order.amount };
            }
          })
        );
        setPurchasedProducts(productDetails.filter(Boolean));
      }
    } catch (error) {
      console.error("Failed to load user dashboard:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      toast.info("Preparing download...");
      const res = await downloadProduct(id);
      if (res.success && res.data.fileUrl) {
        const response = await fetch(res.data.fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const fileName = res.data.title ? `${res.data.title.replace(/\s+/g, '_')}_asset` : 'asset';
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Download started!");
      }
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const res = await getDashboardStats();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleGetAIInsights = async () => {
    try {
      setAiLoading(true);
      const res = await getAIInsights();
      if (res?.success) {
        setAiInsights(res.data);
        toast.success("AI Insights generated!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAiLoading(false);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                  <BoxIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {statsLoading ? "..." : stats.totalProducts}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Products</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
                  <DollarSignIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {statsLoading ? "..." : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                  <ChartLineIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {statsLoading ? "..." : stats.totalSales}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Sales</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                  <DollarSignIcon />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {statsLoading ? "..." : `₹${stats.avgOrderValue.toFixed(2)}`}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Avg. Order</div>
              </div>
              <div className="bg-[#2d32d3] p-6 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-800 transition-all"
                   onClick={() => { setShowAddForm(true); setEditingProduct(null); }}>
                <PlusIcon className="text-white text-2xl mb-2" />
                <span className="text-white font-black text-sm uppercase tracking-wider">Add New Product</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Trend Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Revenue Trend</h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleGetAIInsights}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#2d32d3] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm disabled:opacity-50"
                    >
                      {aiLoading ? <SpinnerIcon className="animate-spin text-sm" /> : <ChartLineIcon className="text-sm" />}
                      {aiLoading ? "Analyzing..." : "Get AI Insights"}
                    </button>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 7 Days</span>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-3 px-2">
                  {(() => {
                    const days = [];
                    const now = new Date();
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date();
                      d.setUTCDate(now.getUTCDate() - i);
                      days.push(d.toISOString().split('T')[0]);
                    }
                    
                    const revenues = Object.values(stats.revenueByDate || {});
                    const maxRevenue = Math.max(...revenues, 10);
                    
                    return days.map(date => {
                      const revenue = stats.revenueByDate?.[date] || 0;
                      const height = (revenue / maxRevenue) * 100;
                      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
                      const fullDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
                      
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <div className="absolute -top-12 bg-gray-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap shadow-xl flex flex-col items-center gap-1 scale-95 group-hover:scale-100 origin-bottom">
                            <span className="text-gray-400 text-[9px] uppercase tracking-tighter">{fullDate}</span>
                            <span className="text-white text-xs">₹{revenue.toLocaleString('en-IN')}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                          </div>
                          <div 
                            className="w-full bg-indigo-50/50 rounded-t-xl group-hover:bg-indigo-100 transition-all relative overflow-hidden min-h-[4px]"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          >
                            {revenue > 0 && (
                              <div 
                                className="absolute inset-0 bg-[#2d32d3]"
                              />
                            )}
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase mt-4">{dayName}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Top Performing Assets */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Top Performers</h2>
                <div className="space-y-6">
                  {stats.topProducts?.length > 0 ? stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-[#2d32d3] transition-colors">{p.title}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.sales} Sales</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#2d32d3]">₹{p.revenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-50">
                      <ChartLineIcon className="text-3xl text-gray-200 mb-2 mx-auto" />
                      <p className="text-xs font-bold text-gray-400 uppercase">No sales yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insights Display */}
            {aiInsights && (
              <div className="bg-gradient-to-br from-[#2d32d3] to-[#4f46e5] rounded-[32px] p-8 md:p-12 shadow-2xl shadow-indigo-200 text-white animate-in slide-in-from-bottom duration-700 relative overflow-hidden">
                {/* Close Button */}
                <button 
                  onClick={() => setAiInsights(null)}
                  className="absolute top-2 right-6 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 z-20 group"
                  title="Close Insights"
                >
                  <TimesCircleIcon className="text-xl group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        AI Analysis Powered by Gemini
                      </div>
                      <h2 className="text-3xl font-black mb-2 leading-tight">Growth Strategy & Insights</h2>
                      <p className="text-indigo-100 font-medium text-lg leading-relaxed opacity-90">{aiInsights.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">Key Observations</h4>
                        <ul className="space-y-3">
                          {aiInsights.insights.map((insight, i) => (
                            <li key={i} className="flex gap-3 text-sm font-bold items-start">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-300 rounded-full shrink-0" />
                              {typeof insight === 'object' ? (insight.insight || insight.text || JSON.stringify(insight)) : insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">Actionable Steps</h4>
                        <ul className="space-y-3">
                          {aiInsights.suggestions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm font-bold items-start">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                              <div className="flex flex-col gap-1">
                                <span>{typeof step === 'object' ? (step.action || step.suggestion) : step}</span>
                                {typeof step === 'object' && step.priority && (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full w-fit uppercase tracking-tighter ${
                                    step.priority.toLowerCase() === 'high' ? 'bg-red-500/30 text-red-200' : 'bg-blue-500/30 text-blue-200'
                                  }`}>
                                    {step.priority} Priority
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {aiInsights.bestProduct && (
                    <div className="w-full md:w-64 bg-white rounded-3xl p-6 shadow-xl text-[#1a1c1e] transform hover:-rotate-2 transition-transform duration-500">
                      <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                        <StarIcon />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Top Potential</h4>
                      <p className="font-black text-xl leading-tight mb-4">{aiInsights.bestProduct}</p>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-bold leading-relaxed">This asset is driving your current engagement. Focus on similar content.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
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
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
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
                            ₹{product.price}
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
                <div className="text-4xl font-black text-[#1a1c1e]">
                  {ordersLoading ? "..." : purchasedProducts.length}
                </div>
                <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">My Assets</div>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
                <div className="text-4xl font-black text-[#1a1c1e]">
                  {ordersLoading ? "..." : purchasedProducts.length}
                </div>
                <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">Downloads</div>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
                <div className="text-4xl font-black text-[#1a1c1e]">
                  {ordersLoading ? "..." : `₹${userOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0).toLocaleString('en-IN')}`}
                </div>
                <div className="text-xs text-indigo-600 uppercase tracking-[0.2em] font-black mt-3">Spent</div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900">Your Library</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-20"><SpinnerIcon className="animate-spin text-[#2d32d3] text-4xl" /></div>
              ) : purchasedProducts.length === 0 ? (
                <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                  <BoxIcon className="text-5xl text-gray-200 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-gray-400">Your library is empty</h3>
                  <p className="text-gray-400 text-sm mt-2">Browse the marketplace to find amazing digital assets.</p>
                  <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-[#2d32d3] text-white rounded-xl font-bold text-sm">Browse Marketplace</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedProducts.map(product => (
                    <div key={product._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                      <div className="aspect-video relative overflow-hidden bg-gray-100">
                        <img 
                          src={product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'} 
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <button 
                            onClick={() => handleDownload(product._id)}
                            className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-[#2d32d3] font-bold text-xs shadow-sm hover:bg-[#2d32d3] hover:text-white transition-all"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-[#2d32d3] transition-colors">{product.title}</h4>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-1 font-medium">{product.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
