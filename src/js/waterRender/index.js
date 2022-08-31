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

    this.uniformParams = {
      uWaveFrequency: {
        min: 49.9,
        max: 50.2,
        step: 0.001,
        value: 50,
      },
      uScale: { // 上下浮动的距离
        min: 3,
        max: 15,
        step: 0.1,
        value: 10.0,
      },
    };

    this.init();
  }

  setDatGui() {
    const gui = new dat.GUI();
    Object.entries(this.uniformParams).forEach(item => {
      const [
        propName,
        {
          min,
          max,
          step,
        },
      ] = item;
      if (
        typeof min === 'number'
        && typeof max === 'number'
        && typeof step === 'number'
      ) {
        gui
          .add(this.uniformParams[propName], 'value')
          .min(min)
          .max(max)
          .step(step)
          .name(propName)
          .onChange((val) => {
            this.mesh.material.uniforms[propName].value = val;
          });
      }
    });
  }

  init() {
    const geometry = new PlaneGeometry(100, 100, 200, 200);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      uniforms: Object.entries(this.uniformParams).reduce((val, item) => {
        val[item[0]] = { value: item[1].value };
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
