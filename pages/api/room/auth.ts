import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../utils/mongodb'
import Room from '../../../interface/roomProps'
import {generatePassword} from "../../../utils/modeling";

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  switch(_.method){
    case "POST":
      if(!_.body.room){
        res.status(404).send("Not found");
        return;
      }
      try{
        const f :Room = await rooms.findOne({name:_.body.room});
        if(f){
            if(f.password===_.body.password?.trim()){
                res.status(200).send("OK");
            }else{
                res.status(401).send("Wrong password");
            }
        }else{
            res.status(404).send("Room not found.");
        }
      }catch(e){
        res.status(500).send("Internal error");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}