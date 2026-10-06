import * as THREE from './assets/vendor/three.module.js';
import { GLTFLoader } from './assets/vendor/loaders/GLTFLoader.js';
import { clone } from './assets/vendor/utils/SkeletonUtils.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const loader = new GLTFLoader();
let modelPromise;
function character() {
  modelPromise ||= loader.loadAsync('./assets/models/combat.glb');
  return modelPromise;
}
function renderer(container, transparent) {
  const canvas = document.createElement('canvas');
  const render = new THREE.WebGLRenderer({ canvas, alpha: transparent, antialias: true });
  render.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  render.shadowMap.enabled = true;
  render.shadowMap.type = THREE.PCFSoftShadowMap;
  render.toneMapping = THREE.ACESFilmicToneMapping;
  render.toneMappingExposure = 1.3;
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);
  return render;
}
function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xdde9ff, 0x313528, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x638bff, 3);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
}
function avatar(gltf, color, animationName = 'Sprint_Loop') {
  const root = clone(gltf.scene);
  root.traverse(object => {
    if (object.isMesh) {
      object.material = new THREE.MeshStandardMaterial({ color, roughness: .65, metalness: .12 });
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  const mixer = new THREE.AnimationMixer(root);
  const clip = THREE.AnimationClip.findByName(gltf.animations, animationName);
  if (clip) mixer.clipAction(clip).play();
  mixer.update(0);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const height = box.max.y - box.min.y;
  const normalized = new THREE.Group();
  normalized.add(root);
  normalized.scale.setScalar(1.8 / height);
  normalized.position.set(-(box.min.x + box.max.x) / 2 * normalized.scale.x, -box.min.y * normalized.scale.y, -(box.min.z + box.max.z) / 2 * normalized.scale.z);
  const pivot = new THREE.Group();
  pivot.add(normalized);
  return { pivot, mixer, clips: gltf.animations, root };
}
function animateScene(render, scene, camera, container, update) {
  let visible = false;
  let disposed = false;
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: '100px' });
  observer.observe(container);
  const resize = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    render.setSize(Math.max(1, width), Math.max(1, height), false);
    if (camera.isPerspectiveCamera) { camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); }
  });
  resize.observe(container);
  let previous = performance.now();
  let time = 0;
  render.setAnimationLoop(now => {
    const dt = Math.min((now - previous) / 1000, .05);
    previous = now;
    if (disposed || !visible || document.hidden) return;
    const paused = reduced.matches || document.body.classList.contains('motion-paused');
    if (!paused) { time += dt; update(dt, time); }
    render.render(scene, camera);
  });
  addEventListener('pagehide', () => {
    disposed = true; observer.disconnect(); resize.disconnect(); render.setAnimationLoop(null); render.dispose();
  }, { once: true });
}
async function roadScene() {
  const container = document.querySelector('.road-avatar');
  if (!container) return;
  try {
    const render = renderer(container, true);
    const scene = new THREE.Scene();
    lights(scene);
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
    camera.position.set(0, 1.1, 4.8);
    camera.lookAt(0, .9, 0);
    const actor = avatar(await character(), 0x345ce0);
    scene.add(actor.pivot);
    actor.pivot.rotation.y = Math.PI / 2;
    container.querySelector('.avatar-loading')?.remove();
    const path = document.querySelector('.career-road .road-center');
    const grid = document.querySelector('.journey-grid');
    const footAnchor = new THREE.Vector3();
    const length = path.getTotalLength();
    animateScene(render, scene, camera, container, (dt, time) => {
      actor.mixer.update(dt * 1.65);
      const distance = (time % 28) / 28 * length;
      const point = path.getPointAtLength(distance);
      const ahead = path.getPointAtLength(Math.min(distance + 4, length));
      const behind = path.getPointAtLength(Math.max(distance - 4, 0));
      const matrix = path.getScreenCTM();
      if (!matrix) return;
      const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      const screenAhead = new DOMPoint(ahead.x, ahead.y).matrixTransform(matrix);
      const screenBehind = new DOMPoint(behind.x, behind.y).matrixTransform(matrix);
      actor.pivot.rotation.y = Math.atan2(screenAhead.x - screenBehind.x, screenAhead.y - screenBehind.y);
      const gridRect = grid.getBoundingClientRect();
      footAnchor.set(0, 0, 0).project(camera);
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const footX = (footAnchor.x + 1) / 2 * width;
      const footY = (1 - footAnchor.y) / 2 * height;
      container.style.left = `${screenPoint.x - gridRect.left - footX}px`;
      container.style.top = `${screenPoint.y - gridRect.top - footY}px`;
    });
  } catch (error) {
    container.querySelector('canvas')?.remove();
    const status = container.querySelector('.avatar-loading');
    if (status) status.textContent = '3D unavailable';
    console.warn('3D road scene could not load.', error);
  }
}
roadScene();
