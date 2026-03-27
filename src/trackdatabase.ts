import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string = process.env.DB_CONN_STRING || "";
const dbName: string = process.env.DB_NAME || "formula_one";
const client = new MongoClient(connectionString);

export const collections: { tracks?: Collection } = {}

if (connectionString == "") {
    throw new Error("No connection string  in .env");
}


let db: Db;

export async function TrackinitDb(): Promise<void> {

    try {
        await client.connect();
        db = client.db(dbName);
        const trackCollection: Collection = db.collection('tracks')
        collections.tracks = trackCollection;

        console.log('connected to Track database')

    }

    catch (error) {
        if (error instanceof Error) {
            console.log(`issue with db connection ${error.message}`);
        } else {
            console.log(`error with ${error}`);
        }

    }

}
