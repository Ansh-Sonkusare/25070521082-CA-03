import { useState } from 'react';

// Five stars. Read-only without onRate, clickable with hover preview when onRate is given
const StarRating = ({rating,onRate}) =>{

    const [hover,setHover] = useState(0);

    if( !onRate ){

        return (
            <span className="stars" role="img" aria-label={rating + " out of 5 stars"}>
                {"★".repeat(rating)}<i>{"★".repeat(5 - rating)}</i>
            </span>
        )
    }

    const shown = hover || rating;

    return (
        <span className="stars live" role="group" aria-label="Rate this album" onMouseLeave={() => setHover(0)}>
            {
                [1,2,3,4,5].map(n =>
                    <button key={n} type="button" className={"star" + (n <= shown ? " on" : "") + (n === hover ? " pop" : "")}
                        aria-label={"Rate " + n + (n === 1 ? " star" : " stars")} aria-pressed={n === rating}
                        onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)}
                        onClick={() => onRate(n)}>★</button>
                )
            }
        </span>
    )
}


export default StarRating;
