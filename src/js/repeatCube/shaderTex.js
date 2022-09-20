import {
  BoxGeometry,
  TextureLoader,
} from 'three';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

class CubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.init();
  }

  init() {
    // 添加立方体
    const geometry = new BoxGeometry(40, 40, 40);
  }
}

export default CubeRender;
