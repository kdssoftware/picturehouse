import Head from 'next/head'
import Image from 'next/image'
import RoomProps from '../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import styles from '../styles/Room.module.scss'
import { connectToDatabase } from '../utils/mongodb'
import axios from "axios";
import {uuidv4} from "../utils/modeling";
import { SyntheticEvent, useRef, useState } from 'react'

export default function Room({name}:{name:string}) {
  const formRef = useRef(null);
  const [imagesInput,setImagesInput] = useState(null);

  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    const formData = new FormData();
    const files:File[] = event.target.images.files;
    for await (const file of files){
      await formData.append(file.name,  new Blob([new Uint8Array(await file.arrayBuffer())], {
        type: file.type,
      }));
    }
    const response = await axios.post("/api/image/"+name+"/",
     formData);
  }

  return (
    <div className={styles.container}>
        <h2>{name}</h2>
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
  return {
    props: {
      name:params?.name
    },
    revalidate:1
  }
}