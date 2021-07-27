import { useState } from "react";
import Style from "../styles/bg.module.scss";

export default function bg (){
  const [random, setRandom] = useState(Math.floor(Math.random() * 56) + 1);
  
    return(<div className={Style.bg}>

        <img  src={"/bg/"+random+".svg"} alt="" />
    </div>);
}