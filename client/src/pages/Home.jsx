import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, SearchIcon, StarIcon } from "../components/FontAwesomeIcons";
import { getPublicProducts } from "../services/products.service";
import { AuthContext } from "../context/AuthContext";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60";

const normalizeTag = (tag = "") => String(tag).trim();

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPublicProducts({ page: 1, limit: 24 });
        if (!isMounted) return;
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Failed to load products");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const tags = new Set();
    for (const product of products) {
      for (const tag of product?.tags || []) {
        const normalized = normalizeTag(tag);
        if (normalized) tags.add(normalized);
      }
    }
    return ["All", ...Array.from(tags).slice(0, 8)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => (p?.tags || []).some((t) => normalizeTag(t) === activeCategory));
  }, [activeCategory, products]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center space-x-12">
          <div 
            className="text-2xl font-bold tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            CreatorHub
          </div>
          <div className="hidden md:flex items-center space-x-1 text-blue-600 font-medium cursor-pointer group">
            <span className="border-b-2 border-blue-600 pb-1">Browse</span>
            <ChevronDownIcon className="text-sm transition-transform group-hover:translate-y-0.5" />
          </div>
          <div className="relative w-96 hidden lg:block">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#2d32d3] hover:bg-indigo-50 transition-all border border-indigo-100"
              >
                Dashboard
              </button>
              <div className="flex items-center space-x-3 bg-gray-50/50 px-4 py-2 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d32d3] to-[#4f46e5] flex items-center justify-center text-white shadow-md border-2 border-white">
                  <span className="text-sm font-bold uppercase">
                    {user.name ? user.name.charAt(0) : user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.1em] leading-none mb-1">
                    Hello,
                  </span>
                  <span className="text-[15px] font-extrabold text-[#1a1c1e] leading-none">
                    {user.name?.split(" ")[0] || "Friend"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#2d32d3] hover:bg-indigo-50 transition-all border border-indigo-100"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all shadow-sm"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="py-24 px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-[74px] font-[900] tracking-tight mb-10 leading-[1.05] text-[#1a1c1e]">
          Discover amazing tools from the world's{" "}
          <span className="text-[#3c44e6] italic font-serif">best creators.</span>
        </h1>

        <div className="relative max-w-2xl mx-auto mb-8 shadow-[0_30px_60px_-15px_rgba(60,68,230,0.15)] rounded-2xl">
          <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Find templates, assets, or courses..."
            className="w-full pl-16 pr-44 py-7 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-xl placeholder:text-gray-400 font-medium"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#2d32d3] text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-800 transition-all text-base shadow-lg shadow-indigo-200">
            Search
          </button>
        </div>

      </section>

	      <main className="max-w-7xl mx-auto px-8 pb-20">
	        <div className="flex items-center space-x-3 mb-16">
	          {categories.map((cat) => (
	            <button
	              key={cat}
	              onClick={() => setActiveCategory(cat)}
              className={`px-7 py-3 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[#2d32d3] text-white shadow-[0_10px_20px_rgba(45,50,211,0.2)]"
                  : "bg-[#eff2ff] text-[#2d32d3] hover:bg-indigo-100"
              }`}
            >
              {cat}
            </button>
	          ))}
	        </div>

          {error ? (
            <div className="max-w-xl mx-auto text-center py-10">
              <p className="text-sm font-bold text-red-600">Failed to load products</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[1.35/1] mb-5 rounded-2xl bg-gray-100 border border-gray-100" />
                      <div className="h-5 bg-gray-100 rounded w-4/5 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-2/5 mb-3" />
                      <div className="h-5 bg-gray-100 rounded w-full" />
                    </div>
                  ))
                : visibleProducts.length === 0
                  ? (
                      <div className="col-span-full text-center py-12">
                        <p className="text-sm font-bold text-gray-900">No products found</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Try a different tag filter, or check back later.
                        </p>
                      </div>
                    )
                  : visibleProducts.map((product) => {
                    const id = product?._id || product?.id;
                    const title = product?.title || "Untitled";
                    const author = product?.creatorId ? `Creator ${String(product.creatorId).slice(0, 6)}` : "Creator";
                    const badge = (product?.tags?.[0] || "Product").toUpperCase();
                    const price =
                      Number(product?.price || 0) === 0 ? "Free" : `₹${Number(product?.price || 0)}`;
                    const thumbnail = product?.thumbnail || FALLBACK_THUMBNAIL;

                    return (
                      <div
                        key={id}
                        className="group cursor-pointer"
                        onClick={() => id && navigate(`/product/${id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (!id) return;
                          if (e.key === "Enter" || e.key === " ") navigate(`/product/${id}`);
                        }}
                      >
                        <div className="relative aspect-[1.35/1] mb-5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                          <img
                            src={thumbnail}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_THUMBNAIL;
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-widest text-gray-800 shadow-sm uppercase">
                            {badge}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-bold text-[19px] leading-tight text-[#1a1c1e] group-hover:text-[#2d32d3] transition-colors">
                            {title}
                          </h3>
                          <p className="text-[14px] text-gray-500 font-medium tracking-tight">by {author}</p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-1.5">
                              <StarIcon className="text-[#f59e0b] text-[13px]" />
                              <span className="text-[14px] font-bold text-[#1a1c1e]">
                                {product?.tags?.length ? `${product.tags.length} tags` : "New"}
                              </span>
                            </div>
                            <div className="text-[18px] font-bold text-[#2d32d3]">{price}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
	      </main>
	    </div>
	  );
}
