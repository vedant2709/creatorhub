import { Config } from "../config/config.js";
import Order from "../models/order.model.js";
import { checkPurchaseService, createOrderService, getOrderByIdService, getOrdersService, updateOrderStatusService } from "../services/order.service.js";

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
                authorization: `Bearer ${req.token}`, // 🔥 Use the token extracted by middleware
                "x-user": JSON.stringify(req.user)
                }
            }
        );

        console.log(response);

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
            status: { $in: ["pending", "paid"] }
        });

        if (existingOrder) {
            if (existingOrder.status === "paid") {
                return res.status(400).json({
                    success: false,
                    message: "Product already purchased"
                });
            }
            // 🔥 If pending, return the existing order so UI can resume payment
            return res.status(200).json({
                success: true,
                data: existingOrder,
                message: "Resuming existing order"
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

export const updateOrderStatusController = async(req,res,next) => {
    try {
        const {id} = req.params;
        const {status, paymentId} = req.body;

        // ✅ Validate status
        const allowedStatuses = ["pending","paid","failed"];

        if(!allowedStatuses.includes(status)){
            return res.status(400),json({
                message: "Invalid status"
            })
        }

        const order = await updateOrderStatusService(id, status, paymentId);

        res.json({
            success: true,
            message: "Order status updated",
            data: order
        });
    } catch (error) {
        if (error.message === "Order not found") {
            return res.status(404).json({
                message: error.message
            });
        }
        next(error);
    }
}

export const checkPurchaseController = async(req,res,next) => {
    try {
        const {productId} = req.params;
        
        const purchased = await checkPurchaseService(req.user.id, productId);

        res.json({
            success: true,
            purchased
        });
    } catch (error) {
        next(error)
    }
}