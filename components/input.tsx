import Style from "../styles/input.module.scss";

export default function input ({
    name,
    id,
    label,
    type="input",
    onChange,
    onKeyUp,
    onKeyDown,
    defaultValue
}:{
    name:string,
    id:string
    label:string,
    type:string,
    onChange?:Function,
    onKeyUp?:Function,
    onKeyDown?:Function,
    defaultValue?: string | number | readonly string[] | undefined}){
    return(
        <div className={Style.form__group +" "+Style.field}>
            <input defaultValue={defaultValue} type={type} className={Style.form__field} onChange={async(event)=>{
                if(onChange){
                    onChange(event);
                }
            }}  onKeyUp={async(event)=>{
                if(onKeyUp){
                    onKeyUp(event);
                }
            }}  onKeyDown={async(event)=>{
                if(onKeyDown){
                    onKeyDown(event);
                }
            }} name={name} id={id} required/>
            <label htmlFor={id} className={Style.form__label} >{label}</label>
        </div>
    );
}