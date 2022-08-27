import {
  ShaderMaterial,
  LoadingManager,
  EquirectangularReflectionMapping,
  DoubleSide,
  Vector3,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import environmentImg from '@/assets/image/2k.hdr';
import flyLightModel from '@/assets/model/flyLight.glb';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

class LanternRender {
  constructor(scene) {
    this.scene = scene;

    this.loadManager = new LoadingManager();
    this.loadManager.onLoad = this.loadSuccess;
    this.loadManager.onError = this.loadError;
    this.loader = new RGBELoader(this.loadManager);

    this.gltfLoader = new GLTFLoader();

    this.init();
  }

  // 加载成功
  loadSuccess(val) {
    console.log(val);
  }
  // 加载失败
  loadError(val) {
    console.log('失败', val);
  }

  init() {
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
      for (let i =0; i < 100; i++) {
        let tempFlyLight = modelMesh.clone(true);
        let x = (Math.random() - 0.5) * 600;
        let z = (Math.random() - 0.5) * 600;
        let y = Math.random() * 200 + 40;
        tempFlyLight.position.set(x, y, z);
        tempFlyLight.scale.set(2.5, 2.5, 2.5);
        this.scene.add(tempFlyLight);
      }
    });
  }

  setShaderMaterial(mesh) {
    const shaderMaterial = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: DoubleSide,
    });
    mesh.material = shaderMaterial;
  }
}

export default LanternRender;
