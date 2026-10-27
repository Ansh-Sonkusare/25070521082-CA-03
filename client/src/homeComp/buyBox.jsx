import { useState } from 'react';
import { useCart } from '../cartContext';
import { formatNames,rupee,sellableFormats } from '../money';

// Pick a format (Vinyl / CD / Digital) and add the album to the cart
const BuyBox = ({album}) =>{

    const {add,setDrawerOpen} = useCart();
    const formats = sellableFormats(album);
    const [picked,setPicked] = useState("");
    const [added,setAdded] = useState(false);
    const [busy,setBusy] = useState(false);

    if( formats.length === 0 ) return <p className="muted not-sale">Not for sale</p>

    const format = formats.includes(picked) ? picked : formats[0];

    const buy = async () =>{

        if( busy ) return;

        setBusy(true);
        const ok = await add(album,format);
        setBusy(false);

        if( ok ){

            setAdded(true);
            setTimeout(() => setAdded(false),1400);
        }
    }

    return (
        <div className="buy">
            <div className="seg fmt" role="group" aria-label="Format">
                {
                    formats.map(f =>
                        <button key={f} type="button" className={format === f ? "on" : ""} onClick={() => setPicked(f)}>{formatNames[f]}</button>
                    )
                }
            </div>
            <b className="price" key={format}>{rupee(album.prices[format])}</b>
            <button type="button" className={"pill pill-gold buy-btn" + (added ? " added" : "")} onClick={buy} disabled={busy} aria-busy={busy}>{busy ? "Adding…" : added ? "Added ✓" : "Add to cart"}</button>
            { added && <button type="button" className="link-btn" onClick={() => setDrawerOpen(true)}>Open cart</button> }
        </div>
    )
}


export default BuyBox;
