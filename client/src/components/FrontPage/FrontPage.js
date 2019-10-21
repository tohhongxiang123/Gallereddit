import React, {useContext, useState, useEffect, useCallback} from 'react';
import {UserContext} from '../../UserContext';
import {SubredditContext} from '../../SubredditContext';
import SinglePost from '../SinglePost/SinglePost';
import { withRouter } from 'react-router-dom';
import PostItem from '../PostItem/PostItem';
import MasonryLayout from '../MasonryLayout';
import axios from 'axios';
import './FrontPage.css';
import uuidv4 from 'uuid/v4';

const loginError = <button className="link" onClick={
    async () => {
        try {
            const {data} = await axios.get('/user/login');
            const {url} = data;

            window.location = url;
        } catch(e) {
            const {status, error} = e.response.data;
            console.log(`Unable to log user out, ${status}: ${error}`);
        }
        
    }
}><b>Log in</b> to continue</button>

function FrontPage(props) {
    const defaultColumnWidth = 250;
    const [posts, setPosts] = useState([]);
    const [after, setAfter] = useState('');
    const [currentPost, setCurrentPost] = useState(null);
    const [subreddit, setSubreddit] = useContext(SubredditContext);
    const [user, ] = useContext(UserContext);
    const [userId,] = useState(uuidv4());
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(null);
    const [columnCount, setColumnCount] = useState(Math.floor(window.innerWidth / defaultColumnWidth));

    const category = props.match.params.category ? props.match.params.category : 'hot';
    const duration = props.match.params.duration ? props.match.params.duration : 'all'; //duration must be [hour, day, week, month, year, all]

    // fetch the posts from reddit
    const fetchPosts = useCallback(async (source, after, limit=25) => {
        // source is a token used to cancel
        // after is the last post fetched
        // if grabbing a new batch of posts, set after=null
        let response;
        // clear errors and set isLoading
        setIsLoading(true);
        setIsError(null);
        try {
            // fetch from the appropriate place
            if (props.type === 'post') {
                if (subreddit) {
                    response = await axios.post(`/post/${subreddit}/${category}`, {limit, after, duration}, {cancelToken: source.token});
                } else {
                    response = await axios.post(`/post`, {limit, after}, {cancelToken: source.token});
                }
            } else if (props.type === 'user') {
                setSubreddit(props.match.params.posttype);
                if (user) {
                    response = await axios.post(`/user/${user.name}/${props.match.params.posttype}`, {limit, after, duration}, {cancelToken: source.token});
                } else {
                    return setIsError(loginError);
                }
            }

            // extract posts from response (extract only posts that contain images/gifs)
            const newPosts = response.data.data.children.filter(post => post.data.hasOwnProperty('preview'));
    
            // if there are posts, set posts
            if (newPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setAfter(newPosts[newPosts.length - 1].data.name); // set after as the last post
            } 
            
        } catch(e) {
            // if error due to aborting fetch request, do nothing. Else, setIsError
            if (!axios.isCancel(e)) {
                const {status, error} = e.response.data;
                setIsError(`Status code: ${status}, ${error}`);
            }
        } finally {
            // all done, isLoading back to false
            setIsLoading(false);
        }
    }, [subreddit, category, duration, user, props.type, props.match.params.posttype, setSubreddit]);

    // abort fetch requests halfway through
    const cancelActions = useCallback((source) => {
        source.cancel('Cancelling fetch request');
        setAfter('');
        setPosts([]);
    }, []);

    // enable application-only oauth
    useEffect(() => {
        const fetchInitialAccessCode = async () => {
            await axios.get(`/init_code/${userId}`);
        }

        if (!user) {
            fetchInitialAccessCode();
        }
        
    }, [userId, user]);

    // set subreddit everytime subreddit changes
    useEffect(() => {
        setSubreddit(props.match.params.subreddit ? props.match.params.subreddit : '');
        
        const changeColumnCount = () => {
            let updatedColumnCount = Math.floor(window.innerWidth / defaultColumnWidth);
            if (updatedColumnCount < 1) {
                updatedColumnCount = 1;
            }
            setColumnCount(updatedColumnCount);
        }

        window.addEventListener('resize', changeColumnCount);
        return () => window.removeEventListener('resize', changeColumnCount);
    }, [props.match.params.subreddit, setSubreddit]);

    // fetch posts from new subreddit everytime subreddit changes, and clear all previous posts when subreddit changes
    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source(); // used to abort axios requests
        // everytime the subreddit changes, we should set after to null
        fetchPosts(source, null);

        // clean up after yourself
        return () => cancelActions(source);
    }, [subreddit, category, duration, fetchPosts, cancelActions])

    // infinite scroll thing
    useEffect(() => {
        const all_posts = document.querySelectorAll('.post-container');
        const last_post = all_posts[all_posts.length - 1];
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source(); // used to abort axios requests

        if (last_post) {
            let options = {
                rootMargin: '0px',
                threshold: 0
            }
    
            let callback = (entries, observer) => {
                entries.forEach(async entry => {
                    if (entry.isIntersecting) {
                        await fetchPosts(source, after);
                        observer.unobserve(entry.target); // we can unobserve the post once we scroll to it
                    }
                })
            }
    
            let observer = new IntersectionObserver(callback, options);
            observer.observe(last_post);

            // always remember to clean up
            return () => {
                observer.unobserve(last_post);
                source.cancel('Clean up from infinite scroll');
            }
        }
    }, [after, fetchPosts]);

    // when user clicks on an img, it will trigger this and show a single post
    function showSinglePost(e) {
        const name = e.target.parentElement.dataset.index;

        const current_post = posts.filter(post => post.data.name === name)[0];
        setCurrentPost(current_post);
    }

    // hides post
    function hideSinglePost(e) {
        setCurrentPost(null);
        setIsError(null);
    }

    // controls the prev and next buttons in the single post
    function navigatePost(value) {
        const currentPostIndex = posts.indexOf(currentPost);
        const next_in_line = posts[currentPostIndex + value];
        setCurrentPost(next_in_line);
        setIsError(null);
    }

    // upvoting a post
    async function toggleUpvote(name) {
        const upvoted = posts.filter(post => post.data.name === name)[0].data.likes;
        try {
            if (!upvoted) {
                await axios.get(`/post/upvote/${name}/1`); // upvote the post
            } else {
                await axios.get(`/post/upvote/${name}/0`); // upvote the post
            }

            // update the like status
            const copy_of_currentPost = {...currentPost}
            copy_of_currentPost.data.likes = upvoted ? 0 : 1;
            setCurrentPost(copy_of_currentPost);
        } catch(e) {
            const {status, error} = e.response.data;

            if (e.response.data.error === 'No access token') {
                setIsError(loginError);
            } else {
                setIsError(`Status code: ${status}, ${error}`);
            }
            
        }
    }

    // saving a post
    async function toggleSave(id) {
        const saved = currentPost.data.saved
        try {
            if (!saved) {
                await axios.get(`/post/save/${id}`); // save the post
            } else {
                await axios.get(`/post/unsave/${id}`); // unsave the post
            }
            // update the save status
            const copy_of_currentPost = {...currentPost}
            copy_of_currentPost.data.saved = !saved;
            setCurrentPost(copy_of_currentPost);
        } catch(e) {
            const {status, error} = e.response.data;

            if (e.response.data.error === 'No access token') {
                setIsError(loginError)
            } else {
                setIsError(`Status code: ${status}, ${error}`);
            }
            
        }
    }

    return (
        <div className="post-list-container">
            {isError ? <p className="text-center error-text">{isError}</p> : null}
            {currentPost ? 
                <SinglePost 
                error={isError}
                upvoted={currentPost.data.likes}
                data={currentPost.data} 
                handleClick={hideSinglePost} 
                nextPost={() => navigatePost(1)} 
                previousPost={() => navigatePost(-1)} 
                className="single-post-container"
                toggleUpvote={() => toggleUpvote(currentPost.data.name)}
                toggleSave={() => toggleSave(currentPost.data.name)}/> : null }
            <MasonryLayout columns={columnCount} gap={0}>
                {posts.filter(post => post.data.hasOwnProperty('preview')).map((post, index) => (
                    <PostItem {...post.data} key={`${index}-${post.data.name}`} data-index={index} handleClick={showSinglePost} />
                ))}
            </MasonryLayout>
            <button className="btn btn-primary more-posts-btn" onClick={() => {
                const CancelToken = axios.CancelToken;
                const source = CancelToken.source(); // used to abort axios requests
                fetchPosts(source, after);
                }}>{isLoading ? "Loading..." : "MORE POSTS"}</button>
        </div>
    )
}

export default withRouter(FrontPage);
