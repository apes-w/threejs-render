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

    // this.init();
    this.debugInit();
    this.guiInit();
  }

  init() {
    // const diagonal = Math.pow(Math.pow(4, 2) + Math.pow(40, 2), 0.5);
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
        uUpFace: { // 当前点击面对应的法向量
          value: new Vector3(0, 0, 0),
        },
        uIntersectPoint: {
          value: new Vector3(0, 0, 0),
        },
      };

      this.changeWallMaterial(material, uniforms);
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

  debugInit() {
    const material = new MeshStandardMaterial({
      color: new Color('#D8BFD8'),
    });
    // 墙体
    const geometry = new BoxGeometry(30, 40, 50);
    const uniforms = {
      uCardSize: {
        value: 0.2, // 当前是依据uv进行设置，之后要做修改
      },
      uPointUV: {
        value: new Vector2(-1, -1),
      },
      uUpFace: { // 当前点击面对应的法向量
        value: new Vector3(0, 0, 0),
      },
      uIntersectPoint: {
        value: new Vector3(0, 0, 0),
      },
    };

    this.changeWallMaterial(material, uniforms);
    const mesh = new Mesh(geometry, material);
    mesh.translateOnAxis(new Vector3(1, 0, 0), 10);
    this.wallMeshList.push(mesh);
    this.uniformList.push(uniforms);
    this.scene.add(mesh);
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
  }

  // 修改墙体的材质
  changeWallMaterial(material, uniforms) {
    material.onBeforeCompile = (shader) => {
      console.log('vertexShader', shader.vertexShader);
      console.log('fragmentShader', shader.fragmentShader);

      shader.uniforms = {
        ...shader.uniforms,
        ...uniforms,
      };

      // 使用define定义变量
      shader.vertexShader = shader.vertexShader.replace(
        '#define STANDARD',
        `
        #define USE_UV true;
        #define USE_TRANSMISSION true;
        // custom defined end
        #define STANDARD
        `
      );

      // 使用define定义变量
      shader.fragmentShader = shader.fragmentShader.replace(
        '#define STANDARD',
        `
        #define USE_UV true;
        #define USE_TRANSMISSION true;
        #define PHYSICAL true;
        // custom defined end
        #define STANDARD
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        uniform float uCardSize;
        uniform vec2 uPointUV;
        uniform vec3 uUpFace;
        uniform vec3 uIntersectPoint;
        #include <common>
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
        // vWorldPosition
        float deviation = 0.0001;
        vec4 cardColor = vec4(1.0, 0.0, 0.0, 1.0);
        if (uPointUV.x >= 0.0 && uPointUV.y >= 0.0) {
          if (
            abs(uPointUV.x - vUv.x) <= uCardSize
            && abs(uPointUV.y - vUv.y) <= uCardSize
            && (uUpFace.x != 0.0 || uUpFace.y != 0.0 || uUpFace.z != 0.0)
          ) {
            vec3 xAxesVec = vec3(1.0, 0.0, 0.0);
            vec3 yAxesVec = vec3(0.0, 1.0, 0.0);
            vec3 zAxesVec = vec3(0.0, 0.0, 1.0);

            if (
              ( // x轴正方向
                dot(uUpFace, xAxesVec) > 0.0
                && dot(vWorldPosition, xAxesVec) >= dot(uIntersectPoint, xAxesVec) - deviation
              )
              ||
              ( // x轴负方向
                dot(uUpFace, xAxesVec) < 0.0
                && dot(vWorldPosition, xAxesVec) <= dot(uIntersectPoint, xAxesVec) + deviation
              )
            ) {
              gl_FragColor = cardColor;
            }

            if (
              ( // y轴正方向上
                dot(uUpFace, yAxesVec) > 0.0
                && dot(vWorldPosition, yAxesVec) >= dot(uIntersectPoint, yAxesVec) - deviation
              )
              ||
              ( // y轴负方向上
                dot(uUpFace, yAxesVec) < 0.0
                && dot(vWorldPosition, yAxesVec) <= dot(uIntersectPoint, yAxesVec) + deviation
              )
            ) {
              gl_FragColor = cardColor;
            }

            if (
              ( // z轴正方向上
                dot(uUpFace, zAxesVec) > 0.0
                && dot(vWorldPosition, zAxesVec) >= dot(uIntersectPoint, zAxesVec) - deviation
              )
              ||
              ( // z轴负方向上
                dot(uUpFace, zAxesVec) < 0.0
                && dot(vWorldPosition, zAxesVec) <= dot(uIntersectPoint, zAxesVec) + deviation
              )
            ) {
              gl_FragColor = cardColor;
            }
          }
        }
        // void main end
        `
      );
    };
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
    console.log(interArr);
    if (interArr.length) {
      // 第一个相交的物体
      const [
        {
          face, // 相交的点，存在于物体的哪一个面上
          point,
          uv,
        },
      ] = interArr;
      this.uniformList[0].uPointUV.value = uv;
      this.uniformList[0].uUpFace.value = face.normal;
      this.uniformList[0].uIntersectPoint.value = point;
    }

    // const interArr = ray.intersectObjects(this.wallMeshList);
    // console.log(interArr);
    // if (interArr.length) {
    //   // 第一个相交的物体
    //   const [
    //     {
    //       face, // 相交的点，存在于物体的哪一个面上
    //       object,
    //       point,
    //       uv,
    //     },
    //   ] = interArr;
    //   const { meshIndex } = object.userData;
    //   this.uniformList[meshIndex].uPointUV.value = uv;
    //   this.uniformList[meshIndex].uUpFace.value = face.normal;
    //   this.uniformList[meshIndex].uIntersectPoint.value = point;
    // }
  }
}

export default DecorationDesignRender;
