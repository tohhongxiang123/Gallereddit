import React, { useContext, useEffect } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import {UserContext} from '../UserContext';
import axios from 'axios';

function Login(props) {
    // if user agrees, will receive a params.code, which is the refresh token to exchange for a bearer token
    // if user disagrees, will receive a params.error = 'access_denied"
    // params.state = RANDOM_STRING 
    const [, setUser] = useContext(UserContext);
    const params = queryString.parse(props.location.search);
    const code = params.code;

    // get access token on component mount
    useEffect(() => {
        async function getAccessToken(code){
            try {
                await axios.post(`/user/access_token/${code}`); // sets the access token and refresh token cookie
                
                const userInfoResponse = await axios.get(`/user/info`);
                const userData = userInfoResponse.data;
    
                setUser(userData);
            } catch(e) {
                console.log({...e});
            }
            
        }

        getAccessToken(code);
    }, [code, setUser]);
    
    
    return (
        <Redirect to={'/'} />
    )
}

export default withRouter(Login);

