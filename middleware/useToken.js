// if access_token, append it to 'Authorization' header
// if no access_token, do not continue

module.exports = async (req, res, next) => {
    // get access_token from cookie
    const access_token = req.cookies['access_token'];

    // if no access token, return error
    if (!access_token) {
        return res.status(403).json({
            status: 403,
            error: 'No access token'
        })
    }
    
    req.headers['Authorization'] = `bearer ${req.cookies['access_token']}`;

    next();
};