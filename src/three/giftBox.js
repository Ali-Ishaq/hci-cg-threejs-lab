import * as THREE from "three";

export function createGiftBox(scene, boxColor, lidColor) {
  const boxMat = new THREE.MeshStandardMaterial({
    color: boxColor,
    metalness: 0.15,
    roughness: 0.55,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: lidColor,
    metalness: 0.15,
    roughness: 0.55,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0xff6b81,
    metalness: 0.1,
    roughness: 0.4,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.15,
  });

  // 5 thin panels

  [
    { size: [2, 0.06, 2], pos: [0, -0.75, 0] }, // floor
    { size: [0.06, 1.5, 2], pos: [-1, 0, 0] }, // left wall
    { size: [0.06, 1.5, 2], pos: [1, 0, 0] }, // right wall
    { size: [2, 1.5, 0.06], pos: [0, 0, -1] }, // back wall
    { size: [2, 1.5, 0.06], pos: [0, 0, 1] }, // front wall
  ].forEach(({ size, pos }) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), boxMat);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  // Ribbon strips on front and back outer faces
  const oz = 1.04;
  [
    { size: [0.22, 1.5, 0.04], pos: [0, 0, oz] },
    { size: [0.22, 1.5, 0.04], pos: [0, 0, -oz] },
  ].forEach(({ size, pos }) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), ribMat);
    mesh.position.set(...pos);
    scene.add(mesh);
  });

  // Lid
  const LID_H = 0.12;
  const LID_W = 2.06;
  const LID_D = 2.06;

  // pivot acts as hinge at the back outer face
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.75, -1.03);
  scene.add(pivot);

  const lidMesh = new THREE.Mesh(
    new THREE.BoxGeometry(LID_W, LID_H, LID_D),
    lidMat,
  );
  lidMesh.position.set(0, LID_H / 2, LID_D / 2);
  lidMesh.castShadow = true;
  pivot.add(lidMesh);

  // Ribbon cross on lid top
  [
    { size: [LID_W + 0.01, 0.04, 0.22], pos: [0, LID_H / 2 + 0.02, 0] },
    { size: [0.22, 0.04, LID_D + 0.01], pos: [0, LID_H / 2 + 0.02, 0] },
  ].forEach(({ size, pos }) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), ribMat);
    mesh.position.set(...pos);
    lidMesh.add(mesh);
  });

  const bowKnot = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 12),
    goldMat,
  );
  bowKnot.position.set(0, LID_H / 2 + 0.17, 0);
  lidMesh.add(bowKnot);

  // Button on the front face
  const btnMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.15,
  });
  const button3D = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.09, 32),
    btnMat,
  );
  button3D.rotation.x = Math.PI / 2;
  button3D.position.set(0, -0.375, 1.08);
  scene.add(button3D);

  return { boxMat, lidMat, pivot, button3D, btnMat };
}
