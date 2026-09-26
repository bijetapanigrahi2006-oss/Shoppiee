"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Html, Lightformer, RoundedBox, Sparkles, Trail, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { inr } from "@/lib/utils";

export interface HeroProduct {
  id: string;
  photo: string;
  fit?: "cover" | "contain";
  name: string;
  price?: number;
  brand?: string;
}

const W = 1.2;
const H = 1.5;
const RADIUS = 2.75;

/** Pointer-drag state shared between the canvas wrapper (DOM events) and the ring (frame loop). */
interface Drag {
  active: boolean;
  lastX: number;
  moved: number;
  pending: number;
  velocity: number;
}

// Logo paths (64×64 box), reused to print the Shoppiee mark on the back of every card.
const BAG = "M17.5 27.5a3 3 0 0 1 3-2.9h23a3 3 0 0 1 3 2.9l1.6 20.3a5 5 0 0 1-5 5.4H20.9a5 5 0 0 1-5-5.4z";
const HANDLE = "M24.5 25v-3.2a7.5 7.5 0 0 1 15 0V25";
const SPARK = "M32 31.5c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z";

/** Rounded-corner alpha mask so photos match the card's rounded frame. */
function makeRoundedMask() {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 300;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 240, 300);
  g.fillStyle = "#fff";
  g.beginPath();
  g.roundRect(0, 0, 240, 300, 16);
  g.fill();
  return new THREE.CanvasTexture(c);
}

