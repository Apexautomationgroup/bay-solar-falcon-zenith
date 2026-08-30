import * as THREE from "three";
import type { BountyContract, GameMountOptions, NightResult } from "./types";

type Building = { x: number; z: number; hw: number; hd: number };

const WEAPONS = [
  { id: "knife", label: "KNIFE", tag: "SILENT MELEE", silent: true, range: 2.0, cashMin: 0.7, cashMax: 0.9, bountyMin: 0.6, bountyMax: 0.85, hunterDelay: 5200 },
  { id: "pistol", label: "PISTOL", tag: "SILENT", silent: true, range: 6.5, cashMin: 0.85, cashMax: 1.05, bountyMin: 0.85, bountyMax: 1.1, hunterDelay: 4000 },
  { id: "smg", label: "SMG", tag: "LOUD", silent: false, range: 9.5, cashMin: 0.95, cashMax: 1.15, bountyMin: 1.15, bountyMax: 1.4, hunterDelay: 1400 },
  { id: "sniper", label: "SNIPER", tag: "LOUD, LONG", silent: false, range: 17, cashMin: 1.1, cashMax: 1.35, bountyMin: 1.25, bountyMax: 1.55, hunterDelay: 2200 },
] as const;

export type GameHandle = {
  destroy: () => void;
  setHudHost: (el: HTMLElement | null) => void;
};

