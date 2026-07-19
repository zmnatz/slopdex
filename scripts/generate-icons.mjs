import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

const SIZES = [
  180,  // iPhone (iOS 7+)
  167,  // iPad Pro
  152,  // iPad Retina
  120,  // iPhone
  76,   // iPad
  60,   // iPhone spotlights
  192,  // Android/PWA
  512,  // Android/PWA splash
]

const publicDir = join(process.cwd(), 'public')
const svgPath = join(publicDir, 'favicon.svg')

async function generatePng(size) {
  const outputPath = join(publicDir, `icon-${size}.png`)
  return new Promise((resolve, reject) => {
    const proc = spawn('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', outputPath, svgPath])
    proc.on('close', (code) => {
      if (code === 0) resolve(outputPath)
      else reject(new Error(`rsvg-convert exited with ${code}`))
    })
    proc.on('error', async (err) => {
      if (err.code === 'ENOENT') {
        try {
          const sharp = (await import('sharp')).default
          await sharp(svgPath).resize(size, size).png().toFile(outputPath)
          resolve(outputPath)
        } catch {
          reject(new Error('sharp not installed and rsvg-convert not found'))
        }
      } else {
        reject(err)
      }
    })
  })
}

async function main() {
  for (const size of SIZES) {
    try {
      await generatePng(size)
      console.log(`Generated icon-${size}.png`)
    } catch (e) {
      console.error(`Failed to generate ${size}:`, e.message)
    }
  }

  // Generate 180x180 as apple-touch-icon.png (default)
  try {
    await generatePng(180)
    await fs.copyFile(join(publicDir, 'icon-180.png'), join(publicDir, 'apple-touch-icon.png'))
    console.log('Generated apple-touch-icon.png')
  } catch (e) {
    console.error('Failed to generate apple-touch-icon:', e.message)
  }
}

main()