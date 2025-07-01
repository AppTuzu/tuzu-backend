import multer from "multer"
import { fileURLToPath } from "url";
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadPath = path.join(__dirname, '../tmp')
// const uploadPath = '/tmp'

export const upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, uploadPath); 
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + "-" + file.originalname );
		},
	}),
});

