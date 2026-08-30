import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-z4IcqJxQ.mjs";
import { A as Vector3, C as RingGeometry, D as SpriteMaterial, E as Sprite, O as Timer, S as PointsMaterial, T as SphereGeometry, _ as MeshStandardMaterial, a as BufferGeometry, b as PointLight, c as CylinderGeometry, d as FogExp2, f as Group, g as MeshBasicMaterial, h as Mesh, i as BufferAttribute, k as TorusGeometry, l as DirectionalLight, m as MathUtils, n as AmbientLight, o as CanvasTexture, p as HemisphereLight, r as BoxGeometry, s as Color, t as WebGLRenderer, u as Float32BufferAttribute, v as PerspectiveCamera, w as Scene, x as Points, y as PlaneGeometry } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BCV-DCmZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROSTER = [
	{
		name: "Mara Kline",
		alias: "THE ACCOUNTANT",
		brief: "Cooks books for the scrap barons. Walks the east lots after dusk.",
		district: "East Lots",
		difficulty: "low",
		base: 420,
		heat: 220,
		x: 0,
		z: 22,
		r: 9
	},
	{
		name: "Joss Hale",
		alias: "THE COURIER",
		brief: "Runs sealed crates between camps. Never looks back.",
		district: "River Cut",
		difficulty: "mid",
		base: 560,
		heat: 340,
		x: 47,
		z: -12,
		r: 10
	},
	{
		name: "Ivy Renn",
		alias: "THE FIXER",
		brief: "Sells names. Yours is already on a list.",
		district: "North Stacks",
		difficulty: "mid",
		base: 610,
		heat: 380,
		x: -40,
		z: 47,
		r: 10
	},
	{
		name: "Cal Voss",
		alias: "FUEL THIEF",
		brief: "Siphons the last diesel from wrecks on the ring road.",
		district: "Ring Road",
		difficulty: "low",
		base: 390,
		heat: 200,
		x: -48,
		z: -18,
		r: 9
	},
	{
		name: "Nera Quinn",
		alias: "RADIO GHOST",
		brief: "Jams camp frequencies. People go missing when she talks.",
		district: "Relay Hill",
		difficulty: "high",
		base: 780,
		heat: 520,
		x: 38,
		z: 42,
		r: 11
	},
	{
		name: "Boomer Tate",
		alias: "SCRAP BARON",
		brief: "Owns the wrecker crews. Loud, proud, well-armed friends.",
		district: "Yard 9",
		difficulty: "high",
		base: 840,
		heat: 560,
		x: -22,
		z: -48,
		r: 11
	},
	{
		name: "Lena Orth",
		alias: "TOLL KEEPER",
		brief: "Shakes down riders at the south choke. Takes more than coin.",
		district: "South Choke",
		difficulty: "mid",
		base: 540,
		heat: 310,
		x: 18,
		z: -38,
		r: 9
	},
	{
		name: "Rook Senn",
		alias: "NIGHT HOWLER",
		brief: "Leads a pack through the alleys. Don't let him see you first.",
		district: "Alley Grid",
		difficulty: "high",
		base: 720,
		heat: 480,
		x: -8,
		z: 8,
		r: 10
	},
	{
		name: "Pax Dreel",
		alias: "CAMP RAT",
		brief: "Steals from the kitchen stores. The camp wants him quiet.",
		district: "Market Row",
		difficulty: "low",
		base: 360,
		heat: 180,
		x: 28,
		z: 18,
		r: 8
	},
	{
		name: "Sable Orr",
		alias: "THE WIDOW",
		brief: "Collects debts the old way. Always two steps ahead.",
		district: "Old Chapel",
		difficulty: "mid",
		base: 640,
		heat: 400,
		x: -32,
		z: 22,
		r: 10
	}
];
function mulberry32(seed) {
	return function() {
		let t = seed += 1831565813;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hashDate(dateKey) {
	let h = 2166136261;
	for (let i = 0; i < dateKey.length; i++) {
		h ^= dateKey.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function todayKey(dayOffset) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + dayOffset);
	return d.toISOString().slice(0, 10);
}
function payoutMultiplier(bountiesClaimed) {
	return 1 + Math.min(2.4, bountiesClaimed * .14);
}
function generateDailyContracts(dateKey, bountiesClaimed) {
	const rng = mulberry32(hashDate(dateKey) ^ 2654435769);
	const pool = [...ROSTER];
	const picked = [];
	while (picked.length < 3 && pool.length) {
		const i = Math.floor(rng() * pool.length);
		picked.push(pool.splice(i, 1)[0]);
	}
	const mult = payoutMultiplier(bountiesClaimed);
	const repBonus = Math.min(12, bountiesClaimed);
	return picked.map((p, idx) => {
		const offered = Math.round(p.base * mult);
		const maxAsk = Math.round(offered * (1.1 + .035 * repBonus));
		const minAccept = Math.round(offered * .78);
		return {
			id: `${dateKey}-${idx}-${p.alias.replace(/\s+/g, "-")}`,
			name: p.name,
			alias: p.alias,
			brief: p.brief,
			district: p.district,
			difficulty: p.difficulty,
			basePayout: p.base,
			offered,
			agreed: null,
			maxAsk,
			minAccept,
			bountyHeat: Math.round(p.heat * (.9 + .08 * repBonus)),
			center: {
				x: p.x,
				z: p.z
			},
			radius: p.r,
			status: "open",
			haggleAttempts: 0
		};
	});
}
function tryHaggle(c, ask) {
	const clamped = Math.round(Math.max(c.minAccept, ask));
	if (clamped <= c.maxAsk) return {
		ok: true,
		price: clamped,
		message: "They spit in their palm. Deal."
	};
	if (clamped > c.maxAsk * 1.28 || c.haggleAttempts >= 2) return {
		ok: false,
		price: c.offered,
		message: "They walk. Take the posted rate or leave it."
	};
	const counter = Math.round(c.maxAsk * .94);
	return {
		ok: true,
		price: counter,
		message: `They laugh it off. Counter: $${counter.toLocaleString()}.`
	};
}
var KEY = "ledger.save.v1";
var SAVE_VERSION = 1;
var defaults = () => {
	const dateKey = todayKey(0);
	return {
		version: SAVE_VERSION,
		callsign: "",
		cash: 0,
		reputation: 0,
		bountiesClaimed: 0,
		dayOffset: 0,
		lastDateKey: dateKey,
		daily: {
			dateKey,
			contracts: generateDailyContracts(dateKey, 0),
			allClearBonusPaid: false
		}
	};
};
function migrate(raw) {
	const base = defaults();
	return {
		...base,
		...raw,
		version: SAVE_VERSION,
		daily: {
			...base.daily,
			...raw.daily ?? {}
		}
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return defaults();
		const save = migrate(JSON.parse(raw));
		const now = todayKey(save.dayOffset);
		if (save.daily.dateKey !== now) {
			save.daily = {
				dateKey: now,
				contracts: generateDailyContracts(now, save.bountiesClaimed),
				allClearBonusPaid: false
			};
			save.lastDateKey = now;
		}
		return save;
	} catch {
		return defaults();
	}
}
function persistSave(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}
function dailyBonus(claimed) {
	return Math.round(420 * (1 + .18 * claimed));
}
var WEAPONS = [
	{
		id: "knife",
		label: "KNIFE",
		tag: "SILENT MELEE",
		silent: true,
		range: 2,
		cashMin: .7,
		cashMax: .9,
		bountyMin: .6,
		bountyMax: .85,
		hunterDelay: 5200
	},
	{
		id: "pistol",
		label: "PISTOL",
		tag: "SILENT",
		silent: true,
		range: 6.5,
		cashMin: .85,
		cashMax: 1.05,
		bountyMin: .85,
		bountyMax: 1.1,
		hunterDelay: 4e3
	},
	{
		id: "smg",
		label: "SMG",
		tag: "LOUD",
		silent: false,
		range: 9.5,
		cashMin: .95,
		cashMax: 1.15,
		bountyMin: 1.15,
		bountyMax: 1.4,
		hunterDelay: 1400
	},
	{
		id: "sniper",
		label: "SNIPER",
		tag: "LOUD, LONG",
		silent: false,
		range: 17,
		cashMin: 1.1,
		cashMax: 1.35,
		bountyMin: 1.25,
		bountyMax: 1.55,
		hunterDelay: 2200
	}
];
function mountGame(container, options) {
	const scene = new Scene();
	scene.background = new Color(460812);
	scene.fog = new FogExp2(526864, .0115);
	const camera = new PerspectiveCamera(52, 1, .1, 600);
	const renderer = new WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = 1;
	container.appendChild(renderer.domElement);
	const ambient = new AmbientLight(1711662, .95);
	scene.add(ambient);
	const moon = new DirectionalLight(11057407, 1.05);
	moon.position.set(-40, 60, -30);
	moon.castShadow = true;
	moon.shadow.mapSize.set(2048, 2048);
	moon.shadow.camera.left = -70;
	moon.shadow.camera.right = 70;
	moon.shadow.camera.top = 70;
	moon.shadow.camera.bottom = -70;
	moon.shadow.camera.far = 220;
	moon.shadow.bias = -3e-4;
	scene.add(moon);
	const rim = new PointLight(16733504, 1.35, 70);
	scene.add(rim);
	scene.add(new DirectionalLight(3162208, .35).translateX(30));
	scene.add(new HemisphereLight(2764880, 658190, .4));
	const WORLD_HALF = 100;
	const GROUND_SIZE = 200;
	const ground = new Mesh(new PlaneGeometry(GROUND_SIZE, GROUND_SIZE), new MeshStandardMaterial({
		color: 1184794,
		roughness: .92,
		metalness: .08
	}));
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);
	const ROAD_SPACING = 30;
	const ROAD_WIDTH = 7;
	const roadCoords = [];
	for (let c = -70; c < WORLD_HALF; c += ROAD_SPACING) roadCoords.push(c);
	const roadMat = new MeshStandardMaterial({
		color: 1710880,
		roughness: .78,
		metalness: .12
	});
	new MeshBasicMaterial({
		color: 14729290,
		transparent: true,
		opacity: .55
	});
	roadCoords.forEach((c) => {
		const vRoad = new Mesh(new PlaneGeometry(ROAD_WIDTH, GROUND_SIZE), roadMat);
		vRoad.rotation.x = -Math.PI / 2;
		vRoad.position.set(c, .015, 0);
		scene.add(vRoad);
		const hRoad = new Mesh(new PlaneGeometry(GROUND_SIZE, ROAD_WIDTH), roadMat);
		hRoad.rotation.x = -Math.PI / 2;
		hRoad.position.set(0, .015, c);
		scene.add(hRoad);
	});
	const buildings = [];
	function addBuilding(x, z, w, d, h, color, accent) {
		const mesh = new Mesh(new BoxGeometry(w, h, d), new MeshStandardMaterial({
			color,
			roughness: .72,
			metalness: .28
		}));
		mesh.position.set(x, h / 2, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
		if (accent) {
			const strip = new Mesh(new BoxGeometry(w * 1.01, .18, .06), new MeshStandardMaterial({
				color: accent,
				emissive: accent,
				emissiveIntensity: .55,
				roughness: .3,
				metalness: .5
			}));
			strip.position.set(x, h * .62, z + d / 2 + .04);
			scene.add(strip);
			const glow = new PointLight(accent, .65, 8);
			glow.position.set(x, h * .62, z + d / 2 + .5);
			scene.add(glow);
		}
		buildings.push({
			x,
			z,
			hw: w / 2 + .6,
			hd: d / 2 + .6
		});
	}
	let seed = 1337;
	function rand() {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	}
	const ACCENTS = [
		16731453,
		3854847,
		8231530,
		12892314
	];
	const RESERVED = [
		{
			x: 0,
			z: 24,
			r: 15
		},
		{
			x: 0,
			z: -72,
			r: 18
		},
		{
			x: 47,
			z: -12,
			r: 16
		},
		{
			x: -40,
			z: 47,
			r: 16
		}
	];
	function inReserved(x, z) {
		return RESERVED.some((rz) => Math.hypot(x - rz.x, z - rz.z) < rz.r);
	}
	for (let x = -85; x < WORLD_HALF; x += ROAD_SPACING) for (let z = -85; z < WORLD_HALF; z += ROAD_SPACING) {
		if (inReserved(x, z) || rand() < .12) continue;
		const w = 12 + rand() * 7;
		const d = 12 + rand() * 7;
		const h = 6 + rand() * 16;
		const grey = 21 + Math.floor(rand() * 10);
		const color = grey << 16 | grey + 2 << 8 | grey + 5;
		addBuilding(x + (rand() - .5) * 4, z + (rand() - .5) * 4, w, d, h, color, rand() < .55 ? ACCENTS[Math.floor(rand() * ACCENTS.length)] : null);
	}
	function hasLOS(a, b) {
		const dx = b.x - a.x, dz = b.z - a.z;
		const steps = Math.max(2, Math.floor(Math.hypot(dx, dz) / 1.2));
		for (let i = 1; i < steps; i++) {
			const t = i / steps;
			const px = a.x + dx * t, pz = a.z + dz * t;
			for (const bld of buildings) if (Math.abs(px - bld.x) < bld.hw - .6 && Math.abs(pz - bld.z) < bld.hd - .6) return false;
		}
		return true;
	}
	const RAIN_COUNT = 900;
	const rainPos = new Float32Array(RAIN_COUNT * 3);
	for (let i = 0; i < RAIN_COUNT; i++) {
		rainPos[i * 3] = (Math.random() - .5) * 70;
		rainPos[i * 3 + 1] = Math.random() * 30;
		rainPos[i * 3 + 2] = (Math.random() - .5) * 70;
	}
	const rainGeo = new BufferGeometry();
	rainGeo.setAttribute("position", new BufferAttribute(rainPos, 3));
	const rain = new Points(rainGeo, new PointsMaterial({
		color: 9413577,
		size: .12,
		transparent: true,
		opacity: .5
	}));
	scene.add(rain);
	function makeHumanoid(opts) {
		const skin = opts.skin ?? 14198393;
		const clothes = opts.clothes ?? 2237739;
		const clothes2 = opts.clothes2 ?? 1711137;
		const hair = opts.hair ?? 1840914;
		const height = opts.height ?? 1.75;
		const castShadow = opts.castShadow !== false;
		const HIP_Y = height * .47;
		const TORSO_H = height * .34;
		const HEAD_R = height * .095;
		const LEG_LEN = HIP_Y;
		const ARM_LEN = TORSO_H * .95;
		const g = new Group();
		const legMat = new MeshStandardMaterial({
			color: clothes2,
			roughness: .75
		});
		function makeLeg(sign) {
			const pivot = new Group();
			pivot.position.set(sign * .11, HIP_Y, 0);
			const mesh = new Mesh(new CylinderGeometry(.1, .085, LEG_LEN, 8), legMat);
			mesh.position.y = -LEG_LEN / 2;
			mesh.castShadow = castShadow;
			pivot.add(mesh);
			g.add(pivot);
			return pivot;
		}
		const legL = makeLeg(-1);
		const legR = makeLeg(1);
		const torso = new Mesh(new BoxGeometry(.52, TORSO_H, .3), new MeshStandardMaterial({
			color: clothes,
			roughness: .7,
			metalness: .1
		}));
		torso.position.y = HIP_Y + TORSO_H / 2;
		torso.castShadow = castShadow;
		g.add(torso);
		function makeArm(sign) {
			const pivot = new Group();
			pivot.position.set(sign * .34, HIP_Y + TORSO_H * .92, 0);
			const mesh = new Mesh(new CylinderGeometry(.075, .065, ARM_LEN, 8), new MeshStandardMaterial({
				color: clothes,
				roughness: .72
			}));
			mesh.position.y = -ARM_LEN / 2;
			mesh.castShadow = castShadow;
			pivot.add(mesh);
			const hand = new Mesh(new SphereGeometry(.07, 8, 8), new MeshStandardMaterial({
				color: skin,
				roughness: .6
			}));
			hand.position.y = -ARM_LEN;
			pivot.add(hand);
			g.add(pivot);
			return pivot;
		}
		const armL = makeArm(-1);
		const armR = makeArm(1);
		const headGroup = new Group();
		headGroup.position.y = HIP_Y + TORSO_H + HEAD_R + .02;
		g.add(headGroup);
		const headMesh = new Mesh(new SphereGeometry(HEAD_R, 14, 12), new MeshStandardMaterial({
			color: skin,
			roughness: .55
		}));
		headMesh.castShadow = castShadow;
		headGroup.add(headMesh);
		const hairMesh = new Mesh(new SphereGeometry(HEAD_R * 1.06, 14, 10, 0, Math.PI * 2, 0, Math.PI * .62), new MeshStandardMaterial({
			color: hair,
			roughness: .85
		}));
		hairMesh.position.y = HEAD_R * .08;
		headGroup.add(hairMesh);
		const eyeMat = opts.eyesGlow ? new MeshBasicMaterial({ color: opts.eyesGlow }) : new MeshStandardMaterial({
			color: 1710618,
			roughness: .3
		});
		const eyeGeo = new SphereGeometry(HEAD_R * .13, 8, 8);
		const eyeL = new Mesh(eyeGeo, eyeMat);
		eyeL.position.set(-HEAD_R * .42, HEAD_R * .08, HEAD_R * .88);
		const eyeR = new Mesh(eyeGeo, eyeMat);
		eyeR.position.set(HEAD_R * .42, HEAD_R * .08, HEAD_R * .88);
		headGroup.add(eyeL, eyeR);
		g.userData.legL = legL;
		g.userData.legR = legR;
		g.userData.armL = armL;
		g.userData.armR = armR;
		g.userData.headGroup = headGroup;
		g.userData.walkPhase = Math.random() * Math.PI * 2;
		return g;
	}
	function animateWalk(entity, dt, moving, speedScale) {
		const u = entity.userData;
		if (moving) u.walkPhase += dt * 7.5 * Math.max(.4, speedScale);
		const s = Math.sin(u.walkPhase);
		const amt = moving ? .55 : 0;
		u.legL.rotation.x = MathUtils.lerp(u.legL.rotation.x, s * amt, .4);
		u.legR.rotation.x = MathUtils.lerp(u.legR.rotation.x, -s * amt, .4);
		u.armL.rotation.x = MathUtils.lerp(u.armL.rotation.x, -s * amt * .8, .4);
		u.armR.rotation.x = MathUtils.lerp(u.armR.rotation.x, s * amt * .8, .4);
	}
	function makeBike(color, hunter) {
		const g = new Group();
		const bodyMat = new MeshStandardMaterial({
			color,
			roughness: .4,
			metalness: .65
		});
		const tank = new Mesh(new BoxGeometry(.42, .28, 1.15), bodyMat);
		tank.position.y = .62;
		tank.castShadow = true;
		g.add(tank);
		const seat = new Mesh(new BoxGeometry(.32, .1, .45), new MeshStandardMaterial({
			color: 1709072,
			roughness: .85
		}));
		seat.position.set(0, .72, -.35);
		g.add(seat);
		const fork = new Mesh(new BoxGeometry(.08, .45, .08), new MeshStandardMaterial({
			color: 546,
			metalness: .8,
			roughness: .3
		}));
		fork.position.set(0, .55, .55);
		g.add(fork);
		const wheelGeo = new TorusGeometry(.28, .07, 8, 16);
		const wheelMat = new MeshStandardMaterial({
			color: 273,
			roughness: .9
		});
		const w1 = new Mesh(wheelGeo, wheelMat);
		w1.position.set(0, .28, .62);
		const w2 = w1.clone();
		w2.position.z = -.55;
		g.add(w1, w2);
		const light = new Mesh(new SphereGeometry(.07, 8, 8), new MeshBasicMaterial({ color: hunter ? 16722458 : 16769162 }));
		light.position.set(0, .7, .78);
		g.add(light);
		if (hunter) {
			const beacon = new PointLight(16722458, 1.2, 8);
			beacon.position.set(0, 1.1, 0);
			g.add(beacon);
		}
		return g;
	}
	function makeWeaponMesh(id) {
		const g = new Group();
		const metal = new MeshStandardMaterial({
			color: 2764083,
			roughness: .35,
			metalness: .85
		});
		const dark = new MeshStandardMaterial({
			color: 1118740,
			roughness: .55,
			metalness: .4
		});
		const grip = new MeshStandardMaterial({
			color: 1709072,
			roughness: .8,
			metalness: .15
		});
		const blade = new MeshStandardMaterial({
			color: 12633292,
			roughness: .25,
			metalness: .95
		});
		if (id === "knife") {
			const handle = new Mesh(new BoxGeometry(.04, .14, .05), grip);
			handle.position.y = -.07;
			g.add(handle);
			const bladeMesh = new Mesh(new BoxGeometry(.025, .22, .012), blade);
			bladeMesh.position.y = .13;
			g.add(bladeMesh);
			g.userData.muzzleOffset = new Vector3(0, .28, 0);
		} else if (id === "pistol") {
			g.add(new Mesh(new BoxGeometry(.06, .09, .18), metal));
			const barrel = new Mesh(new CylinderGeometry(.012, .012, .08, 8), dark);
			barrel.rotation.x = Math.PI / 2;
			barrel.position.set(0, .02, .12);
			g.add(barrel);
			const gr = new Mesh(new BoxGeometry(.05, .12, .07), grip);
			gr.position.set(0, -.08, -.02);
			g.add(gr);
			g.userData.muzzleOffset = new Vector3(0, .05, .2);
		} else if (id === "smg") {
			g.add(new Mesh(new BoxGeometry(.07, .1, .28), metal));
			const barrel = new Mesh(new CylinderGeometry(.015, .015, .14, 8), dark);
			barrel.rotation.x = Math.PI / 2;
			barrel.position.set(0, .02, .2);
			g.add(barrel);
			const mag = new Mesh(new BoxGeometry(.04, .14, .06), grip);
			mag.position.set(0, -.1, .02);
			g.add(mag);
			g.userData.muzzleOffset = new Vector3(0, .04, .32);
		} else {
			const body = new Mesh(new BoxGeometry(.06, .08, .36), metal);
			g.add(body);
			const barrel = new Mesh(new CylinderGeometry(.014, .014, .28, 8), dark);
			barrel.rotation.x = Math.PI / 2;
			barrel.position.set(0, .02, .28);
			g.add(barrel);
			const scope = new Mesh(new CylinderGeometry(.025, .025, .12, 10), metal);
			scope.rotation.x = Math.PI / 2;
			scope.position.set(0, .08, .02);
			g.add(scope);
			g.userData.muzzleOffset = new Vector3(0, .04, .48);
		}
		g.scale.setScalar(1.15);
		return g;
	}
	function makeNameSprite(name) {
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 128;
		const ctx = canvas.getContext("2d");
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
		const tex = new CanvasTexture(canvas);
		tex.needsUpdate = true;
		const spr = new Sprite(new SpriteMaterial({
			map: tex,
			transparent: true,
			depthTest: false
		}));
		spr.scale.set(2.6, .65, 1);
		spr.position.y = 2.4;
		spr.renderOrder = 10;
		return spr;
	}
	function buildVisionCone(range, halfAngle, color) {
		const segs = 18;
		const positions = [
			0,
			.03,
			0
		];
		for (let i = 0; i <= segs; i++) {
			const a = -halfAngle + i / segs * halfAngle * 2;
			positions.push(Math.sin(a) * range, .03, Math.cos(a) * range);
		}
		const idx = [];
		for (let i = 1; i <= segs; i++) idx.push(0, i, i + 1);
		const geo = new BufferGeometry();
		geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
		geo.setIndex(idx);
		return new Mesh(geo, new MeshBasicMaterial({
			color,
			transparent: true,
			opacity: .16,
			side: 2,
			depthWrite: false
		}));
	}
	const player = makeHumanoid({
		skin: 13210219,
		clothes: 2237739,
		clothes2: 1381914,
		hair: 920586
	});
	player.position.set(0, 0, 24);
	player.add(makeNameSprite(options.callsign || "RIDER"));
	scene.add(player);
	const playerGlow = new PointLight(16726830, .2, 5);
	playerGlow.position.set(0, 1.2, 0);
	player.add(playerGlow);
	const weaponMeshes = {};
	WEAPONS.forEach((w) => {
		weaponMeshes[w.id] = makeWeaponMesh(w.id);
	});
	let currentWeaponIdx = 0;
	let currentWeaponMesh = null;
	function attachWeapon(idx) {
		const armR = player.userData.armR;
		if (currentWeaponMesh) armR.remove(currentWeaponMesh);
		const id = WEAPONS[idx].id;
		currentWeaponMesh = weaponMeshes[id];
		currentWeaponMesh.position.set(0, -.55, .08);
		currentWeaponMesh.rotation.set(id === "knife" ? .4 : -.15, id === "knife" ? .6 : 0, -.35);
		armR.add(currentWeaponMesh);
	}
	attachWeapon(0);
	const P = {
		pos: new Vector3(0, 0, 24),
		heading: 0,
		speed: 5.2
	};
	const playerMode = { value: "onfoot" };
	let activeVehicle = null;
	function getPlayerPos() {
		return playerMode.value === "vehicle" && activeVehicle ? activeVehicle.pos : P.pos;
	}
	const vehicles = [];
	const bikeSpots = [
		{
			x: 15,
			z: 30,
			h: 0
		},
		{
			x: -15,
			z: 9,
			h: Math.PI / 2
		},
		{
			x: 0,
			z: -3,
			h: 0
		},
		{
			x: 29,
			z: -15,
			h: Math.PI / 2
		},
		{
			x: -29,
			z: -33,
			h: 0
		},
		{
			x: 15,
			z: -51,
			h: Math.PI / 2
		}
	];
	const BIKE_COLORS = [
		2763304,
		4856340,
		1714722,
		3811858
	];
	bikeSpots.forEach((s, i) => {
		const group = makeBike(BIKE_COLORS[i % BIKE_COLORS.length], false);
		group.position.set(s.x, 0, s.z);
		group.rotation.y = s.h;
		scene.add(group);
		vehicles.push({
			group,
			pos: new Vector3(s.x, 0, s.z),
			heading: s.h,
			speedVal: 0,
			occupied: false
		});
	});
	const CAR_MAX_SPEED = 18, CAR_ACCEL = 16, CAR_FRICTION = 8, CAR_TURN_RATE = 2.7;
	function nearestFreeVehicle(pos, maxDist) {
		let best = null, bestD = maxDist;
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
	const SAFEHOUSE_POS = new Vector3(0, 0, -72);
	const safehouseRing = new Mesh(new RingGeometry(2.75, 2.95, 40), new MeshBasicMaterial({
		color: 6280826,
		transparent: true,
		opacity: .8,
		side: 2
	}));
	safehouseRing.rotation.x = -Math.PI / 2;
	safehouseRing.position.copy(SAFEHOUSE_POS);
	safehouseRing.position.y = .04;
	scene.add(safehouseRing);
	addBuilding(0, -84, 8, 7, 7, 1123354, 6280826);
	const campLight = new PointLight(6280826, 1.3, 14);
	campLight.position.set(0, 3, -72);
	scene.add(campLight);
	const TARGET_VISION_RANGE = 12;
	const TARGET_VISION_HALF_ANGLE = MathUtils.degToRad(32);
	const targets = options.contracts.filter((c) => c.status === "accepted").map((def) => {
		const group = makeHumanoid({
			skin: 14199682,
			clothes: 4866854,
			clothes2: 3814176,
			hair: 2760725,
			height: 1.72
		});
		scene.add(group);
		const ring = new Mesh(new RingGeometry(.9, 1.05, 32), new MeshBasicMaterial({
			color: 16731453,
			transparent: true,
			opacity: .55,
			side: 2
		}));
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = .02;
		scene.add(ring);
		const cone = buildVisionCone(TARGET_VISION_RANGE, TARGET_VISION_HALF_ANGLE, 3854847);
		scene.add(cone);
		const path = [];
		for (let k = 0; k < 4; k++) {
			const ang = k / 4 * Math.PI * 2 + rand() * .5;
			path.push(new Vector3(def.center.x + Math.cos(ang) * def.radius, 0, def.center.z + Math.sin(ang) * def.radius));
		}
		const pos = path[0].clone();
		group.position.copy(pos);
		return {
			def,
			group,
			ring,
			cone,
			path,
			pathIdx: 0,
			pos,
			speed: 2 + rand() * .4,
			alive: true,
			dying: false,
			alertState: "unaware",
			calmTimer: 0
		};
	});
	const hunterPool = Array.from({ length: 3 }, () => {
		const foot = makeHumanoid({
			skin: 12157024,
			clothes: 2756364,
			clothes2: 1705989,
			hair: 656901,
			eyesGlow: 16722458
		});
		foot.visible = false;
		scene.add(foot);
		const car = makeBike(4853516, true);
		car.visible = false;
		scene.add(car);
		return {
			foot,
			car,
			pos: new Vector3(),
			heading: 0,
			active: false,
			inVehicle: false,
			mode: "search",
			lastKnownPos: new Vector3(),
			searchTarget: null
		};
	});
	const pedestrians = [];
	for (let i = 0; i < 10; i++) {
		let px = 0, pz = 0, tries = 0;
		do {
			px = (rand() - .5) * GROUND_SIZE * .85;
			pz = (rand() - .5) * GROUND_SIZE * .85;
			tries++;
		} while (inReserved(px, pz) && tries < 20);
		const group = makeHumanoid({
			skin: [
				13210219,
				9067066,
				14727313
			][Math.floor(rand() * 3)],
			clothes: [
				3360602,
				5911347,
				3362863
			][Math.floor(rand() * 3)],
			height: 1.6 + rand() * .25,
			castShadow: false
		});
		group.position.set(px, 0, pz);
		scene.add(group);
		pedestrians.push({
			group,
			pos: new Vector3(px, 0, pz),
			heading: 0,
			target: new Vector3(px, 0, pz),
			wait: rand() * 2,
			speed: 1.1 + rand() * .6,
			fleeing: false,
			fleeTimer: 0
		});
	}
	const keys = {};
	const injected = /* @__PURE__ */ new Set();
	const onKeyDown = (e) => {
		keys[e.key.toLowerCase()] = true;
		if ([
			"1",
			"2",
			"3",
			"4"
		].includes(e.key)) {
			currentWeaponIdx = Number(e.key) - 1;
			attachWeapon(currentWeaponIdx);
			refreshWeaponBar();
		}
		if (e.key === "e" || e.key === "E" || e.key === " ") {
			e.preventDefault();
			doContext();
		}
	};
	const onKeyUp = (e) => {
		keys[e.key.toLowerCase()] = false;
	};
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	let joyVec = {
		x: 0,
		y: 0
	};
	function updateMovementVector() {
		let mx = joyVec.x, my = joyVec.y;
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
		return {
			x: mx,
			y: my
		};
	}
	const state = {
		phase: "playing",
		bounty: 0,
		cash: 0,
		heat: "clear",
		lastKillTime: performance.now(),
		kills: []
	};
	const CATCH_RANGE_FOOT = 1.15, CATCH_RANGE_VEHICLE = 2.1, SAFEHOUSE_RANGE = 3.2;
	const BOUNTY_DECAY_GRACE = 12e3, BOUNTY_DECAY_RATE = 16;
	const shakeState = { mag: 0 };
	const activeFx = [];
	let hudHost = null;
	const hud = {
		bounty: 0,
		cash: 0,
		heat: "CLEAR",
		objective: "Close the contracts. Extract at camp.",
		action: "",
		weapon: 0,
		decay: "",
		speed: "",
		contracts: []
	};
	function refreshWeaponBar() {
		hud.weapon = currentWeaponIdx;
	}
	function allTargetsDown() {
		return targets.length === 0 || targets.every((t) => !t.alive);
	}
	function resolveCollision(pos, radius) {
		for (const b of buildings) {
			const dx = pos.x - b.x, dz = pos.z - b.z;
			const ox = b.hw + radius - Math.abs(dx);
			const oz = b.hd + radius - Math.abs(dz);
			if (ox > 0 && oz > 0) {
				if (ox < oz) pos.x += Math.sign(dx || 1) * ox;
				else pos.z += Math.sign(dz || 1) * oz;
			}
		}
		const bound = 99;
		pos.x = Math.max(-99, Math.min(bound, pos.x));
		pos.z = Math.max(-99, Math.min(bound, pos.z));
	}
	function spawnMuzzleFlash() {
		if (!currentWeaponMesh || WEAPONS[currentWeaponIdx].id === "knife") return;
		const muzzleWorld = new Vector3();
		currentWeaponMesh.localToWorld(muzzleWorld.copy(currentWeaponMesh.userData.muzzleOffset));
		const flashLight = new PointLight(16755285, 4.5, 6);
		flashLight.position.copy(muzzleWorld);
		scene.add(flashLight);
		const flashMesh = new Mesh(new PlaneGeometry(.35, .35), new MeshBasicMaterial({
			color: 16772744,
			transparent: true,
			opacity: .95,
			side: 2,
			depthWrite: false,
			blending: 2
		}));
		flashMesh.position.copy(muzzleWorld);
		scene.add(flashMesh);
		activeFx.push({
			type: "muzzle",
			light: flashLight,
			mesh: flashMesh,
			life: .12,
			maxLife: .12
		});
	}
	function spawnBloodSpray(pos) {
		for (let i = 0; i < 16; i++) {
			const p = new Mesh(new SphereGeometry(.04 + Math.random() * .07, 5, 5), new MeshBasicMaterial({
				color: [
					9116186,
					12858411,
					5902095
				][i % 3],
				transparent: true,
				opacity: .9
			}));
			p.position.copy(pos);
			p.position.y += .9 + Math.random() * .5;
			const vel = new Vector3((Math.random() - .5) * 2.2, 1.6 + Math.random() * 3.2, (Math.random() - .5) * 2.2);
			scene.add(p);
			activeFx.push({
				type: "blood",
				mesh: p,
				vel,
				life: .8,
				maxLife: 1.1,
				gravity: 14
			});
		}
	}
	function updateFx(dt) {
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
				if (fx.mesh && fx.mesh instanceof Mesh) {
					fx.mesh.material.opacity = .95 * t;
					fx.mesh.lookAt(camera.position);
				}
			} else if (fx.type === "blood" && fx.mesh && fx.vel) {
				fx.vel.y -= (fx.gravity ?? 14) * dt;
				fx.mesh.position.addScaledVector(fx.vel, dt);
				if (fx.mesh instanceof Mesh) fx.mesh.material.opacity = Math.min(1, t * 1.4);
				if (fx.mesh.position.y < .05) {
					fx.mesh.position.y = .05;
					fx.vel.y *= -.2;
				}
			}
		}
	}
	function findEliminatableTarget() {
		const w = WEAPONS[currentWeaponIdx];
		let best = null;
		let bestD = w.range;
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
	function trySpawnHunter(delay) {
		window.setTimeout(() => {
			if (state.phase !== "playing") return;
			const slot = hunterPool.find((h) => !h.active);
			if (!slot) return;
			const edgeAngle = Math.random() * Math.PI * 2;
			const r = WORLD_HALF * .85;
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
		shakeState.mag = Math.max(shakeState.mag, w.silent && !wasAlerted ? .3 : .6);
		const remaining = targets.filter((x) => x.alive).length;
		hud.objective = remaining > 0 ? `${remaining} contract${remaining > 1 ? "s" : ""} left.` : "All contracts closed. Extract at camp.";
		hud.cash = state.cash;
		hud.bounty = state.bounty;
		let delay = w.hunterDelay;
		if (!w.silent || wasAlerted) {
			state.heat = "hunted";
			hud.heat = "HUNTED";
			delay *= .7;
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
		resolveCollision(P.pos, .45);
		player.position.set(P.pos.x, 0, P.pos.z);
		player.rotation.y = P.heading;
		player.visible = true;
		playerMode.value = "onfoot";
		activeVehicle = null;
	}
	function finish(kind) {
		if (state.phase !== "playing") return;
		state.phase = kind;
		const result = {
			cashEarned: state.cash,
			bountyHeat: Math.round(state.bounty),
			kills: state.kills,
			extracted: kind === "success",
			caught: kind === "caught"
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
	let joyPointer = null;
	function bindHud(el) {
		const joy = el.querySelector("#joyBase");
		const knob = el.querySelector("#joyKnob");
		const action = el.querySelector("#actionBtn");
		if (joy && knob) {
			const start = (e) => {
				joyPointer = e.pointerId;
				joy.setPointerCapture(e.pointerId);
				move(e);
			};
			const move = (e) => {
				if (joyPointer !== e.pointerId) return;
				const rect = joy.getBoundingClientRect();
				const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
				let dx = e.clientX - cx, dy = e.clientY - cy;
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
				currentWeaponIdx = Number(btn.dataset.weapon);
				attachWeapon(currentWeaponIdx);
				refreshWeaponBar();
			});
		});
	}
	const timer = new Timer();
	let frameCounter = 0;
	let raf = 0;
	let destroyed = false;
	function animate() {
		if (destroyed) return;
		raf = requestAnimationFrame(animate);
		timer.update();
		const dt = Math.min(timer.getDelta(), .05);
		frameCounter++;
		const perceptionTick = frameCounter % 6 === 0;
		const playerPos = getPlayerPos();
		const rp = rain.geometry.attributes.position.array;
		for (let i = 0; i < RAIN_COUNT; i++) {
			rp[i * 3 + 1] -= dt * 22;
			if (rp[i * 3 + 1] < 0) {
				rp[i * 3 + 1] = 30;
				rp[i * 3] = playerPos.x + (Math.random() - .5) * 70;
				rp[i * 3 + 2] = playerPos.z + (Math.random() - .5) * 70;
			}
		}
		rain.geometry.attributes.position.needsUpdate = true;
		pedestrians.forEach((p) => {
			if (p.wait > 0) {
				p.wait -= dt;
				animateWalk(p.group, dt, false, 1);
			} else {
				const dir = new Vector3().subVectors(p.target, p.pos);
				if (dir.length() < .3) {
					p.wait = 1.5 + Math.random() * 3;
					p.target.set(p.pos.x + (rand() - .5) * 18, 0, p.pos.z + (rand() - .5) * 18);
				} else {
					dir.normalize();
					p.pos.addScaledVector(dir, p.speed * dt);
					resolveCollision(p.pos, .35);
					p.heading = Math.atan2(dir.x, dir.z);
					animateWalk(p.group, dt, true, .85);
				}
			}
			p.group.position.set(p.pos.x, 0, p.pos.z);
			p.group.rotation.y = p.heading;
		});
		if (state.phase === "playing") {
			const mv = updateMovementVector();
			const isMoving = Math.hypot(mv.x, mv.y) > .08;
			if (playerMode.value === "onfoot") {
				if (isMoving) {
					P.pos.x += mv.x * P.speed * dt;
					P.pos.z += mv.y * P.speed * dt;
					let diff = Math.atan2(mv.x, mv.y) - P.heading;
					while (diff > Math.PI) diff -= Math.PI * 2;
					while (diff < -Math.PI) diff += Math.PI * 2;
					P.heading += diff * Math.min(1, dt * 10);
				}
				resolveCollision(P.pos, .45);
				player.position.set(P.pos.x, 0, P.pos.z);
				player.rotation.y = P.heading;
				animateWalk(player, dt, isMoving, 1.2);
				hud.speed = "";
			} else if (activeVehicle) {
				const v = activeVehicle;
				const throttle = -mv.y;
				const steer = mv.x;
				v.speedVal += throttle * CAR_ACCEL * dt;
				if (Math.abs(throttle) < .05) {
					const fr = Math.sign(v.speedVal) * CAR_FRICTION * dt;
					if (Math.abs(fr) > Math.abs(v.speedVal)) v.speedVal = 0;
					else v.speedVal -= fr;
				}
				v.speedVal = Math.max(-9, Math.min(CAR_MAX_SPEED, v.speedVal));
				const speedFrac = v.speedVal / CAR_MAX_SPEED;
				const reverse = v.speedVal >= 0 ? 1 : -1;
				v.heading += steer * CAR_TURN_RATE * dt * (.35 + Math.abs(speedFrac) * .65) * reverse;
				v.pos.x += Math.sin(v.heading) * v.speedVal * dt;
				v.pos.z += Math.cos(v.heading) * v.speedVal * dt;
				resolveCollision(v.pos, 1.1);
				v.group.position.set(v.pos.x, 0, v.pos.z);
				v.group.rotation.y = v.heading;
				hud.speed = `${Math.round(Math.abs(v.speedVal) * 6)} MPH`;
			}
			if (perceptionTick) targets.forEach((t) => {
				if (!t.alive) return;
				let detected = false;
				if (playerMode.value === "vehicle") detected = t.pos.distanceTo(playerPos) < 14;
				else {
					const toPlayer = new Vector3().subVectors(P.pos, t.pos);
					if (toPlayer.length() < TARGET_VISION_RANGE) {
						let diff = Math.atan2(toPlayer.x, toPlayer.z) - t.group.rotation.y;
						while (diff > Math.PI) diff -= Math.PI * 2;
						while (diff < -Math.PI) diff += Math.PI * 2;
						if (Math.abs(diff) < TARGET_VISION_HALF_ANGLE && hasLOS(t.pos, P.pos)) detected = true;
					}
				}
				if (detected) {
					t.alertState = "alerted";
					t.calmTimer = 0;
				} else {
					t.calmTimer += .1;
					if (t.calmTimer > 6 && t.alertState === "alerted") t.alertState = "unaware";
				}
			});
			targets.forEach((t) => {
				if (t.alive) {
					if (t.alertState === "alerted") {
						const away = new Vector3().subVectors(t.pos, P.pos);
						if (away.lengthSq() < 1e-4) away.set(1, 0, 0);
						away.normalize();
						t.pos.addScaledVector(away, t.speed * 1.7 * dt);
						resolveCollision(t.pos, .45);
						t.group.rotation.y = Math.atan2(away.x, away.z);
						animateWalk(t.group, dt, true, 1.3);
					} else {
						const wp = t.path[t.pathIdx];
						const dir = new Vector3().subVectors(wp, t.pos);
						if (dir.length() < .15) t.pathIdx = (t.pathIdx + 1) % t.path.length;
						else {
							dir.normalize();
							t.pos.addScaledVector(dir, t.speed * dt);
							t.group.rotation.y = Math.atan2(dir.x, dir.z);
							animateWalk(t.group, dt, true, .9);
						}
					}
					t.group.position.set(t.pos.x, 0, t.pos.z);
					t.ring.position.set(t.pos.x, .02, t.pos.z);
					t.cone.position.set(t.pos.x, .03, t.pos.z);
					t.cone.rotation.y = t.group.rotation.y;
					t.cone.material.color.setHex(t.alertState === "alerted" ? 16731453 : 3854847);
				} else if (t.dying) {
					t.group.rotation.z += dt * 5.5;
					t.group.position.y -= dt * .45;
					t.group.scale.multiplyScalar(1 - dt * 1.1);
					if (t.group.scale.x < .04) {
						t.group.visible = false;
						t.dying = false;
					}
				}
			});
			if (perceptionTick) hunterPool.forEach((h) => {
				if (!h.active) return;
				const detectRange = h.inVehicle || playerMode.value === "vehicle" ? 40 : 24;
				if (h.pos.distanceTo(playerPos) < detectRange && hasLOS(h.pos, playerPos)) {
					h.mode = "chase";
					h.lastKnownPos.copy(playerPos);
				} else h.mode = "search";
			});
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
						const ang = Math.random() * Math.PI * 2, r = 4 + Math.random() * 8;
						h.searchTarget = new Vector3(h.lastKnownPos.x + Math.cos(ang) * r, 0, h.lastKnownPos.z + Math.sin(ang) * r);
					}
					dest = h.searchTarget;
				}
				const dir = new Vector3().subVectors(dest, h.pos);
				if (dir.length() > .05) {
					dir.normalize();
					h.pos.addScaledVector(dir, (h.mode === "chase" ? baseSpeed : baseSpeed * .82) * dt);
					h.heading = Math.atan2(dir.x, dir.z);
				}
				resolveCollision(h.pos, h.inVehicle ? 1.1 : .45);
				if (h.inVehicle) {
					h.car.position.set(h.pos.x, 0, h.pos.z);
					h.car.rotation.y = h.heading;
				} else {
					h.foot.position.set(h.pos.x, 0, h.pos.z);
					h.foot.rotation.y = h.heading;
					animateWalk(h.foot, dt, true, 1.4);
				}
				if (h.pos.distanceTo(playerPos) <= (h.inVehicle ? CATCH_RANGE_VEHICLE + (playerMode.value === "vehicle" ? 1.2 : 0) : CATCH_RANGE_FOOT)) finish("caught");
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
				status: !t.alive ? "DOWN" : t.alertState === "alerted" ? "ALERTED" : "OPEN"
			}));
		}
		const inCar = playerMode.value === "vehicle";
		const camOffset = inCar ? new Vector3(0, 16, 12) : new Vector3(0, 13, 9);
		const desiredCamPos = new Vector3(playerPos.x, 0, playerPos.z).add(camOffset);
		camera.position.lerp(desiredCamPos, 1 - Math.pow(inCar ? .006 : .001, dt));
		camera.lookAt(playerPos.x, .8, playerPos.z);
		rim.position.set(playerPos.x, 8, playerPos.z);
		if (shakeState.mag > .002) {
			camera.position.x += (Math.random() - .5) * shakeState.mag;
			camera.position.z += (Math.random() - .5) * shakeState.mag;
			shakeState.mag *= .88;
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
		const a = hudHost.querySelector("#actionBtn");
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
		if (rows) rows.innerHTML = hud.contracts.map((r) => {
			const done = r.status === "DOWN";
			const alerted = r.status === "ALERTED";
			return `<div class="cp-row${done ? " done" : ""}${alerted ? " alerted" : ""}"><span class="cp-name">${r.name}</span><span class="cp-status">${r.status}</span></div>`;
		}).join("");
		hudHost.querySelectorAll("[data-weapon]").forEach((btn, i) => {
			btn.classList.toggle("active", i === hud.weapon);
		});
	}
	camera.position.set(0, 13, 33);
	camera.lookAt(0, 0, 24);
	animate();
	window.__controlsTest = {
		getYaw: () => playerMode.value === "vehicle" && activeVehicle ? activeVehicle.heading : P.heading,
		getSpeed: () => {
			if (playerMode.value === "vehicle" && activeVehicle) return Math.abs(activeVehicle.speedVal);
			const mv = updateMovementVector();
			return Math.hypot(mv.x, mv.y) * P.speed;
		},
		setKeys: (codes) => {
			injected.clear();
			codes.forEach((c) => injected.add(c));
		}
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
		}
	};
}
function Home() {
	const [save, setSave] = (0, import_react.useState)(null);
	const [screen, setScreen] = (0, import_react.useState)("boot");
	const [draftName, setDraftName] = (0, import_react.useState)("");
	const [focusId, setFocusId] = (0, import_react.useState)(null);
	const [ask, setAsk] = (0, import_react.useState)(0);
	const [haggleMsg, setHaggleMsg] = (0, import_react.useState)("");
	const [debrief, setDebrief] = (0, import_react.useState)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const hudRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const s = loadSave();
		setSave(s);
		setDraftName(s.callsign);
		setScreen(s.callsign ? "camp" : "name");
	}, []);
	const commit = (0, import_react.useCallback)((next) => {
		persistSave(next);
		setSave(next);
	}, []);
	const focused = save?.daily.contracts.find((c) => c.id === focusId) ?? null;
	const accepted = save?.daily.contracts.filter((c) => c.status === "accepted" || c.status === "cleared") ?? [];
	const openCount = save?.daily.contracts.filter((c) => c.status === "open" || c.status === "negotiating").length ?? 0;
	const clearedCount = save?.daily.contracts.filter((c) => c.status === "cleared").length ?? 0;
	const mult = payoutMultiplier(save?.bountiesClaimed ?? 0);
	function setCallsign() {
		if (!save) return;
		const name = draftName.trim().slice(0, 18);
		if (name.length < 2) return;
		commit({
			...save,
			callsign: name
		});
		setScreen("camp");
	}
	function openNegotiate(c) {
		if (c.status === "cleared" || c.status === "accepted") return;
		setFocusId(c.id);
		setAsk(c.offered);
		setHaggleMsg("");
		setScreen("negotiate");
	}
	function applyContract(id, patch) {
		if (!save) return;
		commit({
			...save,
			daily: {
				...save.daily,
				contracts: save.daily.contracts.map((c) => c.id === id ? {
					...c,
					...patch
				} : c)
			}
		});
	}
	function acceptAt(price) {
		if (!focused) return;
		applyContract(focused.id, {
			status: "accepted",
			agreed: price
		});
		setScreen("camp");
	}
	function haggle() {
		if (!focused || !save) return;
		const res = tryHaggle({
			...focused,
			haggleAttempts: focused.haggleAttempts
		}, ask);
		setHaggleMsg(res.message);
		applyContract(focused.id, {
			haggleAttempts: focused.haggleAttempts + 1,
			offered: res.ok ? res.price : focused.offered,
			maxAsk: res.ok ? focused.maxAsk : Math.round(focused.maxAsk * .96)
		});
		if (res.ok) setAsk(res.price);
	}
	function rollOut() {
		if (!save) return;
		if (!save.daily.contracts.filter((c) => c.status === "accepted").length) return;
		setScreen("night");
	}
	(0, import_react.useEffect)(() => {
		if (screen !== "night" || !save || !canvasRef.current) return;
		const jobs = save.daily.contracts.filter((c) => c.status === "accepted");
		const handle = mountGame(canvasRef.current, {
			callsign: save.callsign,
			contracts: jobs,
			onExtract: (r) => {
				setDebrief(r);
				setScreen("debrief");
			},
			onCaught: (r) => {
				setDebrief(r);
				setScreen("debrief");
			}
		});
		gameRef.current = handle;
		if (hudRef.current) handle.setHudHost(hudRef.current);
		return () => {
			handle.destroy();
			gameRef.current = null;
		};
	}, [screen, save]);
	function settleNight() {
		if (!save || !debrief) return;
		let next = {
			...save,
			cash: save.cash + (debrief.extracted ? debrief.cashEarned : Math.floor(debrief.cashEarned * .35))
		};
		const killSet = new Set(debrief.kills);
		next.daily = {
			...next.daily,
			contracts: next.daily.contracts.map((c) => {
				if (killSet.has(c.id)) return {
					...c,
					status: "cleared"
				};
				if (c.status === "accepted" && debrief.caught) return {
					...c,
					status: "open",
					agreed: null
				};
				return c;
			})
		};
		const newly = next.daily.contracts.filter((c) => c.status === "cleared").length - save.daily.contracts.filter((c) => c.status === "cleared").length;
		next.bountiesClaimed += Math.max(0, newly);
		next.reputation = next.bountiesClaimed;
		if (next.daily.contracts.every((c) => c.status === "cleared") && !next.daily.allClearBonusPaid && debrief.extracted) {
			next.cash += dailyBonus(next.bountiesClaimed);
			next.daily = {
				...next.daily,
				allClearBonusPaid: true
			};
		}
		commit(next);
		setDebrief(null);
		setScreen("camp");
	}
	function sleepNextDay() {
		if (!save) return;
		const offset = save.dayOffset + 1;
		const key = todayKey(offset);
		commit({
			...save,
			dayOffset: offset,
			lastDateKey: key,
			daily: {
				dateKey: key,
				contracts: generateDailyContracts(key, save.bountiesClaimed),
				allClearBonusPaid: false
			}
		});
	}
	const bonus = (0, import_react.useMemo)(() => dailyBonus(save?.bountiesClaimed ?? 0), [save?.bountiesClaimed]);
	if (!save) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex h-dvh max-w-lg flex-col justify-center gap-6 bg-bg px-6 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] tracking-[0.28em] text-muted",
				children: "FALL CAMP — ENLIST"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-6xl leading-none tracking-wide",
				children: "LEDGER"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm leading-relaxed text-muted",
				children: "The city fell. Camps still pay for names. Take a callsign — it rides over your head so the camp knows who brought the bounty in."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-bg text-fg",
		children: [
			screen === "name" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto flex h-full max-w-lg flex-col justify-center gap-6 px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] tracking-[0.28em] text-muted",
						children: "FALL CAMP — ENLIST"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-6xl leading-none tracking-wide text-fg",
						children: "LEDGER"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-sm leading-relaxed text-muted",
						children: "The city fell. Camps still pay for names. Take a callsign — it rides over your head so the camp knows who brought the bounty in."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] tracking-[0.18em] text-muted",
							children: "CALLSIGN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: draftName,
							maxLength: 18,
							onChange: (e) => setDraftName(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && setCallsign(),
							placeholder: "DEACON, RYN, ASH…",
							className: "h-12 rounded-md border border-border bg-elevated px-4 font-display text-2xl tracking-widest text-fg outline-none focus:border-rust"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: setCallsign,
						className: "h-12 rounded-md bg-fg px-6 font-display text-xl tracking-[0.2em] text-ink",
						children: "TAKE THE BOARD"
					})
				]
			}),
			screen === "camp" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex h-full flex-col overflow-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[10px] tracking-[0.28em] text-muted",
							children: ["CAMP BOARD · ", save.daily.dateKey]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-5xl leading-none text-fg",
							children: save.callsign
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-6 font-mono text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "STASH",
									value: "$" + save.cash.toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "CLAIMED",
									value: String(save.bountiesClaimed)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "PAY RATE",
									value: mult.toFixed(2) + "×"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-5 pt-4 text-sm leading-relaxed text-muted",
						children: [
							"Daily paper from the fixer. More names you close, the richer the next sheet. Haggle if you have the reputation. Clear all three for a camp bonus of $",
							bonus.toLocaleString(),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 p-5 md:grid-cols-3",
						children: save.daily.contracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col gap-3 rounded-lg border border-border bg-elevated p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono text-[10px] tracking-[0.16em] text-muted",
											children: [
												c.district,
												" · ",
												c.difficulty.toUpperCase()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-3xl leading-none text-paper",
											children: c.alias
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-fg",
											children: c.name
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] tracking-widest text-rust-bright",
										children: c.status.toUpperCase()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: c.brief
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-display text-2xl text-olive",
									children: ["$", (c.agreed ?? c.offered).toLocaleString()]
								}),
								c.status === "open" || c.status === "negotiating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => openNegotiate(c),
									className: "h-11 rounded-sm bg-fg font-display text-lg tracking-[0.16em] text-ink",
									children: "NEGOTIATE"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-muted",
									children: c.status === "accepted" ? "Pinned to tonight's ride." : "Paid. Name is off the board."
								})
							]
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mt-auto flex flex-wrap gap-3 border-t border-border px-5 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !accepted.filter((c) => c.status === "accepted").length,
								onClick: rollOut,
								className: "h-12 min-w-40 rounded-md bg-rust px-6 font-display text-xl tracking-[0.18em] text-fg disabled:opacity-40",
								children: "RIDE OUT"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: sleepNextDay,
								className: "h-12 rounded-md border border-border px-5 font-display text-lg tracking-[0.14em] text-muted",
								children: "SLEEP TILL DAWN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "self-center font-mono text-xs text-subtle",
								children: [
									openCount,
									" open · ",
									clearedCount,
									"/3 cleared · WASD move · E act"
								]
							})
						]
					})
				]
			}),
			screen === "negotiate" && focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto flex h-full max-w-lg flex-col justify-center gap-5 px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[10px] tracking-[0.24em] text-muted",
						children: ["FIXER TABLE · ", focused.district]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-5xl leading-none text-paper",
						children: focused.alias
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: focused.brief
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							"Posted $",
							focused.offered.toLocaleString(),
							" · they will not go below $",
							focused.minAccept.toLocaleString(),
							" · reputation ceiling $",
							focused.maxAsk.toLocaleString()
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[11px] tracking-[0.16em] text-muted",
							children: ["YOUR ASK $", ask.toLocaleString()]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: focused.minAccept,
							max: Math.round(focused.maxAsk * 1.35),
							value: ask,
							onChange: (e) => setAsk(Number(e.target.value)),
							className: "w-full accent-rust"
						})]
					}),
					haggleMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-paper",
						children: haggleMsg
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: haggle,
								className: "h-12 rounded-md border border-border px-5 font-display text-lg tracking-widest text-fg",
								children: "HAGGLE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => acceptAt(ask <= focused.maxAsk ? ask : focused.offered),
								className: "h-12 rounded-md bg-fg px-5 font-display text-lg tracking-widest text-ink",
								children: "TAKE THE JOB"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setScreen("camp"),
								className: "h-12 px-3 font-mono text-xs tracking-widest text-muted",
								children: "BACK"
							})
						]
					})
				]
			}),
			screen === "night" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: canvasRef,
						className: "absolute inset-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scanlines" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: hudRef,
						className: "ledger-hud",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "name-chip",
								id: "callsignChip",
								children: save.callsign
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "stamp-panel",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "stamp-label",
										children: "BOUNTY ON YOUR HEAD"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "stamp-value",
										id: "bountyValue",
										children: "$0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "decay-note",
										id: "decayNote"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "contract-panel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "cp-label",
									children: "TONIGHT"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "contractRows" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cash-panel",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "stamp-label",
										children: "EARNED"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cash-value",
										id: "cashValue",
										children: "$0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "speedo",
										id: "speedoText"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "heat-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									id: "heatText",
									className: "heat-clear",
									children: "CLEAR"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "objective",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "obj-eyebrow",
									children: "OBJECTIVE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "obj-text",
									id: "objectiveText",
									children: "Close the contracts. Extract at camp."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								id: "weaponBar",
								children: [
									"KNIFE",
									"PISTOL",
									"SMG",
									"SNIPER"
								].map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "wbtn" + (i === 0 ? " active" : ""),
									"data-weapon": i,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "wname",
										children: n
									})
								}, n))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								id: "actionBtn",
								children: "ELIMINATE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								id: "joyBase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "joyKnob" })
							})
						]
					})
				]
			}),
			screen === "debrief" && debrief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto flex h-full max-w-lg flex-col justify-center gap-5 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] tracking-[0.28em] text-muted",
						children: debrief.caught ? "TAKEN" : "NIGHT CLOSED"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-6xl leading-none text-rust-bright",
						children: debrief.caught ? "CAUGHT" : "EXTRACTED"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: debrief.caught ? "They took a cut. What you carried still counts, but the open names go back on the board." : "Camp takes the paper. Stash grows. Tomorrow the sheet pays more."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-3xl text-olive",
						children: [
							"$",
							debrief.cashEarned.toLocaleString(),
							" earned"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							debrief.kills.length,
							" names closed · heat $",
							Math.round(debrief.bountyHeat).toLocaleString()
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: settleNight,
						className: "h-12 rounded-md bg-fg font-display text-xl tracking-[0.2em] text-ink",
						children: "RETURN TO CAMP"
					})
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] tracking-[0.18em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-display text-2xl leading-none text-fg",
			children: value
		})]
	});
}
//#endregion
export { Home as component };
