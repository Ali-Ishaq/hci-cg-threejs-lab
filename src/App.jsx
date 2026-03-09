import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createScene } from "./three/scene.js";
import { createGiftBox } from "./three/giftBox.js";
import { buildTextMesh } from "./three/textMesh.js";
import ConfigPanel from "./ConfigPanel.jsx";
import "./App.css";

function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const boxMatRef = useRef(null);
  const lidMatRef = useRef(null);
  const textRef = useRef(null);
  const textMatRef = useRef(null);
  const isOpenRef = useRef(false);
  const activeTlRef = useRef(null);

  const [boxColor, setBoxColor] = useState("#4fc3f7");
  const [lidColor, setLidColor] = useState("#ff4757");
  const [textColor, setTextColor] = useState("#ffd700");
  const [draftText, setDraftText] = useState("EID MUBARAK !");

  // One-time scene setup
  useEffect(() => {
    const mount = mountRef.current;
    const { scene, camera, renderer, controls } = createScene(mount);
    sceneRef.current = scene;

    const { boxMat, lidMat, pivot, button3D, btnMat } = createGiftBox(
      scene,
      boxColor,
      lidColor,
    );
    boxMatRef.current = boxMat;
    lidMatRef.current = lidMat;

    const { mesh: textMesh0, mat: textMat0 } = buildTextMesh(
      draftText,
      textColor,
      scene,
    );
    textRef.current = textMesh0;
    textMatRef.current = textMat0;

    const toggle = () => {
      const textMesh = textRef.current;
      if (activeTlRef.current) activeTlRef.current.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          activeTlRef.current = null;
        },
      });
      activeTlRef.current = tl;

      if (!isOpenRef.current) {
        isOpenRef.current = true;
        tl.to(pivot.rotation, {
          x: -Math.PI * 0.78,
          duration: 1.0,
          ease: "power2.out",
        })
          .to(
            textMesh.position,
            { y: 1.55, duration: 0.7, ease: "power2.out" },
            "-=0.2",
          )
          .to(
            textMesh.scale,
            { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.7)" },
            "<",
          );
      } else {
        isOpenRef.current = false;
        tl.to(textMesh.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          duration: 0.4,
          ease: "back.in(2)",
        })
          .to(
            textMesh.position,
            { y: 0.85, duration: 0.4, ease: "power2.in" },
            "<",
          )
          .to(
            pivot.rotation,
            { x: 0, duration: 1.0, ease: "power2.inOut" },
            "+=0.05",
          );
      }
    };

    //Button Interactivity

    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();

    const toNDC = (e) => {
      const r = mount.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    const btnColors = {
      idle: { r: 1, g: 0.843, b: 0 },
      hover: { r: 1, g: 0.941, b: 0.416 },
    };
    let btnHovered = false;

    const onPointerMove = (e) => {
      toNDC(e);
      raycaster.setFromCamera(ptr, camera);

      const btnHit = raycaster.intersectObject(button3D).length > 0;
      mount.style.cursor = btnHit ? "pointer" : "default";
      if (btnHit && !btnHovered) {
        btnHovered = true;
        gsap.to(btnMat.color, { ...btnColors.hover, duration: 0.2 });
      } else if (!btnHit && btnHovered) {
        btnHovered = false;
        gsap.to(btnMat.color, { ...btnColors.idle, duration: 0.2 });
      }
    };

    const onPointerDown = (e) => {
      toNDC(e);
      raycaster.setFromCamera(ptr, camera);
      if (!raycaster.intersectObject(button3D).length) return;
      gsap.to(button3D.scale, {
        x: 0.82,
        y: 0.82,
        z: 0.82,
        duration: 0.1,
        ease: "power2.in",
      });
    };

    const onPointerUp = (e) => {
      toNDC(e);
      raycaster.setFromCamera(ptr, camera);
      if (!raycaster.intersectObject(button3D).length) return;
      gsap.to(button3D.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.18,
        ease: "back.out(3)",
      });
      toggle();
    };

    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointerup", onPointerUp);
      if (activeTlRef.current) activeTlRef.current.kill();
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live colour updates
  useEffect(() => {
    if (!boxMatRef.current) return;
    boxMatRef.current.color.set(boxColor);
  }, [boxColor]);

  useEffect(() => {
    if (!lidMatRef.current) return;
    lidMatRef.current.color.set(lidColor);
  }, [lidColor]);

  useEffect(() => {
    if (!textMatRef.current) return;
    textMatRef.current.color.set(textColor);
  }, [textColor]);

  const applyText = () => {
    const scene = sceneRef.current;
    const old = textRef.current;
    if (!scene || !old) return;
    if (activeTlRef.current) activeTlRef.current.kill();
    old.geometry.dispose();
    scene.remove(old);
    const { mesh: fresh, mat: freshMat } = buildTextMesh(
      draftText,
      textColor,
      scene,
    );
    if (isOpenRef.current) {
      fresh.position.y = 1.55;
      fresh.scale.setScalar(1);
    }
    textRef.current = fresh;
    textMatRef.current = freshMat;
  };

  return (
    <div className="root">
      <div ref={mountRef} className="canvas-container" />
      <ConfigPanel
        draftText={draftText}
        setDraftText={setDraftText}
        onApplyText={applyText}
        boxColor={boxColor}
        setBoxColor={setBoxColor}
        lidColor={lidColor}
        setLidColor={setLidColor}
        textColor={textColor}
        setTextColor={setTextColor}
      />
    </div>
  );
}

export default App;
