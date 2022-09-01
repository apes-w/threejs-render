import {
  RawShaderMaterial,
  DoubleSide,
  Mesh,
  PlaneGeometry,
} from 'three';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

class MainRender {
  constructor(val) {
    const {
      scene,
    } = val;
    this.scene = scene;
    this.init();
  }

  // 加载成功
  loadSuccess() {}
  // 加载失败
  loadError() {}

  // 初始化
  init() {
    const shaderMaterial = new RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: DoubleSide, // 双面渲染
      uniforms: {
        uTime: {
          value: 0,
        },
        uJsChange: {
          value: 10.0,
        },
      },
    });

    this.mesh = new Mesh(
      new PlaneGeometry(30, 20, 30, 30),
      shaderMaterial,
    );

    this.scene.add(this.mesh);
  }

  render(time) {
    this.mesh.material.uniforms.uTime.value = time;
  }
}

export default MainRender;
