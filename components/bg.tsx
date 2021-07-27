import { useState } from "react";
import Style from "../styles/bg.module.scss";

export default function bg (){
    
    return(<div className={Style.bg}>

        <img  src={"/bg/"+(Math.floor(Math.random() * 56) + 1)+".svg"} alt="" />
    </div>);
}