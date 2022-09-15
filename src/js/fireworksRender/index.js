import {
  BoxGeometry,
  ShaderMaterial,
  MeshLambertMaterial,
  Mesh,
  BufferGeometry,
  Points,
  BufferAttribute,
} from 'three';

import vertexShader from './shader/fireworks/vertex.glsl';
import fragmentShader from './shader/fireworks/fragment.glsl';

const getRandomScale = (min = 5, max = 10) => {
  return Math.random() * (max - min) + min;
};

class Fireworks{
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    // 烟花的mesh
    this.fireworksList = [];
    // 烟花爆炸效果的mesh
    this.fireworksExplorerList = [];

    this.init();
  }

  // 初始化一个立方体，作为参照
  init() {
    const geometry = new BoxGeometry(20, 20, 20);
    const material = new MeshLambertMaterial({
      color: 0xff0000,
    });

    this.boxMesh = new Mesh(geometry, material);
    this.boxMesh.position.set(0, -10, 0);
    this.scene.add(this.boxMesh);
  }

  // 生成烟花
  generateFirework() {
    const geometry = new BufferGeometry();

    const position = new Float32Array(3);
    position[0] = 0;
    position[1] = 0;
    position[2] = 0;
    geometry.setAttribute('position', new BufferAttribute(position, 3));

    // const direction = new Float32Array(3);
    const theta = Math.random() * 2 * Math.PI; // 水平方向上的任意角度
    const beta = Math.random() * Math.PI; // 数值方向上的任意角度
    // const r = Math.random();
    // direction[0] = Math.sin(theta) + Math.sin(beta);
    // direction[1] = Math.cos(theta) + Math.cos(beta);
    // direction[2] = Math.sin(theta) + Math.cos(beta);
    geometry.setAttribute(
      'aDirectionX',
      new BufferAttribute(new Float32Array([theta]), 1)
    );
    geometry.setAttribute(
      'aDirectionY',
      new BufferAttribute(new Float32Array([beta]), 1));

    const aLengthArr = new Float32Array([0]);
    geometry.setAttribute('aLength', new BufferAttribute(aLengthArr, 1));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {},
    });

    const points = new Points(geometry, material);
    this.fireworksList.push(points);
    this.scene.add(points);
  }

  // 生成烟花爆炸的效果
  generateFireworksExplorer() {}

  // 点击事件触发后调用的函数
  handleClick() {
    this.generateFirework();
  }

  render(time, interval) {
    // 根据interval重复设置点移动的距离length
    // this.mesh.geometry.setAttribute();
    this.fireworksList = this.fireworksList.reduce((val, item) => {
      const newLength = item.geometry.getAttribute('aLength').array.map(item => item + interval);
      // 判断是否要移除mesh
      if (newLength[0] > 9) {
        item.geometry.dispose();
        item.material.dispose();
        this.scene.remove(item);
      } else {
        item.geometry.setAttribute('aLength', new BufferAttribute(newLength, 1));
        val.push(item);
      }
      return val;
    }, []);
  }
}

export default Fireworks;
