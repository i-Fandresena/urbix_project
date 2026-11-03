"use client";

import { useEffect, useRef } from "react";

type CountryFeature = { polygons: number[][][] };
type CountryPack = { meta?: { decimals?: number }; features?: CountryFeature[] };

const TEXTURE_WIDTH = 1440;
const TEXTURE_HEIGHT = 720;
const CENTER_LONGITUDE = 47.5;
const TWO_PI = Math.PI * 2;
const ROTATION_DURATION = 32_000;
const MADAGASCAR_PAUSE = 1_800;

const LIGHTS = [
  { latitude: -18.8792, longitude: 47.5079 },
  { latitude: -1.2864, longitude: 36.8172 },
  { latitude: 30.0444, longitude: 31.2357 },
  { latitude: 48.8566, longitude: 2.3522 },
  { latitude: 40.7128, longitude: -74.006 },
  { latitude: 19.4326, longitude: -99.1332 },
  { latitude: -23.5505, longitude: -46.6333 },
  { latitude: 28.6139, longitude: 77.209 },
  { latitude: 35.6762, longitude: 139.6503 },
  { latitude: -33.8688, longitude: 151.2093 },
  { latitude: -26.2041, longitude: 28.0473 },
  { latitude: 41.0082, longitude: 28.9784 },
  { latitude: 13.7563, longitude: 100.5018 },
  { latitude: 55.7558, longitude: 37.6173 },
];

type GlobeProjection = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  targetIndices: Uint32Array;
  sourceColumns: Uint16Array;
  sourceRows: Uint16Array;
  depth: Float32Array;
  count: number;
  image: ImageData;
};

function createMapTexture(pack: CountryPack) {
  const texture = document.createElement("canvas");
  texture.width = TEXTURE_WIDTH;
  texture.height = TEXTURE_HEIGHT;
  const textureContext = texture.getContext("2d", { alpha: false });
  if (!textureContext) return null;

  textureContext.fillStyle = "#06131f";
  textureContext.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  textureContext.fillStyle = "#12313d";
  textureContext.strokeStyle = "rgba(72, 190, 207, 0.42)";
  textureContext.lineWidth = 0.7;
  textureContext.lineJoin = "round";

  const decimals = pack.meta?.decimals ?? 3;
  const coordinateScale = 10 ** decimals;
  for (const feature of pack.features ?? []) {
    for (const polygon of feature.polygons ?? []) {
      textureContext.beginPath();
      for (const ring of polygon) {
        if (ring.length < 6) continue;
        let longitude = 0;
        let latitude = 0;
        for (let index = 0; index < ring.length; index += 2) {
          longitude += ring[index] / coordinateScale;
          latitude += ring[index + 1] / coordinateScale;
          const x = ((longitude + 180) / 360) * TEXTURE_WIDTH;
          const y = ((90 - latitude) / 180) * TEXTURE_HEIGHT;
          if (index === 0) textureContext.moveTo(x, y);
          else textureContext.lineTo(x, y);
        }
        textureContext.closePath();
      }
      textureContext.fill("evenodd");
      textureContext.stroke();
    }
  }

  return textureContext.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT).data;
}

function createProjection(width: number, height: number, frameContext: CanvasRenderingContext2D): GlobeProjection {
  const centerX = width / 2;
  const centerY = height * 0.68;
  const radiusX = Math.min(width * 0.72, height * 1.5);
  const radiusY = height * 0.62;
  const capacity = width * height;
  const targetIndices = new Uint32Array(capacity);
  const sourceColumns = new Uint16Array(capacity);
  const sourceRows = new Uint16Array(capacity);
  const depths = new Float32Array(capacity);
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    const vertical = (centerY - y) / radiusY;
    if (Math.abs(vertical) >= 1) continue;
    const latitude = Math.asin(vertical);
    const latitudeWidth = Math.cos(latitude);
    const sourceRow = Math.max(
      0,
      Math.min(TEXTURE_HEIGHT - 1, Math.floor((0.5 - latitude / Math.PI) * TEXTURE_HEIGHT)),
    );
    const firstX = Math.max(0, Math.ceil(centerX - radiusX * latitudeWidth));
    const lastX = Math.min(width - 1, Math.floor(centerX + radiusX * latitudeWidth));

    for (let x = firstX; x <= lastX; x += 1) {
      const horizontal = (x - centerX) / radiusX;
      const relativeLongitude = Math.asin(Math.max(-1, Math.min(1, horizontal / latitudeWidth)));
      const mapLongitude = ((CENTER_LONGITUDE * Math.PI / 180 + relativeLongitude + Math.PI) / TWO_PI + 1) % 1;
      targetIndices[count] = y * width + x;
      sourceColumns[count] = Math.floor(mapLongitude * TEXTURE_WIDTH);
      sourceRows[count] = sourceRow;
      depths[count] = Math.sqrt(Math.max(0, 1 - horizontal * horizontal - vertical * vertical));
      count += 1;
    }
  }

  return {
    width,
    height,
    centerX,
    centerY,
    radiusX,
    radiusY,
    targetIndices,
    sourceColumns,
    sourceRows,
    depth: depths,
    count,
    image: frameContext.createImageData(width, height),
  };
}

