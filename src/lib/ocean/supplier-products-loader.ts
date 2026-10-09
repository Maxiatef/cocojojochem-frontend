import "server-only";
import { Buffer } from "node:buffer";
import { gunzipSync } from "node:zlib";
import packed from "./data/supplier-products-packed";

// Keep the catalog on the server; the browser receives only the visible page.
const supplierProducts = JSON.parse(gunzipSync(Buffer.from(packed, "base64")).toString("utf8"));
export default supplierProducts;
