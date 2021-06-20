import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../utils/mongodb'
import Room from '../../../interface/roomProps'
import {generatePassword,uuidv4} from "../../../utils/modeling";
import mail from "../../../utils/mail";

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  switch(_.method){
    case "GET":
      if(!_.query?.adminUID){
        res.status(404).send("Not found");
        return;
      }
      const f = await rooms.findOne({adminUID:_.query.adminUID});
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