import {
  BoxGeometry,
  PlaneGeometry,
  ExtrudeGeometry,
  BufferGeometry,
  MeshStandardMaterial,
  Mesh,
  Color,
  Vector3,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  TextureLoader,
  MOUSE,
  Shape,
  LineCurve3,
  ShaderMaterial,
  Group,
} from 'three';
import * as dat from 'dat.gui';
import assetImage from '@/assets/image/five.jpeg';

import vertexShader from './shader/vertexShader.glsl';
import fragmentShader from './shader/fragmentShader.glsl';


const textureLoader = new TextureLoader();
const imgTex = textureLoader.load(assetImage);

// 墙体的颜色
const wallColor = new Color('#D8BFD8');
// 墙角的柱子的颜色
const pillarColor = new Color('#ADD8E6');
// 度数 - 1°
const singleRad = Math.PI / 180;

/*
  装修移动墙体的思路
  可以生成两套模型，一套是完成的带有墙体和柱子的模型
  在需要自定义墙体的位置时，可以隐藏墙体和柱子
  另外生成一套用来代表墙体和柱子的平面
  然后对平面进行操作，包括添加、移动、删除这些的操作
  在操作结束之后，根据平面的位置，生成新的墙体和柱子
*/

/*
  实现了对于debug模型的点击操作之后，修改 threejs 渲染的界面的大小
  在右边留一部分用于操作按钮的区域
*/

class DecorationDesignRender {
  constructor(val) {
    const { scene, camera } = val;
    this.scene = scene;
    this.camera = camera;

    this.wallMeshGroup = new Group(); // 真实墙体
    this.wallDepth = 6; // 墙体的默认厚度
    this.wallHeight = 50; // 墙体的默认高度
    this.pillarMeshGroup = new Group(); // 真实柱子
    this.planeWallMeshList = []; // 代表墙体的平面
    this.planePillarMeshList = []; // 代表柱子的平面
    this.uniformList = [];

    this.debugMesh = {};
    this.debugUniformParams = {};

    this.scene.add(this.wallMeshGroup);
    this.scene.add(this.pillarMeshGroup);

    this.init();
    // this.debugInit();
    this.guiInit();
  }

  // 以坐标原点为中心
  // 可以理解为平行四边形挤压出的几何体
  /**
   * 
   * @param {Object} directionVec 墙体的方向的向量
   * @param {String} axesType 依据于哪一条边创建平行四边形
   */
  createLineGeometry(directionVec, axesType) {
    // 使用挤压几何体之后，定义的方向的角度是依据于z轴负方向绘制的
    const width = this.wallDepth; // 平行四边形较窄的边的默认长度
    const depth = this.wallHeight;
    const pointArr = []; // 需要移动的点位
    if (axesType === 'x') {
      const directionTempVec = directionVec.clone().rotateAround(new Vector2(0, 0), -Math.PI / 2);
      pointArr.push({ x: directionTempVec.x, y: directionTempVec.y });

      const diagonalVec = new Vector2().addVectors(directionVec, new Vector2(0, width)).rotateAround(new Vector2(0, 0), -Math.PI / 2);
      pointArr.push({ x: diagonalVec.x, y: diagonalVec.y });

      pointArr.push({ x: width, y: 0 });
    } else {
      pointArr.push({ x: 0, y: -width });

      const diagonalVec = new Vector2().addVectors(new Vector2(width, 0), directionVec).rotateAround(new Vector2(0, 0), -Math.PI / 2);
      pointArr.push({ x: diagonalVec.x, y: diagonalVec.y });

      const directionTempVec = directionVec.clone().rotateAround(new Vector2(0, 0), -Math.PI / 2);
      pointArr.push({ x: directionTempVec.x, y: directionTempVec.y });
    }
    pointArr.push({ x: 0, y: 0 });

    const shape = new Shape();
    shape.moveTo(0, 0);
    pointArr.forEach(({ x, y }) => {
      shape.lineTo(x, y);
    });

    return new ExtrudeGeometry(shape, {
      steps: 3,
      bevelThickness: 0,
      bevelSize: 0,
      extrudePath: new LineCurve3(
        new Vector3(0, -depth / 2, 0),
        new Vector3(0, depth / 2, 0),
      ),
    });
  }

