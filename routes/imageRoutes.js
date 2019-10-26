const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const headers  = {'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`};

// fetch album info with images
router.get('/:id', async (req, res) => {
    const {id} = req.params;

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
            const errorMessage = e.response.data.data.error;
            const errorStatus = e.response.data.data.status;
            
            return res.status(errorStatus).json({
                status: errorStatus,
                error: errorMessage,
                details: e
            })
        }
    }

    
})

module.exports = router;