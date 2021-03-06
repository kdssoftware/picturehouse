import Head from 'next/head'
import NextImage from 'next/image'
import Picture from "../../interface/imageProps";
import RoomProps from '../../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import StyleAdmin from '../../styles/Room.module.scss'
import { connectToDatabase } from '../../utils/mongodb'
import axios from "axios";
import { useInView } from 'react-intersection-observer';
import {uuidv4} from "../../utils/modeling";
import { SyntheticEvent, useRef, useState } from 'react'


import Style from '../../styles/Room.module.scss'
import {  useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { useEffect } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import glassStyle from '../../styles/Home.module.scss';
import Input from "../../components/input";
import Bg from "../../components/bg";
import BgStyle from "../../styles/bg.module.scss";

export default function Page({room}:{room:RoomProps}) {
  const formRef = useRef(null);
  const [passwordRoom,setPasswordRoom] = useState(room.password);
  const [passwordChangeStatus,setPasswordChangeStatus] = useState("");

  //copy of [room].tsx
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
    console.log("filesUploaded: "+filesUploaded);
  },[filesUploaded])

  useEffect(() => {
    console.log("filesToUpload: "+filesToUpload);
  },[filesToUpload])

  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    //@ts-ignore
    const files:any[] = event.target.files;
    if(files?.length<= 0){
      return;
    }
    // setFilesToUpload(files.length);
    // setFilesUploaded(0);
    setUploadStatus("spin");
    let urlsToShow : any[]= [];
    for await (const file of files){
      const formData = new FormData();
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
      axios.post("https://images.picturehouse.be/",formData,{
        onUploadProgress: function(progressEvent) {
          let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
        }}).then(async (response) => {
          console.log("uploaded 1 file")
          // await setFilesUploaded(filesUploaded+1);
          let urls = response.data;
          urlsToShow.push(...urls);
          for (const url of urls) {
            axios({
              method: "POST",
              url:"/api/image/"+room.name+"/?url="+JSON.stringify(url)
            });
          }
          if(filesUploaded === filesToUpload){
            setFiles([]);
            // setFilesUploaded(0);
            // setFilesToUpload(0);
            setUploadStatus("plus");
            setHasMore(true);
            setPictures(
              [
                ...urlsToShow,
                ...pictures
              ]
            );
          }
        });
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
  
  useEffect(()=>{
    if(isOpen){
      axios.get(process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + pictures.length - 1) % pictures.length].file);
      axios.get(process.env.NEXT_PUBLIC_IMAGES_HOST+"/compressed-"+pictures[(photoIndex + 1) % pictures.length].file);
    }
  },[isOpen])

  const handlePasswordForm = async (event:SyntheticEvent) => {
    event.preventDefault();
    try{``
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
            <div className={glassStyle.top}>
              <div className={glassStyle.container }>
                  <h2>{room.name} // admin panel</h2>

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
                      <Input defaultValue={room.password} label="Change password" type="password" name="passwordRoom" id="passwordRoom"   onChange={
                        (event:SyntheticEvent) => {
                          //@ts-ignore
                          setPasswordRoom(event.target.value)}} onKeyDown={async (event:SyntheticEvent)=>{
                        //@ts-ignore
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
                      }} />
                  <p>{passwordChangeStatus}</p>
              </div>
            </div>

            <hr />
            
            
            {/* copy of [name].tsx */}
            
            <div className={Style.container}>
              <div className={Style.pictures}>
                {
                  pictures.map((picture,index)=>{
                    return(
                      <div className={Style.pic} key={index}>
                            <NextImage
                              src={`${process.env.NEXT_PUBLIC_IMAGES_HOST}/cropped-${picture.file}`}
                              blurDataURL={`${process.env.NEXT_PUBLIC_IMAGES_HOST}/blur-${picture.file}`}
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
                }} multiple/>
              </form>
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