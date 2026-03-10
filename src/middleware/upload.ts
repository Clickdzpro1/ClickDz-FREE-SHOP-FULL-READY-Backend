import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../utils/constants";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`));
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array("images", 10);

// For CCP/BaridiMob payment proof
export const uploadProof = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("proof");
