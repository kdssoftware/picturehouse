import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer/index";
import { NextApiRequest, NextApiResponse } from 'next'

export default async (_: NextApiRequest, res: NextApiResponse) => {
  switch(_.method){
    case "POST":
      if(!_.body.from && !_.body.html && !_.body.subject && !_.body.text && !_.body.to ){
        res.status(405).send("given incorrect body");
        return;
      }
      try{
        //@ts-ignore
        let transporter = nodemailer.createTransport({ host: process.env.SMTP_URI,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth:{
                user:process.env.SMTP_USER,
                pass:process.env.SMTP_PASSWORD
            }
          });
        const mailOptions:Options = {
          from:_.body.from,
          html:_.body.html,
          subject:_.body.subject,
          to:_.body.to
        };
        console.log(mailOptions,_.body);
        let info = await transporter.sendMail(mailOptions);
        res.status(200).send(info);
      }catch(e){
        console.trace(e);
        res.status(500).send("Internal error");
      }
      break;
    default:
      res.status(405).send(_.method+" is not allowed");
  }
}