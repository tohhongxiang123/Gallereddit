import React, { useState, useEffect } from 'react';
import './PostItem.css';
import upArrow from '../../assets/thumbUp.svg'
import star from '../../assets/star.svg'
import axios from 'axios';

export default function PostItem(props) {
    const [imageSrc, setImageSrc] = useState(null)

    useEffect(() => {
        const image_info = props.preview.images[0];

        let image_src = image_info.source.url; // set default thumbnail as image source
        let low_res_image_src;
    
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

        // imgur album, use the cover instead
        if (props.hasOwnProperty('url') && props.url.includes('imgur')) {
            const album_id = props.url.split('/')[props.url.split('/').length - 1];
            const fetchCover = async (id) => {
                console.log('requesting from postitem', id)
                const {data} = await axios.get(`/image/${id}`);
                image_src = ` http://i.imgur.com/${data.data.cover}m.jpg`
                setImageSrc(image_src)
            }
            fetchCover(album_id);
        }

        setImageSrc(image_src)
    }, [])
    

    

   

    return (
        <div className="post-container" onClick={props.handleClick} data-index={props.name}>
            {props.preview ?  <img src={imageSrc} alt={props.title} className="post-container-image"/> : <p>Loading...</p>}
            <div className="isLikedOrSaved">
                {props.likes ? <img src={upArrow} className="upvoted" width="32px" height="32px" alt="upvoted"/> : null}
                {props.saved ? <img src={star} className="star" width="32px" height="32px" alt="saved"/> : null}
            </div>
        </div>
    )
}
