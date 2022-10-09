import {
  BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  Color,
  Vector3,
  MeshBasicMaterial,
} from 'three';
import * as dat from 'dat.gui';

class DecorationDesignRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;
    this.meshList = [];

    this.init();
    this.guiInit();
  }

  init() {
    const material = new MeshStandardMaterial({
      color: new Color('#D8BFD8'),
    });
    // 墙体
    const wallGeometry = new BoxGeometry(4, 40, 60 - 4);

    const wallMesh = new Mesh(wallGeometry, material);
    for (let i = 0; i < 4; i++) {
      const tempMesh = wallMesh.clone();
      tempMesh.userData.meshType = 'wall';
      this.meshList.push(tempMesh);
      this.scene.add(tempMesh);
    }
    this.meshList[0].translateOnAxis(new Vector3(1, 0, 0), 30);
    this.meshList[1].translateOnAxis(new Vector3(-1, 0, 0), 30);
    /*
      可以理解为，物体本身也有一个xyz的坐标系
      在旋转物体的时候，物体自身的坐标轴也会跟着一起进行旋转
      移动旋转之后的物体对应的方向，也是依据于物体自身的坐标轴方向
    */
    this.meshList[2].translateOnAxis(new Vector3(0, 0, 1), 30);
    this.meshList[2].rotateY(Math.PI / 2);
    this.meshList[3].translateOnAxis(new Vector3(0, 0, -1), 30);
    this.meshList[3].rotateY(Math.PI / 2);

    // 墙角的柱子
    const pillarGeometry = new BoxGeometry(4, 40, 4);
    const pillarMesh = new Mesh(pillarGeometry, material);
    for (let i = 0; i < 4; i++) {
      const tempMesh = pillarMesh.clone();
      tempMesh.userData.meshType = 'pillar';
      this.meshList.push(tempMesh);
      this.scene.add(tempMesh);
    }
    const length = Math.pow(Math.pow(30, 2) * 2, 0.5);
    this.meshList[4].translateOnAxis(new Vector3(1, 0, 1).normalize(), length);
    this.meshList[5].translateOnAxis(new Vector3(-1, 0, 1).normalize(), length);
    this.meshList[6].translateOnAxis(new Vector3(-1, 0, -1).normalize(), length);
    this.meshList[7].translateOnAxis(new Vector3(1, 0, -1).normalize(), length);

    // 添加地面
    const basePlaneGeometry = new PlaneGeometry(100, 100);
    const planeMaterial = new MeshBasicMaterial({
      color: new Color('#8A2BE2'),
    });
    const basePlaneMesh = new Mesh(basePlaneGeometry, planeMaterial);
    basePlaneMesh.translateY(-20);
    basePlaneMesh.rotateX(- Math.PI / 2);
    this.scene.add(basePlaneMesh);
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
  }
}

export default DecorationDesignRender;
