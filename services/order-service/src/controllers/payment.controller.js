import { Config } from "../config/config.js";
import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js"
import crypto from "crypto";
import { updateOrderStatusService } from "../services/order.service.js";

export const createPaymentOrder = async(req,res,next) => {
    try {
        const {orderId} = req.body;
        
        // 🔥 Get order from DB
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // 🔥 Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: order.amount * 100,
            currency: "INR",
            receipt: order._id.toString()
        });

        console.log("Razorpay order...", razorpayOrder);

        res.json({
            success: true,
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: Config.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        next(error)
    }
}

export const verifyPayment = async(req,res,next) => {
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId} = req.body;

        // 🔥 Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
        .createHmac("sha256",Config.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if(expectedSignature !== razorpay_signature){
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        // 🔥 Update order → PAID
        const order = await updateOrderStatusService(
            orderId,
            "paid",
            razorpay_payment_id
        );

        res.json({
            success: true,
            message: "Payment verified",
            data: order
        });
    } catch (error) {
        next(error);
    }
}