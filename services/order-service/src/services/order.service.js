import Order from "../models/order.model.js"

export const createOrderService = async(data) => {
    const order = await Order.create(data);
    return order;
}

export const getOrdersService = async(userId) => {
    const orders = await Order.find({userId}).sort({createdAt:-1});
    return orders;
}

export const getOrderByIdService = async(orderId, userId) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error("Order not found");
    }

    // 🔥 Ownership check
    if (order.userId !== userId) {
        throw new Error("Not authorized");
    }

    return order;
}