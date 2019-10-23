import React, { useState, cloneElement, Children } from 'react'
import CarouselStyles from './Carousel.module.css'

export default function Carousel({children, ...props}) {
    const [activeIndex, setActiveIndex] = useState(0);
    function navigateCarousel(direction) {
        setActiveIndex(i => (i + direction + children.length) % children.length);
    }

    function next() {
        navigateCarousel(1);
    }

    function prev() {
        navigateCarousel(-1);
    }
    return (
        <div className={CarouselStyles.container}>
            <ul className={CarouselStyles.navigation}>
                <li className={CarouselStyles.prev} onClick={prev}>&#10094;</li>
                <li className={CarouselStyles.next} onClick={next}>&#10095;</li>
            </ul>
            <div className={CarouselStyles.content}>
                {
                    Children.map(children, (child, index) => {
                        return cloneElement(child, {key: index, className: (index === activeIndex ? CarouselStyles.active : CarouselStyles.inactive)})
                    }) 
                    
                }
            </div>
            <div className={CarouselStyles.indicator}>
                {
                    children.length < 50 ?
                    children.map((child, index) => 
                    <span key={`Image-${index}`} className={`${CarouselStyles.dot} ${index === activeIndex ? CarouselStyles.active : null}`} onClick={() => setActiveIndex(index)}></span>)
                    : 
                    `${activeIndex + 1}/${children.length}`
                }
            </div>
        </div>
    )
}
