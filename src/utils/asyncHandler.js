const asyncHandler = (fn) => async (req, res) => {
    try {
        await fn(req, res)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export {asyncHandler}