import {
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  DoubleSide,
} from 'three';
import * as dat from 'dat.gui';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

class Water {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.params = {
      uWaveFrequency: 50,
      uScale: 10.0, // 上下浮动的距离
    };

    this.init();
  }

  setDatGui() {
    const gui = new dat.GUI();
    gui
      .add(this.params, 'uWaveFrequency')
      .min(49)
      .max(51)
      .step(0.01)
      .onChange((val) => {
        this.mesh.material.uniforms.uWaveFrequency.value = val;
      });
    gui
      .add(this.params, 'uScale')
      .min(6)
      .max(15)
      .step(0.1)
      .onChange((val) => {
        this.mesh.material.uniforms.uScale.value = val;
      });
  }

  init() {
    const geometry = new PlaneGeometry(100, 100, 200, 200);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      uniforms: Object.entries(this.params).reduce((val, item) => {
        val[item[0]] = { value: item[1] };
        return val;
      }, {}),
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.rotateX(-Math.PI / 2);
    this.scene.add(this.mesh);

    this.setDatGui();
  }

  render() {}
}

export default Water;