/** Card back: brand gradient with the Shoppiee bag, so the far side of the ring looks finished. */
function makeBackTexture() {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 300;
  const g = c.getContext("2d")!;
  const lg = g.createLinearGradient(0, 0, 240, 300);
  lg.addColorStop(0, "#ff3d7f");
  lg.addColorStop(0.5, "#9b5cff");
  lg.addColorStop(1, "#1fc8f5");
  g.fillStyle = lg;
  g.fillRect(0, 0, 240, 300);
  const rg = g.createRadialGradient(60, 40, 0, 60, 40, 240);
  rg.addColorStop(0, "rgba(255,255,255,0.5)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 240, 300);
  g.save();
  g.translate(120 - 32 * 2.6, 150 - 37 * 2.6);
  g.scale(2.6, 2.6);
  g.strokeStyle = "#fff";
  g.lineWidth = 3.6;
  g.lineCap = "round";
  g.stroke(new Path2D(HANDLE));
  g.fillStyle = "#fff";
  g.fill(new Path2D(BAG));
  g.fillStyle = "#b45cff";
  g.fill(new Path2D(SPARK));
  g.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function RingCard({
  product,
  angle,
  index,
  hovered,
  onHover,
  onOpen,
  mask,
  back,
  drag,
}: {
  product: HeroProduct;
  angle: number;
  index: number;
  hovered: boolean;
  onHover: (v: boolean) => void;
  onOpen: () => void;
  mask: THREE.Texture;
  back: THREE.Texture;
  drag: MutableRefObject<Drag>;
}) {
  const inner = useRef<THREE.Group>(null);
  const texture = useTexture(product.photo);
  const contain = product.fit === "contain";

  // Studio shots fit inside the white card; lifestyle photos are cover-cropped via UVs.
  const plane = useMemo<[number, number]>(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const img = texture.image as { width: number; height: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 0.8;
    if (contain) return aspect > W / H ? [W * 0.9, (W * 0.9) / aspect] : [H * 0.9 * aspect, H * 0.9];
    const card = W / H;
    if (aspect > card) {
      texture.repeat.set(card / aspect, 1);
      texture.offset.set((1 - card / aspect) / 2, 0);
    } else {
      texture.repeat.set(1, aspect / card);
      texture.offset.set(0, (1 - aspect / card) / 2);
    }
    return [W, H];
  }, [texture, contain]);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, hovered ? 1.14 : 1, 10, dt));
    g.position.z = THREE.MathUtils.damp(g.position.z, hovered ? 0.4 : 0, 10, dt);
  });

  return (
    <group position={[Math.sin(angle) * RADIUS, Math.sin(index * 1.7) * 0.25, Math.cos(angle) * RADIUS]} rotation={[0, angle, 0]}>
      <group
        ref={inner}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (drag.current.moved < 6) onOpen();
        }}
      >
        {/* glossy rounded card */}
        <RoundedBox args={[W + 0.1, H + 0.1, 0.05]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.2} />
        </RoundedBox>
        {/* pure-white face so studio shots sit on clean white, whatever the lighting */}
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial color="#ffffff" alphaMap={mask} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.028]}>
          <planeGeometry args={plane} />
          <meshBasicMaterial map={texture} alphaMap={contain ? null : mask} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.027]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={back} alphaMap={mask} transparent toneMapped={false} />
        </mesh>
        {hovered && (
          <Html position={[0, -H / 2 - 0.26, 0.1]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-2xl border border-white/20 bg-black/70 px-3.5 py-2 text-center text-white shadow-2xl backdrop-blur-md">
              <p className="text-xs font-semibold">{product.name}</p>
              {product.price != null && <p className="text-[11px] text-white/75">from {inr(product.price)} · tap to open</p>}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

/** A slowly turning carousel of real product photos. Drag to spin it; it coasts to a stop. */
function ProductRing({ products, reduced, drag }: { products: HeroProduct[]; reduced: boolean; drag: MutableRefObject<Drag> }) {
  const group = useRef<THREE.Group>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const mask = useMemo(makeRoundedMask, []);
  const back = useMemo(makeBackTexture, []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = drag.current;
    if (d.pending) {
      g.rotation.y += d.pending;
      d.velocity = THREE.MathUtils.clamp(d.pending / Math.max(dt, 1 / 120), -6, 6);
      d.pending = 0;
    } else if (d.active) {
      d.velocity = 0;
    } else {
      g.rotation.y += d.velocity * dt;
      d.velocity = THREE.MathUtils.damp(d.velocity, 0, 2.2, dt);
      if (!hovered && !reduced) g.rotation.y += 0.13 * dt;
    }
  });

  return (
    <group ref={group}>
      {products.map((p, i) => (
        <Suspense key={p.id} fallback={null}>
          <RingCard
            product={p}
            angle={(i / products.length) * Math.PI * 2}
            index={i}
            hovered={hovered === p.id}
            onHover={(v) => setHovered(v ? p.id : null)}
            onOpen={() => router.push(`/product/${p.id}`)}
            mask={mask}
            back={back}
            drag={drag}
          />
        </Suspense>
      ))}
    </group>
  );
}

/** Soft pink-violet halo drawn once to a canvas, used behind the spark. */
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,160,230,0.9)");
  rg.addColorStop(0.35, "rgba(168,85,247,0.45)");
  rg.addColorStop(1, "rgba(34,211,238,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** The Shoppiee spark in iridescent chrome, glowing at the heart of the ring. */
function Spark() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const k = 0.14;
    const s = new THREE.Shape();
    s.moveTo(0, 1);
    s.quadraticCurveTo(k, k, 1, 0);
    s.quadraticCurveTo(k, -k, 0, -1);
    s.quadraticCurveTo(-k, -k, -1, 0);
    s.quadraticCurveTo(-k, k, 0, 1);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.1, bevelSegments: 12, curveSegments: 48 });
    g.center();
    return g;
  }, []);
  const glow = useMemo(makeGlowTexture, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.45;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.7}>
      <group position={[0, 0.5, 0]}>
        <sprite scale={[3.4, 3.4, 1]}>
          <spriteMaterial map={glow} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
        <mesh ref={ref} geometry={geometry} scale={0.9}>
          <meshPhysicalMaterial
            color="#ffe8f7"
            metalness={0.72}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.04}
            iridescence={1}
            iridescenceIOR={1.9}
            iridescenceThicknessRange={[200, 1000]}
            emissive="#8b5cf6"
            emissiveIntensity={0.18}
            envMapIntensity={2.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

/** A faint orbit line with a glowing comet and light trail travelling along it. */
function Orbit({ radius, tilt, speed, color, phase = 0, reduced }: { radius: number; tilt: [number, number, number]; speed: number; color: string; phase?: number; reduced: boolean }) {
  const dot = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = (reduced ? 0 : state.clock.elapsedTime * speed) + phase;
    dot.current?.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.005, 8, 220]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <Trail width={1.6} length={6} color={color} attenuation={(w) => w * w} decay={1.4}>
        <mesh ref={dot}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
}

