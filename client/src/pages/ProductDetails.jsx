import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById, getPublicProductById } from "../services/products.service";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&auto=format&fit=crop&q=60";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        let res;
        try {
          res = await getProductById(id);
        } catch (e) {
          // If the backend protects `/products/:id`, fallback to public list scan.
          res = await getPublicProductById(id);
        }
        if (!isMounted) return;
        setProduct(res?.data || null);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Failed to load product");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    if (id) load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="h-5 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-[2.3/1] bg-gray-100 animate-pulse" />
            <div className="p-8">
              <div className="h-7 w-2/3 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded mt-4 animate-pulse" />
              <div className="h-20 w-full bg-gray-100 rounded mt-6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm font-bold text-red-600">Couldn&apos;t load product</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-[#2d32d3] hover:bg-indigo-50 transition-all border border-indigo-100"
            >
              Back to browse
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = product?.title || "Untitled";
  const description = product?.description || "";
  const thumbnail = product?.thumbnail || FALLBACK_THUMBNAIL;
  const priceNumber = Number(product?.price || 0);
  const priceLabel = priceNumber === 0 ? "Free" : `$${priceNumber}`;
  const tags = Array.isArray(product?.tags) ? product.tags : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-sm font-bold text-[#2d32d3] hover:text-indigo-900 transition-colors">
          ← Back to browse
        </Link>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative aspect-[2.3/1] bg-gray-100">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_THUMBNAIL;
              }}
            />
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-black text-[#2d32d3] shadow-sm">
              {priceLabel}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-[900] tracking-tight text-[#1a1c1e]">{title}</h1>
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[#eff2ff] text-[#2d32d3]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 w-full md:w-[280px]">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="text-sm text-gray-600 font-medium">Price</div>
                  <div className="text-2xl font-[900] text-[#1a1c1e] mt-1">{priceLabel}</div>
                  <button
                    type="button"
                    className="mt-4 w-full px-5 py-3 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all shadow-sm"
                  >
                    {priceNumber === 0 ? "Get for free" : "Buy now"}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    This is a UI placeholder — wire checkout/download next.
                  </p>
                </div>
              </div>
            </div>

            {description && (
              <div className="mt-8">
                <h2 className="text-sm font-black tracking-widest uppercase text-gray-700">Description</h2>
                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
