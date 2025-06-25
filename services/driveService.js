import fs from "fs";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const keyFilePath = path.join(__dirname, '../service-account.json')

const credentials = JSON.parse(process.env.SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
	// keyFile: keyFilePath,
	// keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH,
	credentials,
	scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const PARENT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

const createFolder = async (name) => {
	const res = await drive.files.create({
		requestBody: {
			name,
			mimeType: "application/vnd.google-apps.folder",
			parents: [PARENT_FOLDER_ID],
		},
		fields: "id",
	});
	return res.data.id;

	// !Search for existing folder with the same name
	// const res = await drive.files.list({
	// 	q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
	// 	fields: "files(id, name)",
	// });
	// if (res.data.files && res.data.files.length > 0) {
	// 	return res.data.files[0].id;
	// }

	// ! Create new folder if not found
	// const createRes = await drive.files.create({
	// 	requestBody: {
	// 		name,
	// 		mimeType: "application/vnd.google-apps.folder",
	// 	},
	// 	fields: "id",
	// });
	// return createRes.data.id;
}

const uploadSingleFile = async (file, folderId) => {
	const fileMetadata = {
		name: file.originalname,
		parents: [folderId],
	};
	const media = {
		mimeType: file.mimetype,
		body: fs.createReadStream(file.path),
	};
	const res = await drive.files.create({
		requestBody: fileMetadata,
		media,
		fields: "id, name",
	});
	return res.data;
};

export const uploadToDrive = async (orderId, files) => {
	const uploadedFiles = [];
	const folderId = await createFolder(orderId);

	for (const field in files) {
		const currFiles = files[field];

		for (const file of currFiles) {
			const uploaded = await uploadSingleFile(file, folderId);
			uploadedFiles.push({
				field,
				name: uploaded.name,
				id: uploaded.id,
			});
			await fs.unlink(file.path);
		}
	}

	// Make folder public
	await drive.permissions.create({
		fileId: folderId,
		requestBody: {
			role: "reader",
			type: "anyone",
		},
	});

	return `https://drive.google.com/drive/folders/${folderId}`;
};
