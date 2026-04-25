import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrorHandler.js"

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username, email, password} = req.body
    console.log(fullName, username, email, password)

    // check if any field is empty using some method
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are compulsory")
    }

    
})

export {registerUser}