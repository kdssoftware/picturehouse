import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase,images_page } from '../../../utils/mongodb'
import Room from '../../../interface/roomProps';
import Image from '../../../interface/imageProps';
export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  switch(_.method){
    case "POST":
      const newImage:Image = {
        description:"",
        data:_.body,
        date:new Date()
      }
      console.log(newImage)
      res.status(200).json(newImage);
      break;
    case "GET":
      if(!_.query?.room){
        res.status(404).send("Not found");
        return;
      }
      const room:Room = await rooms.findOne({name:_.query.room});
      if(room){
        const page = Number(_.query.page);
        const size = Number(_.query.size);
        console.log(page,size,room.name); 
        if(page!==undefined&&size!==undefined){
            const images = await images_page(room.name,size,page);
            res.status(200).json(images.toArray());
        }else{
         res.status(400).send("add page and size to query string");
        }
      }else{
        res.status(404).send("Not found");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}