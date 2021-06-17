import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../utils/mongodb'

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  switch(_.method){
    case "POST":
      if(!_.query.room){
        res.status(404).send("Not found");
        return;
      }
      const newRoom = {
        name:_.query.room,
        images:[]
      };
      try{
        const f = await rooms.findOne({name:newRoom.name});
        if(f){
          res.status(409).send("room already exist");
        }else{
        const r = await rooms.insertOne(newRoom)
        res.status(201).json(r.ops[0]);
        }
      }catch(e){
        res.status(500).send("Internal error");
      }
      break;
    case "GET":
      if(!_.query?.room){
        res.status(404).send("Not found");
        return;
      }
      const f = await rooms.findOne({name:_.query.room});
      if(f){
        res.status(200).json(f);
      }else{
        res.status(404).send("Not found");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}