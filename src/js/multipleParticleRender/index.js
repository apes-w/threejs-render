import {
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  // PointsMaterial,
  ShaderMaterial,
  Color,
  BufferGeometry,
  BufferAttribute,
  Points,
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
    const { scene } = threeVal;
    this.scene = scene;
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
    const { maxX, maxY } = this.maxArea;
    const maxXAbs = Math.max(Math.abs(maxX[0]), Math.abs(maxX[1]));
    const maxYAbs = Math.max(Math.abs(maxY[0]), Math.abs(maxY[1]));
    const geometry = new BufferGeometry();
    const positionList = Float32Array.from(this.pointList.reduce((val, item) => {
      // val.push(...item, 0.1);
      let [x, y] = item;
      x = this.baseSize.x / 2 * (x / maxXAbs);
      y = this.baseSize.y / 2 * (y / maxYAbs);
      val.push(x, y, 0.1);
      return val;
    }, []));
    geometry.setAttribute('position', new BufferAttribute(positionList, 3));
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMaxAreaX: {
          value: Math.max(Math.abs(maxX[0]), Math.abs(maxX[1])),
        },
        uMaxAreaY: {
          value: Math.max(Math.abs(maxY[0]), Math.abs(maxY[1])),
        },
        uAreaSize: {
          value: new Vector2(this.baseSize.x, this.baseSize.y),
        },
      },
    });
    this.pointMesh = new Points(geometry, material);
    console.log(this.pointMesh);
    this.pointMesh.scale.set(1.5, 1.5, 1.5);
    this.scene.add(this.pointMesh);
  }
}

export default MultipleParticleRender;
