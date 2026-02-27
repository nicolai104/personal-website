export function rgbToLab(r, g, b) {
  let rr = r / 255
  let gg = g / 255
  let bb = b / 255

  if (rr > 0.04045) {
    rr = Math.pow((rr + 0.055) / 1.055, 2.4)
  } else {
    rr = rr / 12.92
  }
  if (gg > 0.04045) {
    gg = Math.pow((gg + 0.055) / 1.055, 2.4)
  } else {
    gg = gg / 12.92
  }
  if (bb > 0.04045) {
    bb = Math.pow((bb + 0.055) / 1.055, 2.4)
  } else {
    bb = bb / 12.92
  }

  rr *= 100
  gg *= 100
  bb *= 100

  let x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375
  let y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750
  let z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041

  x /= 95.047
  y /= 100.000
  z /= 108.883

  if (x > 0.008856) {
    x = Math.pow(x, 1 / 3)
  } else {
    x = (7.787 * x) + (16 / 116)
  }
  if (y > 0.008856) {
    y = Math.pow(y, 1 / 3)
  } else {
    y = (7.787 * y) + (16 / 116)
  }
  if (z > 0.008856) {
    z = Math.pow(z, 1 / 3)
  } else {
    z = (7.787 * z) + (16 / 116)
  }

  const labL = (116 * y) - 16
  const labA = 500 * (x - y)
  const labB = 200 * (y - z)

  return [labL, labA, labB]
}

export function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2

  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab = (C1 + C2) / 2

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))))

  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)

  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  let h1p = Math.atan2(b1, a1p) * (180 / Math.PI)
  if (h1p < 0) h1p += 360

  let h2p = Math.atan2(b2, a2p) * (180 / Math.PI)
  if (h2p < 0) h2p += 360

  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp = h2p - h1p
  if (C1p * C2p === 0) {
    dhp = 0
  } else if (Math.abs(dhp) <= 180) {
    // keep as is
  } else if (dhp > 180) {
    dhp -= 360
  } else {
    dhp += 360
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180))

  const Lp = (L1 + L2) / 2
  const Cp = (C1p + C2p) / 2

  let Hp
  if (C1p * C2p === 0) {
    Hp = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2
  } else {
    Hp = (h1p + h2p - 360) / 2
  }

  const T = 1 
    - 0.17 * Math.cos((Hp - 30) * (Math.PI / 180))
    + 0.24 * Math.cos((2 * Hp) * (Math.PI / 180))
    + 0.32 * Math.cos((3 * Hp + 6) * (Math.PI / 180))
    - 0.20 * Math.cos((4 * Hp - 63) * (Math.PI / 180))

  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2))

  const RC = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)))

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2))
  const SC = 1 + 0.045 * Cp
  const SH = 1 + 0.015 * Cp * T

  const RT = -Math.sin((2 * dTheta) * (Math.PI / 180)) * RC

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  )

  return dE
}

export function findClosestColor(r, g, b, colorPalette) {
  const lab = rgbToLab(r, g, b)
  
  let minDeltaE = Infinity
  let closestColor = colorPalette[0]

  for (const color of colorPalette) {
    const deltaE = deltaE2000(lab, color.lab)
    if (deltaE < minDeltaE) {
      minDeltaE = deltaE
      closestColor = color
    }
  }

  return closestColor
}

export function quantizeImage(imageData, colorPalette, gridWidth, gridHeight) {
  const { width, height, data } = imageData
  const result = []
  const colorCounts = {}

  const cellWidth = width / gridWidth
  const cellHeight = height / gridHeight

  for (let gy = 0; gy < gridHeight; gy++) {
    const row = []
    for (let gx = 0; gx < gridWidth; gx++) {
      const startX = Math.floor(gx * cellWidth)
      const startY = Math.floor(gy * cellHeight)
      const endX = Math.floor((gx + 1) * cellWidth)
      const endY = Math.floor((gy + 1) * cellHeight)

      let r = 0, g = 0, b = 0, count = 0

      for (let y = startY; y < endY && y < height; y++) {
        for (let x = startX; x < endX && x < width; x++) {
          const idx = (y * width + x) * 4
          r += data[idx]
          g += data[idx + 1]
          b += data[idx + 2]
          count++
        }
      }

      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)

      const matchedColor = findClosestColor(r, g, b, colorPalette)
      row.push(matchedColor)

      if (!colorCounts[matchedColor.code]) {
        colorCounts[matchedColor.code] = {
          code: matchedColor.code,
          name: matchedColor.name,
          hex: matchedColor.hex,
          count: 0
        }
      }
      colorCounts[matchedColor.code].count++
    }
    result.push(row)
  }

  const colorStats = Object.values(colorCounts).map(c => ({
    ...c,
    percentage: (c.count / (gridWidth * gridHeight) * 100).toFixed(1)
  }))

  return {
    pattern: result,
    stats: {
      totalBeads: gridWidth * gridHeight,
      colorCount: colorStats.length,
      colors: colorStats
    }
  }
}

export function floydSteinbergDither(pattern, colorPalette, gridWidth, gridHeight) {
  const result = pattern.map(row => [...row])
  const error = Array.from({ length: gridHeight }, () => Array(gridWidth).fill().map(() => ({ r: 0, g: 0, b: 0 })))

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const oldColor = result[y][x]
      
      const oldRgb = hexToRgb(oldColor.hex)
      const oldWithError = {
        r: Math.max(0, Math.min(255, oldRgb.r + error[y][x].r)),
        g: Math.max(0, Math.min(255, oldRgb.g + error[y][x].g)),
        b: Math.max(0, Math.min(255, oldRgb.b + error[y][x].b))
      }

      const newColor = findClosestColor(oldWithError.r, oldWithError.g, oldWithError.b, colorPalette)
      result[y][x] = newColor

      const newRgb = hexToRgb(newColor.hex)
      const errR = oldWithError.r - newRgb.r
      const errG = oldWithError.g - newRgb.g
      const errB = oldWithError.b - newRgb.b

      const distribute = (dx, dy, factor) => {
        if (dx + x >= 0 && dx + x < gridWidth && dy + y >= 0 && dy + y < gridHeight) {
          error[dy + y][dx + x].r += errR * factor
          error[dy + y][dx + x].g += errG * factor
          error[dy + y][dx + x].b += errB * factor
        }
      }

      distribute(1, 0, 7 / 16)
      distribute(-1, 1, 3 / 16)
      distribute(0, 1, 5 / 16)
      distribute(1, 1, 1 / 16)
    }
  }

  const colorCounts = {}
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const color = result[y][x]
      if (!colorCounts[color.code]) {
        colorCounts[color.code] = {
          code: color.code,
          name: color.name,
          hex: color.hex,
          count: 0
        }
      }
      colorCounts[color.code].count++
    }
  }

  const colorStats = Object.values(colorCounts).map(c => ({
    ...c,
    percentage: (c.count / (gridWidth * gridHeight) * 100).toFixed(1)
  }))

  return {
    pattern: result,
    stats: {
      totalBeads: gridWidth * gridHeight,
      colorCount: colorStats.length,
      colors: colorStats
    }
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}
