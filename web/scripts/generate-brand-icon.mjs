import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const svg = await readFile(new URL("../src/app/icon.svg", import.meta.url));
const png = await sharp(svg).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);

header.writeUInt16LE(1, 2); // ICO image type
header.writeUInt16LE(1, 4); // one image
header[6] = 48;
header[7] = 48;
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(header.length, 18);

await writeFile(new URL("../src/app/favicon.ico", import.meta.url), Buffer.concat([header, png]));
