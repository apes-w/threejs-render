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
        value: 1,
        guiShow: true,
      },
      uNoiseScaleScope: { // 噪声发生的密集程度
        min: 320,
        max: 700,
        step: 1,
        value: 420,
        guiShow: true,
      },
      uNoiseScaleHeight: { // 噪声的上下浮动的距离
        min: 0.2,
        max: 10,
        step: 0.01,
        value: 3.6,
        guiShow: true,
      },
      uNoiseSpeed: {
        min: 10,
        max: 40,
        step: 1,
        value: 25,
        guiShow: true,
      },
      uTime: {
        value: 0,
        guiShow: false,
      },
      uXSpeed: {
        min: 0,
        max: 30,
        step: 0.1,
        value: 0,
        guiShow: true,
      },
      uZSpeed: {
        min: 0,
        max: 30,
        step: 0.1,
        value: 0,
        guiShow: true,
      },
      uOpacity: {
        min: 0,
        max: 1,
        step: 0.01,
        value: 1,
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
      const randomNum = Math.random();
      let setValue = 0;
      if (Math.random() < 0.5) {
        setValue = this.mesh.material.uniforms.uXSpeed.value;
        if (randomNum < 0.3) {
          setValue += 0.2;
        } else {
          setValue -= 0.1;
        }
        if (setValue >= 0) {
          this.mesh.material.uniforms.uXSpeed.value = setValue;
        }
      } else {
        setValue = this.mesh.material.uniforms.uZSpeed.value;
        if (randomNum < 0.6) {
          setValue += 0.1;
        } else {
          setValue -= 0.2;
        }
        if (setValue >= 0) {
          this.mesh.material.uniforms.uZSpeed.value = setValue;
        }
      }
    }
    this.mesh.material.uniforms.uTime.value = time / 70;
  }
}

export default Water;
