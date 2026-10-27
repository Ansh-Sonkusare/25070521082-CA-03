import useCountUp from './useCountUp';

// A number that counts up when start is true. decimals = 1 for averages
const CountUp = ({value,start,decimals = 0}) =>{

    const current = useCountUp(Number(value) || 0,start);

    return <>{current.toFixed(decimals)}</>
}


export default CountUp;