  // 以两个柱子作为参照创建墙体
  // 使用柱子的中心点作为计算的坐标
  /**
   * 
   * @param {Object} pilarLocation1 第一个柱子的位置
   * @param {Object} pilarLocation2 第二个柱子的位置
   * @param {string} axesType 两个柱子中间的墙体连接到柱子的哪一个面
   */
  createWallMesh(pilarLocation1 = {}, pilarLocation2 = {}, axesType) {
    let { x: x1, z: z1 } = pilarLocation1;
    let { x: x2, z: z2 } = pilarLocation2;
    /*
      这里需要在二维上进行计算，需要将y轴的坐标进行反转
    */
    z1 = -z1;
    z2 = -z2;

    const startVec = new Vector2(x1, z1);
    const startTranslateVec = startVec.clone();
    const endVec = new Vector2(x2, z2);
    let tempX = 0;
    let tempY = 0;
    if (axesType === 'x') {
      tempX = startVec.x + (this.wallDepth / 2 * (x1 < x2 ? 1 : -1));
      tempY = startVec.y - this.wallDepth / 2;
      startVec.setX(tempX);
      startTranslateVec.set(tempX, tempY);
    } else if (axesType === 'z') {
      tempX = startVec.x - this.wallDepth / 2;
      tempY = startVec.y + (this.wallDepth / 2 * (z1 < z2 ? 1 : -1));
      startVec.setY(tempY);
      startTranslateVec.set(tempX, tempY);
    }
    if (axesType === 'x') {
      endVec.setX(endVec.x + (this.wallDepth / 2 * (x1 < x2 ? -1 : 1)));
    } else if (axesType === 'z') {
      endVec.setY(endVec.y + (this.wallDepth / 2 * (z1 < z2 ? -1 : 1)));
    }
    const directVec = new Vector2().subVectors(endVec, startVec);

    // 求墙体内部的角度
    const axesVec = new Vector2(0, 0);
    if (axesType === 'x') {
      axesVec.setX(1);
    } else {
      axesVec.setY(1);
    }
    const angleCos = axesVec.dot(directVec.clone().normalize());
    let angle = Math.acos(angleCos);
    if (angle > Math.PI / 2) angle -= Math.PI / 2;

    const geometry = this.createLineGeometry(directVec, axesType);
    // geometry.computeVertexNormals(); // 计算顶点的法向量
    const material = new ShaderMaterial({
      uniforms: {
        uTexture: {
          value: imgTex,
        },
        // 先使用平行光做出一个效果
        uDirection: {
          // 平行光的方向为，从亮处到暗处的反方向
          value: new Vector3(30, 30, 50).normalize(),
        },
        uColor: {
          value: wallColor,
        },
        // 漫反射的颜色
        uAmbientLightColor: {
          value: new Color('#BFBFBF'),
        },
        uLightColor: {
          value: new Color('#ffffff'),
        },
        // 最后渲染的卡片的大小
        uCardSize: {
          value: 10,
        },
        // 点光源的位置
        uLightPosition: {
          value: new Vector3(30, 30, 100),
        },
        // 点击的位置
        uClickPoint: {
          value: new Vector3(0, 0, 0),
        },
        // 点击位置对应的uv
        uClickPointUV: {
          value: new Vector2(0, 0),
        },
        // 点击的位置，对应面的法向量
        uClickNormal: {
          value: new Vector3(0, 0, 0),
        },
      },
      vertexShader,
      fragmentShader,
    });
    const mesh = new Mesh(geometry, material);
    // 需要将墙体移动到第一个柱子的位置
    const translateLength = startTranslateVec.length();
    mesh.translateOnAxis(new Vector3(startTranslateVec.x, 0, -startTranslateVec.y).normalize(), translateLength);
    this.wallMeshGroup.add(mesh);
  }

