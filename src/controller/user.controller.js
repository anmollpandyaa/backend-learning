import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrorHandler.js"
import { User } from "../model/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponseHandler.js"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "failed to generate access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username, email, password} = req.body
    console.log("data recieved: ", fullName, username, email, password)

    // check if any field is empty using some method
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are compulsory")
    }

    // check is user already exists
    const userExists = await User.findOne({
        $or: [{username}, {email}]
    })

    if (userExists) {
        throw new ApiError(409, "user with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
        avatar: avatarUploaded.url,
        coverImage: coverImageUploaded.url || "", // keep empty if does not exist
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
        new ApiResponse(200, "user registered successfully", userCreated)
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body

    if(!email && !username){
        throw new ApiError(400, "username of password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "incorrect password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "user logged in successfully",
            {
                user: loggedInUser, accessToken, refreshToken
            }
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )

        const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, "user logged out", {})
})

export { registerUser }
export { loginUser }
export { logoutUser }