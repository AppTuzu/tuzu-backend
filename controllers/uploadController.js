import { customAlphabet } from "nanoid";
import { uploadToDrive } from "../services/driveService.js";
import { appendToSheet } from "../services/sheetService.js";

export const uploadController = async (req, res) => {
	try {
		const alphabet =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const generateId = customAlphabet(alphabet, 6);
		// const orderId = "ORDER-" + generateId();
		const orderId = "#" + generateId();
		const metaData = req.body;
		const files = req.files;

		if (
			!metaData.email ||
			!metaData.number ||
			!metaData.contentType ||
			files["files"].length === 0
		) {
			return res
				.status(400)
				.json({ success: false, message: "Missing required fields." });
		}

		const folderUrl = await uploadToDrive(orderId, files);

		if (!folderUrl) {
			res
				.status(500)
				.json({ success: false, message: "Failed to upload files" });
			return;
		}

		await appendToSheet({ ...metaData, orderId, folderUrl })

		res.status(200).json({
			success: true,
			message: "Upload successfulL",
			orderId,
			folderUrl,
		});
		
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: "Failed to upload files" });
	}
};
