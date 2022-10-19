import {
  BoxGeometry,
  PlaneGeometry,
  ExtrudeGeometry,
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
} from 'three';
import * as dat from 'dat.gui';
import assetImage from '@/assets/image/five.jpeg';

const textureLoader = new TextureLoader();

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

    this.wallMeshList = []; // 真实墙体
    this.pillarMeshList = []; // 真实柱子
    this.planeWallMeshList = []; // 代表墙体的平面
    this.planePillarMeshList = []; // 代表柱子的平面
    this.uniformList = [];

    this.debugMesh = {};
    this.debugUniformParams = {};

    // this.init();
    this.debugInit();
    this.guiInit();
  }

  // 以坐标原点为中心
  // 可以理解为平行四边形挤压出的几何体
  /**
   * 
   * @param {Number} length 长边的长度
   * @param {Number} angle 内部小角的大小
   * @param {Number} axesAngle 长边相对于x轴正方向的长度
   */
  getLineGeometry(length, angle = Math.PI / 2, axesAngle = 0) {
    // 使用挤压几何体之后，定义的方向的角度是依据于z轴负方向绘制的

    // 深度为 40
    const width = 6; // 平行四边形较窄的边的默认长度
    const depth = 40;
    const shape = new Shape();
    // const diagonalLength = (length + Math.cos(angle))
    const diagonalVec = new Vector2(length, 0).add(new Vector2(width * Math.cos(angle), width * Math.sin(angle)));
    const diagonalLength = diagonalVec.length();
    const diagonalAngle = diagonalVec.angle();
    shape.moveTo(0, 0);
    // shape.lineTo(length, 0);
    shape.lineTo(
      length * Math.cos(axesAngle),
      length * Math.sin(axesAngle),
    );
    shape.lineTo(
      diagonalLength * Math.cos(diagonalAngle + axesAngle),
      diagonalLength * Math.sin(diagonalAngle + axesAngle),
    );
    shape.lineTo(
      width * Math.cos(angle + axesAngle),
      width * Math.sin(angle + axesAngle),
    );
    shape.lineTo(0, 0);

    return new ExtrudeGeometry(shape, {
      steps: 3,
      bevelThickness: 0,
      bevelSize: 0,
      extrudePath: new LineCurve3(
        new Vector3(0, 0, 0),
        new Vector3(0, depth, 0),
      ),
    });
  }

  init() {
    const imgTex = textureLoader.load(assetImage);
    // const diagonal = Math.pow(Math.pow(4, 2) + Math.pow(40, 2), 0.5);
    for (let i = 0; i < 4; i++) {
      const material = new MeshStandardMaterial({
        color: wallColor,
      });
      // 墙体
      let wallGeometry = null;
      let planeWallGeometry = null;
      if (i < 2) {
        wallGeometry = new BoxGeometry(4, 40, 60 - 4);
        planeWallGeometry = new PlaneGeometry(4, 60 - 4);
      } else {
        wallGeometry = new BoxGeometry(60 - 4, 40, 4);
        planeWallGeometry = new PlaneGeometry(60 - 4, 4);
      }
      const position = wallGeometry.getAttribute('position').array;
      const uniforms = {
        uMaxGeoSize: {
          value: new Vector3(
            Math.abs(position[0]),
            Math.abs(position[1]),
            Math.abs(position[2]),
          ),
        },
        uTexture: {
          value: imgTex,
        },
        uCardSize: {
          value: 6,
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
      material.onBeforeCompile = (shader) => {
        console.log(shader.vertexShader);
        console.log(shader.fragmentShader);
        shader.uniforms = {
          ...shader.uniforms,
          ...uniforms,
        };
  
        // 顶点着色器
        // 变量的初始化，包括使用defined、uniform、attribute、varying
        shader.vertexShader = this.vertexConstantInit(shader.vertexShader);
        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `
          // custom func end
          void main() {
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          'vWorldPosition = worldPosition.xyz;',
          `
          vWorldPosition = worldPosition.xyz;
          // void main end
          `
        );
  
        // 片元着色器
        // 变量的初始化，包括使用defined、uniform、attribute、varying
        shader.fragmentShader = this.fragmentConstantInit(shader.fragmentShader);
        shader.fragmentShader = shader.fragmentShader.replace(
          'void main() {',
          `
          // custom func end
          void main() {
          `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          // void main end
          `
        );
        // 添加根据纹理获取渲染效果的函数
        shader.fragmentShader = this.handleSetTexRender(shader.fragmentShader);
        // 添加验证方向的函数，当前逻辑可以理解校验坐标轴的正负方向是否为法向量
        shader.fragmentShader = this.handleCheckFace(shader.fragmentShader);
        // 实现边缘校验的操作，生成新的中心点
        shader.fragmentShader = this.handleGetRealCenterPoint(shader.fragmentShader);
        // 添加获取一个方形区域的函数
        shader.fragmentShader = this.handleGetCardArea(shader.fragmentShader);
        // 片元着色器，针对于点击位置进行渲染的逻辑
        shader.fragmentShader = this.handleRenderClickArea(shader.fragmentShader);
      };

      // this.changeWallMaterial(material, uniforms);
      this.uniformList.push(uniforms);

      // 真实墙体
      const mesh = new Mesh(wallGeometry, material);
      mesh.userData = {
        ...mesh.userData,
        meshType: 'wall',
        meshIndex: i,
      };
      this.wallMeshList.push(mesh);
      this.scene.add(mesh);

      // 用来代表墙体的虚拟mesh
      const planeMesh = new Mesh(planeWallGeometry, new MeshBasicMaterial({ color: wallColor }));
      planeMesh.visible = false;
      this.planeWallMeshList.push(planeMesh);
      this.scene.add(planeMesh);
    }
    /*
      可以理解为，物体本身也有一个xyz的坐标系
      在旋转物体的时候，物体自身的坐标轴也会跟着一起进行旋转
      移动旋转之后的物体对应的方向，也是依据于物体自身的坐标轴方向
    */
    this.wallMeshList[0].translateOnAxis(new Vector3(1, 0, 0), 30);
    this.wallMeshList[1].translateOnAxis(new Vector3(-1, 0, 0), 30);
    this.wallMeshList[2].translateOnAxis(new Vector3(0, 0, 1), 30);
    // this.wallMeshList[2].rotateY(Math.PI / 2);
    this.wallMeshList[3].translateOnAxis(new Vector3(0, 0, -1), 30);
    // this.wallMeshList[3].rotateY(Math.PI / 2);

    // 墙角的柱子
    for (let i = 0; i < 4; i++) {
      const material = new MeshStandardMaterial({
        color: pillarColor,
      });
      const pillarGeometry = new BoxGeometry(4, 40, 4);
      const planePillarGeometry = new PlaneGeometry(4, 4);

      // 真实地柱子
      const mesh = new Mesh(pillarGeometry, material);
      mesh.userData.meshType = 'pillar';
      this.pillarMeshList.push(mesh);
      this.scene.add(mesh);

      // 代表柱子的虚拟mesh
      const planeMesh = new Mesh(planePillarGeometry, new MeshBasicMaterial({ color: pillarColor }));
      planeMesh.visible = false;
      this.planePillarMeshList.push(planeMesh);
      this.scene.add(planeMesh);
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
    const imgTex = textureLoader.load(assetImage);
    const material = new MeshStandardMaterial({
      color: wallColor,
    });
    // const geometry = new BoxGeometry(30, 40, 50);
    const geometry = this.getLineGeometry(50, singleRad * 40, -singleRad * 76);
    console.log(geometry);
    
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

    material.onBeforeCompile = (shader) => {
      console.log('vertexShader', shader.vertexShader);
      console.log('fragmentShader', shader.fragmentShader);
      shader.uniforms = {
        ...shader.uniforms,
        ...this.debugUniformParams,
      };

      // 顶点着色器
      // 变量的初始化，包括使用defined、uniform、attribute、varying
      shader.vertexShader = this.vertexConstantInit(shader.vertexShader);
      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        // custom func end
        void main() {
        // void main start
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <fog_vertex>',
        `
        #include <fog_vertex>
        // void main end
        `
      );

      // 片元着色器
      // 变量的初始化，包括使用defined、uniform、attribute、varying
      shader.fragmentShader = this.fragmentConstantInit(shader.fragmentShader);
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        // custom func end
        void main() {
        // void main start
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        // void main end
        `
      );
      shader.fragmentShader = this.handleRenderClickArea(shader.fragmentShader);
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
      // console.log('阻止冒泡');
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

  vertexConstantInit(vertex) {
    let res = vertex.replace(
      '#define STANDARD',
      `
      #define STANDARD
      `
    );

    res = res.replace(
      '#include <common>',
      `
      #include <common>
      `
    );

    return res;
  }

  fragmentConstantInit(fragment) {
    let res = fragment.replace(
      '#define STANDARD',
      `
      #define STANDARD
      `
    );

    res = res.replace(
      '#include <common>',
      `
      uniform sampler2D uTexture;
      uniform vec3 uFaceNormal;
      uniform vec3 uClickPoint;
      uniform float uCardSize;
      #include <common>
      // uniform params end
      `
    );

    return res;
  }

  handleRenderClickArea(fragment) {
    let res = fragment.replace(
      '// void main end',
      `
      // 使用vNormal和获取到点击位置的法向量进行比较
      // if (dot(normalize(objectNormal), normalize(uFaceNormal)) > 0.9) {
      //   gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
      // }
      // void main end
      `
    );

    return res;
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

    const interArr = ray.intersectObjects([this.debugMesh]);
    console.log(interArr);
    // todo ------ 在物体的mesh经过旋转之后，使用这个逻辑渲染就会有问题
    // 已修复
    // 在经过mesh的旋转之后，point的点和face对应的法向量之间有差距
    // face的法向量是相对于物体本身的向量方向
    // point的点是相对于物体在世界坐标系中的位置
    if (interArr.length) {
      // 第一个相交的物体
      const [
        {
          face, // 相交的点，存在于物体的哪一个面上
          point,
          // uv,
        },
      ] = interArr;
      this.debugUniformParams.uFaceNormal.value = face.normal;
      this.debugUniformParams.uClickPoint.value = point;
    }

    // const interArr = ray.intersectObjects(this.wallMeshList);
    // console.log(interArr);
    // // todo ------ 在物体的mesh经过旋转之后，使用这个逻辑渲染就会有问题
    // // 已修复
    // // 在经过mesh的旋转之后，point的点和face对应的法向量之间有差距
    // // face的法向量是相对于物体本身的向量方向
    // // point的点是相对于物体在世界坐标系中的位置
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
