const cloudinary = require("cloudinary").v2;

//Cloudinary Config
cloudinary.config({
  cloud_name: "de4zekrke",
  api_key: "515435648194892",
  api_secret: "NKKu-Ct1JJKM7XUQfoQgPa_ECdA",
});

const uploadProfileImage = async (tempFilePath) => {
  const result = await cloudinary.uploader.upload(tempFilePath);
  return result;
};

const uploadCompanyImage = async (tempFilePath) => {
  const result = await cloudinary.uploader.upload(tempFilePath);
  return result;
};

const uploadCoverImage = async (tempFilePath) => {
  const result = await cloudinary.uploader.upload(tempFilePath);
  return result;
};

module.exports = { uploadProfileImage, uploadCoverImage, uploadCompanyImage };
