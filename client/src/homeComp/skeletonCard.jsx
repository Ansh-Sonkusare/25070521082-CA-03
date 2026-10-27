// Shimmering placeholder shown while albums load
const SkeletonCard = () =>{

    return (
        <div className="item skeleton" aria-hidden="true">
            <div className="sk-cover shimmer"></div>
            <div className="sk-line shimmer"></div>
            <div className="sk-line short shimmer"></div>
        </div>
    )
}


export default SkeletonCard;
