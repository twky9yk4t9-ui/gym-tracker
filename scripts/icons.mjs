// Renders the Forge app icon (a plate seen end-on, iron with a hot core)
// to the PNG sizes iOS and the PWA manifest need.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const icon = (pad = 0) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#17191E"/>
      <stop offset="100%" stop-color="#0A0B0D"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFB25C"/>
      <stop offset="100%" stop-color="#FF9330"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(${1 - pad}) translate(-256 -256)">
    <circle cx="256" cy="256" r="176" fill="#1B1E24"/>
    <circle cx="256" cy="256" r="176" stroke="rgba(255,255,255,0.14)" stroke-width="6"/>
    <circle cx="256" cy="256" r="132" stroke="rgba(255,255,255,0.07)" stroke-width="4"/>
    <circle cx="256" cy="256" r="92" stroke="rgba(255,255,255,0.05)" stroke-width="4"/>
    <circle cx="256" cy="256" r="62" fill="#FF9330" opacity="0.16"/>
    <circle cx="256" cy="256" r="40" fill="url(#core)"/>
  </g>
</svg>`

await mkdir('public', { recursive: true })
const std = Buffer.from(icon(0))
const maskable = Buffer.from(icon(0.18))
await sharp(std).resize(512, 512).png().toFile('public/icon-512.png')
await sharp(std).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(std).resize(180, 180).png().toFile('public/apple-touch-icon.png')
await sharp(maskable).resize(512, 512).png().toFile('public/icon-maskable-512.png')
console.log('icons written to public/')
