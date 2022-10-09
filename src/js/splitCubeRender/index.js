import {
  BoxGeometry,
  // MeshBasicMaterial,
  ShaderMaterial,
  Mesh,
  TextureLoader,
} from 'three';

import vertex from './shader/vertexShader.glsl';
import fragment from './shader/fragmentShader.glsl';
import fiveImg from '@/assets/image/five.jpeg';

const textureLoader = new TextureLoader();

class SplitCubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;
    this.mesh = null;
    this.offsetStep = 0.2;

    this.init();
  }

  init() {
    const geometry = new BoxGeometry(40, 40, 40);
    // const material = new MeshBasicMaterial({
    //   color: 0xff3399,
    // });
    const imgTex = textureLoader.load(fiveImg);
    const material = new ShaderMaterial({
      uniforms: {
        uSceneWidth: {
          value: window.innerWidth,
        },
        uTexture: {
          value: imgTex,
        },
        uHorizontalOffset: {
          value: 0,
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 37:
        // 左箭头
        this.mesh.material.uniforms.uHorizontalOffset.value -= this.offsetStep;
        break;
      case 39:
        // 右箭头
        this.mesh.material.uniforms.uHorizontalOffset.value += this.offsetStep;
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.keyCode) {
      case 37:
        // 左箭头
        break;
      case 39:
        // 右箭头
        break;
    }
  }
}

export default SplitCubeRender;
