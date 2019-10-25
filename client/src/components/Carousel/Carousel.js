import React, { useState, cloneElement, Children, useEffect } from 'react'
import CarouselStyles from './Carousel.module.css'

export default function Carousel({children, ...props}) {
    const [activeIndex, setActiveIndex] = useState(0);
    function navigateCarousel(direction) {
        direction = parseInt(direction);
        setActiveIndex(i => (i + direction + Children.count(children)) % Children.count(children));
    }

    useEffect(() => {
        function handleKeyDown(e) {
            const key = e.keyCode;
            let direction = 0;
            if (key === 65) {
                direction = -1;
            } else {
                direction = 1;
            }
            setActiveIndex(i => (i + direction + Children.count(children)) % Children.count(children));
        }
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        };
    }, [children])
    // giving children as a dependency instead of the [] dependency, because on component mount, children.length = 0

    function next() {
        console.log('next')
        navigateCarousel(1);
    }

    function prev() {
        console.log('prev')
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
                    // TODO: all indicator dots should fit on one line, regardless of screen size. If overflow, should change format to currentPage/totalPages
                    // children.length < 50 ?
                    // children.map((child, index) => 
                    // <span key={`Image-${index}`} className={`${CarouselStyles.dot} ${index === activeIndex ? CarouselStyles.active : null}`} onClick={() => setActiveIndex(index)}></span>)
                    // : 
                    `${activeIndex + 1}/${children.length}`
                }
            </div>
        </div>
    )
}
