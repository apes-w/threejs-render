import {
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  TextureLoader,
  CubeReflectionMapping,
  CubeRefractionMapping,
} from 'three';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

class CubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    // this.mergeTex = textureLoader.load(mergeImg);
    this.init();
  }

  init() {
    // 添加立方体
    // const geometry = new BoxGeometry(40, 40, 40);

    // 生成纹理
    const image = new Image();
    image.src = mergeImg;
    image.onload = (e) => {
      this.generateMaterial(e, image);
    }

    // const material = new MeshLambertMaterial({
    //   // color: 0x334455,
    //   map: this.mergeTex,
    // });
    
    // const mesh = new Mesh(geometry, material);
    // mesh.position.set(0, 0, 0);
    // this.scene.add(mesh);
  }

  generateMaterial(e, image) {
    const { width, height } = e.path[0];
    const singleWidth = width / 3;
    const singleHeight = height / 2;
    const canvasArr = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        const newCanvas = document.createElement('canvas');
        const ctx = newCanvas.getContext('2d');
        // todo ---------------
        // 上 - 中
        ctx.drawImage(image, );
      }
    }
  }
}

export default CubeRender;
