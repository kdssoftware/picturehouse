import Head from 'next/head'
import Image from 'next/image'
import RoomProps from '../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import styles from '../styles/Room.module.scss'
import { connectToDatabase } from '../utils/mongodb'
import axios from "axios";
import {uuidv4} from "../utils/modeling";
import { SyntheticEvent, useRef, useState } from 'react'

export default function Room({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [imagesInput,setImagesInput] = useState(null);
  const [isLocked,setLocked]= useState<boolean>(room.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    const formData = new FormData();
    
    const files:File[] = event.target.images.files;
    for await (const file of files){
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
    }
    const response = await axios.post("/api/image/"+room.name+"/",
     formData);
  }

  const handlePasswordForm = async (event:SyntheticEvent) => {
    event.preventDefault();
    try{
      await axios.post("/api/room/auth",{
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
          <div className={styles.container}>
            <h2>{room.name}</h2>
            <hr/>
            <form 
            ref={formRef}
            onSubmit={(e:SyntheticEvent)=>{
                handleSubmit(e);
            }}>
              <input id="images" name="image" type="file" multiple/>
              <button type="submit">submit</button>
            </form>
          </div>
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
        params: { name:r.name },
    }
})
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params}) => {
  const { db } = await connectToDatabase();
  const room:RoomProps = await db.collection("rooms").findOne({name:params?.name});
  return {
    props: {
      room:{
        name:room.name,
        locked:room.locked
      }
    },
    revalidate:1
  }
}