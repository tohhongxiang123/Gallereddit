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
        const {data} = await axios.get(`https://api.imgur.com/3/album/${id}`, {headers});
        return res.json(data);
    } catch(e) {
        console.log(e);
    }

    
})

module.exports = router;