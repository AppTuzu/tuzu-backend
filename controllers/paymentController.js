import Razorpay from "razorpay";
import crypto from 'crypto'

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrderController = async (req, res) => {
	const { amount, currency } = req.body;

	const options = {
		amount: amount * 100,
		currency,
		receipt: `receipt_${Date.now()}`,
	};

	try {
		const order = await razorpay.orders.create(options);
		res.json(order);
	} catch (err) {
		console.error(err);
		res.status(500).send("Something went wrong");
	}
};

export const verifyPaymentController = (req, res) => {
	const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
	const hmac = crypto
		.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
		.update(`${razorpay_order_id}|${razorpay_payment_id}`)
		.digest("hex");

	if (hmac === razorpay_signature) {
		res.json({ status: "success", message: "Payment verification successful." });
	} else {
		res.status(400).json({ status: "failed", message: "Payment verification failed." });
	}
};