import {
  BoxGeometry,
  // MeshBasicMaterial,
  ShaderMaterial,
  Mesh,
} from 'three';

import vertex from './shader/vertexShader.glsl';
import fragment from './shader/fragmentShader.glsl';

class SplitCubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;
    this.mesh = null;

    this.init();
  }

  init() {
    const geometry = new BoxGeometry(40, 40, 40);
    // const material = new MeshBasicMaterial({
    //   color: 0xff3399,
    // });
    const material = new ShaderMaterial({
      uniforms: {
        uSceneWidth: {
          value: window.innerWidth,
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.mesh = new Mesh(geometry, material);
    console.log(this.mesh);
    this.scene.add(this.mesh);
  }

  // handleResize() {
  //   if (this.mesh) {
  //     console.log(this.mesh);
  //     this.mesh.material.uniforms.uSceneWidth.value = window.innerWidth;
  //   }
  // }
}

export default SplitCubeRender;
