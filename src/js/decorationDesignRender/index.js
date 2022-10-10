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
    this.uniformList = [];

    this.init();
    this.guiInit();
  }

  init() {
    for (let i = 0; i < 4; i++) {
      const material = new MeshStandardMaterial({
        color: new Color('#D8BFD8'),
      });
      // 墙体
      const wallGeometry = new BoxGeometry(4, 40, 60 - 4);
      const uniforms = {
        uCardSize: {
          value: 0.2, // 当前是依据uv进行设置，之后要做修改
        },
        uPointUV: {
          value: new Vector2(-1, -1),
        },
      };

      this.changeMaterial(material, uniforms);
      this.uniformList.push(uniforms);

      const mesh = new Mesh(wallGeometry, material);
      mesh.userData = {
        ...mesh.userData,
        meshType: 'wall',
        meshIndex: i,
      };
      this.wallMeshList.push(mesh);
      this.scene.add(mesh);
    }
    this.wallMeshList[0].translateOnAxis(new Vector3(1, 0, 0), 30);
    // 添加每个墙体可以使用的面
    this.wallMeshList[0].userData = {
      ...this.wallMeshList[0].userData,
      availableFace: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    };
    this.wallMeshList[1].translateOnAxis(new Vector3(-1, 0, 0), 30);
    this.wallMeshList[1].userData = {
      ...this.wallMeshList[1].userData,
      availableFace: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    };
    /*
      可以理解为，物体本身也有一个xyz的坐标系
      在旋转物体的时候，物体自身的坐标轴也会跟着一起进行旋转
      移动旋转之后的物体对应的方向，也是依据于物体自身的坐标轴方向
    */
    this.wallMeshList[2].translateOnAxis(new Vector3(0, 0, 1), 30);
    this.wallMeshList[2].rotateY(Math.PI / 2);
    this.wallMeshList[2].userData = {
      ...this.wallMeshList[2].userData,
      availableFace: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    };
    this.wallMeshList[3].translateOnAxis(new Vector3(0, 0, -1), 30);
    this.wallMeshList[3].rotateY(Math.PI / 2);
    this.wallMeshList[3].userData = {
      ...this.wallMeshList[3].userData,
      availableFace: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    };

    // 墙角的柱子
    for (let i = 0; i < 4; i++) {
      const material = new MeshStandardMaterial({
        color: new Color('#D8BFD8'),
      });
      const pillarGeometry = new BoxGeometry(4, 40, 4);
      const mesh = new Mesh(pillarGeometry, material);
      mesh.userData.meshType = 'pillar';
      this.pillarMeshList.push(mesh);
      this.scene.add(mesh);
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
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
  }

  changeMaterial(material, uniforms) {
    material.onBeforeCompile = (shader) => {

      shader.uniforms = {
        ...shader.uniforms,
        ...uniforms,
      };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        #define USE_UV true;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        #define USE_UV true;
        uniform float uCardSize;
        uniform vec2 uPointUV;
        // uniform params end
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        'vWorldPosition = worldPosition.xyz;',
        `
        vWorldPosition = worldPosition.xyz;
        // void main end
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        if (uPointUV.x >= 0.0 && uPointUV.y >= 0.0) {
          if (
            abs(uPointUV.x - vUv.x) <= uCardSize
            && abs(uPointUV.y - vUv.y) <= uCardSize
          ) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
          }
        }
        // void main end
        `
      );
    }
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
    const interArr = ray.intersectObjects(this.wallMeshList);
    if (interArr.length) {
      // 第一个相交的物体
      const [
        {
          face, // 相交的点，存在于物体的哪一个面上
          object, // 相交的物体
          point, // 相交的点的坐标
          uv,
        },
      ] = interArr;
      const { meshIndex } = object.userData;
      this.uniformList[meshIndex].uPointUV.value = uv;
    }
  }
}

export default DecorationDesignRender;
