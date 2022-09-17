import {
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  TextureLoader,
} from 'three';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

class CubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.mergeTex = textureLoader.load(mergeImg);
    this.mergeTex.repeat.set(3, 2);
    this.mergeTex.offset.set(-0.8, -0.6);

    this.init();
  }

  init() {
    // 添加立方体
    const geometry = new BoxGeometry(40, 40, 40);
    const material = new MeshLambertMaterial({
      // color: 0x334455,
      map: this.mergeTex,
    });
    
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
  }
}

export default CubeRender;