function drawSatellite(context: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number, color: string) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.scale(scale, scale);
  context.shadowColor = color;
  context.shadowBlur = 9;
  context.fillStyle = color;
  context.strokeStyle = "#d8fbff";
  context.lineWidth = 0.8;
  context.fillRect(-3, -2.2, 6, 4.4);
  context.strokeRect(-3, -2.2, 6, 4.4);
  context.fillStyle = "#69dff0";
  context.fillRect(-9, -1.7, 5, 3.4);
  context.fillRect(4, -1.7, 5, 3.4);
  context.beginPath();
  context.moveTo(0, -2.2);
  context.lineTo(2.2, -5.8);
  context.stroke();
  context.restore();
}

export function PointGlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let rotation = 0;
    let elapsed = 0;
    let lastFrame = 0;
    let frame = 0;
    let active = false;
    let inView = false;
    let disposed = false;
    let mapPixels: Uint8ClampedArray | null = null;
    let projection: GlobeProjection | null = null;
    let frameCanvas = document.createElement("canvas");
    let frameContext = frameCanvas.getContext("2d");

    const paintFallback = () => {
      if (!frameContext) return;
      frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
      const centerX = frameCanvas.width / 2;
      const centerY = frameCanvas.height * 0.68;
      const radiusX = Math.min(frameCanvas.width * 0.72, frameCanvas.height * 1.5);
      const radiusY = frameCanvas.height * 0.62;
      const glow = frameContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, radiusX);
      glow.addColorStop(0, "#0e3546");
      glow.addColorStop(0.78, "#061722");
      glow.addColorStop(1, "#02070c");
      frameContext.fillStyle = glow;
      frameContext.beginPath();
      frameContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, TWO_PI);
      frameContext.fill();
    };

    const paint = (animationTime: number) => {
      if (!frameContext) return;
      if (!projection || !mapPixels) {
        paintFallback();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(frameCanvas, 0, 0, canvas.width, canvas.height);
        return;
      }

      const output = projection.image.data;
      const columnShift = Math.floor((rotation / TWO_PI) * TEXTURE_WIDTH);
      for (let point = 0; point < projection.count; point += 1) {
        let sourceColumn = projection.sourceColumns[point] + columnShift;
        if (sourceColumn >= TEXTURE_WIDTH) sourceColumn -= TEXTURE_WIDTH;
        const source = (projection.sourceRows[point] * TEXTURE_WIDTH + sourceColumn) * 4;
        const target = projection.targetIndices[point] * 4;
        const shade = 0.46 + projection.depth[point] * 0.48;
        output[target] = mapPixels[source] * shade;
        output[target + 1] = mapPixels[source + 1] * shade;
        output[target + 2] = mapPixels[source + 2] * shade;
        output[target + 3] = 255;
      }

      frameContext.clearRect(0, 0, projection.width, projection.height);
      frameContext.putImageData(projection.image, 0, 0);

      const { centerX, centerY, radiusX, radiusY } = projection;
      frameContext.save();
      frameContext.strokeStyle = "rgba(80, 221, 242, 0.54)";
      frameContext.lineWidth = 1.1;
      frameContext.shadowColor = "rgba(42, 209, 246, 0.8)";
      frameContext.shadowBlur = 24;
      frameContext.beginPath();
      frameContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, TWO_PI);
      frameContext.stroke();
      frameContext.shadowBlur = 0;

      const orbits = [
        { rx: radiusX * 1.02, ry: radiusY * 0.52, tilt: -0.11, phase: animationTime * TWO_PI / 27_000, color: "#73e8f6" },
        { rx: radiusX * 0.52, ry: radiusY * 1.06, tilt: 0.42, phase: -animationTime * TWO_PI / 21_000 + 1.1, color: "#8da9ff" },
      ];
      const satelliteScale = Math.max(0.72, Math.min(1.12, projection.width / 850));
      for (const orbit of orbits) {
        frameContext.save();
        frameContext.setLineDash([3, 7]);
        frameContext.lineWidth = 0.9;
        frameContext.strokeStyle = "rgba(93, 213, 232, 0.28)";
        frameContext.beginPath();
        frameContext.ellipse(centerX, centerY, orbit.rx, orbit.ry, orbit.tilt, 0, TWO_PI);
        frameContext.stroke();
        frameContext.restore();

        const cosine = Math.cos(orbit.tilt);
        const sine = Math.sin(orbit.tilt);
        const localX = orbit.rx * Math.cos(orbit.phase);
        const localY = orbit.ry * Math.sin(orbit.phase);
        const x = centerX + localX * cosine - localY * sine;
        const y = centerY + localX * sine + localY * cosine;
        const tangentX = -orbit.rx * Math.sin(orbit.phase) * cosine - orbit.ry * Math.cos(orbit.phase) * sine;
        const tangentY = -orbit.rx * Math.sin(orbit.phase) * sine + orbit.ry * Math.cos(orbit.phase) * cosine;
        drawSatellite(frameContext, x, y, Math.atan2(tangentY, tangentX), satelliteScale, orbit.color);
      }

      const latitudeRadians = Math.PI / 180;
      LIGHTS.forEach((light, index) => {
        const latitude = light.latitude * latitudeRadians;
        const longitudeDelta = (light.longitude - CENTER_LONGITUDE) * latitudeRadians - rotation;
        const depth = Math.cos(latitude) * Math.cos(longitudeDelta);
        if (depth <= 0.08) return;
        const x = centerX + Math.cos(latitude) * Math.sin(longitudeDelta) * radiusX;
        const y = centerY - Math.sin(latitude) * radiusY;
        const hue = (animationTime / 55 + index * 37) % 360;
        const color = `hsl(${hue} 95% 68%)`;
        const pulse = 1.5 + (Math.sin(animationTime / 430 + index * 1.7) + 1) * 0.85;
        frameContext.save();
        frameContext.fillStyle = color;
        frameContext.shadowColor = color;
        frameContext.shadowBlur = 9;
        frameContext.globalAlpha = 0.52;
        frameContext.beginPath();
        frameContext.arc(x, y, pulse * 2.5, 0, TWO_PI);
        frameContext.fill();
        frameContext.globalAlpha = 0.98;
        frameContext.beginPath();
        frameContext.arc(x, y, pulse * 0.55, 0, TWO_PI);
        frameContext.fill();
        frameContext.restore();
      });

      frameContext.restore();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frameCanvas, 0, 0, canvas.width, canvas.height);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      const renderScale = Math.min(1, 900 / width);
      const renderWidth = Math.max(1, Math.ceil(width * renderScale));
      const renderHeight = Math.max(1, Math.ceil(height * renderScale));
      frameCanvas.width = renderWidth;
      frameCanvas.height = renderHeight;
      frameContext = frameCanvas.getContext("2d");
      projection = mapPixels && frameContext ? createProjection(renderWidth, renderHeight, frameContext) : null;
      paint(elapsed);
      canvas.classList.add("is-ready");
    };

    const stop = () => {
      active = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    };

    const animate = (time: number) => {
      if (!active) return;
      if (!inView || document.hidden || motion.matches) {
        stop();
        return;
      }
      if (time - lastFrame >= 42) {
        if (lastFrame) elapsed += Math.min(time - lastFrame, 100);
        const cycleTime = elapsed % (ROTATION_DURATION + MADAGASCAR_PAUSE);
        rotation = cycleTime < ROTATION_DURATION ? (cycleTime / ROTATION_DURATION) * TWO_PI : 0;
        lastFrame = time;
        paint(elapsed);
      }
      frame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (active || !projection || !inView || document.hidden || motion.matches) {
        if (motion.matches && projection) {
          rotation = 0;
          paint(0);
        }
        return;
      }
      active = true;
      lastFrame = 0;
      frame = window.requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      if (inView) start();
      else stop();
    }, { threshold: 0.01 });
    const resizeObserver = new ResizeObserver(resize);
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMotionChange = () => {
      if (motion.matches) {
        stop();
        rotation = 0;
        paint(0);
      } else start();
    };
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motion.addEventListener("change", onMotionChange);
    resize();

    fetch("/geo/natural-earth-countries.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);
        return response.json() as Promise<CountryPack>;
      })
      .then((pack) => {
        if (disposed) return;
        mapPixels = createMapTexture(pack);
        resize();
        start();
      })
      .catch(() => {
        if (disposed) return;
        canvas.dataset.mapState = "unavailable";
        canvas.classList.add("is-ready");
      });

    return () => {
      disposed = true;
      controller.abort();
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="orbit-art__canvas" aria-hidden="true" />;
}
