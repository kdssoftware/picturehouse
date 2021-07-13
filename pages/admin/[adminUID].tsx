import Head from 'next/head'
import NextImage from 'next/image'
import Picture from "../../interface/imageProps";
import RoomProps from '../../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import Style from '../styles/Room.module.scss'
import { connectToDatabase } from '../../utils/mongodb'
import axios from "axios";
import { useInView } from 'react-intersection-observer';
import {uuidv4} from "../../utils/modeling";
import { SyntheticEvent, useRef, useState } from 'react'

export default function Page({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [isLocked,setLocked]= useState<boolean>(room.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const [passwordRoom,setPasswordRoom] = useState(room.password);
  const [passwordChangeStatus,setPasswordChangeStatus] = useState("");

  return (
       
          <>
            <h2>{room.name} // admin panel</h2>
            <hr/>
            <label htmlFor="locked">Lock the room:</label>
            <select name="locked" id="lock" onChange={async (event)=>{
              const locked=event.target.value.trim()==="true";
              const admin = location.pathname.replace(/\/admin\//g,"");
              console.log(locked);
              try{
                await axios.patch("/api/room/"+room.name,{
                  admin,
                  locked
                })
                setLocked(locked);
              }catch(e){
                console.trace(e);
              }
            }}>
              <option value="true">Locked</option>
              <option value="false">Unlocked</option>
            </select>
            <hr/>
            <label htmlFor="passwordRoom">Change password</label>
            <input onChange={event => setPasswordRoom(event.target.value)} type="text" id="passwordRoom" onKeyDown={async (event)=>{
              if(event.key==="Enter"){
                  try{
                    await axios.patch("/api/room/"+room.name,{
                      password:passwordRoom,
                      admin:room.adminUID
                    })
                    setPasswordChangeStatus("password changed");
                  }catch(e){
                    setPasswordChangeStatus("Something went wrong");
                  }
              }
            }} defaultValue={room.password}/>
            <p>{passwordChangeStatus}</p>
          </>
  )
}

export async function getServerSideProps(ctx:any) {
  let res;
  try{
    const res = await axios.get(process.env.NEXT_PUBLIC_HOST+'/api/admin/'+ctx.query.adminUID);
    return {props:{room:res.data}};
  }catch(e){
    return {props:{room:null}}
  }
}

// //@ts-ignore
// Page.getInitialProps = async (ctx:any)=>{
//     const res = await axios.get('http://localhost:3000/api/admin/'+ctx.query.adminUID);
//     return {room:res.data};
// }