function Pearl({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={position}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhysicalMaterial color={color} metalness={0.35} roughness={0.16} clearcoat={1} clearcoatRoughness={0.05} emissive={color} emissiveIntensity={0.25} envMapIntensity={1.8} />
      </mesh>
    </Float>
  );
}

/** Eases the camera in on load, follows the pointer a little, and pulls back on narrow screens. */
function Rig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const z = 9.3 * Math.max(1, 1.12 / aspect);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.6, 2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.3 + state.pointer.y * 0.3, 2, dt);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, z, 1.4, dt);
    cam.lookAt(0, 0.05, 0);
  });
  return null;
}

function Scene({ products, reduced, drag }: { products: HeroProduct[]; reduced: boolean; drag: MutableRefObject<Drag> }) {
  return (
    <>
      {!reduced && <Rig />}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <pointLight position={[-5, -2, 3]} intensity={35} color="#ec4899" />
      <pointLight position={[5, 2, -2]} intensity={35} color="#22d3ee" />
      <Suspense fallback={null}>
        <ProductRing products={products} reduced={reduced} drag={drag} />
      </Suspense>
      <Spark />
      <Orbit radius={3.3} tilt={[0.32, 0, 0.18]} speed={0.45} color="#f0abfc" reduced={reduced} />
      <Orbit radius={3.0} tilt={[-0.26, 0, -0.34]} speed={-0.36} color="#67e8f9" phase={2} reduced={reduced} />
      <Pearl position={[2.95, 1.75, 0.6]} color="#fbbf24" size={0.17} />
      <Pearl position={[-3.0, -1.3, 0.9]} color="#e5e7eb" size={0.13} />
      <Pearl position={[-2.5, 2.0, -1]} color="#fb7185" size={0.1} />
      <Sparkles count={60} scale={[10, 6, 7]} size={2} speed={0.3} color="#f5d0fe" />
      <Sparkles count={28} scale={[8, 5, 6]} size={3.5} speed={0.2} color="#a5f3fc" opacity={0.7} />
      <ContactShadows position={[0, -2.1, 0]} scale={10} blur={2.8} opacity={0.55} far={4.5} resolution={256} color="#4c1d95" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#f0abfc" position={[-4, 3, 4]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#67e8f9" position={[4, -1, 4]} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={2.4} color="#fde68a" position={[0, 4, -4]} scale={3} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 0, 6]} scale={[6, 1, 1]} />
      </Environment>
    </>
  );
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroScene({ products }: { products: HeroProduct[] }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<Drag>({ active: false, lastX: 0, moved: 0, pending: 0, velocity: 0 });
  useEffect(() => {
    setOk(supportsWebGL());
    setReduced(document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const ring = useMemo(() => products.filter((p) => p.photo).slice(0, 10), [products]);

  if (ok === false) {
    return (
      <div className="grid h-full grid-cols-3 gap-3 p-6 opacity-90">
        {ring.slice(0, 6).map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.photo} alt={p.name} className="animate-float aspect-[4/5] w-full rounded-2xl bg-white object-cover shadow-2xl" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
    );
  }
  if (ok === null) return null;

  const release = () => {
    drag.current.active = false;
  };

  return (
    <div
      className="h-full w-full cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.lastX = e.clientX;
        drag.current.moved = 0;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active) return;
        const dx = e.clientX - d.lastX;
        d.lastX = e.clientX;
        d.moved += Math.abs(dx);
        d.pending += dx * 0.008;
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      <Canvas dpr={[1, 1.75]} camera={{ position: reduced ? [0, 1.3, 9.3] : [0, 2.6, 14], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: "pan-y" }}>
        <Scene products={ring} reduced={reduced} drag={drag} />
      </Canvas>
    </div>
  );
}
