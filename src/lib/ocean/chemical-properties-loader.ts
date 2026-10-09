import "server-only";
import { Buffer } from "node:buffer";
import { gunzipSync } from "node:zlib";
import packed from "./data/chemical-properties-packed";
// Only the selected ingredient's sourced observations are rendered to the page.
const chemicalData = JSON.parse(gunzipSync(Buffer.from(packed, "base64")).toString("utf8"));
export default chemicalData;
