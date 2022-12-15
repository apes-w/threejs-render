import {
  BoxGeometry,
  TextureLoader,
  ShaderMaterial,
  Mesh,
  Vector3,
  Vector2,
  Raycaster,
} from 'three';

import vertexShader from './shader/vertexShader.glsl';
import fragmentShader from './shader/fragmentShader.glsl';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

window.onload = () => {
  // 添加展示的组件
  const textContainer = document.getElementById('text-container');
  textContainer.style.userSelect = 'none';
  textContainer.style.position = 'absolute';
  textContainer.style.left = '10px';
  textContainer.style.top = '10px';
  textContainer.style.width = 'calc(100% - 42px)';
  textContainer.style.height = '60px';
  textContainer.style.padding = '6px';
  textContainer.style.backgroundColor = '#B0C4DE';

  const p1 = document.createElement('p');
  p1.innerText = '0';
  textContainer.appendChild(p1);
  window.eventBus.add('setP1Text', (val) => {
    p1.innerText = `${val}`;
  });

  const p2 = document.createElement('p');
  p2.innerText = '0';
  textContainer.appendChild(p2);
  window.eventBus.add('setP2Text', (val) => {
    p2.innerText = `${val}`;
  });

  const pEnd = document.createElement('p');
  pEnd.innerText = '0';
  textContainer.appendChild(pEnd);
  window.eventBus.add('setPEndText', (val) => {
    pEnd.innerText = `${val}`;
  });
};

// 添加一个距离测量的功能
// 可以尝试在有曲面或者不在同一个面上时，获取两点之间在几何体面上的距离
// 类比蚂蚁从一个点走到另一个点

class CubeRender {
  constructor(val) {
    const { scene, camera } = val;
    this.scene = scene;
    this.camera = camera;
    this.mesh = null;
    this.changePointIndex = false;

    this.init();
  }

  init() {
    const texture = textureLoader.load(mergeImg);

    // 添加立方体
    const geometry = new BoxGeometry(40, 40, 40);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      defines: {
        PI: 3.141592653589793,
      },
      uniforms: {
        uTexture: {
          value: texture,
        },
        uGeometrySize: {
          value: new Vector3(40, 40, 40),
        },
        repeatNum: {
          value: 3,
        },
      },
    });

    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  getRaycaster(width, height) {
    const x = (width / window.innerWidth) * 2 - 1;
    const y = -(height / window.innerHeight) * 2 + 1;
    const mouse = new Vector2(x, y);
    const ray = new Raycaster();
    ray.setFromCamera(mouse, this.camera);
    return ray;
  }

  handlerClick(e) {
    // 利用射线，获取点击的数据
    const ray = this.getRaycaster(e.clientX, e.clientY);
    const inter = ray.intersectObject(this.mesh, true);
    console.log(inter);
    const [{ point }] = inter;
    // changePointIndex 切换需要设置的点的下标

    if (!this.changePointIndex) {
      window.eventBus.dispatch('setP1Text', JSON.stringify({
        x: point.x,
        y: point.y,
        z: point.z,
      }))
    } else {
      window.eventBus.dispatch('setP2Text', JSON.stringify({
        x: point.x,
        y: point.y,
        z: point.z,
      }))
    }
    this.changePointIndex = !this.changePointIndex;
  }
}

export default CubeRender;
