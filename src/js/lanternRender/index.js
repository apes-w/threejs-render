import {
  LoadingManager,
  EquirectangularReflectionMapping,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import environmentImg from '@/assets/image/2k.hdr';

class LanternRender {
  constructor(scene) {
    this.scene = scene;

    this.loadManager = new LoadingManager();
    this.loadManager.onLoad = this.loadSuccess;
    this.loadManager.onError = this.loadError;
    this.loader = new RGBELoader(this.loadManager);
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
  }
}

export default LanternRender;
