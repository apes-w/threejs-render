import {
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  // PointsMaterial,
  Points,
  TextureLoader,
} from 'three';

import vertex from './shader/vertex.glsl';
import fragment from './shader/fragment.glsl';

import pointImg from '@/assets/image/particles/1.png';
import pointImg1 from '@/assets/image/particles/9.png';
import pointImg2 from '@/assets/image/particles/11.png';

const textureLoader = new TextureLoader();

class Particle {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.galaxyParams = {
      count: 1000, // 点的数量
      branch: 4, // 星系对应的柱的数量
      radius: 40, // 星臂最大的长度
    };

    this.init();
  }

  init() {
    const {
      count,
      branch,
      radius,
    } = this.galaxyParams;

    // 加载 点 的纹理
    const texture = textureLoader.load(pointImg);
    const texture1 = textureLoader.load(pointImg1);
    const texture2 = textureLoader.load(pointImg2);

    const position = new Float32Array(count * 3);
    const imgIndex = new Int32Array(count);
    for (let i = 0; i < count; i++) {
      // 计算出当前的点需要在第几条星臂上
      const branchAngel = (i % branch) * (Math.PI * 2 / branch);
      const radiusLength = Math.random() * radius;

      // 设置点在自己位置上的随机偏移量
      const randomX = Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (radius - radiusLength) * 0.3;
      const randomY = Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (radius - radiusLength) * 0.3;
      const randomZ = Math.pow(Math.random() * 2 - 1, 3) * 0.5 * (radius - radiusLength) * 0.3;

      // 设置当前点的坐标
      position[i * 3] = Math.cos(branchAngel) * radiusLength + randomX;
      position[i * 3 + 1] = randomY;
      position[i * 3 + 2] = Math.sin(branchAngel) * radiusLength + randomZ;

      imgIndex[i] = i % 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(position, 3));
    geometry.setAttribute('imgIndex', new BufferAttribute(imgIndex, 1))

    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: {
        uTexture: {
          value: texture,
        },
        uTexture1: {
          value: texture1,
        },
        uTexture2: {
          value: texture2,
        },
      },
    });

    const point = new Points(geometry, material);
    this.scene.add(point);
  }

  render() {}
}

export default Particle;
