import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from 'three';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

/*
  渲染大量的随机点的坐标，并且将点以较好的形式，渲染在指定的区域上
*/

function getRandomPoint() {
  const resArr = [];
  // 横坐标在[-500, 500]之间，纵坐标在[-1000, 1000]之间
  for (let i = 0; i < 100000; i++) {
    resArr.push([
      (Math.random() - 0.5) * 2 * 500,
      (Math.random() - 0.5) * 2 * 1000,
    ]);
  }
  return resArr;
}

class MultipleParticleRender {
  constructor(threeVal) {
    const { scene } = threeVal;
    this.scene = scene;
    this.pointList = getRandomPoint();
    this.mesh = null;

    console.log(this.pointList);

    this.init()
  }

  init() {
    const geometry = new PlaneGeometry(80, 70);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uPointList: {
          value: this.pointList.map(item => new Vector2(item[0], item[1]))
        },
      },
    });

    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);
  }
}

export default MultipleParticleRender;
