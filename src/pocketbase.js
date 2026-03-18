import PocketBase from "pocketbase";

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

if (!pocketbaseUrl) {
  throw new Error("VITE_POCKETBASE_URL must be defined in the .env file");
}

const pb = new PocketBase(pocketbaseUrl);

export default pb;
