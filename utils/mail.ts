import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer/index";

export default async (mailOptions:Options)=>{
    //@ts-ignore
    let transporter = nodemailer.createTransport({ host: process.env.SMTP_URI,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASSWORD
    }
  });
    let info = await transporter.sendMail(mailOptions);
    return info;
}