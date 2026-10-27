// Four bars that dance while on
const Equalizer = ({on}) =>
    <span className={"eq" + (on ? " on" : "")} aria-hidden="true"><i></i><i></i><i></i><i></i></span>


export default Equalizer;
