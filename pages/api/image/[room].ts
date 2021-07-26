import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase,images_page } from '../../../utils/mongodb'
import {initMiddleware} from "../../../utils/files";
import {uuidv4} from "../../../utils/modeling";
import Room from '../../../interface/roomProps';
import Image from '../../../interface/imageProps';
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import superagent from 'superagent';

export default async (_: NextApiRequest, res: NextApiResponse) => {

  const { db } = await connectToDatabase();
  const rooms = await db.collection("rooms");
  const room:Room = await rooms.findOne({name:_.query.room});
  switch(_.method){
    case "POST":
      if (!_?.query?.url) {
        res.statusCode = 400;
        res.end();
        return;
      }else{
        const images = await db.collection("images");
        let url = JSON.parse(String(_.query.url));
        const response = await images.insertOne({
          ...url,
          room:_.query.room
        });
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
      sizeLimit:"500mb" 
  },
}