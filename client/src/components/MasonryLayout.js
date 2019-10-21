import React from 'react'

export default function MasonryLayout(props) {
    const columnWrapper = {};
    const result = [];

    // creating columns
    for (let i=0; i<props.columns; i++) {
        columnWrapper[`column-${i}`] = {columnHeight: 0, columnItems:[]};
    }

    // dividing the children into the columns
    // wrap each child in a div
    for (let i=0;i < props.children.length; i++) {
        // [{column name, column height}]
        let lowestColumn = 'column-0';
        let lowestColumnHeight = columnWrapper[`column-0`].columnHeight;

        for (const [key, value] of Object.entries(columnWrapper)) {
            if (value.columnHeight <= lowestColumnHeight) {
                lowestColumnHeight = value.columnHeight;
                lowestColumn = key;
            }
        }

        if (props.children[i].props.thumbnail_height) {
            // add to the column height the RATIO height/width, since all columns have equal width, but not all images have equal width
            const {height, width} = props.children[i].props.preview.images[0].source;
            if (typeof height == 'number' && typeof width == 'number') {
                columnWrapper[lowestColumn].columnHeight += height/width;
            } else {
                console.log('HEIGHT OR WIDTH IS NOT A NUMBER', {height, width});
            }
        }

        columnWrapper[lowestColumn].columnItems.push(
            <div style={{marginBottom: `${props.gap}px`}} key={`item${i}`}>
                {props.children[i]}
            </div>
        );
    }

    // wrapping each column in its own div
    // the first column has no gap
    for (let i=0; i<props.columns; i++) {
        result.push(
            <div style={{marginLeft: `${i > 0 ? props.gap : 0}px`, flex: 1}} key={`column${i}`}> 
                {columnWrapper[`column-${i}`].columnItems}
            </div>
        )
    }

    // wrap result in another div
    return (
        <div style={{display: 'flex'}}>
            {result}
        </div>
    )
}

MasonryLayout.defaultProps = {
    columns: 3,
    gap: 20
}
