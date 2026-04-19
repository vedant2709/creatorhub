import { Config } from "../config/config.js";

export const getDashboardStatsService = async (token) => {
  try {
    // 🔥 1. Fetch creator products
    const productsRes = await fetch(
      `${Config.PRODUCT_SERVICE_URL}/api/products/my-products`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        }
      }
    );

    // 🔥 2. Fetch creator orders (NEW API)
    const ordersRes = await fetch(
      `${Config.ORDER_SERVICE_URL}/api/orders/creator`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        }
      }
    );

    const productsData = await productsRes.json();
    const ordersData = await ordersRes.json();

    const products = productsData.products || [];
    const orders = ordersData.data || [];

    // 🔥 3. Filter paid orders
    const paidOrders = orders.filter(o => o.status === "paid");

    // 🔥 KPI 1: Total Revenue
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    // 🔥 KPI 2: Total Sales
    const totalSales = paidOrders.length;

    // 🔥 KPI 3: Total Products
    const totalProducts = products.length;

    // 🔥 KPI 4: Average Order Value
    const avgOrderValue =
      totalSales > 0 ? totalRevenue / totalSales : 0;

    // 🔥 KPI 5: Top Products
    const productMap = {};

    paidOrders.forEach(order => {
      const productId = order.productId;

      if (!productMap[productId]) {
        productMap[productId] = {
          productId,
          sales: 0,
          revenue: 0
        };
      }

      productMap[productId].sales += 1;
      productMap[productId].revenue += order.amount;
    });

    const topProducts = Object.values(productMap)
      .map(p => {
        const product = products.find(
          prod => prod._id == p.productId
        );

        return {
          productId: p.productId,
          title: product?.title || "Unknown",
          sales: p.sales,
          revenue: p.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 🔥 KPI 6: Revenue Over Time (last 7 days ready)
    const revenueByDate = {};

    paidOrders.forEach(order => {
      const date = new Date(order.createdAt)
        .toISOString()
        .split("T")[0];

      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }

      revenueByDate[date] += order.amount;
    });

    return {
      totalRevenue,
      totalSales,
      totalProducts,
      avgOrderValue,
      topProducts,
      revenueByDate
    };

  } catch (error) {
    console.error("Dashboard Error:", error);
    throw new Error("Failed to load dashboard");
  }
};