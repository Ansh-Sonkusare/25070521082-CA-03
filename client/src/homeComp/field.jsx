// Label + input + inline error message
const Field = ({label,error,htmlFor,children,className = ""}) =>
    <div className={"form-group " + className}>
        <label htmlFor={htmlFor}>{label}</label>
        {children}
        <p className={"field-err" + (error ? " show" : "")} role={error ? "alert" : undefined}>{error}</p>
    </div>


export default Field;
