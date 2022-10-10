import {
  BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  Color,
  Vector3,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
} from 'three';
import * as dat from 'dat.gui';

class DecorationDesignRender {
  constructor(val) {
    const { scene, camera } = val;
    this.scene = scene;
    this.camera = camera;
    this.wallMeshList = [];
    this.pillarMeshList = [];

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
      this.wallMeshList.push(tempMesh);
      this.scene.add(tempMesh);
      this.changeWallMaterial(tempMesh.material);
    }
    this.wallMeshList[0].translateOnAxis(new Vector3(1, 0, 0), 30);
    this.wallMeshList[0].userData = {
      ...this.wallMeshList[0].userData,
    };
    this.wallMeshList[1].translateOnAxis(new Vector3(-1, 0, 0), 30);
    /*
      可以理解为，物体本身也有一个xyz的坐标系
      在旋转物体的时候，物体自身的坐标轴也会跟着一起进行旋转
      移动旋转之后的物体对应的方向，也是依据于物体自身的坐标轴方向
    */
    this.wallMeshList[2].translateOnAxis(new Vector3(0, 0, 1), 30);
    this.wallMeshList[2].rotateY(Math.PI / 2);
    this.wallMeshList[3].translateOnAxis(new Vector3(0, 0, -1), 30);
    this.wallMeshList[3].rotateY(Math.PI / 2);

    // 墙角的柱子
    const pillarGeometry = new BoxGeometry(4, 40, 4);
    const pillarMesh = new Mesh(pillarGeometry, material);
    for (let i = 0; i < 4; i++) {
      const tempMesh = pillarMesh.clone();
      tempMesh.userData.meshType = 'pillar';
      this.pillarMeshList.push(tempMesh);
      this.scene.add(tempMesh);
    }
    const length = Math.pow(Math.pow(30, 2) * 2, 0.5);
    this.pillarMeshList[0].translateOnAxis(new Vector3(1, 0, 1).normalize(), length);
    this.pillarMeshList[1].translateOnAxis(new Vector3(-1, 0, 1).normalize(), length);
    this.pillarMeshList[2].translateOnAxis(new Vector3(-1, 0, -1).normalize(), length);
    this.pillarMeshList[3].translateOnAxis(new Vector3(1, 0, -1).normalize(), length);

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

  // 修改墙体的材质
  changeWallMaterial(material) {
    material.onBeforeCompile = (shader, renderer) => {
      console.log(shader);
      console.log(renderer);
    };
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
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
    // console.log(e);
    const ray = this.getRaycaster(e.clientX, e.clientY);
    const interArr = ray.intersectObjects(this.wallMeshList);
    console.log(interArr);
    if (interArr.length) {
      // 第一个相交的物体
      const [interObj] = interArr;
    }
  }
}

export default DecorationDesignRender;
