const express = require('express');
const router = express.Router();
const useToken = require('../middleware/useToken');
const axios = require('axios');
const uuidv4 = require('uuid/v4');
const cors = require('cors')

// login
router.get('/login', cors() ,async (req, res) => {
    const random_string = uuidv4();
    console.log(process.env.CLIENT_ID, random_string, process.env.URI);
    const url = `https://www.reddit.com/api/v1/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&state=${random_string}&redirect_uri=${process.env.URI}&duration=permanent&scope=identity history vote read save`;
    // return res.status(302).redirect(`https://www.reddit.com/api/v1/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&state=${random_string}&redirect_uri=${process.env.URI}&duration=permanent&scope=identity history vote read save`);
    return res.json({url});
})

// get access token
router.post('/access_token/:code', async (req, res) => {
    const code = req.params.code;
    // auth string has to be base64 encoded
    const auth_string = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

    const headers = {
        'Authorization': `Basic ${auth_string}`
    }

    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.URI}`;
    
    try {
        const response = await axios.post('https://www.reddit.com/api/v1/access_token', body, {headers});

        console.log(response.data);
        const {access_token, refresh_token} = response.data;

        return res.cookie('access_token', access_token).cookie('refresh_token', refresh_token).json({status: '200', message:"Logged in", payload: access_token});
    } catch(e) {
        console.log(e);
        return res.status(400).json(e);
    }
})

// refresh access token
router.post('/refresh_token/:code', async (req, res) => {
    const code = req.params.code;
    const auth_string = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

    const headers = {
        'Authorization': `Basic ${auth_string}`
    }

    const body = `grant_type=refresh_token&refresh_token=${code}`

    try {
        const response = await axios.post('https://www.reddit.com/api/v1/access_token', body, {headers});
        const data = response.data;
        const refresh_token = data
    } catch(e) {
        console.log(e)
    }
})

// get info about user
router.get('/info', useToken, async (req, res) => {
    try {
        const response = await axios.get('https://oauth.reddit.com/api/v1/me', {headers: {'Authorization': req.headers['Authorization']}});
        const data = response.data;
        return res.json(data)
    } catch(e) {
        res.clearCookie('access_token').clearCookie('refresh_token');
        return res.status(400).json(e);
    }
    
})

// gets all upvoted posts by user
router.post('/:username/upvoted', useToken, async (req, res) => {
    const {username} = req.params;
    const {limit, after} = req.body;
    try {
        const {access_token} = req.cookies;
        let response;
        if (access_token) {
            // user currently logged in
            response = await axios.get(`https://oauth.reddit.com/user/${username}/upvoted.json?raw_json=1&limit=${limit}&after=${after}&show=all`, 
            {headers: {'Authorization': `bearer ${access_token}`}});
        } else {
            // user not logged in
            return res.status(403).json({
                status: 403,
                error: 'Please log in to continue'
            })
        }

        const data = response.data;

        return res.json(data);
    } catch(e) {
        console.log(e);
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
})

// gets saved posts by user
router.post('/:username/saved', useToken, async (req, res) => {
    const {username} = req.params;
    const {limit, after} = req.body;
    try {
        const {access_token} = req.cookies;
        let response;
        if (access_token) {
            // user currently logged in
            response = await axios.get(`https://oauth.reddit.com/user/${username}/saved.json?raw_json=1&limit=${limit}&after=${after}&show=all`, 
            {headers: {'Authorization': `bearer ${access_token}`}});
        } else {
            // user not logged in
            return res.status(403).json({
                status: 403,
                error: 'Please log in to continue'
            })
        }

        const data = response.data;

        return res.json(data);
    } catch(e) {
        console.log(e);
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
})

// log out user
router.get('/logout', async (req, res) => {
    const auth_string = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

    const headers = {
        'Authorization': `Basic ${auth_string}`
    }

    const body = `token=${req.cookies['access_token']}&token_type_hint=ACCESS_TOKEN`

    try {
        const response = await axios.post(`https://www.reddit.com/api/v1/revoke_token`, body, {headers});
        console.log(response.data);
    } catch(e) {
        console.log(e.response);
    } finally {
        return res.clearCookie('access_token').clearCookie('refresh_token').json({status: 200, message: "Successfully logged out"});
    }
});



module.exports = router;