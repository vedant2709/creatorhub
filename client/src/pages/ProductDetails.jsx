import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProductById, getPublicProductById, downloadProduct } from "../services/products.service";
import { checkPurchaseStatus, createOrder } from "../services/order.service";
import { createRazorpayOrder, verifyPayment } from "../services/payment.service";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { SpinnerIcon } from "../components/FontAwesomeIcons";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&auto=format&fit=crop&q=60";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPurchased, setIsPurchased] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Load product details
        let res;
        try {
          res = await getProductById(id);
        } catch (e) {
          res = await getPublicProductById(id);
        }
        
        if (!isMounted) return;
        const productData = res?.data || null;
        setProduct(productData);

        // Check if already purchased if user is logged in
        if (user && productData) {
          const statusRes = await checkPurchaseStatus(id);
          if (isMounted) setIsPurchased(statusRes.purchased);
        }

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
  }, [id, user]);

  const handleDownload = async () => {
    try {
      setProcessing(true);
      const res = await downloadProduct(id);
      if (res.success && res.data.fileUrl) {
        // 🔥 To force download from a cross-origin URL (Cloudinary), 
        // we fetch the file as a blob and then trigger the download.
        const response = await fetch(res.data.fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        
        // Use the actual filename if available, or extract from URL
        const fileName = res.data.title 
          ? `${res.data.title.replace(/\s+/g, '_')}_asset` 
          : res.data.fileUrl.split('/').pop();
          
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        toast.success("Download started!");
      }
    } catch (error) {
      toast.error("Failed to download file. Please try again.");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.info("Please login to purchase this asset");
      return navigate("/login");
    }

    try {
      setProcessing(true);
      
      // 1. Create local order
      const orderRes = await createOrder(id);
      const localOrder = orderRes.data;

      // 2. If product is free, it might already be marked as paid
      if (localOrder.status === 'paid') {
        setIsPurchased(true); // 🔥 Immediate state update
        toast.success("Added to your library!");
        setProcessing(false);
        return;
      }

      // 3. Initiate Razorpay Payment
      const razorpayOrderRes = await createRazorpayOrder(localOrder._id);
      const rpData = razorpayOrderRes.data;

      const options = {
        key: rpData.key,
        amount: rpData.amount,
        currency: rpData.currency,
        name: "CreatorHub",
        description: `Purchase ${product.title}`,
        order_id: rpData.razorpayOrderId,
        handler: async function (response) {
          try {
            setProcessing(true);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: localOrder._id
            });
            setIsPurchased(true);
            toast.success("Payment successful! You can now download the asset.");
          } catch (err) {
            toast.error("Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2d32d3",
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error(error.message);
      setProcessing(false);
    }
  };

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
  const priceLabel = priceNumber === 0 ? "Free" : `₹${priceNumber}`;
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
                  {isPurchased ? (
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleDownload}
                      className="mt-4 w-full px-5 py-3 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {processing ? <SpinnerIcon className="animate-spin" /> : "Download Asset"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleBuyNow}
                      className="mt-4 w-full px-5 py-3 rounded-xl text-sm font-bold bg-[#2d32d3] text-white hover:bg-indigo-800 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {processing ? <SpinnerIcon className="animate-spin" /> : (priceNumber === 0 ? "Get for free" : "Buy now")}
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {isPurchased 
                      ? "You own this asset. Enjoy your download!" 
                      : (priceNumber === 0 ? "Instant access to your library." : "Secure payment via Razorpay.")}
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
