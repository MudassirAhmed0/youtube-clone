import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const validateRequiredFields = (requiredFields) => {
  if (requiredFields.some((field) => !field?.trim())) {
    throw new ApiError(400, "Required Fields are not submitted!");
  }
};

const checkIfUserExist = async (username, email) => {
  const existedUser = await User.findOne({
    $or: [{ username, email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User Already Exist");
  }
};

const validateAndUploadImagesOnCloudinary = async (files) => {
  const localAvatarPath = files?.avatar[0]?.path;
  const localCoverImagePath =
    files?.coverImage?.length > 0 ? files?.coverImage[0]?.path : undefined;

  if (!localAvatarPath) {
    throw new ApiError(400, "Avatar is Required");
  }
  const avatar = await uploadOnCloudinary(localAvatarPath);
  const coverImage = await uploadOnCloudinary(localCoverImagePath);
  return { avatar, coverImage };
};

const createUserInMongoDB = async (
  username,
  email,
  fullname,
  password,
  avatar,
  coverImage
) => {
  const user = User.create({
    fullname,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  if (user) return user;
  throw new ApiError(500, "Something went wrong while registering the user");
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  validateRequiredFields([username, email, fullname, password]);
  await checkIfUserExist(username, email);
  const { avatar, coverImage } = await validateAndUploadImagesOnCloudinary(
    req.files
  );
  const createdUser = await createUserInMongoDB(
    username,
    email,
    fullname,
    password,
    avatar,
    coverImage
  );
  const userResponse = await User.findById(createdUser?._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, "User Successfully Registed"));
});

export { registerUser };
