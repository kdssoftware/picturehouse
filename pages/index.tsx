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
  const sendMail = async(roomname:string,pass:string)=>{
    let html = "<h1>Your room information at Picture House</h1>";
    html += "<ul>";
    html += "<li>";
    html += "<b>Room name:</b> <a href='picturehouse.be/"+roomname+"'> https://picturehouse.be/"+roomname+"</a>";
    html += "</li>";
    html += "<li>";
    html += "<b>Password:</b> "+pass;
    html += "</li>";
    html += "</ul>";
    await axios.post("/api/mail",{
      from: '"Picture House" <new-room@picturehouse.be>', // sender address
      to:mailInput,
      subject: "Your room information", // Subject line
      html: html, // html body
    })
  }
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
        <input id="room" onChange={event => setRoom(event.target.value)} onKeyDown={async (event)=>{
          if(room.trim().length>=2){
            try{
              await axios.get('/api/room/'+room);
              setRoomStatus("Room already exist");
            }catch(e){
              setRoomStatus("Room is available");
              if (event.key === 'Enter') {
                try{
                  if(mailInput.trim.length!==6&&validateEmail(mailInput)){
                    setRoomStatus("Creating new room");
                    const response = await axios.post('/api/room/'+room);
                    await sendMail(room,response.data.password);
                    setRoomStatus("Room created, check your e-mail");
                  }else{
                    setRoomStatus("Email is not valid");
                  }
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