import { MongoClient ,Db } from 'mongodb'

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

let cached:any;

if (!cached) {
  cached= { conn: null, promise: null }
}

export async function connectToDatabase():Promise<{client:MongoClient,db:Db}> {
    return await MongoClient.connect(String(process.env.MONGODB_URI), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(async(client) => {
      return {
        client,
        db: client.db(process.env.MONGODB_DB),
      }
    })

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
      { $sort: {'exif_tags.DateTimeOriginal': -1} },
      { $match: {room:room} },    // This is your query
      { $skip: skips },   // Always apply 'skip' before 'limit'
      { $limit: page_size }, // This is your 'page size'
    ])
    return list.toArray();
  }
}
