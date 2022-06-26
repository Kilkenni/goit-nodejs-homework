const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const { InvalidFileTypeError} = require("../errors/FileError");

const PUBLIC_PATH = "./public"
const PUBLIC_AVATAR_PATH = "/avatars";
const avatarPath = path.resolve(path.join(PUBLIC_PATH, PUBLIC_AVATAR_PATH) );
const tempPath = path.resolve("./tmp");

const validSubtypes = ["jpeg", "png"];
const validExtensions = ["jpg", "jpeg", "png"];

const avatarStorage = multer.diskStorage({
  destination: tempPath,
  filename: function (req, file, callback) {
    const [, fileExtension] = file.originalname.split(".");
    const nameForSaving = uuidv4() + "." + fileExtension;
    callback(null, nameForSaving);
  },
});
const uploadAvatars = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 1048576, // 1 Mb
  },
  fileFilter: function (req, file, callback) {
    //quick filter on MIME types
    const [, extension] = file.originalname.split(".");
    const [type, subtype] = file.mimetype.split("/");
    const accepted = (type === "image" && validSubtypes.includes(subtype) && validExtensions.includes(extension))
      ? true : false; //accepts only images with predefined subtypes 
    const error = accepted ? null : new InvalidFileTypeError(validSubtypes.join(", "));
    
    callback(error, accepted);
  },
});

async function resizeAndMoveAvatar(avatarName) {
  const origAvatar = await Jimp.read(path.join(tempPath, avatarName));
  await origAvatar.resize(250, 250, Jimp.RESIZE_BICUBIC);
  const [origName, origExt] = avatarName.split(".");
  const resizedName = origName + "_250" + "." + origExt;
  await origAvatar.writeAsync(path.join(tempPath, resizedName));

  await fs.rename(path.join(tempPath, resizedName), path.join(avatarPath, resizedName)); //move resized result to public
  await fs.unlink(path.join(tempPath, avatarName)); //delete original
  
  return path.join(PUBLIC_AVATAR_PATH, resizedName); //return public path
  
}

async function removeAvatar(avatarURL) {
  //do not delete file if avatar is a Gravatar (i.e. no file exists)
  if (avatarURL.includes("gravatar.com/avatar")) {
    return true;
  }
  const pathArray = avatarURL.split("/");
  const avatarName = pathArray[pathArray.length - 1]; //get only filename
  return await fs.unlink(path.join(avatarPath, avatarName));
}

module.exports = {
  uploadAvatars,
  resizeAndMoveAvatar,
  removeAvatar,
  validFileTypes: validSubtypes,
};