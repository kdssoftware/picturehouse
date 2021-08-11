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
import glassStyle from '../styles/Home.module.scss';
import Input from "../components/input";
import Bg from "../components/bg";
import BgStyle from "../styles/bg.module.scss";

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
  const [uploadStatus,setUploadStatus] = useState('plus');
  const [progress, setProgress] = useState(0);
  const [photoIndex,setPhotoIndex] = useState<number>(0);
  const [isOpen,setIsOpen] = useState<boolean>(false);
  const [filesUploaded,setFilesUploaded] = useState(0);
  const [filesToUpload,setFilesToUpload] = useState(0);
  const defaultSizeToLoadPictures = 12;

  useEffect(() => {
    console.log(pictures);
  },[pictures])


  const handleSubmit = async (event:SyntheticEvent) => {
    try{
      event.preventDefault()
      //@ts-ignore
      const files:any[] = event.target.files;
      if(files?.length<= 0){
        return;
      }
      setUploadStatus("spin");
      let urlsToShow : any[]= [];
      for await (const file of files){
        const formData = new FormData();
        await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
          type: file.type,
        }));
        axios.post(process.env.NEXT_PUBLIC_IMAGES_HOST+"/",formData,{
          onUploadProgress: function(progressEvent) {
            let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
          }}).then(async (response) => {
            console.log("uploaded 1 file")
            axios({
              method: "POST",
              url:"/api/image/"+room.name+"/?url="+JSON.stringify(response.data)
            });

            if(filesUploaded === filesToUpload){
              setFiles([]);
              setUploadStatus("plus");
              setHasMore(true);
              setPictures(
                [
                  response.data,
                  ...pictures
                ]
              );
            }
          });
      }
    }catch(e){
      console.log(e);
      setUploadStatus("error");
      //sleep function
      setTimeout(()=>{  
        setUploadStatus("plus");
      },5000);
    }
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
    <Head>
      <title>{room.name}</title>
    </Head>
    <div className={Style.main}></div>
      {
        room?
        <>
        {
        isLocked?(
          <>
            <div className={glassStyle.middle}>
              <div className={glassStyle.container }>
                  <h2>This room is locked</h2>
                  <form className={Style.lockForm} onSubmit={handlePasswordForm}>
                      <Input label="Password" type="password" name="password" id="password" />
                    </form>
                  <p>{passwordStatus}</p>
            </div>
          </div>
          </>
        ):(
          <>
          <div className={Style.pictureContainer}>
            <div className={Style.pictures}>
              {
                pictures.map((picture,index)=>{
                  return(
                    <div className={Style.pic} key={index} >
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGES_HOST}/cropped-${picture.file}`}
                            placeholder={"blur"}
                            // blurDataURL={`${process.env.NEXT_PUBLIC_IMAGES_HOST}/blur-${picture.file}`}
                            width={500}
                            height={500}
                            onClick={()=>{
                              setPhotoIndex(index);
                              setIsOpen(true);
                            }}
                          >
                          </img>
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
              toolbarButtons={[(
                <img style={{width:"25px",color:"white",
                top: "9px",
                position: "relative"}} src="/dl.svg" alt="" ></img>
              )]}
              mainSrc={process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[photoIndex].file}
              nextSrc={process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + 1) % pictures.length].file}
              prevSrc={process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + pictures.length - 1) % pictures.length].file}
              onCloseRequest={() => setIsOpen( false)}
              onMovePrevRequest={() =>{
                setPhotoIndex((photoIndex + pictures.length - 1) % pictures.length);
                axios.get(process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + pictures.length - 1) % pictures.length].file);
              }}
              onMoveNextRequest={() =>{
                setPhotoIndex((photoIndex + 1) % pictures.length);
                axios.get(process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + 1) % pictures.length].file);
              }}
              imageTitle={new Date(pictures[photoIndex].exif_tags.DateTimeOriginal*1000).toUTCString()}
            />
          )}
          <div className={Style.filesUploading+" "+(filesToUpload===0?Style.inactive:"")} >{`${filesUploaded}/${filesToUpload} files uploaded`}</div>
          <form 
            ref={formRef}
            onChange={(e:SyntheticEvent)=>{
                handleSubmit(e);
            }}>
            <label htmlFor="images" className={Style.float+" "+Style[uploadStatus]}>
              <img src={"/"+uploadStatus+".svg"} alt="upload" />
            </label>
              <input className={Style.fileinput} id="images" name="image" type="file" onChange={(e:SyntheticEvent)=>{
                setFiles([...files,
                  //@ts-ignore
                  ...e.target.files]);
              }} accept="image/png, image/jpeg, image/jpg" multiple/>
            </form>
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
    console.trace(e);
    return {props:{room:null}}
  }
}
