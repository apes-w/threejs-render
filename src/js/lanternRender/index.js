import {
  ShaderMaterial,
  LoadingManager,
  EquirectangularReflectionMapping,
  DoubleSide,
  Vector3,
} from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import environmentImg from '@/assets/image/2k.hdr';
import flyLightModel from '@/assets/model/flyLight.glb';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

let renderTimes = 0;

class LanternRender {
  /**
   * 
   * @param {Object} val 所有和threejs相关的变量
   * @param {Object} other 其他的一些变量或者是方法
   */
  constructor(val, other) {
    const {
      scene,
      controls,
    } = val;
    const {
      executeRender,
    } = other;
    this.scene = scene;
    this.controls = controls;
    this.executeRender = executeRender;

    this.meshList = [];

    this.init();
  }

  // 加载成功
  loadSuccess(val) {
    console.log('模型加载成功', val);
  }
  // 加载失败
  loadError(val) {
    console.log('模型加载失败', val);
  }

  setLoad() {
    this.loadManager = new LoadingManager();
    this.loadManager.onLoad = this.loadSuccess;
    this.loadManager.onError = this.loadError;
    this.loader = new RGBELoader(this.loadManager);

    this.gltfLoader = new GLTFLoader();
  }

  setControls() {
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;
    this.controls.maxPolarAngle = (Math.PI / 3) * 2; // 垂直方向上可以旋转的角度上限
    this.controls.minPolarAngle = (Math.PI / 3) * 2; // 垂直方向上可以旋转的角度下限
    this.controls.update();
    this.executeRender();
  }

  setShaderMaterial(mesh) {
    const shaderMaterial = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: DoubleSide,
    });
    mesh.material = shaderMaterial;
  }

  rotateMesh() {
    this.meshList.forEach(item => {
      gsap.to(item.rotation, {
        y: Math.PI * 2,
        duration: 24 + Math.random() * 10,
        repeat: -1,
      });
    });
  }

  init() {
    // this.setControls();
    this.setLoad();

    // 异步加载环境贴图
    this.loader.loadAsync(environmentImg).then(texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.environment = texture;
    });

    // 异步加载模型
    this.gltfLoader.loadAsync(flyLightModel).then(val => {
      // console.log(val);
      // 模型导入到shader中，进行计算时，应该是根据 m 作为单位进行计算
      const modelMesh = val.scene;
      this.setShaderMaterial(modelMesh.children[1]);
      // 创建多个灯笼
      for (let i = 0; i < 100; i++) {
        let tempFlyLight = modelMesh.clone(true);
        let x = (Math.random() - 0.5) * 600;
        let z = (Math.random() - 0.5) * 600;
        let y = Math.random() * 200 + 40;
        tempFlyLight.position.set(x, y, z);
        tempFlyLight.scale.set(2.5, 2.5, 2.5);
        tempFlyLight.userData = {
          yAxisDistance: Math.pow(Math.pow(x, 2) + Math.pow(z, 2), 0.5),
        };
        const xAxis = new Vector3(1, 0, 0);
        const meshAxis = new Vector3(x, 0, z);
        const angle = meshAxis.angleTo(xAxis);
        tempFlyLight.userData.oldAngle = z > 0 ? angle : Math.PI + angle;
        this.meshList.push(tempFlyLight);
        this.scene.add(tempFlyLight);
      }
      // console.log('初始', this.meshList);
      this.rotateMesh();
    });
  }

  render(time, interval) {
    this.controls.update();

    renderTimes += 1;

    // 所有物体绕一个固定轴旋转
    this.meshList.forEach(item => {
      const {
        userData: { yAxisDistance, oldAngle },
      } = item;
      // 求出以物体的x，z轴为向量和x轴之间的角度
      const newAngle = oldAngle + interval / 20;
      const x = Math.sin(newAngle) * yAxisDistance;
      const z = Math.cos(newAngle) * yAxisDistance;
      item.position.set(x, item.position.y, z);
      item.userData.oldAngle = newAngle;
    });
    // console.log('');
  }
}

export default LanternRender;
