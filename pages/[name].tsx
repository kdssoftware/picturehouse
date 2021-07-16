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
import {  useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { useEffect } from 'react';

export default function Page({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [ref, isAtEnd] = useInView({
    threshold: 0,
  });
  const [imagesInput,setImagesInput] = useState(null);
  const [isWaitForNextLoad,setIsWaitForNextLoad] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pictures,setPictures] = useState<Array<Picture>>([]);
  const [isLocked,setLocked]= useState<boolean>(room?.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const [page,setPage] = useState(1);
  const [files,setFiles] = useState<Array<any>>([]);
  const [uploadbar,setUploadbar] = useState('enabled');//disabled, enabled, uploading, hasFiles
  const [uploadText,setUploadText] = useState("Upload");
  const defaultSizeToLoadPictures = 12;
  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    const formData = new FormData();
    //@ts-ignore
    const files:File[] = event.target.images.files;
    let toState:Picture[]; 
    for await (const file of files){
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
    }
    
    setUploadText("Uploading files...");  
    setUploadbar("loading");
    const response = await axios.post("/api/image/"+room.name+"/",formData,{
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
        console.log(progressEvent);
      }}).then(()=>{
        setUploadText("Upload");  
        setUploadbar("enabled");
    });
    filesToPictures(files);
  }
  const filesToPictures = async (files:File[]) =>{
    let pics = [];
    for await(let f of Array.from(files)){
      await pics.push({
        buffer: String(await toBase64(f)),
        date:new Date(f.lastModified).toISOString(),
        mimetype:f.type,
        encoding:"7bit ",
        name:f.name,
        room:room.name,
        size:f.size,
        _id:"added_in_state"
      });
    }
    await setPictures(
      [
        ...pics,
        ...pictures
      ]
    )
    return pics;
  }
  const loadPictures = async () => {
    setIsWaitForNextLoad(true);
    try{
      const response = await axios.get("/api/image/"+room.name+"?page="+page+"&size="+defaultSizeToLoadPictures);
      setPage(page+1);
      const data = response?.data;
      if(data?.length!==0){
        await setPictures([
          ...pictures,
          ...data
        ]);
      }else{
        await setHasMore(false);
      }
      await setIsWaitForNextLoad(false);
    }catch(e){
      throw new Error(e);
    }
  }
  const toBase64 = (f:File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
  useEffect(()=>{
    console.log(files);
    if(files.length>0){
      setUploadText(files.length+" files to upload");  
      setUploadbar("hasFiles");
    }else{
      setUploadText("Upload");
      setUploadbar("enabled");
    }
  },[files])

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
    <div className={Style.main}></div>
      {
        room?
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
            <form 
            ref={formRef}
            onSubmit={(e:SyntheticEvent)=>{
                handleSubmit(e);
            }}>
              <label htmlFor="images" className={Style.inputCustom}>
                Add new pictures
              </label>
              <input className={Style.fileinput} id="images" name="image" type="file" onChange={(e:SyntheticEvent)=>{
                setFiles([...files,
                  //@ts-ignore
                  ...e.target.files]);
              }} multiple/>
              <button className={Style.submitButton+" "+Style[uploadbar]} type="submit" >{uploadText}</button>
            </form>
            <div className={Style.pictures}>
              {
                pictures.map((picture,index)=>{
                  const image = new Image();
                  image.onload;
                  if(picture._id==="added_in_state"){
                    image.src = String(picture.buffer);
                  }else{
                    image.src = "data:"+picture.mimetype+";base64,"+picture.buffer; 
                  }
                  
                  
                  return(
                  <div className={Style.pic} key={index}>
                        <NextImage
                        src={image.src}
                        width={image.width*10}
                        height={image.height*10}
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
                      <div className={Style.loadingPics}>loading...</div>
                    )
                }
            </div>
          </div>
        )
      }
        </>:(
          <>
          <h1>Room not found</h1>
          </>
        )
      }
    </>
    
  )
}

export async function getServerSideProps(ctx:any) {
  let res;
  try{
    res = await axios.get(process.env.NEXT_PUBLIC_HOST+'/api/room/'+ctx.query.name);
    return {props:{room:res.data}};
  }catch(e){
    return {props:{room:null}}
  }
}

// //@ts-ignore
// Page.getInitialProps = async (ctx:any)=>{
//   let res;
//   try{
//     res = await axios.get('http://localhost:3000/api/room/'+ctx.query.name);
//     https://img-9gag-fun.9cache.com/photo/apNj7z5_460svvp9.webm
//     return {room:res.data};
//   }catch(e){
//     return {room:null}
//   }
// }