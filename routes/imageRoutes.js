const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// fetch album info with images
router.get('/:id', async (req, res) => {
    const {id} = req.params;
    console.log(id);
    const headers = {'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`};
    try {
        const response = await axios.get(`https://api.imgur.com/3/album/${id}`, {headers});
        // if this passes, we know that the id we requested is an album. If not, we try again with image
        console.log({
            'user remaining': response.headers['x-ratelimit-userremaining'], 
            'client remaining': response.headers['x-ratelimit-clientremaining']})
        
        return res.json({type:"album", data: response.data});
    } catch(e) {
        try {
            const response = await axios.get(`https://api.imgur.com/3/image/${id}`, {headers});
            console.log({
                'user remaining': response.headers['x-ratelimit-userremaining'], 
                'client remaining': response.headers['x-ratelimit-clientremaining']})
            return res.json({type:"image", data: response.data});
        } catch (e) {
            return res.json({
                status: 'failed',
                error: e
            })
        }
    }

    
})

module.exports = router;