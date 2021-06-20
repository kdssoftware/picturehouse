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

export default function Room({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [isLocked,setLocked]= useState<boolean>(room.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const [passwordRoom,setPasswordRoom] = useState("");
  const [passwordChangeStatus,setPasswordChangeStatus] = useState("");

  const handlePasswordForm = async (event:SyntheticEvent) => {
    event.preventDefault();
    try{
      await axios.post("/api/room/auth",{
        //@ts-ignore
        password:event.target.password.value,
        room:room.name
      })
      setLocked(false);
    }catch(e){
      setPasswordStatus("Password was incorrect, please view the email is you are the one that created this room");
    }
  }
  
  return (
    <>
    {
        isLocked?(
          <>
          <h1>This room is locked</h1>
          <form onSubmit={handlePasswordForm}>
            <label htmlFor="pass">please provide the password</label>
            <input type="password" name="password"/>
          </form>
          <p>{passwordStatus}</p>
          </>
        ):(
          <>
            <h2>{room.name} // admin panel</h2>
            <hr/>
            <label htmlFor="locked">Lock the room:</label>
            <select name="locked" id="lock">
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
            }} value={room.password}/>
            <p>{passwordChangeStatus}</p>
          </>
          )
        }
    </>
  )
}

export async function getStaticPaths() {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms").find({}).toArray();
  const paths = rooms.map((r:RoomProps) => {
    return {
        params: { adminUID:r.adminUID },
    }
})
  console.log(paths);
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params}) => {
  const { db } = await connectToDatabase();
  const room:RoomProps = await db.collection("rooms").findOne({adminUID:params?.adminUID});
  return {
    props: {
      room:{
        adminUID:room.adminUID,
        name:room.name,
        locked:room?.locked||false
      }
    },
    revalidate:1
  }
}