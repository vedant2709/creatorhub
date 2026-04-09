import { Config } from "../config/config.js";
import Order from "../models/order.model.js";
import { createOrderService, getOrderByIdService, getOrdersService } from "../services/order.service.js";

export const createOrderController = async(req,res,next) => {
    try {
        const {productId} = req.body;

        // 🔥 1. Fetch product from product service
        const response = await fetch(
            `${Config.PRODUCT_SERVICE_URL}/${productId}`,
            {
                method: "GET",
                headers: {
                "Content-Type": "application/json",
                authorization: req.headers.authorization,
                "x-user": JSON.stringify(req.user)
                }
            }
        );

        const productData = await response.json();

        if (!productData?.data) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = productData.data;

        const existingOrder = await Order.findOne({
            userId: req.user.id,
            productId,
            status: {$in: ["pending","paid"]}
        });

        if (existingOrder) {
            return res.status(400).json({
                message: "Order already exists or product already purchased"
            });
        }

        // 🔥 2. Use price from backend
        const order = await createOrderService({
            userId: req.user.id,
            productId,
            amount: product.price
        })

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
}

export const getOrdersController = async(req,res,next) => {
    try {
        const orders = await getOrdersService(req.user.id);

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error)
    }
}

export const getOrderByIdController = async(req,res,next) => {
    try {
        const { id } = req.params;

        const order = await getOrderByIdService(id, req.user.id);

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        if (error.message === "Order not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.message === "Not authorized") {
            return res.status(403).json({
                message: error.message
            });
        }

        next(error);
    }
}