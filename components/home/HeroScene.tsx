"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Float, Lightformer, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface HeroProduct {
  id: string;
  photo: string;
  fit?: "cover" | "contain";
  name: string;
}

/** A rotating carousel of real product photos that tilts toward the pointer. */
function ProductRing({ products, reduced }: { products: HeroProduct[]; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const radius = 2.55;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduced && !hovered) g.rotation.y += delta * 0.12;
    // Ease the whole ring toward the pointer for a parallax feel.
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.25 + 0.12, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * 0.08, 0.05);
  });

  return (
    <group ref={group}>
      {products.map((p, i) => {
        const a = (i / products.length) * Math.PI * 2;
        const pos: [number, number, number] = [Math.sin(a) * radius, Math.sin(i * 1.7) * 0.35, Math.cos(a) * radius];
        return (
          <Suspense key={p.id} fallback={null}>
          <RingCard
            product={p}
            position={pos}
            rotationY={a}
            hovered={hovered === p.id}
            onHover={(v) => setHovered(v ? p.id : null)}
            onClick={() => router.push(`/product/${p.id}`)}
          />
          </Suspense>
        );
      })}
    </group>
  );
}

function RingCard({
  product,
  position,
  rotationY,
  hovered,
  onHover,
  onClick,
}: {
  product: HeroProduct;
  position: [number, number, number];
  rotationY: number;
  hovered: boolean;
  onHover: (v: boolean) => void;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const texture = useTexture(product.photo);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const W = 1.3;
  const H = W * 1.25;
  const img = texture.image as { width: number; height: number } | undefined;
  const imgAspect = img?.width && img?.height ? img.width / img.height : 0.8;
  const contain = product.fit === "contain";
  // Studio shots: fit inside the card on white. Lifestyle photos: cover-crop via UVs.
  const plane: [number, number] = contain
    ? imgAspect > W / H
      ? [W * 0.96, (W * 0.96) / imgAspect]
      : [H * 0.96 * imgAspect, H * 0.96]
    : [W, H];
  if (!contain && img?.width && img?.height) {
    const cardAspect = 0.8;
    if (imgAspect > cardAspect) {
      texture.repeat.set(cardAspect / imgAspect, 1);
      texture.offset.set((1 - cardAspect / imgAspect) / 2, 0);
    } else {
      texture.repeat.set(1, imgAspect / cardAspect);
      texture.offset.set(0, (1 - imgAspect / cardAspect) / 2);
    }
  }
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.lerp(g.scale.x, hovered ? 1.18 : 1, 0.12);
    g.scale.setScalar(s);
  });
  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, rotationY, 0]}
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
        onClick();
      }}
    >
      {/* white frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[W + 0.08, H + 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* photo */}
      <mesh>
        <planeGeometry args={plane} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Gem({ position, color, geometry, speed = 1 }: { position: [number, number, number]; color: string; geometry: "knot" | "ico" | "torus" | "sphere"; speed?: number }) {
  return (
    <Float speed={1.6 * speed} rotationIntensity={1.4} floatIntensity={1.6}>
      <mesh position={position} castShadow>
        {geometry === "knot" && <torusKnotGeometry args={[0.42, 0.15, 160, 24]} />}
        {geometry === "ico" && <icosahedronGeometry args={[0.5, 0]} />}
        {geometry === "torus" && <torusGeometry args={[0.45, 0.16, 48, 96]} />}
        {geometry === "sphere" && <sphereGeometry args={[0.38, 64, 64]} />}
        <meshPhysicalMaterial color={color} roughness={0.12} metalness={0.35} clearcoat={1} clearcoatRoughness={0.05} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[120, 900]} envMapIntensity={1.4} />
      </mesh>
    </Float>
  );
}

function Scene({ products, reduced }: { products: HeroProduct[]; reduced: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={30} color="#ec4899" />
      <pointLight position={[5, 2, -2]} intensity={30} color="#22d3ee" />
      <Suspense fallback={null}>
        <ProductRing products={products} reduced={reduced} />
      </Suspense>
      <Gem position={[-2.2, 1.55, 1.2]} color="#f472b6" geometry="knot" />
      <Gem position={[2.25, -1.45, 1.4]} color="#a78bfa" geometry="ico" speed={0.8} />
      <Gem position={[2.1, 1.7, -0.4]} color="#fbbf24" geometry="torus" speed={1.2} />
      <Gem position={[-2.05, -1.65, 0.9]} color="#34d399" geometry="sphere" speed={0.9} />
      <Sparkles count={70} scale={[9, 5, 6]} size={2.4} speed={0.35} color="#f5d0fe" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#f0abfc" position={[-4, 3, 4]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#67e8f9" position={[4, -1, 4]} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#fde68a" position={[0, 4, -4]} scale={3} />
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

  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.5, 9], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: "pan-y" }}>
      <Scene products={ring} reduced={reduced} />
    </Canvas>
  );
}
