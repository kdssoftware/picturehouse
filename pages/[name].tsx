import Head from 'next/head'
import Image from 'next/image'
import RoomProps from '../interface/roomProps'
import { GetStaticPropsResult, GetStaticProps, GetServerSideProps } from "next"
import styles from '../styles/Room.module.scss'
import { connectToDatabase } from '../utils/mongodb'

export default function Room({roomName}:{roomName:string}) {
  return (
    <div className={styles.container}>
        <h2>{roomName}</h2>
        <hr/>
        <input type="file" multiple/>
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