export function mountGame(container: HTMLElement, options: GameMountOptions): GameHandle {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080c);
  scene.fog = new THREE.FogExp2(0x080a10, 0.0115);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 600);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x1a1e2e, 0.95);
  scene.add(ambient);
  const moon = new THREE.DirectionalLight(0xa8b8ff, 1.05);
  moon.position.set(-40, 60, -30);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -70;
  moon.shadow.camera.right = 70;
  moon.shadow.camera.top = 70;
  moon.shadow.camera.bottom = -70;
  moon.shadow.camera.far = 220;
  moon.shadow.bias = -0.0003;
  scene.add(moon);
  const rim = new THREE.PointLight(0xff5540, 1.35, 70);
  scene.add(rim);
  scene.add(new THREE.DirectionalLight(0x304060, 0.35).translateX(30));
  scene.add(new THREE.HemisphereLight(0x2a3050, 0x0a0b0e, 0.4));

  const WORLD_HALF = 100;
  const GROUND_SIZE = WORLD_HALF * 2;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.92, metalness: 0.08 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ROAD_SPACING = 30;
  const ROAD_WIDTH = 7;
  const roadCoords: number[] = [];
  for (let c = -WORLD_HALF + ROAD_SPACING; c < WORLD_HALF; c += ROAD_SPACING) roadCoords.push(c);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1b20, roughness: 0.78, metalness: 0.12 });
  const laneMat = new THREE.MeshBasicMaterial({ color: 0xe0c04a, transparent: true, opacity: 0.55 });
  roadCoords.forEach((c) => {
    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, GROUND_SIZE), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(c, 0.015, 0);
    scene.add(vRoad);
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SIZE, ROAD_WIDTH), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.015, c);
    scene.add(hRoad);
  });

  const buildings: Building[] = [];
  function addBuilding(x: number, z: number, w: number, d: number, h: number, color: number, accent: number | null) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.28 }),
    );
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    if (accent) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.01, 0.18, 0.06),
        new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.5 }),
      );
      strip.position.set(x, h * 0.62, z + d / 2 + 0.04);
      scene.add(strip);
      const glow = new THREE.PointLight(accent, 0.65, 8);
      glow.position.set(x, h * 0.62, z + d / 2 + 0.5);
      scene.add(glow);
    }
    buildings.push({ x, z, hw: w / 2 + 0.6, hd: d / 2 + 0.6 });
  }

  let seed = 1337;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  const ACCENTS = [0xff4d3d, 0x3ad1ff, 0x7d9a6a, 0xc4b89a];
  const RESERVED = [
    { x: 0, z: 24, r: 15 },
    { x: 0, z: -72, r: 18 },
    { x: 47, z: -12, r: 16 },
    { x: -40, z: 47, r: 16 },
  ];
  function inReserved(x: number, z: number) {
    return RESERVED.some((rz) => Math.hypot(x - rz.x, z - rz.z) < rz.r);
  }
  for (let x = -WORLD_HALF + ROAD_SPACING / 2; x < WORLD_HALF; x += ROAD_SPACING) {
    for (let z = -WORLD_HALF + ROAD_SPACING / 2; z < WORLD_HALF; z += ROAD_SPACING) {
      if (inReserved(x, z) || rand() < 0.12) continue;
      const w = 12 + rand() * 7;
      const d = 12 + rand() * 7;
      const h = 6 + rand() * 16;
      const grey = 0x15 + Math.floor(rand() * 10);
      const color = (grey << 16) | ((grey + 2) << 8) | (grey + 5);
      addBuilding(x + (rand() - 0.5) * 4, z + (rand() - 0.5) * 4, w, d, h, color, rand() < 0.55 ? ACCENTS[Math.floor(rand() * ACCENTS.length)] : null);
    }
  }

  function hasLOS(a: THREE.Vector3, b: THREE.Vector3) {
    const dx = b.x - a.x,
      dz = b.z - a.z;
    const dist = Math.hypot(dx, dz);
    const steps = Math.max(2, Math.floor(dist / 1.2));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = a.x + dx * t,
        pz = a.z + dz * t;
      for (const bld of buildings) {
        if (Math.abs(px - bld.x) < bld.hw - 0.6 && Math.abs(pz - bld.z) < bld.hd - 0.6) return false;
      }
    }
    return true;
  }

  const RAIN_COUNT = 900;
  const rainPos = new Float32Array(RAIN_COUNT * 3);
  for (let i = 0; i < RAIN_COUNT; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 70;
    rainPos[i * 3 + 1] = Math.random() * 30;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x8fa3c9, size: 0.12, transparent: true, opacity: 0.5 }));
  scene.add(rain);

  function makeHumanoid(opts: { skin?: number; clothes?: number; clothes2?: number; hair?: number; eyesGlow?: number | null; height?: number; castShadow?: boolean }) {
    const skin = opts.skin ?? 0xd8a679;
    const clothes = opts.clothes ?? 0x22252b;
    const clothes2 = opts.clothes2 ?? 0x1a1c21;
    const hair = opts.hair ?? 0x1c1712;
    const height = opts.height ?? 1.75;
    const castShadow = opts.castShadow !== false;
    const HIP_Y = height * 0.47;
    const TORSO_H = height * 0.34;
    const HEAD_R = height * 0.095;
    const LEG_LEN = HIP_Y;
    const ARM_LEN = TORSO_H * 0.95;
    const g = new THREE.Group();
    const legMat = new THREE.MeshStandardMaterial({ color: clothes2, roughness: 0.75 });
    function makeLeg(sign: number) {
      const pivot = new THREE.Group();
      pivot.position.set(sign * 0.11, HIP_Y, 0);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, LEG_LEN, 8), legMat);
      mesh.position.y = -LEG_LEN / 2;
      mesh.castShadow = castShadow;
      pivot.add(mesh);
      g.add(pivot);
      return pivot;
    }
    const legL = makeLeg(-1);
    const legR = makeLeg(1);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, TORSO_H, 0.3), new THREE.MeshStandardMaterial({ color: clothes, roughness: 0.7, metalness: 0.1 }));
    torso.position.y = HIP_Y + TORSO_H / 2;
    torso.castShadow = castShadow;
    g.add(torso);
    function makeArm(sign: number) {
      const pivot = new THREE.Group();
      pivot.position.set(sign * 0.34, HIP_Y + TORSO_H * 0.92, 0);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, ARM_LEN, 8), new THREE.MeshStandardMaterial({ color: clothes, roughness: 0.72 }));
      mesh.position.y = -ARM_LEN / 2;
      mesh.castShadow = castShadow;
      pivot.add(mesh);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.6 }));
      hand.position.y = -ARM_LEN;
      pivot.add(hand);
      g.add(pivot);
      return pivot;
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);
    const headGroup = new THREE.Group();
    headGroup.position.y = HIP_Y + TORSO_H + HEAD_R + 0.02;
    g.add(headGroup);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 14, 12), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55 }));
    headMesh.castShadow = castShadow;
    headGroup.add(headMesh);
    const hairMesh = new THREE.Mesh(
      new THREE.SphereGeometry(HEAD_R * 1.06, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new THREE.MeshStandardMaterial({ color: hair, roughness: 0.85 }),
    );
    hairMesh.position.y = HEAD_R * 0.08;
    headGroup.add(hairMesh);
    const eyeMat = opts.eyesGlow ? new THREE.MeshBasicMaterial({ color: opts.eyesGlow }) : new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    const eyeGeo = new THREE.SphereGeometry(HEAD_R * 0.13, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-HEAD_R * 0.42, HEAD_R * 0.08, HEAD_R * 0.88);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(HEAD_R * 0.42, HEAD_R * 0.08, HEAD_R * 0.88);
    headGroup.add(eyeL, eyeR);
    g.userData.legL = legL;
    g.userData.legR = legR;
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.headGroup = headGroup;
    g.userData.walkPhase = Math.random() * Math.PI * 2;
    return g;
  }

  function animateWalk(entity: THREE.Group, dt: number, moving: boolean, speedScale: number) {
    const u = entity.userData;
    if (moving) u.walkPhase += dt * 7.5 * Math.max(0.4, speedScale);
    const s = Math.sin(u.walkPhase);
    const amt = moving ? 0.55 : 0.0;
    u.legL.rotation.x = THREE.MathUtils.lerp(u.legL.rotation.x, s * amt, 0.4);
    u.legR.rotation.x = THREE.MathUtils.lerp(u.legR.rotation.x, -s * amt, 0.4);
    u.armL.rotation.x = THREE.MathUtils.lerp(u.armL.rotation.x, -s * amt * 0.8, 0.4);
    u.armR.rotation.x = THREE.MathUtils.lerp(u.armR.rotation.x, s * amt * 0.8, 0.4);
  }

  function makeBike(color: number, hunter: boolean) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.65 });
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 1.15), bodyMat);
    tank.position.y = 0.62;
    tank.castShadow = true;
    g.add(tank);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.45), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.85 }));
    seat.position.set(0, 0.72, -0.35);
    g.add(seat);
    const fork = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.8, roughness: 0.3 }));
    fork.position.set(0, 0.55, 0.55);
    g.add(fork);
    const wheelGeo = new THREE.TorusGeometry(0.28, 0.07, 8, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111, roughness: 0.9 });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(0, 0.28, 0.62);
    const w2 = w1.clone();
    w2.position.z = -0.55;
    g.add(w1, w2);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: hunter ? 0xff2a1a : 0xffe08a }));
    light.position.set(0, 0.7, 0.78);
    g.add(light);
    if (hunter) {
      const beacon = new THREE.PointLight(0xff2a1a, 1.2, 8);
      beacon.position.set(0, 1.1, 0);
      g.add(beacon);
    }
    return g;
  }

  function makeWeaponMesh(id: string) {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.35, metalness: 0.85 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55, metalness: 0.4 });
    const grip = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.8, metalness: 0.15 });
    const blade = new THREE.MeshStandardMaterial({ color: 0xc0c4cc, roughness: 0.25, metalness: 0.95 });
    if (id === "knife") {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.05), grip);
      handle.position.y = -0.07;
      g.add(handle);
      const bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.22, 0.012), blade);
      bladeMesh.position.y = 0.13;
      g.add(bladeMesh);
      g.userData.muzzleOffset = new THREE.Vector3(0, 0.28, 0);
    } else if (id === "pistol") {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.18), metal));
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.12);
      g.add(barrel);
      const gr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.07), grip);
      gr.position.set(0, -0.08, -0.02);
      g.add(gr);
      g.userData.muzzleOffset = new THREE.Vector3(0, 0.05, 0.2);
    } else if (id === "smg") {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.28), metal));
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.2);
      g.add(barrel);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), grip);
      mag.position.set(0, -0.1, 0.02);
      g.add(mag);
      g.userData.muzzleOffset = new THREE.Vector3(0, 0.04, 0.32);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.36), metal);
      g.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.28, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.28);
      g.add(barrel);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 10), metal);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.08, 0.02);
      g.add(scope);
      g.userData.muzzleOffset = new THREE.Vector3(0, 0.04, 0.48);
    }
    g.scale.setScalar(1.15);
    return g;
  }

  function makeNameSprite(name: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = "rgba(12,13,11,0.78)";
    ctx.fillRect(40, 28, 432, 72);
    ctx.strokeStyle = "rgba(196,52,43,0.85)";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 28, 432, 72);
    ctx.fillStyle = "#e8e4d8";
    ctx.font = "700 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = name.slice(0, 18).toUpperCase();
    ctx.fillText(label, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.scale.set(2.6, 0.65, 1);
    spr.position.y = 2.4;
    spr.renderOrder = 10;
    return spr;
  }

  function buildVisionCone(range: number, halfAngle: number, color: number) {
    const segs = 18;
    const positions = [0, 0.03, 0];
    for (let i = 0; i <= segs; i++) {
      const a = -halfAngle + (i / segs) * halfAngle * 2;
      positions.push(Math.sin(a) * range, 0.03, Math.cos(a) * range);
    }
    const idx: number[] = [];
    for (let i = 1; i <= segs; i++) idx.push(0, i, i + 1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(idx);
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  }

  const player = makeHumanoid({ skin: 0xc9926b, clothes: 0x22252b, clothes2: 0x15161a, hair: 0x0e0c0a });
  player.position.set(0, 0, 24);
  player.add(makeNameSprite(options.callsign || "RIDER"));
  scene.add(player);
  const playerGlow = new THREE.PointLight(0xff3b2e, 0.2, 5);
  playerGlow.position.set(0, 1.2, 0);
  player.add(playerGlow);

  const weaponMeshes: Record<string, THREE.Group> = {};
  WEAPONS.forEach((w) => {
    weaponMeshes[w.id] = makeWeaponMesh(w.id);
  });
  let currentWeaponIdx = 0;
  let currentWeaponMesh: THREE.Group | null = null;
  function attachWeapon(idx: number) {
    const armR = player.userData.armR as THREE.Group;
    if (currentWeaponMesh) armR.remove(currentWeaponMesh);
    const id = WEAPONS[idx].id;
    currentWeaponMesh = weaponMeshes[id];
    currentWeaponMesh.position.set(0, -0.55, 0.08);
    currentWeaponMesh.rotation.set(id === "knife" ? 0.4 : -0.15, id === "knife" ? 0.6 : 0, -0.35);
    armR.add(currentWeaponMesh);
  }
  attachWeapon(0);

  const P = { pos: new THREE.Vector3(0, 0, 24), heading: 0, speed: 5.2 };
  const playerMode = { value: "onfoot" as "onfoot" | "vehicle" };
  let activeVehicle: { group: THREE.Group; pos: THREE.Vector3; heading: number; speedVal: number; occupied: boolean } | null = null;
  function getPlayerPos() {
    return playerMode.value === "vehicle" && activeVehicle ? activeVehicle.pos : P.pos;
  }

  const vehicles: { group: THREE.Group; pos: THREE.Vector3; heading: number; speedVal: number; occupied: boolean }[] = [];
  const bikeSpots = [
    { x: 15, z: 30, h: 0 },
    { x: -15, z: 9, h: Math.PI / 2 },
    { x: 0, z: -3, h: 0 },
    { x: 29, z: -15, h: Math.PI / 2 },
    { x: -29, z: -33, h: 0 },
    { x: 15, z: -51, h: Math.PI / 2 },
  ];
  const BIKE_COLORS = [0x2a2a28, 0x4a1a14, 0x1a2a22, 0x3a2a12];
  bikeSpots.forEach((s, i) => {
    const group = makeBike(BIKE_COLORS[i % BIKE_COLORS.length], false);
    group.position.set(s.x, 0, s.z);
    group.rotation.y = s.h;
    scene.add(group);
    vehicles.push({ group, pos: new THREE.Vector3(s.x, 0, s.z), heading: s.h, speedVal: 0, occupied: false });
  });

  const CAR_MAX_SPEED = 18,
    CAR_ACCEL = 16,
    CAR_FRICTION = 8,
    CAR_TURN_RATE = 2.7;
  function nearestFreeVehicle(pos: THREE.Vector3, maxDist: number) {
    let best = null as (typeof vehicles)[0] | null,
      bestD = maxDist;
    for (const v of vehicles) {
      if (v.occupied) continue;
      const d = pos.distanceTo(v.pos);
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }

  const SAFEHOUSE_POS = new THREE.Vector3(0, 0, -72);
  const safehouseRing = new THREE.Mesh(
    new THREE.RingGeometry(2.75, 2.95, 40),
    new THREE.MeshBasicMaterial({ color: 0x5fd67a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  );
  safehouseRing.rotation.x = -Math.PI / 2;
  safehouseRing.position.copy(SAFEHOUSE_POS);
  safehouseRing.position.y = 0.04;
  scene.add(safehouseRing);
  addBuilding(0, -84, 8, 7, 7, 0x11241a, 0x5fd67a);
  const campLight = new THREE.PointLight(0x5fd67a, 1.3, 14);
  campLight.position.set(0, 3, -72);
  scene.add(campLight);

  const TARGET_VISION_RANGE = 12;
  const TARGET_VISION_HALF_ANGLE = THREE.MathUtils.degToRad(32);
  type Target = {
    def: BountyContract;
    group: THREE.Group;
    ring: THREE.Mesh;
    cone: THREE.Mesh;
    path: THREE.Vector3[];
    pathIdx: number;
    pos: THREE.Vector3;
    speed: number;
    alive: boolean;
    dying: boolean;
    alertState: "unaware" | "alerted";
    calmTimer: number;
  };
  const liveContracts = options.contracts.filter((c) => c.status === "accepted");
  const targets: Target[] = liveContracts.map((def) => {
    const group = makeHumanoid({ skin: 0xd8ab82, clothes: 0x4a4326, clothes2: 0x3a3320, hair: 0x2a2015, height: 1.72 });
    scene.add(group);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.05, 32),
      new THREE.MeshBasicMaterial({ color: 0xff4d3d, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
    const cone = buildVisionCone(TARGET_VISION_RANGE, TARGET_VISION_HALF_ANGLE, 0x3ad1ff);
    scene.add(cone);
    const path: THREE.Vector3[] = [];
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * Math.PI * 2 + rand() * 0.5;
      path.push(new THREE.Vector3(def.center.x + Math.cos(ang) * def.radius, 0, def.center.z + Math.sin(ang) * def.radius));
    }
    const pos = path[0].clone();
    group.position.copy(pos);
    return { def, group, ring, cone, path, pathIdx: 0, pos, speed: 2.0 + rand() * 0.4, alive: true, dying: false, alertState: "unaware" as const, calmTimer: 0 };
  });

  const MAX_HUNTERS = 3;
  const hunterPool = Array.from({ length: MAX_HUNTERS }, () => {
    const foot = makeHumanoid({ skin: 0xb98060, clothes: 0x2a0f0c, clothes2: 0x1a0805, hair: 0x0a0605, eyesGlow: 0xff2a1a });
    foot.visible = false;
    scene.add(foot);
    const car = makeBike(0x4a0f0c, true);
    car.visible = false;
    scene.add(car);
    return {
      foot,
      car,
      pos: new THREE.Vector3(),
      heading: 0,
      active: false,
      inVehicle: false,
      mode: "search" as "search" | "chase",
      lastKnownPos: new THREE.Vector3(),
      searchTarget: null as THREE.Vector3 | null,
    };
  });

  const pedestrians: { group: THREE.Group; pos: THREE.Vector3; heading: number; target: THREE.Vector3; wait: number; speed: number; fleeing: boolean; fleeTimer: number }[] = [];
  for (let i = 0; i < 10; i++) {
    let px = 0,
      pz = 0,
      tries = 0;
    do {
      px = (rand() - 0.5) * GROUND_SIZE * 0.85;
      pz = (rand() - 0.5) * GROUND_SIZE * 0.85;
      tries++;
    } while (inReserved(px, pz) && tries < 20);
    const group = makeHumanoid({
      skin: [0xc9926b, 0x8a5a3a, 0xe0b891][Math.floor(rand() * 3)],
      clothes: [0x33475a, 0x5a3333, 0x33502f][Math.floor(rand() * 3)],
      height: 1.6 + rand() * 0.25,
      castShadow: false,
    });
    group.position.set(px, 0, pz);
    scene.add(group);
    pedestrians.push({
      group,
      pos: new THREE.Vector3(px, 0, pz),
      heading: 0,
      target: new THREE.Vector3(px, 0, pz),
      wait: rand() * 2,
      speed: 1.1 + rand() * 0.6,
      fleeing: false,
      fleeTimer: 0,
    });
  }

  const keys: Record<string, boolean> = {};
  const injected = new Set<string>();
  const onKeyDown = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = true;
    if (["1", "2", "3", "4"].includes(e.key)) {
      currentWeaponIdx = Number(e.key) - 1;
      attachWeapon(currentWeaponIdx);
      refreshWeaponBar();
    }
    if (e.key === "e" || e.key === "E" || e.key === " ") {
      e.preventDefault();
      doContext();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  let joyVec = { x: 0, y: 0 };
  function updateMovementVector() {
    let mx = joyVec.x,
      my = joyVec.y;
    const w = keys["w"] || keys["arrowup"] || injected.has("KeyW");
    const s = keys["s"] || keys["arrowdown"] || injected.has("KeyS");
    const a = keys["a"] || keys["arrowleft"] || injected.has("KeyA");
    const d = keys["d"] || keys["arrowright"] || injected.has("KeyD");
    if (w) my -= 1;
    if (s) my += 1;
    if (a) mx -= 1;
    if (d) mx += 1;
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    return { x: mx, y: my };
  }

  const state = {
    phase: "playing" as "playing" | "caught" | "success",
    bounty: 0,
    cash: 0,
    heat: "clear" as "clear" | "alert" | "hunted",
    lastKillTime: performance.now(),
    kills: [] as string[],
  };
  const CATCH_RANGE_FOOT = 1.15,
    CATCH_RANGE_VEHICLE = 2.1,
    SAFEHOUSE_RANGE = 3.2;
  const BOUNTY_DECAY_GRACE = 12000,
    BOUNTY_DECAY_RATE = 16;
  const shakeState = { mag: 0 };
  const activeFx: { type: string; mesh?: THREE.Object3D; light?: THREE.PointLight; core?: THREE.Object3D; vel?: THREE.Vector3; life: number; maxLife: number; gravity?: number }[] = [];

  let hudHost: HTMLElement | null = null;
  const hud = {
    bounty: 0,
    cash: 0,
    heat: "CLEAR",
    objective: "Close the contracts. Extract at camp.",
    action: "" as "" | "ELIMINATE" | "MOUNT BIKE" | "DISMOUNT",
    weapon: 0,
    decay: "",
    speed: "",
    contracts: [] as { name: string; status: string }[],
  };

  function refreshWeaponBar() {
    hud.weapon = currentWeaponIdx;
  }
  function allTargetsDown() {
    return targets.length === 0 || targets.every((t) => !t.alive);
  }
  function resolveCollision(pos: THREE.Vector3, radius: number) {
    for (const b of buildings) {
      const dx = pos.x - b.x,
        dz = pos.z - b.z;
      const ox = b.hw + radius - Math.abs(dx);
      const oz = b.hd + radius - Math.abs(dz);
      if (ox > 0 && oz > 0) {
        if (ox < oz) pos.x += Math.sign(dx || 1) * ox;
        else pos.z += Math.sign(dz || 1) * oz;
      }
    }
    const bound = WORLD_HALF - 1;
    pos.x = Math.max(-bound, Math.min(bound, pos.x));
    pos.z = Math.max(-bound, Math.min(bound, pos.z));
  }

  function spawnMuzzleFlash() {
    if (!currentWeaponMesh || WEAPONS[currentWeaponIdx].id === "knife") return;
    const muzzleWorld = new THREE.Vector3();
    currentWeaponMesh.localToWorld(muzzleWorld.copy(currentWeaponMesh.userData.muzzleOffset));
    const flashLight = new THREE.PointLight(0xffaa55, 4.5, 6);
    flashLight.position.copy(muzzleWorld);
    scene.add(flashLight);
    const flashMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    flashMesh.position.copy(muzzleWorld);
    scene.add(flashMesh);
    activeFx.push({ type: "muzzle", light: flashLight, mesh: flashMesh, life: 0.12, maxLife: 0.12 });
  }

  function spawnBloodSpray(pos: THREE.Vector3) {
    for (let i = 0; i < 16; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.07, 5, 5),
        new THREE.MeshBasicMaterial({ color: [0x8b1a1a, 0xc4342b, 0x5a0f0f][i % 3], transparent: true, opacity: 0.9 }),
      );
      p.position.copy(pos);
      p.position.y += 0.9 + Math.random() * 0.5;
      const vel = new THREE.Vector3((Math.random() - 0.5) * 2.2, 1.6 + Math.random() * 3.2, (Math.random() - 0.5) * 2.2);
      scene.add(p);
      activeFx.push({ type: "blood", mesh: p, vel, life: 0.8, maxLife: 1.1, gravity: 14 });
    }
  }

  function updateFx(dt: number) {
    for (let i = activeFx.length - 1; i >= 0; i--) {
      const fx = activeFx[i];
      fx.life -= dt;
      if (fx.life <= 0) {
        if (fx.light) scene.remove(fx.light);
        if (fx.mesh) scene.remove(fx.mesh);
        activeFx.splice(i, 1);
        continue;
      }
      const t = fx.life / fx.maxLife;
      if (fx.type === "muzzle") {
        if (fx.light) fx.light.intensity = 4.5 * t;
        if (fx.mesh && fx.mesh instanceof THREE.Mesh) {
          (fx.mesh.material as THREE.MeshBasicMaterial).opacity = 0.95 * t;
          fx.mesh.lookAt(camera.position);
        }
      } else if (fx.type === "blood" && fx.mesh && fx.vel) {
        fx.vel.y -= (fx.gravity ?? 14) * dt;
        fx.mesh.position.addScaledVector(fx.vel, dt);
        if (fx.mesh instanceof THREE.Mesh) (fx.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, t * 1.4);
        if (fx.mesh.position.y < 0.05) {
          fx.mesh.position.y = 0.05;
          fx.vel.y *= -0.2;
        }
      }
    }
  }

  function findEliminatableTarget() {
    const w = WEAPONS[currentWeaponIdx];
    let best: Target | null = null;
    let bestD: number = w.range;
    for (const t of targets) {
      if (!t.alive) continue;
      const d = P.pos.distanceTo(t.pos);
      if (d <= bestD) {
        bestD = d;
        best = t;
      }
    }
    return best;
  }

  function trySpawnHunter(delay: number) {
    window.setTimeout(() => {
      if (state.phase !== "playing") return;
      const slot = hunterPool.find((h) => !h.active);
      if (!slot) return;
      const edgeAngle = Math.random() * Math.PI * 2;
      const r = WORLD_HALF * 0.85;
      const px = getPlayerPos();
      slot.pos.set(px.x + Math.cos(edgeAngle) * r, 0, px.z + Math.sin(edgeAngle) * r);
      slot.active = true;
      slot.inVehicle = false;
      slot.mode = "search";
      slot.lastKnownPos.copy(slot.pos);
      slot.foot.visible = true;
      slot.car.visible = false;
      state.heat = "hunted";
      hud.heat = "HUNTED";
      hud.objective = "Hunters on you. Break line of sight.";
    }, delay);
  }

  function tryEliminate() {
    if (state.phase !== "playing" || playerMode.value === "vehicle") return;
    const t = findEliminatableTarget();
    if (!t) return;
    const w = WEAPONS[currentWeaponIdx];
    const wasAlerted = t.alertState === "alerted";
    t.alive = false;
    t.dying = true;
    t.ring.visible = false;
    t.cone.visible = false;
    spawnMuzzleFlash();
    spawnBloodSpray(t.pos);
    const payout = Math.round((t.def.agreed ?? t.def.offered) * (w.cashMin + Math.random() * (w.cashMax - w.cashMin)));
    let heat = Math.round(t.def.bountyHeat * (w.bountyMin + Math.random() * (w.bountyMax - w.bountyMin)));
    if (wasAlerted) heat += 150;
    state.cash += payout;
    state.bounty += heat;
    state.lastKillTime = performance.now();
    state.kills.push(t.def.id);
    shakeState.mag = Math.max(shakeState.mag, w.silent && !wasAlerted ? 0.3 : 0.6);
    const remaining = targets.filter((x) => x.alive).length;
    hud.objective = remaining > 0 ? `${remaining} contract${remaining > 1 ? "s" : ""} left.` : "All contracts closed. Extract at camp.";
    hud.cash = state.cash;
    hud.bounty = state.bounty;
    let delay = w.hunterDelay;
    if (!w.silent || wasAlerted) {
      state.heat = "hunted";
      hud.heat = "HUNTED";
      delay *= 0.7;
    } else if (state.heat !== "hunted") {
      state.heat = "alert";
      hud.heat = "ALERT";
    }
    trySpawnHunter(Math.max(900, delay));
  }

  function tryEnterVehicle() {
    if (state.phase !== "playing" || playerMode.value !== "onfoot") return;
    const v = nearestFreeVehicle(P.pos, 2.4);
    if (!v) return;
    v.occupied = true;
    activeVehicle = v;
    playerMode.value = "vehicle";
    player.visible = false;
  }
  function exitVehicle() {
    if (playerMode.value !== "vehicle" || !activeVehicle) return;
    const v = activeVehicle;
    v.occupied = false;
    P.pos.set(v.pos.x + Math.sin(v.heading + Math.PI / 2) * 1.6, 0, v.pos.z + Math.cos(v.heading + Math.PI / 2) * 1.6);
    P.heading = v.heading;
    resolveCollision(P.pos, 0.45);
    player.position.set(P.pos.x, 0, P.pos.z);
    player.rotation.y = P.heading;
    player.visible = true;
    playerMode.value = "onfoot";
    activeVehicle = null;
  }

  function finish(kind: "caught" | "success") {
    if (state.phase !== "playing") return;
    state.phase = kind;
    const result: NightResult = {
      cashEarned: state.cash,
      bountyHeat: Math.round(state.bounty),
      kills: state.kills,
      extracted: kind === "success",
      caught: kind === "caught",
    };
    if (kind === "caught") options.onCaught(result);
    else options.onExtract(result);
  }

  function doContext() {
    if (playerMode.value === "vehicle") exitVehicle();
    else if (findEliminatableTarget()) tryEliminate();
    else tryEnterVehicle();
  }

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let joyPointer: number | null = null;
  function bindHud(el: HTMLElement) {
    const joy = el.querySelector("#joyBase") as HTMLElement | null;
    const knob = el.querySelector("#joyKnob") as HTMLElement | null;
    const action = el.querySelector("#actionBtn") as HTMLElement | null;
    if (joy && knob) {
      const start = (e: PointerEvent) => {
        joyPointer = e.pointerId;
        joy.setPointerCapture(e.pointerId);
        move(e);
      };
      const move = (e: PointerEvent) => {
        if (joyPointer !== e.pointerId) return;
        const rect = joy.getBoundingClientRect();
        const cx = rect.left + rect.width / 2,
          cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx,
          dy = e.clientY - cy;
        const dist = Math.min(Math.hypot(dx, dy), 40);
        const ang = Math.atan2(dy, dx);
        dx = Math.cos(ang) * dist;
        dy = Math.sin(ang) * dist;
        knob.style.left = 34 + dx + "px";
        knob.style.top = 34 + dy + "px";
        joyVec.x = dx / 40;
        joyVec.y = dy / 40;
      };
      const end = () => {
        joyPointer = null;
        joyVec.x = 0;
        joyVec.y = 0;
        knob.style.left = "34px";
        knob.style.top = "34px";
      };
      joy.addEventListener("pointerdown", start);
      joy.addEventListener("pointermove", move);
      joy.addEventListener("pointerup", end);
      joy.addEventListener("pointercancel", end);
    }
    if (action) action.addEventListener("click", doContext);
    el.querySelectorAll("[data-weapon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentWeaponIdx = Number((btn as HTMLElement).dataset.weapon);
        attachWeapon(currentWeaponIdx);
        refreshWeaponBar();
      });
    });
  }

  const timer = new THREE.Timer();
  let frameCounter = 0;
  let raf = 0;
  let destroyed = false;

  function animate() {
    if (destroyed) return;
    raf = requestAnimationFrame(animate);
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    frameCounter++;
    const perceptionTick = frameCounter % 6 === 0;
    const playerPos = getPlayerPos();

    const rp = rain.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < RAIN_COUNT; i++) {
      rp[i * 3 + 1] -= dt * 22;
      if (rp[i * 3 + 1] < 0) {
        rp[i * 3 + 1] = 30;
        rp[i * 3] = playerPos.x + (Math.random() - 0.5) * 70;
        rp[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 70;
      }
    }
    rain.geometry.attributes.position.needsUpdate = true;

    pedestrians.forEach((p) => {
      if (p.wait > 0) {
        p.wait -= dt;
        animateWalk(p.group, dt, false, 1);
      } else {
        const dir = new THREE.Vector3().subVectors(p.target, p.pos);
        const d = dir.length();
        if (d < 0.3) {
          p.wait = 1.5 + Math.random() * 3;
          p.target.set(p.pos.x + (rand() - 0.5) * 18, 0, p.pos.z + (rand() - 0.5) * 18);
        } else {
          dir.normalize();
          p.pos.addScaledVector(dir, p.speed * dt);
          resolveCollision(p.pos, 0.35);
          p.heading = Math.atan2(dir.x, dir.z);
          animateWalk(p.group, dt, true, 0.85);
        }
      }
      p.group.position.set(p.pos.x, 0, p.pos.z);
      p.group.rotation.y = p.heading;
    });

    if (state.phase === "playing") {
      const mv = updateMovementVector();
      const isMoving = Math.hypot(mv.x, mv.y) > 0.08;
      if (playerMode.value === "onfoot") {
        if (isMoving) {
          P.pos.x += mv.x * P.speed * dt;
          P.pos.z += mv.y * P.speed * dt;
          const targetHeading = Math.atan2(mv.x, mv.y);
          let diff = targetHeading - P.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          P.heading += diff * Math.min(1, dt * 10);
        }
        resolveCollision(P.pos, 0.45);
        player.position.set(P.pos.x, 0, P.pos.z);
        player.rotation.y = P.heading;
        animateWalk(player, dt, isMoving, 1.2);
        hud.speed = "";
      } else if (activeVehicle) {
        const v = activeVehicle;
        const throttle = -mv.y;
        const steer = mv.x;
        v.speedVal += throttle * CAR_ACCEL * dt;
        if (Math.abs(throttle) < 0.05) {
          const fr = Math.sign(v.speedVal) * CAR_FRICTION * dt;
          if (Math.abs(fr) > Math.abs(v.speedVal)) v.speedVal = 0;
          else v.speedVal -= fr;
        }
        v.speedVal = Math.max(-CAR_MAX_SPEED * 0.5, Math.min(CAR_MAX_SPEED, v.speedVal));
        const speedFrac = v.speedVal / CAR_MAX_SPEED;
        const reverse = v.speedVal >= 0 ? 1 : -1;
        v.heading += steer * CAR_TURN_RATE * dt * (0.35 + Math.abs(speedFrac) * 0.65) * reverse;
        v.pos.x += Math.sin(v.heading) * v.speedVal * dt;
        v.pos.z += Math.cos(v.heading) * v.speedVal * dt;
        resolveCollision(v.pos, 1.1);
        v.group.position.set(v.pos.x, 0, v.pos.z);
        v.group.rotation.y = v.heading;
        hud.speed = `${Math.round(Math.abs(v.speedVal) * 6)} MPH`;
      }

      if (perceptionTick) {
        targets.forEach((t) => {
          if (!t.alive) return;
          let detected = false;
          if (playerMode.value === "vehicle") detected = t.pos.distanceTo(playerPos) < 14;
          else {
            const toPlayer = new THREE.Vector3().subVectors(P.pos, t.pos);
            const dist = toPlayer.length();
            if (dist < TARGET_VISION_RANGE) {
              const angleToPlayer = Math.atan2(toPlayer.x, toPlayer.z);
              let diff = angleToPlayer - t.group.rotation.y;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              if (Math.abs(diff) < TARGET_VISION_HALF_ANGLE && hasLOS(t.pos, P.pos)) detected = true;
            }
          }
          if (detected) {
            t.alertState = "alerted";
            t.calmTimer = 0;
          } else {
            t.calmTimer += 0.1;
            if (t.calmTimer > 6 && t.alertState === "alerted") t.alertState = "unaware";
          }
        });
      }

      targets.forEach((t) => {
        if (t.alive) {
          if (t.alertState === "alerted") {
            const away = new THREE.Vector3().subVectors(t.pos, P.pos);
            if (away.lengthSq() < 0.0001) away.set(1, 0, 0);
            away.normalize();
            t.pos.addScaledVector(away, t.speed * 1.7 * dt);
            resolveCollision(t.pos, 0.45);
            t.group.rotation.y = Math.atan2(away.x, away.z);
            animateWalk(t.group, dt, true, 1.3);
          } else {
            const wp = t.path[t.pathIdx];
            const dir = new THREE.Vector3().subVectors(wp, t.pos);
            const d = dir.length();
            if (d < 0.15) t.pathIdx = (t.pathIdx + 1) % t.path.length;
            else {
              dir.normalize();
              t.pos.addScaledVector(dir, t.speed * dt);
              t.group.rotation.y = Math.atan2(dir.x, dir.z);
              animateWalk(t.group, dt, true, 0.9);
            }
          }
          t.group.position.set(t.pos.x, 0, t.pos.z);
          t.ring.position.set(t.pos.x, 0.02, t.pos.z);
          t.cone.position.set(t.pos.x, 0.03, t.pos.z);
          t.cone.rotation.y = t.group.rotation.y;
          (t.cone.material as THREE.MeshBasicMaterial).color.setHex(t.alertState === "alerted" ? 0xff4d3d : 0x3ad1ff);
        } else if (t.dying) {
          t.group.rotation.z += dt * 5.5;
          t.group.position.y -= dt * 0.45;
          t.group.scale.multiplyScalar(1 - dt * 1.1);
          if (t.group.scale.x < 0.04) {
            t.group.visible = false;
            t.dying = false;
          }
        }
      });

      if (perceptionTick) {
        hunterPool.forEach((h) => {
          if (!h.active) return;
          const detectRange = h.inVehicle || playerMode.value === "vehicle" ? 40 : 24;
          if (h.pos.distanceTo(playerPos) < detectRange && hasLOS(h.pos, playerPos)) {
            h.mode = "chase";
            h.lastKnownPos.copy(playerPos);
          } else h.mode = "search";
        });
      }

      hunterPool.forEach((h) => {
        if (!h.active) return;
        const wantVehicle = playerMode.value === "vehicle";
        if (wantVehicle !== h.inVehicle) {
          h.inVehicle = wantVehicle;
          h.foot.visible = !wantVehicle;
          h.car.visible = wantVehicle;
        }
        const baseSpeed = h.inVehicle ? 15.5 : 4.35;
        let dest = h.mode === "chase" ? playerPos : h.lastKnownPos;
        if (h.mode === "search" && h.pos.distanceTo(h.lastKnownPos) < 2) {
          if (!h.searchTarget || h.pos.distanceTo(h.searchTarget) < 1.5) {
            const ang = Math.random() * Math.PI * 2,
              r = 4 + Math.random() * 8;
            h.searchTarget = new THREE.Vector3(h.lastKnownPos.x + Math.cos(ang) * r, 0, h.lastKnownPos.z + Math.sin(ang) * r);
          }
          dest = h.searchTarget;
        }
        const dir = new THREE.Vector3().subVectors(dest, h.pos);
        if (dir.length() > 0.05) {
          dir.normalize();
          h.pos.addScaledVector(dir, (h.mode === "chase" ? baseSpeed : baseSpeed * 0.82) * dt);
          h.heading = Math.atan2(dir.x, dir.z);
        }
        resolveCollision(h.pos, h.inVehicle ? 1.1 : 0.45);
        if (h.inVehicle) {
          h.car.position.set(h.pos.x, 0, h.pos.z);
          h.car.rotation.y = h.heading;
        } else {
          h.foot.position.set(h.pos.x, 0, h.pos.z);
          h.foot.rotation.y = h.heading;
          animateWalk(h.foot, dt, true, 1.4);
        }
        const distToPlayer = h.pos.distanceTo(playerPos);
        const catchDist = h.inVehicle ? CATCH_RANGE_VEHICLE + (playerMode.value === "vehicle" ? 1.2 : 0) : CATCH_RANGE_FOOT;
        if (distToPlayer <= catchDist) finish("caught");
      });

      if (state.bounty > 0 && performance.now() - state.lastKillTime > BOUNTY_DECAY_GRACE) {
        state.bounty = Math.max(0, state.bounty - BOUNTY_DECAY_RATE * dt);
        hud.decay = "DECAYING — LYING LOW";
      } else hud.decay = "";
      hud.bounty = Math.round(state.bounty);

      if (allTargetsDown() && getPlayerPos().distanceTo(SAFEHOUSE_POS) <= SAFEHOUSE_RANGE) finish("success");

      if (playerMode.value === "vehicle") hud.action = "DISMOUNT";
      else if (findEliminatableTarget()) hud.action = "ELIMINATE";
      else if (nearestFreeVehicle(P.pos, 2.4)) hud.action = "MOUNT BIKE";
      else hud.action = "";

      hud.contracts = targets.map((t) => ({
        name: t.def.alias,
        status: !t.alive ? "DOWN" : t.alertState === "alerted" ? "ALERTED" : "OPEN",
      }));
    }

    const inCar = playerMode.value === "vehicle";
    const camOffset = inCar ? new THREE.Vector3(0, 16, 12) : new THREE.Vector3(0, 13, 9);
    const desiredCamPos = new THREE.Vector3(playerPos.x, 0, playerPos.z).add(camOffset);
    camera.position.lerp(desiredCamPos, 1 - Math.pow(inCar ? 0.006 : 0.001, dt));
    camera.lookAt(playerPos.x, 0.8, playerPos.z);
    rim.position.set(playerPos.x, 8, playerPos.z);
    if (shakeState.mag > 0.002) {
      camera.position.x += (Math.random() - 0.5) * shakeState.mag;
      camera.position.z += (Math.random() - 0.5) * shakeState.mag;
      shakeState.mag *= 0.88;
    } else shakeState.mag = 0;

    updateFx(dt);
    renderer.render(scene, camera);
    paintHud();
  }

  function paintHud() {
    if (!hudHost) return;
    const b = hudHost.querySelector("#bountyValue");
    const c = hudHost.querySelector("#cashValue");
    const h = hudHost.querySelector("#heatText");
    const o = hudHost.querySelector("#objectiveText");
    const d = hudHost.querySelector("#decayNote");
    const s = hudHost.querySelector("#speedoText");
    const a = hudHost.querySelector("#actionBtn") as HTMLElement | null;
    const rows = hudHost.querySelector("#contractRows");
    const nameEl = hudHost.querySelector("#callsignChip");
    if (b) b.textContent = "$" + Math.round(hud.bounty).toLocaleString();
    if (c) c.textContent = "$" + hud.cash.toLocaleString();
    if (h) {
      h.textContent = hud.heat;
      h.className = hud.heat === "CLEAR" ? "heat-clear" : hud.heat === "ALERT" ? "heat-alert" : "heat-hunted";
    }
    if (o) o.textContent = hud.objective;
    if (d) d.textContent = hud.decay;
    if (s) s.textContent = hud.speed;
    if (nameEl) nameEl.textContent = options.callsign;
    if (a) {
      if (hud.action) {
        a.textContent = hud.action;
        a.classList.add("show");
        a.classList.toggle("mode-enter", hud.action === "MOUNT BIKE");
        a.classList.toggle("mode-exit", hud.action === "DISMOUNT");
      } else a.classList.remove("show");
    }
    if (rows) {
      rows.innerHTML = hud.contracts
        .map((r) => {
          const done = r.status === "DOWN";
          const alerted = r.status === "ALERTED";
          return `<div class="cp-row${done ? " done" : ""}${alerted ? " alerted" : ""}"><span class="cp-name">${r.name}</span><span class="cp-status">${r.status}</span></div>`;
        })
        .join("");
    }
    hudHost.querySelectorAll("[data-weapon]").forEach((btn, i) => {
      btn.classList.toggle("active", i === hud.weapon);
    });
  }

  camera.position.set(0, 13, 33);
  camera.lookAt(0, 0, 24);
  animate();

  window.__controlsTest = {
    getYaw: () => (playerMode.value === "vehicle" && activeVehicle ? activeVehicle.heading : P.heading),
    getSpeed: () => {
      if (playerMode.value === "vehicle" && activeVehicle) return Math.abs(activeVehicle.speedVal);
      const mv = updateMovementVector();
      return Math.hypot(mv.x, mv.y) * P.speed;
    },
    setKeys: (codes: string[]) => {
      injected.clear();
      codes.forEach((c) => injected.add(c));
    },
  };

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      delete window.__controlsTest;
    },
    setHudHost(el) {
      hudHost = el;
      if (el) bindHud(el);
    },
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
    };
  }
}
