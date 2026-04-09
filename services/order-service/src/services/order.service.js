import Order from "../models/order.model.js"

export const createOrderService = async(data) => {
    const order = await Order.create(data);
    return order;
}