import React from 'react';
import './PostItem.css';
import upArrow from '../../assets/thumbUp.svg'
import star from '../../assets/star.svg'

export default function PostItem(props) {
    const image_info = props.preview.images[0];

    let image_src = image_info.source.url; // set default thumbnail as image source
    let low_res_image_src;

    if (image_info.resolutions.length > 1) {
        low_res_image_src = image_info.resolutions[1].url;
    } else if (image_info.resolutions.length === 1) {
        low_res_image_src = image_info.resolutions[0].url;
    } else {
        low_res_image_src = image_src;
    }

    // if image_info.variants is not empty and contains the property 'gif', use the highest quality gif as the source instead
    if (!(Object.entries(image_info.variants).length === 0 && image_info.variants.constructor === Object)) {
        if (image_info.variants.hasOwnProperty('gif')) {
            if (image_info.variants.gif.hasOwnProperty('source')) {
                image_src = image_info.variants.gif.source.url;
                low_res_image_src = image_info.variants.gif.resolutions[0].url;
            } else {
                const resolution_array = image_info.variants.gif.resolutions;
                image_src = resolution_array[resolution_array.length - 1].url;
                low_res_image_src = resolution_array[0].url;
            }
        } 
    }

    return (
        <div className="post-container" onClick={props.handleClick} data-index={props.name}>
            {props.preview ?  <img src={low_res_image_src} alt={props.title} className="post-container-image"/> : <p>Loading...</p>}
            <div className="isLikedOrSaved">
                {props.likes ? <img src={upArrow} className="upvoted" width="32px" height="32px" alt="upvoted"/> : null}
                {props.saved ? <img src={star} className="star" width="32px" height="32px" alt="saved"/> : null}
            </div>
        </div>
    )
}
