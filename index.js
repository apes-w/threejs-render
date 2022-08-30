import {
  Clock,
  Scene,
  PerspectiveCamera,
  AxesHelper,
  PointLight,
  WebGLRenderer,
  sRGBEncoding,
  ACESFilmicToneMapping,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// eslint-disable-next-line
import MainRender from './src/js/mainRender/main';
// eslint-disable-next-line
import LanternRender from './src/js/lanternRender';
import WaterRender from './src/js/waterRender';

const scene = new Scene();
const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight;
const camera = new PerspectiveCamera(
  75,
  sceneWidth / sceneHeight,
  0.1,
  1000
);
camera.position.set(60, 30, 80);
camera.lookAt(scene.position);

const light = new PointLight(0xffffff, 2, 1000);
light.position.set(0, 100, 10);
scene.add(light);

const axesHelper = new AxesHelper(30);
scene.add(axesHelper);

const renderer = new WebGLRenderer();
renderer.setSize(sceneWidth, sceneHeight);
renderer.setClearColor(0x696969, 1);
document.body.appendChild(renderer.domElement);
renderer.outputEncoding = sRGBEncoding; // 让颜色变化接近人眼感知的变化
renderer.toneMapping = ACESFilmicToneMapping; // （针对hdr的调整）调整色调，让整体的色调接近一种电影的调色的感觉
renderer.toneMappingExposure = 0.25; // 调整曝光程度，实现夜晚的效果

// 添加轨道控制器
// eslint-disable-next-line
const controls = new OrbitControls(camera, renderer.domElement);

// const mainRender = new MainRender({ scene });
// const lantern = new LanternRender(
//   { scene, controls },
//   {
//     executeRender: () => {
//       renderer.render(scene, camera);
//     },
//   },
// );
// eslint-disable-next-line
const waterRender = new WaterRender({ scene });

const clock = new Clock();
// eslint-disable-next-line
let _oldTime = 0;
function animeRender() {
  const nowTime = clock.getElapsedTime();

  // lantern.render(nowTime, nowTime - _oldTime);
  renderer.render(scene, camera);

  _oldTime = nowTime;
  requestAnimationFrame(animeRender);
}

animeRender();
