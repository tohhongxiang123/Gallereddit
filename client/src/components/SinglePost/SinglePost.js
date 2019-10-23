import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import './SinglePost.css';
import LoadingGif from '../../assets/loading.gif';

function SinglePost({data, ...props}) {
    //props.match.params.postName
    const [imageSource, setImageSource] = useState(null);
    const [isAlbum, setIsAlbum] = useState(false);
    const [title, setTitle] = useState(null);

    useEffect(() => {
        function handleKeyPress(e) {
            const key = e.keyCode
            // left arrow
            if (key === 37) {
                props.previousPost();
            }

            // right arrow
            if (key === 39) {
                props.nextPost();
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        }
    }, [props]);

    useEffect(() => {
        if (data) {
            setTitle(data.title);
            const image_info = data.preview.images[0];

            let image_src = image_info.source.url; // set default thumbnail as image source

            // if image contains media embed, use media embed
            if (!(Object.entries(data.media_embed).length === 0 && data.media_embed.constructor === Object)) {
                setIsAlbum(true);
                console.log('is album')
            }

            // if image_info.variants is not empty and contains the property 'gif', use the highest quality gif as the source instead
            if (!(Object.entries(image_info.variants).length === 0 && image_info.variants.constructor === Object)) {
                if (image_info.variants.hasOwnProperty('gif')) {
                    if (image_info.variants.gif.hasOwnProperty('source')) {
                        image_src = image_info.variants.gif.source.url;
                    } else {
                        const resolution_array = image_info.variants.gif.resolutions;
                        image_src = resolution_array[resolution_array.length - 1].url;
                    }
                } 
            }

            const downloadImage = new Image();
            downloadImage.onload = function() {
                try {
                    document.querySelector('.image-container').src = this.src;
                } catch(e) {
                    console.log(e) //todo
                }
            }

            downloadImage.src = image_src;

            setImageSource(image_src);
        }

        return () => {
            setImageSource(null);
            document.querySelector('.image-container').src = LoadingGif;
        }
    }, [data]);

    const togglePostActions = () => {
        document.querySelector('.post-actions').classList.toggle('active');
    }

    return (
        <>
        {data ? (
            <div className={props.className}>
                <div className="post-image" onClick={props.handleClick}>
                    <a href={imageSource} target="_blank" rel="noopener noreferrer">
                        {isAlbum ? <div className="image-container" dangerouslySetInnerHTML={{__html: data.media_embed.content}}></div> :
                        <img src={LoadingGif} alt={data.imageSource} className="image-container"/>
                        }
                    </a>
                </div>
                <div className="post-information">
                    <div className="btn" onClick={props.previousPost}>{`<`}</div>
                    <div className="post-actions-container">
                        <div className="post-actions">
                            <div onClick={props.handleClick} className="close-btn btn">Close</div>
                            <div className="btn" onClick={props.toggleUpvote}>{!data.likes ? 'Upvote' : 'Upvoted'}</div> 
                            <div className="btn" onClick={props.toggleSave}>{!data.saved ? 'Save' : 'Unsave'}</div>
                        </div>
                        <div className="post-action-expand-btn btn" onClick={togglePostActions}>
                            ...
                        </div>
                    </div>
                    
                    <h2 className="post-title"><a target="_blank" rel="noopener noreferrer" href={`https://www.reddit.com${data.permalink}`}>{title}</a></h2>
                    <a className="post-subreddit" target="_blank" rel="noopener noreferrer" href={`https://www.reddit.com/r/${data.subreddit}`}>r/{data.subreddit}</a>
                    {props.error && <p>{props.error}</p>}
                    <div className="btn" onClick={props.nextPost}>{`>`}</div>
                </div>
            </div>
        ) : ( <p>Loading</p>)}
        </>
    )
}

export default withRouter(SinglePost)