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
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app


export default function Page({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [ref, isAtEnd] = useInView({
    threshold: 0,
  });
  const [imagesInput,setImagesInput] = useState(null);
  const [isWaitForNextLoad,setIsWaitForNextLoad] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pictures,setPictures] = useState<Array<any>>([]);
  const [isLocked,setLocked]= useState<boolean>(room?.locked);
  const [passwordStatus,setPasswordStatus] = useState("");
  const [page,setPage] = useState(1);
  const [files,setFiles] = useState<Array<any>>([]);
  const [uploadbar,setUploadbar] = useState('enabled');//disabled, enabled, uploading, hasFiles
  const [uploadText,setUploadText] = useState("Upload");
  const [progress, setProgress] = useState(0);
  const [photoIndex,setPhotoIndex] = useState(0);
  const [isOpen,setIsOpen] = useState(false);

  const defaultSizeToLoadPictures = 12;

  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    //@ts-ignore
    const files:any[] = event.target.files;
    if(files?.length<= 0){
      return;
    }
    setUploadText("Uploading files...");  
    setUploadbar("loading");
    for await (const file of files){
      const formData = new FormData();
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
      axios.post("https://images.picturehouse.be/",formData,{
        onUploadProgress: function(progressEvent) {
          let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
          setProgress((progress-Math.round(100.0/files.length))+(percentCompleted/files.length));
          console.log(progress,(progress-Math.round(100.0/files.length))+(percentCompleted/files.length));
        }}).then(async (response) => {
          let urls = response.data;
          await setPictures(
            [
              ...urls,
              ...pictures
            ]
          );
          for (const url of urls) {
            axios({
              method: "POST",
              url:"/api/image/"+room.name+"/?url="+JSON.stringify(url)
            });
          }
        });
    }
    setFiles([]);
    setUploadText("Upload");  
    setUploadbar("enabled");
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
          //@ts-ignore
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
          <>
          <div className={Style.container}>
            <form 
            ref={formRef}
            onChange={(e:SyntheticEvent)=>{
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

            </form>
            <div className={Style.pictures}>
              {
                pictures.map((picture,index)=>{
                  return(
                    <div className={Style.pic} key={index}>
                          <NextImage
                            src={`https://images.picturehouse.be/cropped-${picture.file}`}
                            blurDataURL={`https://images.picturehouse.be/blur-${picture.file}`}
                            placeholder={"blur"}
                            width={500}
                            height={500}
                            onClick={()=>{
                              setPhotoIndex(index);
                              setIsOpen(true);
                            }}
                          >

                          </NextImage>
                    </div>
                    )
                  })
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
          {isOpen && (
            <Lightbox
              mainSrc={"https://images.picturehouse.be/compressed-"+pictures[photoIndex].file}
              nextSrc={"https://images.picturehouse.be/compressed-"+pictures[(photoIndex + 1) % pictures.length].file}
              prevSrc={"https://images.picturehouse.be/compressed-"+pictures[(photoIndex + pictures.length - 1) % pictures.length].file}
              onCloseRequest={() => setIsOpen( false)}
              onMovePrevRequest={() =>
                setPhotoIndex((photoIndex + pictures.length - 1) % pictures.length)
              }
              onMoveNextRequest={() =>
                setPhotoIndex((photoIndex + 1) % pictures.length)
              }
            />
          )}
          </>
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
    console.log("fetching room props "+ctx.query.name,process.env.NEXT_PUBLIC_HOST+'/api/room/'+ctx.query.name);
    res = await axios.get(process.env.NEXT_PUBLIC_HOST+'/api/room/'+ctx.query.name);
    console.log("room ",res.data);
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