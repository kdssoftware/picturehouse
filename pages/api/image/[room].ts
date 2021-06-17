import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase,images_page } from '../../../utils/mongodb'
import {initMiddleware} from "../../../utils/files";
import {uuidv4} from "../../../utils/modeling";
import Room from '../../../interface/roomProps';
import Image from '../../../interface/imageProps';
import multer from "multer";

const upload = multer();

const multerAny = initMiddleware(
  upload.any()
);

type NextApiRequestWithFormData = NextApiRequest & {
  files: any[],
}

type BlobCorrected = {
  fieldname:string,
  originalName:string,
  encoding:string,
  mimetype:string,
  buffer:Buffer,
  size:number
}

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  const room:Room = await rooms.findOne({name:_.query.room});
  switch(_.method){
    case "POST":
      await multerAny(_, res);
      if (!_?.files?.length) {
        res.statusCode = 400;
        res.end();
        return;
      }else{
        const blobs: BlobCorrected[] = _.files;
        const imagesData:Image[] = blobs.map((blob:BlobCorrected)=>{
          return { 
            buffer:blob.buffer,
            date:new Date(),
            encoding:blob.encoding,
            name:uuidv4(),
            room:room.name,
            mimetype:blob.mimetype
          }
        });
      const images = await db.collection("images");
      const response = await images.insertMany(imagesData);
      res.status(200).json(response);
      }
      break;
    case "GET":
      if(!_.query?.room){
        res.status(404).send("Not found");
        return;
      }
      if(room){
        const page = Number(_.query.page);
        const size = Number(_.query.size);
        if(page!==undefined&&size!==undefined&&page>0&&size>0){
            const images = await images_page(room.name,size,page);
            res.status(200).json(images);
        }else{
         res.status(400).send("Add page and size to query string");
        }
      }else{
        res.status(404).send("Not found");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}


export const config = {
  api: {
      bodyParser: false,
      sizeLimit:"50mb" 
  },
}