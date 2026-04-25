import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrorHandler.js"
import { User } from "../model/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponseHandler.js"

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username, email, password} = req.body
    console.log(fullName, username, email, password)

    // check if any field is empty using some method
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are compulsory")
    }

    // check is user already exists
    const userExists = User.findOne({
        $or: [{username}, {email}]
    })

    if (userExists) {
        throw new ApiError(409, "user with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    const avatarUploaded = await uploadOnCloudinary(avatarLocalPath)
    const coverImageUploaded = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatarUploaded) {
        throw new ApiError(400, "avatar is required")
    }

    // create an object after getting data and put into db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "", // keep empty if does not exist
        username: username.toLowerCase(),
        email,
        password
    })
    
    const userCreated = await User.findById(user._id)
    .select("-password -refreshToken")

    if (!userCreated) {
        throw new ApiError(500, "failed to register user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "user registered successfully")
    )
})

export { registerUser }