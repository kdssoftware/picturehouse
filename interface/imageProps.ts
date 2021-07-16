export default interface imageProps{
    buffer:Buffer|string,
    date:Date|string,
    mimetype:string,
    name:string,
    encoding:string,
    room:string,
    size:number,
    _id?:string
}