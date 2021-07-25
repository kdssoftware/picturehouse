import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../utils/mongodb'
import Room from '../../../interface/roomProps'
import {generatePassword,uuidv4} from "../../../utils/modeling";
import mail from "../../../utils/mail";

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  switch(_.method){
    case "PATCH":
      if(!_.query.room&&!_.body.admin){
        res.status(404).send("Not found");
        return;
      }else{
        try{
          console.log({name:_.query.room,adminUID:_.body.admin});
          const response :Room = await rooms.findOne({name:_.query.room,adminUID:_.body.admin});
          if(!response){
            res.status(401).send("Unauthorized");
            return;
          }else{
            console.log(_.body.locked);
            const updateData = {
              password:_.body.password?_.body.password:response.password,
              locked:String(_.body.locked)==="true"
            };
            console.log(updateData);
            const resp = await rooms.updateOne({_id:response._id},{ $set: updateData },{ upsert: true });
            res.status(200).send(resp);
            return;
          }
        }catch(e){
          console.trace(e);
          res.status(500).send("Internal error");
          return;
        }
      }
    case "POST":
      if(!_.query.room){
        res.status(404).send("Not found");
        return;
      }
      const newRoom:Room = {
        name:String(_.query.room),
        locked:true,
        password:_.body.password||generatePassword(),
        adminUID:uuidv4().replace(/-/g,"")
      };
      try{
        const f = await rooms.findOne({name:newRoom.name});
        if(f){
          res.status(409).send("room already exist");
        }else{
        const r = await rooms.insertOne(newRoom)
          let html = "<h1>Your room information at Picture House</h1>";
          html += "<ul>";
          html += "<li>";
          html += "<b>Room name:</b> <a href='"+process.env.NEXT_PUBLIC_HOST+"/"+newRoom.name+"'> "+process.env.NEXT_PUBLIC_HOST+"/"+newRoom.name+"</a>";
          html += "</li>";
          html += "<li>";
          html += "<b>Password:</b> "+newRoom.password;
          html += "</li>";
          html += "<li>";
          html += "<b>Admin panel:</b> <a href='"+process.env.NEXT_PUBLIC_HOST+"/admin/"+newRoom.adminUID+"'> "+process.env.NEXT_PUBLIC_HOST+"/admin/"+newRoom.adminUID+"</a>";
          html += "</li>";
          html += "</ul>";
          const mailOptions = {
            from: '"Picture House" <new-room@picturehouse.be>', // sender address
            to:_.body.mailInput,
            subject: "Your room information", // Subject line
            html: html, // html body
            text:"Your room information at Picture House\nRoom name: "+process.env.NEXT_PUBLIC_HOST+"/"+newRoom.name+"\n Password:</b> "+newRoom.password+"\nAdmin panel:"+process.env.NEXT_PUBLIC_HOST+"/admin/"+newRoom.adminUID+""
          }
          const mailing = await mail(mailOptions);
        res.status(201).json(r.ops[0]);
        }
      }catch(e){
        console.trace(e);
        res.status(500).send("Internal error");
      }
      break;
    case "GET":
      console.log("getting "+_.query.room);
      if(!_.query.room){
        res.status(404).send("Not found");
        return;``
      }
      const f = await rooms.findOne({name:_.query.room});
      console.log(f);
      if(f){
        delete f.password;
        delete f.adminUID;
        res.status(200).json(f);
      }else{
        res.status(404).send("Not found");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}