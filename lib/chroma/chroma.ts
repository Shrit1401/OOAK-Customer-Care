import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  ssl: true,
  port: 8000,
  host: "localhost",
});

export default client;
