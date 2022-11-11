import {
  Mesh,
  PlaneGeometry,
  BufferGeometry,
  CircleGeometry,
  MeshBasicMaterial,
  // PointsMaterial,
  // ShaderMaterial,
  Color,
  BufferAttribute,
  Points,
  Vector2,
  Raycaster,
} from 'three';

import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

/*
  渲染大量的随机点的坐标，并且将点以较好的形式，渲染在指定的区域上
*/

function getRandomPoint() {
  const resArr = [];
  // 横坐标在[-500, 500]之间，纵坐标在[-1000, 1000]之间
  for (let i = 0; i < 10000; i++) {
    resArr.push([
      (Math.random() - 0.5) * 2 * 500,
      (Math.random() - 0.5) * 2 * 1000,
    ]);
  }
  return resArr;
}

// 合并排序
function mergeSort(list) {
  var len = list.length;
  var tempArr = new Array(len);

  function mergeArr(left, middle, right) {
    var i = left;
    var j = middle + 1;
    var k = 0;
    for (k = left; k <= right; k++) {
      tempArr[k] = list[k];
    }
    for (k = left; k <= right; k++) {
      if (i > middle) {
        list[k] = tempArr[j++];
      } else if (j > right) {
        list[k] = tempArr[i++];
      } else if (tempArr[i] > tempArr[j]) {
        list[k] = tempArr[j++];
      } else {
        list[k] = tempArr[i++];
      }
    }
  }

  for (var i = 1; i < len; i += i) {
    for (var j = 0; j < len - i; j += i + i) {
      mergeArr(j, i + j - 1, Math.min(j + i + i - 1, len - 1));
    }
  }
}

function getMaxPosition(list) {
  const tempX = list.map(item => item[0]);
  const tempY = list.map(item => item[1]);
  mergeSort(tempX);
  mergeSort(tempY);
  return {
    maxX: [tempX.shift(), tempX.pop()],
    maxY: [tempY.shift(), tempY.pop()],
  };
}

class MultipleParticleRender {
  constructor(threeVal) {
    const { scene, camera } = threeVal;
    this.scene = scene;
    this.camera = camera;
    this.pointList = getRandomPoint();
    this.maxArea = getMaxPosition(this.pointList);
    this.mesh = null;
    this.pointMesh = null;
    this.baseSize = { x: 80, y: 70 };

    this.init();
    this.pointInit();
  }

  init() {
    const geometry = new PlaneGeometry(this.baseSize.x, this.baseSize.y);
    const material = new MeshBasicMaterial({
      color: new Color('#378282'),
    });

    this.mesh = new Mesh(geometry, material);
    console.log(this.mesh);
    this.scene.add(this.mesh);
    
  }

  pointInit() {
    const baseCircleGeometry = new CircleGeometry(2, 26);
    const material = new MeshBasicMaterial({
      color: new Color('#CC7150'),
    });
    const mergeGeometry = new BufferGeometry();

    const positionArr = [];
    const normalArr = [];
    const uvArr = [];
    let tempArr = [];
    const { maxX, maxY } = this.maxArea;
    const maxXAbs = Math.max(Math.abs(maxX[0]), Math.abs(maxX[1]));
    const maxYAbs = Math.max(Math.abs(maxY[0]), Math.abs(maxY[1]));
    const { x: baseSizeX, y: baseSizeY } = this.baseSize;
    this.pointList.forEach(item => {
      const [x, y] = item
      const cloneGeometry = baseCircleGeometry.clone();
      cloneGeometry.translate(
        baseSizeX * (x / maxXAbs),
        baseSizeY * (y / maxYAbs),
        0.1
      );
      tempArr = cloneGeometry.getAttribute('position').array;
      tempArr.forEach(numItem => {
        positionArr.push(numItem);
      });
      tempArr = cloneGeometry.getAttribute('normal').array;
      tempArr.forEach(numItem => {
        normalArr.push(numItem);
      });
      tempArr = cloneGeometry.getAttribute('uv').array;
      tempArr.forEach(numItem => {
        uvArr.push(numItem);
      });
      cloneGeometry.dispose();
    });

    mergeGeometry.setAttribute(
      'position',
      new BufferAttribute(Float32Array.from(positionArr), 3),
    );
    mergeGeometry.setAttribute(
      'normal',
      new BufferAttribute(Float32Array.from(normalArr), 3),
    );
    mergeGeometry.setAttribute(
      'uv',
      new BufferAttribute(Float32Array.from(uvArr), 3),
    );

    this.pointMesh = new Mesh(mergeGeometry, material);
    this.scene.add(this.pointMesh);
  }

  getRaycaster(width, height) {
    const x = (width / window.innerWidth) * 2 - 1;
    const y = (height / window.innerHeight) * 2 + 1;
    const mouse = new Vector2(x, y);
    const ray = new Raycaster();
    ray.setFromCamera(mouse, this.camera);
    return ray;
  }

  handleClick(e) {
    const ray = this.getRaycaster(e.clientX, e.clientY);
    console.log(ray);

    const interArr = ray.intersectObject(this.pointMesh);
    console.log(interArr);
  }
}

export default MultipleParticleRender;
