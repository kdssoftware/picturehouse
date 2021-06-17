import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import router from 'next/router';
import { useState } from 'react';
import styles from '../styles/Home.module.scss'
import axios from 'axios';

export default function Home() {
  const [room, setRoom] = useState('')
  const [roomStatus,setRoomStatus] = useState('');
  return (
    <div className={styles.container}>
        <h2>Image gallery rooms</h2>
        <p>create a new Room
        </p>
        {/* <input type="email" value="provide your email, for the room details"/> */}
        <input onChange={event => setRoom(event.target.value)} onKeyDown={async (event)=>{
          if(room.trim().length>=2){
            try{
              await axios.get('/api/room/'+room);
              setRoomStatus("Room already exist");
            }catch(e){
              setRoomStatus("Room is available");
              if (event.key === 'Enter') {
                try{
                  setRoomStatus("Creating new room");
                  await axios.post('/api/room/'+room);
                  router.push('/'+room);
                }catch(e){
                  setRoomStatus("Something went wrong");
                }
              }
            }
          }else{
            setRoomStatus("Room should be at least 3 characters");
          }
        }} type="text"/>
        <p>{roomStatus}</p>
    </div>
  )
}
