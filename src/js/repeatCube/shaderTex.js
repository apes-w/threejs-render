import {
  BoxGeometry,
  TextureLoader,
  ShaderMaterial,
  Mesh,
  Vector3,
  // BufferAttribute,
} from 'three';

import vertexShader from './shader/vertexShader.glsl';
import fragmentShader from './shader/fragmentShader.glsl';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

class CubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.init();
  }

  init() {
    const texture = textureLoader.load(mergeImg);

    // 添加立方体
    const geometry = new BoxGeometry(40, 40, 40);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {
          value: texture,
        },
        uGeometrySize: {
          value: new Vector3(40, 40, 40),
        },
      },
    });

    const mesh = new Mesh(geometry, material);
    console.log(mesh);
    this.scene.add(mesh);
  }
}

export default CubeRender;
