import { MongoClient } from 'mongodb'
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local or .env'
  )
}

if (!MONGODB_DB) {
  throw new Error(
    'Please define the MONGODB_DB environment variable inside .env.local or .env'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
//@ts-ignore
let cached = global.mongo

if (!cached) {
  //@ts-ignore
  cached = global.mongo = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
    //@ts-ignore
  try{
    //@ts-ignore
    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }catch(e){
    console.log("MONGODB_URI connection error, trying MONGODB_URI_BACKUP");
    //@ts-ignore
    cached.promise = MongoClient.connect(MONGODB_URI_BACKUP, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
}

export const images_page = async (room:string,page_size:number,page_num:number) => {
  if(page_size<=0){
    return [];
  }else{
    const skips = page_size * (page_num-1)
    const {db} = await connectToDatabase();
    const images =  await db.collection("images");
    // console.log(room,skips,page_size);
    const list = await images.aggregate([
      { $match: {} },    // This is your query
      { $skip: skips },   // Always apply 'skip' before 'limit'
      { $limit: page_size }, // This is your 'page size'
    ])
    return list.toArray();
  }
}
