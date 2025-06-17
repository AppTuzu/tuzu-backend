import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { upload } from "./util/multerConfig.js";
import { uploadController } from "./controllers/uploadController.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// app.use(express.json());

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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});