const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// middleware
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client", "build")))

const PORT = process.env.PORT || 5000;

app.use('/user', userRoutes);
app.use('/post', postRoutes);

// used to enable application only oauth
// https://github.com/reddit-archive/reddit/wiki/oauth2#application-only-oauth
app.get('/init_code/:device_id', async (req, res) => {
    const deviceId = req.params.device_id;
    const auth_string = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

    const headers = {
        'Authorization': `Basic ${auth_string}`
    }
    const body = `grant_type=client_credentials&device_id=${deviceId}`;
    const {data} = await axios.post(`https://www.reddit.com/api/v1/access_token`, body, {headers});

    const {access_token} = data;
    return res.cookie('no_user_access_token', access_token).json({deviceId, data});
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))