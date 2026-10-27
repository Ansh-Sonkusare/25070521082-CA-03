// Credit card picture that follows the form and flips over to show the CVV
const CardPreview = ({number,name,expiry,cvv,brand,flipped}) =>{

    const digits = number.replace(/\s/g,"");
    const shown = (digits + "•".repeat(16)).slice(0,Math.max(16,digits.length)).replace(/(.{4})(?=.)/g,"$1 ");

    return (
        <div className={"cc" + (flipped ? " flip" : "")} aria-hidden="true">
            <div className="cc-in">
                <div className="cc-face cc-front">
                    <span className="cc-brand">{brand}</span>
                    <span className="cc-chip"></span>
                    <span className="cc-num">{shown}</span>
                    <div className="cc-row">
                        <span><small>Card holder</small>{name || "YOUR NAME"}</span>
                        <span><small>Expires</small>{expiry || "MM/YY"}</span>
                    </div>
                </div>
                <div className="cc-face cc-back">
                    <span className="cc-strip"></span>
                    <span className="cc-cvv"><small>CVV</small>{cvv ? cvv : "•••"}</span>
                </div>
            </div>
        </div>
    )
}


export default CardPreview;
