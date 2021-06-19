import Head from 'next/head'
import NextImage from 'next/image'
import Picture from "../interface/imageProps";
import RoomProps from '../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import Style from '../styles/Room.module.scss'
import { connectToDatabase } from '../utils/mongodb'
import axios from "axios";
import { useInView } from 'react-intersection-observer';
import {uuidv4} from "../utils/modeling";
import { SyntheticEvent, useRef, useState } from 'react'

export default function Room({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [ref, isAtEnd] = useInView({
    threshold: 0,
  })
  const [imagesInput,setImagesInput] = useState(null);
  const [isWaitForNextLoad,setIsWaitForNextLoad] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pictures,setPictures] = useState<Array<Picture>>([]);
  const [isLocked,setLocked]= useState<boolean>(room.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const [page,setPage] = useState(1);
  const defaultSizeToLoadPictures = 1;
  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    const formData = new FormData();
    //@ts-ignore
    const files:File[] = event.target.images.files;
    for await (const file of files){
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
    }
    const response = await axios.post("/api/image/"+room.name+"/",
     formData);
  }

  const loadPictures = async () => {
    setIsWaitForNextLoad(true);
    try{
      const response = await axios.get("/api/image/"+room.name+"?page="+page+"&size="+defaultSizeToLoadPictures);
      setPage(page+1);
      const data = response?.data;
      if(data?.length!==0){
        setPictures([
          ...pictures,
          ...data
        ])
      }else{
        console.log("no more pictures to load");
        setHasMore(false);
      }
      setIsWaitForNextLoad(false);
    }catch(e){
      throw new Error(e);
    }
  }

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
          <div className={Style.container}>
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
            <div className={Style.pictures}>
              {
                pictures.map(picture=>{
                  const image = new Image();
                  image.onload;
                  image.src = "data:"+picture.mimetype+";base64,"+picture.buffer; 
                  return(
                  <div className={Style.pic} key={picture.name+picture.size}>
                        <NextImage
                        src={image.src}
                        width={image?.width*10}
                        height={image?.height*10}
                        />
                  </div>
                  )})
              }
            </div>
            <div id="ref" className={Style.ref} ref={ref}>
                {
                    (isAtEnd&&!isWaitForNextLoad&&hasMore)&&
                        loadPictures()
                }
                {
                    (isWaitForNextLoad&&hasMore)&&
                    (
                        "loading..."
                    )
                }
            </div>
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
        locked:room?.locked||false
      }
    },
    revalidate:1
  }
}