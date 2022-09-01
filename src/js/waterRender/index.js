import {
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  DoubleSide,
} from 'three';
import * as dat from 'dat.gui';

import vertexShader from './shader/vertex.vs.glsl';
import fragmentShader from './shader/fragment.fs.glsl';

let renderTime = 0;

class Water {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.uniformParams = {
      uWaveFrequency: { // 波浪大的运动轨迹
        min: 50.04,
        max: 50.187,
        step: 0.001,
        value: 50.1,
        guiShow: true,
      },
      uScale: { // 上下浮动的距离
        min: 0.2,
        max: 6,
        step: 0.01,
        value: 4.0,
        guiShow: true,
      },
      uNoiseScaleScope: { // 噪声发生的密集程度
        min: 120,
        max: 300,
        step: 1,
        value: 220,
        guiShow: true,
      },
      uNoiseScaleHeight: { // 噪声的上下浮动的距离
        min: 0.2,
        max: 10,
        step: 0.01,
        value: 0.4,
        guiShow: true,
      },
      uTime: {
        value: 0,
        guiShow: false,
      },
      uXSpeed: {
        min: 0,
        max: 5,
        step: 0.01,
        value: 0,
        guiShow: true,
      },
      uZSpeed: {
        min: 0,
        max: 5,
        step: 0.01,
        value: 0,
        guiShow: true,
      },
    };

    this.init();
  }

  setDatGui() {
    const gui = new dat.GUI();
    gui.width = 320;
    Object.entries(this.uniformParams).forEach(item => {
      const [
        propName,
        {
          min,
          max,
          step,
          guiShow,
        },
      ] = item;
      if (
        typeof min === 'number'
        && typeof max === 'number'
        && typeof step === 'number'
        && guiShow
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

  render(time) {
    renderTime += 1;
    if (renderTime >= 100) {
      renderTime = 0;
    }
    // const {
    //   uWaveFrequency,
    // } = this.uniformParams;
    // this.mesh.material.uniforms.uWaveFrequency.value =
    //   Math.sin(time / 20) * (uWaveFrequency.max - uWaveFrequency.min) + uWaveFrequency.min;
    this.mesh.material.uniforms.uTime.value = time;
  }
}

export default Water;
