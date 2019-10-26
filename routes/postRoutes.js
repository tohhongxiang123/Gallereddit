const express = require('express');
const router = express.Router();
const axios = require('axios');
const useToken = require('../middleware/useToken');

const generateHeaders = token => {
    return {headers: {'Authorization': `bearer ${token}`}}
}

// errors should always return a {status: statuscode, error:errorMessage}

// gets all trending posts
router.post('/', async (req, res) => {
    let {limit, after} = req.body;
    const url = `http://oauth.reddit.com/.json?raw_json=1&limit=${limit}&after=${after}&show=all`;
    
    try {
        const {access_token} = req.cookies;
        const {no_user_access_token} = req.cookies;
        let response;

        if (access_token) {
            // user logged in
            response = await axios.get(url, generateHeaders(access_token));
            console.log({access_token});
        } else if (no_user_access_token) {
            // no user logged in, using oauth implicit grant
            response = await axios.get(url, generateHeaders(no_user_access_token));
        } else {
            // no user logged in, no oauth implicit grant
            response = await axios.get(`http://www.reddit.com/.json?raw_json=1&limit=${limit}&after=${after}`);
        }

        const data = response.data;

        return res.json(data);
    } catch (e) {
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
})

// gets :category posts by subreddit
router.post('/:subreddit/:category', async (req, res) => {
    // category: hot new random rising top
    const {subreddit, category} = req.params;
    const {limit, after, duration} = req.body;
    const url = `https://oauth.reddit.com/r/${subreddit}/${category}.json?raw_json=1&limit=${limit}&after=${after}&t=${duration}&show=all`;

    try {
        const {access_token} = req.cookies;
        const {no_user_access_token} = req.cookies;
        let response;
        if (access_token) {
            // user currently logged in
            response = await axios.get(url, generateHeaders(access_token));
        } else if (no_user_access_token) {
            // user not logged in, using oauth implicit grant
            response = await axios.get(url, generateHeaders(no_user_access_token));
        } else {
            // no implicit grant at all
            response = await axios.get(`https://www.reddit.com/r/${subreddit}/${category}.json?raw_json=1&limit=${limit}&after=${after}&t=${duration}`);
        }

        const data = response.data;

        return res.json(data);
    } catch(e) {
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
});

// upvote post by id
router.get('/upvote/:id/:dir', useToken, async (req, res) => {
    const {id, dir} = req.params;
    // dir is whether the post is to be upvoted or not. 1 is upvote, 0 is un-upvote
    const body = {};
    try {
        await axios.post(`https://oauth.reddit.com/api/vote?id=${id}&dir=${dir}&rank=2`, body, {headers: {'Authorization': req.headers['Authorization']}});

        return res.json({status: 200, message:'Upvoted'});
    } catch(e) {
        console.log(e.response.data);
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
});

// save post by id
router.get('/save/:id', useToken, async (req, res) => {
    const {id} = req.params;
    console.log(id);
    const body = {};
    try {
        const response = await axios.post(`https://oauth.reddit.com/api/save?id=${id}`, body, {headers: {'Authorization': req.headers['Authorization']}});
        const data = response.data;

        return res.json({status: 200, message:'Saved'});
    } catch(e) {
        console.log(e.response);
        console.log(e.response.data);
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
});

// unsave
router.delete('/save/:id', useToken, async (req, res) => {
    const {id} = req.params;
    console.log(id);
    const body = {};
    try {
        const response = await axios.post(`https://oauth.reddit.com/api/unsave?id=${id}`, body, {headers: {'Authorization': req.headers['Authorization']}});
        const data = response.data;

        return res.json({status: 200, message:'Unsaved'});
    } catch(e) {
        console.log(e.response);
        console.log(e.response.data);
        const {status, statusText} = e.response;

        return res.status(status).json({
            status,
            error: statusText
        });
    }
});

module.exports = router;