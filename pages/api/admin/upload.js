import nextConnect from "next-connect";
import { isAuth, isAdmin } from "../../../utils/auth";
import { onError } from "../../../utils/error";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
	api: {
		bodyParser: false,
	},
};

const handler = nextConnect({ onError });
const upload = multer();

handler.use(isAuth, isAdmin, upload.single("file")).post(async (req, res) => {
	const streamUpload = (req) => {
		return new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{ folder: "falaa_department" },
				(error, result) => {
					if (result) {
						console.log("success result", { result });
						resolve(result);
					} else {
						console.log("error result", { error });
						reject(error);
					}
				}
			);
			streamifier.createReadStream(req.file.buffer).pipe(stream);
		});
	};
	try{
		const result = await streamUpload(req);
		console.log("impage upload result", { result });
		res.send(result);
	}catch(e){
		console.log("image upload error", {e});
		res.status(400).send(e);
	};
});

export default handler;
