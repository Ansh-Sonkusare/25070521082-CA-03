import { useState } from 'react';

// Password field with a show / hide button
const PasswordInput = ({value,onChange,name = "password",invalid,id}) =>{

    const [show,setShow] = useState(false);

    return (
        <div className="pw">
            <input id={id} className={"form-control" + (invalid ? " invalid" : "")} type={show ? "text" : "password"} name={name}
                value={value} onChange={onChange} autoComplete={name === "password" ? "current-password" : "off"}/>
            <button type="button" className="pw-toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? "Hide" : "Show"}
            </button>
        </div>
    )
}


export default PasswordInput;
