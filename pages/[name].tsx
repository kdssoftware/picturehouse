import Head from 'next/head'
import Image from 'next/image'
import RoomProps from '../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import styles from '../styles/Room.module.scss'
import { connectToDatabase } from '../utils/mongodb'
import axios from "axios";
import { SyntheticEvent, useRef } from 'react'

export default function Room({name}:{name:string}) {
  const formRef = useRef(null);

  const handleSubmit = async (event:SyntheticEvent) => {
    event.preventDefault()
    const response = await axios.post("/api/images/"+name+"/");

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
          <input name="image" type="file"/>
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