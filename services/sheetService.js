import { google } from "googleapis";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const keyFilePath = path.join(__dirname, "../service-account.json");

const credentials = JSON.parse(process.env.SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
	// keyFile: keyFilePath,
	// keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH,
	credentials,
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export const appendToSheet = async (data) => {
	const values = [
		[
			new Date().toLocaleString(),
			data.orderId,
			data.price,
			data.razorpayOrderId,
			data.razorpayPaymentId,
			data.email,
			data.number,
			data.contentType,
			data.canvasType,
			data.description,
			data.videoDuration,
			data.language,
			data.textToSpeech,
			data.textOverlay,
			data.folderUrl,
			data.instructions || "",
			data.relatedLinks || "",
			data.textToSpeechScript || "",
			data.customText || "",
			data.textToSpeechCharacter,
		],
	];

	await sheets.spreadsheets.values.append({
		spreadsheetId: SPREADSHEET_ID,
		range: "Sheet1!A1",
		valueInputOption: "USER_ENTERED",
		resource: { values },
	});
};
