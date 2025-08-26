import { google } from "googleapis";

const credentials = JSON.parse(process.env.SERVICE_ACCOUNT_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
	// keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH,
	credentials,
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const sheetId = process.env.GOOGLE_DOWNLOAD_SHEET_ID;
const range = "Sheet1!A2:E"; // A = orderID, B = VideoLink, C = Status

export const downloadController = async (req, res) => {
	const orderId = "#" + req.query.orderId;

	if (!orderId)
		return res.status(400).json({ success: false, message: "Missing orderId" });

	try {
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			range,
		});

		const rows = response.data.values;

		const row = rows.find((r) => r[0] === orderId);

		if (!row)
			return res
				.status(404)
				.json({ success: false, message: "Invalid order ID" });

		const videoLink = row[1] || null;
		const status = row[2]?.toLowerCase() || "";

		return res.json({
			success: true,
			orderId,
			videoLink,
			status,
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
};

export const updateSheetController = async (req, res) => {
	const { orderId, instructions, description } = req.body;

	try {
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			range,
		});

		const rows = response.data.values;
		const rowIndex = rows.findIndex((row) => row[0] === "#" + orderId);

		if (rowIndex === -1) {
			return res.status(400).json({ success: false, message: `Order ID ${orderId} not found`});
		}

		const rowNumber = rowIndex + 2; // account for header row

		// Update columns C (Status), D (Instructions), and E (Description)
		await sheets.spreadsheets.values.update({
			spreadsheetId: sheetId,
			range: `Sheet1!C${rowNumber}:E${rowNumber}`,
			valueInputOption: "RAW",
			requestBody: {
				values: [["in review", description, instructions]],
			},
		});

		return res
			.status(200)
			.json({ success: true, message: "Sheet updated successfully" });

	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" });
	}
};
