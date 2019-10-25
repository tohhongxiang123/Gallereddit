import React, { useState, useEffect } from 'react'
import postItemStyles from './PostItem.module.css'
import upArrow from '../../assets/thumbUp.svg'
import star from '../../assets/star.svg'
import album from '../../assets/album.svg'
import video from '../../assets/video.svg'
import axios from 'axios';

export default function PostItem({preview, url, ...props}) {
    const [imageSrc, setImageSrc] = useState(null);
    const [isAlbum, setIsAlbum] = useState(false);
    const [isVideo, setIsVideo] = useState(false);

    // sets the image source
    useEffect(() => {
        const image_info = preview.images[0];

        let image_src = image_info.source.url; // set default thumbnail as image source
    
        // if image_info.variants is not empty and contains the property 'gif', set it as a video
        if (!(Object.entries(image_info.variants).length === 0 && image_info.variants.constructor === Object)) {
            if (image_info.variants.hasOwnProperty('gif')) {
                setIsVideo(true);
            } 
        }
        
        if (url && url.includes('imgur') && url.split('/')[url.split('/').length - 2] === 'a') {
            // if it contains imgur, and the second last thing is an 'a', it is an album, and we will handle differently
            const album_id = url.split('/')[url.split('/').length - 1].split('.')[0]; // https://i.imgur.com/asdFG, and sometimes https://i.imgur.com/asdFG.gifv
            const fetchCover = async (id) => {
                console.log('requesting from postitem', id)
                try {
                    const {data} = await axios.get(`/image/${id}`);
                    console.log(data);
                    if (data.type === 'album') {
                        image_src = `http://i.imgur.com/${data.data.data.cover}m.jpg`;
                        setIsAlbum(true);
                    } else {
                        image_src = `http://i.imgur.com/${data.data.data.id}m.jpg`;
                    }
                    setImageSrc(image_src);
                } catch(e) {
                    console.log(e);
                }
                
            }
            fetchCover(album_id);
        }

        setImageSrc(image_src);
    }, []) // destructuring these stuff out of props rather than using props, because if *any* prop changes, this entire effect reruns
    
    return (
        <div className={`${postItemStyles.postContainer} post-container`} onClick={props.handleClick} data-index={props.name}>
            {preview ?  <img src={imageSrc} alt={props.title} className={postItemStyles.postContainerImage} /> : <p>Loading...</p>}
            {isAlbum || isVideo ?
                <div className={postItemStyles.indicateType}>
                    {isAlbum ? <img src={album} className="isAlbum" width="32px" height="32px" alt="is Album" /> : null}
                    {isVideo ? <img src={video} className="isAlbum" width="32px" height="32px" alt="is Album" /> : null}
                </div> : null
            }
            <div className={postItemStyles.isLikedOrSaved}>
                {props.likes ? <img src={upArrow} className="upvoted" width="32px" height="32px" alt="upvoted"/> : null}
                {props.saved ? <img src={star} className="star" width="32px" height="32px" alt="saved"/> : null}
            </div>
        </div>
    )
}
