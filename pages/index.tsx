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
  const [mailInput,setMailInput] = useState('');
  const [gotoroomInput,setGotoroomInput] = useState('');
  const [gotoroomStatus,setGotoroomStatus] = useState('');
  function validateEmail(mail:string){      
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(mail); 
  } 
  return (
    <div className={styles.container}>
        <h2>Image gallery rooms</h2>
        <p>create a new Room
        </p>
        <label htmlFor="email">E-mail</label>
        <input id="e-mail" type="email" onChange={event => setMailInput(event.target.value)} placeholder="provide your email, for the room details" required/>
        <label htmlFor="room">Room</label>
        <input id="room" onChange={event => setRoom(event.target.value.toLowerCase())} onKeyUp={async (event)=>{
          if(room.toLowerCase().trim().length>=3){
            if(event.key!=="Enter"){
              try{
                await axios.get('/api/room/'+room.toLowerCase());
                setRoomStatus("Room already exist");
              }catch(e){
                setRoomStatus("Room is available");
              }
            }
          }else{
            setRoomStatus("Room should be at least 3 characters");
          }
        }} onKeyDown={async(event)=>{
          if(room.toLowerCase().trim().length>=2){
            if (event.key === 'Enter') {
              try{
                if(mailInput.trim.length!==6&&validateEmail(mailInput)){
                  setRoomStatus("Creating new room");
                  const response = await axios.post('/api/room/'+room.toLowerCase(),{
                    mailInput
                  });
                  setRoomStatus("Room created, check your e-mail");
                }else{
                  setRoomStatus("Email is not valid");
                }
              }catch(e){
              }
            }
          }
        }} type="text"/>
        <p>{roomStatus}</p>
        <p>Go to room</p>
        <input id="gotoroom" onChange={event => setGotoroomInput(event.target.value.toLowerCase())}  type="text" onKeyUp={async (event)=>{
          if(gotoroomInput.toLowerCase().trim().length>=3){
            try{
              await axios.get('/api/room/'+gotoroomInput.toLowerCase());
              setGotoroomStatus("Room exist");
            }catch(e){
              setGotoroomStatus("Room does not exist");
            }
          }else{
            setGotoroomStatus("Room should be at least 3 characters");
          }
        }} onKeyDown={async (event)=>{
          try{
            await axios.get('/api/room/'+gotoroomInput.toLowerCase());
            if (event.key === 'Enter') {
              router.push('/'+gotoroomInput.toLowerCase());
            }
            setGotoroomStatus("Room exist");
          }catch(e){
            setGotoroomStatus("Room does not exist");
          }
        }}/>
        <p>{gotoroomStatus}</p>
    </div>
  )
}