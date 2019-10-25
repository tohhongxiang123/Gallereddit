import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import './SinglePost.css';
import LoadingGif from '../../assets/loading.gif';
import axios from 'axios'
import Carousel from '../Carousel/Carousel'

function SinglePost({data, ...props}) {
    //props.match.params.postName
    const [imageSource, setImageSource] = useState(null);
    const [isAlbum, setIsAlbum] = useState(false);
    const [albumPics, setAlbumPics] = useState([]);
    const [title, setTitle] = useState(null);

    function showImage(imageSrc) {
        const downloadImage = new Image();
        downloadImage.onload = function() {
            try {
                document.querySelector('.image-container').src = this.src;
                // sometimes when the user clicks away, it closes the image container, then .image-container becomes null
            } catch(e) {
                console.log(e) //todo
            }
        }

        downloadImage.src = imageSrc;
        setImageSource(imageSrc);
    }

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
        if (!data) {
            return () => {
                setImageSource(null);
                setAlbumPics([])
            }
        }

        setTitle(data.title);
        const image_info = data.preview.images[0];

        let image_src = image_info.source.url; // set default thumbnail as image source

        // if post is album, use carousel
        // imgur albums follow the format https://i.imgur.com/a/asdfxcv
        if (data.url.includes('imgur') && data.url.split('/')[data.url.split('/').length - 2] === 'a') {
            setIsAlbum(true);
            const album_id = data.url.split('/')[data.url.split('/').length - 1].split('.')[0]; 
            // splits https://i.imgur.com/a/asdfxcv to asdfxcv
            // or splits https://i.imgur.com/a/asdfxcv.gifv to asdfxcv

            const fetchAlbum = async id => {
                console.log('requesting from singlepost', id);
                try {
                    const {data} = await axios.get(`/image/${id}`);
                    if (data.type === 'album') {
                        setAlbumPics(data.data.data.images);
                    } else {
                        setIsAlbum(false);
                        console.log('is a pic')
                        showImage(data.data.data.link)
                    }
                } catch(e) {
                    console.log(e);
                    setIsAlbum(false);
                }
            }
            
            fetchAlbum(album_id);
        } else {
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
            showImage(image_src);
        }
            
        return () => {
            setImageSource(null);
            setAlbumPics([])
        }
    }, [data]);

    const togglePostActions = () => {
        document.querySelector('.post-actions').classList.toggle('active');
    }

    return (
        <>
        {data ? (
            <div className={props.className}>
                <div className="post-image">
                    {isAlbum ? 
                    <Carousel>
                        {albumPics.map(pic => <a href={data.url} target="_blank" rel="noopener noreferrer" key={pic.id}><img src={`https://i.imgur.com/${pic.id}h.jpg`} alt={`Album ${pic.description}`}/></a>)}
                    </Carousel>
                    :
                    <a href={imageSource} target="_blank" rel="noopener noreferrer"><img src={LoadingGif} alt={data.title} className="image-container"/></a>
                    }
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