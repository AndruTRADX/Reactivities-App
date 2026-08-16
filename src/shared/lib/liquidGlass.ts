interface DisplacementMapParams {
  width: number
  height: number
  radius: number
  depth: number
}

interface DisplacementFilterParams extends DisplacementMapParams {
  strength: number
  chromaticAberration: number
}

export function buildDisplacementMap({ width, height, radius, depth }: DisplacementMapParams) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>.mix { mix-blend-mode: screen; }</style>
    <defs>
      <linearGradient
        id="Y"
        x1="0"
        x2="0"
        y1="${Math.ceil((radius / height) * 15)}%"
        y2="${Math.floor(100 - (radius / height) * 15)}%">
        <stop offset="0%" stop-color="#0F0" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
      <linearGradient
        id="X"
        x1="${Math.ceil((radius / width) * 15)}%"
        x2="${Math.floor(100 - (radius / width) * 15)}%"
        y1="0"
        y2="0">
        <stop offset="0%" stop-color="#F00" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect
        x="${depth}"
        y="${depth}"
        height="${height - 2 * depth}"
        width="${width - 2 * depth}"
        fill="#808080"
        rx="${radius}"
        ry="${radius}"
        filter="blur(${depth}px)" />
    </g>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function buildDisplacementFilter({
  width,
  height,
  radius,
  depth,
  strength,
  chromaticAberration,
}: DisplacementFilterParams) {
  const displacementMapUrl = buildDisplacementMap({ width, height, radius, depth })

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="displace" color-interpolation-filters="sRGB">
        <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMapUrl}" result="displacementMap" />
        <feDisplacementMap
          transform-origin="center"
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration * 2}"
          xChannelSelector="R"
          yChannelSelector="G" />
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedR" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration}"
          xChannelSelector="R"
          yChannelSelector="G" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedG" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength}"
          xChannelSelector="R"
          yChannelSelector="G" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0"
          result="displacedB" />
        <feBlend in="displacedR" in2="displacedG" mode="screen" />
        <feBlend in2="displacedB" mode="screen" />
      </filter>
    </defs>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}#displace`
}

let svgFilterSupport: boolean | null = null

export function detectLiquidGlassSupport() {
  if (svgFilterSupport !== null) return svgFilterSupport

  const testElement = document.createElement("div")
  testElement.style.backdropFilter = "blur(1px)"

  if (!testElement.style.backdropFilter) {
    svgFilterSupport = false
    return svgFilterSupport
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const isChrome = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios/.test(userAgent)
  const isFirefox = /firefox|fxios/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/chrome|chromium|crios|edg/.test(userAgent)

  if (isChrome) {
    svgFilterSupport = true
  } else if (isFirefox || isSafari) {
    svgFilterSupport = false
  } else {
    testElement.style.backdropFilter = "url(#test)"
    svgFilterSupport = testElement.style.backdropFilter.includes("url")
  }

  return svgFilterSupport
}

// Mirrors the reference repo's own example configuration (srdavo/liquid-glass README),
// applied uniformly to every surface in the app rather than tiered by surface size.
export const LIQUID_GLASS_PRESET = {
  depth: 5,
  blur: 1,
  strength: 40,
  chromaticAberration: 2,
  brightness: 1.1,
  saturate: 1.5,
} as const