  init() {
    this.scene.add(this.wallMeshGroup);

    const baseWallLength = 60; // 墙体的长度
    // 创建墙角的柱子
    const pillarMaterial = new MeshStandardMaterial({
        color: pillarColor,
    });
    const pillarGeometry = new BoxGeometry(this.wallDepth, this.wallHeight, this.wallDepth);

    const pillarMesh1 = new Mesh(pillarGeometry.clone(), pillarMaterial.clone());
    // 左上角
    pillarMesh1.translateX(-baseWallLength);
    pillarMesh1.translateZ(-baseWallLength / 2);
    this.pillarMeshGroup.add(pillarMesh1);

    const pillarMesh2 = new Mesh(pillarGeometry.clone(), pillarMaterial.clone());
    // 左下角
    pillarMesh2.translateX(-baseWallLength / 2);
    pillarMesh2.translateZ(baseWallLength / 2);
    this.pillarMeshGroup.add(pillarMesh2);

    const pillarMesh3 = new Mesh(pillarGeometry.clone(), pillarMaterial.clone());
    // 右下角
    pillarMesh3.translateX(baseWallLength / 2);
    pillarMesh3.translateZ(baseWallLength / 2);
    this.pillarMeshGroup.add(pillarMesh3);

    const pillarMesh4 = new Mesh(pillarGeometry.clone(), pillarMaterial.clone());
    // 右上角
    pillarMesh4.translateX(baseWallLength);
    pillarMesh4.translateZ(-baseWallLength / 2);
    this.pillarMeshGroup.add(pillarMesh4);

    // 使用四个柱子的坐标创建墙体
    this.createWallMesh(
      { x: -baseWallLength, z: -baseWallLength / 2 }, // 左上角
      { x: -baseWallLength / 2, z: baseWallLength / 2 }, // 左下角
      'z',
    );
    this.createWallMesh(
      { x: -baseWallLength / 2, z: baseWallLength / 2 }, // 左下角
      { x: baseWallLength / 2, z: baseWallLength / 2 }, // 右下角
      'x',
    );
    this.createWallMesh(
      { x: baseWallLength / 2, z: baseWallLength / 2 }, // 右下角
      { x: baseWallLength, z: -baseWallLength / 2 }, // 右上角
      'z',
    );
    this.createWallMesh(
      { x: baseWallLength, z: -baseWallLength / 2 }, // 右上角
      { x: -baseWallLength, z: -baseWallLength / 2 }, // 左上角
      'x',
    );

    // const material = new ShaderMaterial({
    //   vertexShader,
    //   fragmentShader,
    // });

    // // 创建初始的四面墙
    // const baseWallLength = 60; // 墙体的长度
    // const wallTranslateLength = Math.pow(Math.pow(baseWallLength / 2, 2) * 2, 0.5);

    // const wallGeometry1 = this.getLineGeometry(baseWallLength, singleRad * 90, -singleRad * 90);
    // const wallMesh1 = new Mesh(wallGeometry1, material.clone());
    // wallMesh1.translateOnAxis(
    //   new Vector3(-baseWallLength / 2 - this.wallDepth, 0, baseWallLength / 2 + this.wallDepth).normalize(),
    //   wallTranslateLength
    // );
    // this.wallMeshGroup.add(wallMesh1);
  }

  debugInit() {
    const imgTex = textureLoader.load(assetImage);
    // const material = new MeshStandardMaterial({
    //   color: wallColor,
    // });
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
    });
    // const geometry = new BoxGeometry(30, 40, 50);
    const geometry = this.getLineGeometry(50, singleRad * 40, -singleRad * 76);
    
    this.debugUniformParams = {
      uTexture: {
        value: imgTex,
      },
      uFaceNormal: {
        value: new Vector3(0, 0, 0),
      },
      uClickPoint: {
        value: new Vector3(0, 0, 0),
      },
      uCardSize: {
        value: 6,
      },
    };

    const mesh = new Mesh(geometry, material);
    this.debugMesh = mesh;
    this.scene.add(mesh);
  }

  setControlMode(control) {
    control.mouseButtons = {
      RIGHT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
    };
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;

    gui.domElement.addEventListener('click', (e) => {
      e.stopPropagation();
      return false;
    });

    this.funcValue = {
      isModifyWall: false,
    };

    const wallFuncFolder = gui.addFolder('墙体操作');

    // 添加按钮
    const guiFunc = {
      addPillar: () => {
        console.log('添加柱子');
      },
      removePillar: () => {
        console.log('删除柱子');
      },
    };

    wallFuncFolder
      .add(this.funcValue, 'isModifyWall')
      .name('自定义柱子');
    wallFuncFolder
      .add(guiFunc, 'addPillar')
      .name('添加柱子');
    wallFuncFolder
      .add(guiFunc, 'removePillar')
      .name('删除柱子');
  }

  // 根据相机位置和在屏幕上点击的位置生成一条射线
  getRaycaster(width, height) {
    // 将屏幕坐标系转换为标准设备坐标
    const x = (width / window.innerWidth) * 2 - 1;
    const y = -(height / window.innerHeight) * 2 + 1;
    const mouse = new Vector2(x, y);
    const ray = new Raycaster();
    ray.setFromCamera(mouse, this.camera);
    return ray;
  }

  handleClick(e) {
    const ray = this.getRaycaster(e.clientX, e.clientY);

    const interArr = ray.intersectObjects(this.wallMeshGroup.children);
    console.log(interArr);
    if (interArr.length) {
      const [
        {
          face,
          object,
          point,
          uv,
        },
      ] = interArr;
      object.material.uniforms.uClickPoint.value = point;
      object.material.uniforms.uClickPointUV.value = uv;
      object.material.uniforms.uClickNormal.value = face.normal.normalize();
    }
  }
}

export default DecorationDesignRender;
