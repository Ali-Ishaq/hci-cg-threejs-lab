import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";

const font = new FontLoader().parse(helvetikerBold);

export function buildTextMesh(text, color, scene) {
  const geo = new TextGeometry(text, {
    font,
    size: 0.3,
    depth: 0.1,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.012,
    bevelSegments: 4,
  });
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  geo.translate(-(max.x + min.x) / 2, 0, -(max.z + min.z) / 2);

  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.7,
    roughness: 0.15,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0.85, 0);
  mesh.scale.setScalar(0.001);
  scene.add(mesh);
  return { mesh, mat };
}
