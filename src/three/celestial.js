import * as THREE from "three";

const STAR_BATCH_COUNT = 4;
const STARS_PER_BATCH = 65;

export function addCelestial(scene) {
  const moon = buildMoon(scene);
  const starBatches = buildStars(scene);
  return { moon, starBatches };
}

export function updateCelestial({ moon, starBatches }, elapsedSeconds) {
  animateMoon(moon, elapsedSeconds);
  animateStars(starBatches, elapsedSeconds);
}

function buildMoon(scene) {
  const position = new THREE.Vector3(-7.2, 8.5, -20);

  const outerHaloMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff4a0,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    fog: false,
  });
  const outerHalo = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 64),
    outerHaloMaterial,
  );
  outerHalo.position.copy(position);
  scene.add(outerHalo);

  const innerHaloMaterial = new THREE.MeshBasicMaterial({
    color: 0xffeebb,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    fog: false,
  });
  const innerHalo = new THREE.Mesh(
    new THREE.CircleGeometry(1.75, 64),
    innerHaloMaterial,
  );
  innerHalo.position.copy(position);
  scene.add(innerHalo);

  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff9d6,
    emissive: 0xffe55a,
    emissiveIntensity: 1.0,
    roughness: 0.35,
    fog: false,
  });
  const moonDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 64),
    moonMaterial,
  );
  moonDisc.position.copy(position);
  scene.add(moonDisc);

  const moonLight = new THREE.PointLight(0xffe08a, 1.2, 20);
  moonLight.position.set(-7, 9.5, -16);
  scene.add(moonLight);

  return { moonMaterial, outerHaloMaterial, innerHaloMaterial };
}

function buildStars(scene) {
  const batches = [];

  for (let b = 0; b < STAR_BATCH_COUNT; b++) {
    const positions = new Float32Array(STARS_PER_BATCH * 3);

    for (let i = 0; i < STARS_PER_BATCH; i++) {
    //   theta = horizontal angle, phi = vertical angle from top
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0.08, Math.PI * 0.72);
      const r = THREE.MathUtils.randFloat(20, 70); // beyond camera maxDistance of 14

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) - 2;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: b % 2 === 0 ? 0.28 : 0.45,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
      fog: false,
    });

    scene.add(new THREE.Points(geometry, material));
    batches.push({
      material,
      phaseOffset: (b / STAR_BATCH_COUNT) * Math.PI * 2,
    });
  }

  return batches;
}

function animateMoon(
  { moonMaterial, outerHaloMaterial, innerHaloMaterial },
  t,
) {
  const pulse = Math.sin(t * 0.65);
  moonMaterial.emissiveIntensity = 0.75 + 0.28 * pulse;
  outerHaloMaterial.opacity = 0.12 + 0.06 * pulse;
  innerHaloMaterial.opacity = 0.26 + 0.08 * pulse;
}

function animateStars(batches, t) {
  batches.forEach(({ material, phaseOffset }) => {
    material.opacity = 0.45 + 0.55 * Math.abs(Math.sin(t * 1.4 + phaseOffset));
  });
}
