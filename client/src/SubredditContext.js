import React, {createContext, useState} from 'react';

export const SubredditContext = createContext();

export const SubredditProvider = (props) => {
    const [subreddit, setSubreddit] = useState('');

    return <SubredditContext.Provider value={[subreddit, setSubreddit]}>
        {props.children}
    </SubredditContext.Provider>
}