import "dotenv/config";
import express from "express";
import cors from "cors";
import { upload } from "./util/multerConfig.js";
import { uploadController } from "./controllers/uploadController.js";
import { createOrderController, verifyPaymentController } from "./controllers/paymentController.js";
import { downloadController, updateSheetController } from "./controllers/downloadController.js";

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
	})
);

app.use(express.json());
//! multer config and sheet and drive service env, backend url in reacty

app.post(
	"/api/form",
	upload.fields([
		{ name: "files" },
		{ name: "brandKit" },
		{ name: "textToSpeechFile" },
		{ name: "textFile" },
	]),
	uploadController
);

app.post("/create-order", createOrderController);
app.post("/verify", verifyPaymentController);

app.get("/api/download", downloadController);
app.post("/api/update-sheet", updateSheetController);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
