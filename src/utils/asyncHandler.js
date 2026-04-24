const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch({
                success: false,
                message: "cannot handle async function"
            })
    }
}

// try catch version of the same handler
/*
const asyncHandler = (functionName) => {async(req, res, next) => {
    try {
        await functionName(req, res, next)
    } catch (error) {
        res.status(error.code).json({
            success: false,
            message: "cannot handle async function"
        })
    }
}}
*/

export {asyncHandler}