import useReveal from './useReveal';

// Fades and slides its children in when they scroll into view. delay is in ms
const Reveal = ({children,delay = 0,as = "div",className = "",...rest}) =>{

    const [ref,seen] = useReveal();
    const Tag = as;

    return (
        <Tag ref={ref} className={"reveal " + (seen ? "in " : "") + className} style={{"--d" : delay + "ms"}} {...rest}>
            {children}
        </Tag>
    )
}


export default Reveal;
