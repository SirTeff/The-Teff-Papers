import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Rebuild every public icon from the approved square logo without changing its proportions.
const root = process.cwd();
const publicDirectory = path.join(root, "public");
const source = path.join(publicDirectory, "tp-logo.png");

const pngVariants = [
  { filename: "favicon-16x16.png", size: 16 },
  { filename: "favicon-32x32.png", size: 32 },
  { filename: "favicon-48x48.png", size: 48 },
  { filename: "apple-touch-icon.png", size: 180 },
  { filename: "icon-192x192.png", size: 192 },
  { filename: "icon-512x512.png", size: 512 },
];

function createIco(images) {
  const headerSize = 6;
  const directoryEntrySize = 16;
  const directorySize = images.length * directoryEntrySize;
  const header = Buffer.alloc(headerSize + directorySize);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let imageOffset = header.length;
  images.forEach(({ size, data }, index) => {
    const entryOffset = headerSize + index * directoryEntrySize;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

async function renderPng(size) {
  return sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, palette: size <= 48 })
    .toBuffer();
}

await mkdir(publicDirectory, { recursive: true });

for (const { filename, size } of pngVariants) {
  await writeFile(path.join(publicDirectory, filename), await renderPng(size));
}

const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    data: await readFile(path.join(publicDirectory, `favicon-${size}x${size}.png`)),
  })),
);

await writeFile(path.join(publicDirectory, "favicon.ico"), createIco(icoImages));
