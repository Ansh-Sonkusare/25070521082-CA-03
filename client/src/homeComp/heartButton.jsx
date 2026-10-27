import { useFavorites } from '../favContext';

// Heart toggle for one album (only shown to logged in users)
const HeartButton = ({album}) =>{

    const {ids,toggle} = useFavorites();
    const on = ids.includes(album._id);

    return (
        <button type="button" className={"heart" + (on ? " on" : "")} aria-pressed={on}
            aria-label={on ? "Remove from favorites" : "Add to favorites"} onClick={() => toggle(album)}>
            <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.9-8 10.6-8 10.6z"/>
            </svg>
        </button>
    )
}


export default HeartButton;
