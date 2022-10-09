import {
  Clock,
  Scene,
  PerspectiveCamera,
  AxesHelper,
  PointLight,
  AmbientLight,
  WebGLRenderer,
  sRGBEncoding,
  ACESFilmicToneMapping,
  // MOUSE,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// eslint-disable-next-line
import MainRender from './src/js/mainRender/main';
// eslint-disable-next-line
import LanternRender from './src/js/lanternRender';
// eslint-disable-next-line
import WaterRender from './src/js/waterRender';
// eslint-disable-next-line
import ParticleRender from './src/js/particleRender';
// eslint-disable-next-line
import FireworksRender from './src/js/fireworksRender';
// eslint-disable-next-line
import RepeatCubeRender from './src/js/repeatCube';
// eslint-disable-next-line
import RepeatCubeShaderRender from './src/js/repeatCube/shaderTex';
// eslint-disable-next-line
import SplitCubeRender from './src/js/splitCubeRender';
// eslint-disable-next-line
import DecorationDesignRender from './src/js/decorationDesignRender';

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

// 点光源
const light = new PointLight(0xffffff, 2, 1000);
light.position.set(30, 30, 50);
scene.add(light);

// 环境光
const ambientLight = new AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

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
// controls.mouseButtons = {
//   MIDDLE: MOUSE.DOLLY,
//   RIGHT: MOUSE.ROTATE,
// };

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
// const waterRender = new WaterRender({ scene });

// eslint-disable-next-line
// const particleRender = new ParticleRender({ scene });

// eslint-disable-next-line
// const fireworksRender = new FireworksRender({ scene });

// eslint-disable-next-line
// const repeatCubeRender = new RepeatCubeRender({ scene });

// eslint-disable-next-line
// const repeatCubeShaderRender = new RepeatCubeShaderRender({ scene });

// eslint-disable-next-line
// const splitCubeRender = new SplitCubeRender(
//   { scene },
// );

const decorationDesignRender = new DecorationDesignRender({ scene });

const clock = new Clock();
// eslint-disable-next-line
let _oldTime = 0;
function animeRender() {
  const nowTime = clock.getElapsedTime();

  // lantern.render(nowTime, nowTime - _oldTime);
  // waterRender.render(nowTime, nowTime - _oldTime);

  // particleRender.render(nowTime);

  // fireworksRender.render(nowTime, nowTime - _oldTime);

  renderer.render(scene, camera);

  _oldTime = nowTime;
  requestAnimationFrame(animeRender);
}

animeRender();

// 监听页面缩放
window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像头的投影矩阵
  camera.updateProjectionMatrix();

  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比例
  renderer.setPixelRatio(window.devicePixelRatio);

  // splitCubeRender.handleResize();
});

// 整体的点击事件
window.addEventListener('click', () => {
  console.log('触发点击事件');

  // fireworksRender.handleClick();
});

// 监听键盘
window.addEventListener('keydown', (e) => {
  console.log('键盘按下');
  // splitCubeRender.handleKeyDown(e);
});

// 监听键盘
window.addEventListener('keyup', (e) => {
  console.log('键盘抬起');
  // splitCubeRender.handleKeyUp(e);
});
