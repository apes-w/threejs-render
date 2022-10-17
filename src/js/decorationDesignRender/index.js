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
  TextureLoader,
  MOUSE,
} from 'three';
import * as dat from 'dat.gui';
import assetImage from '@/assets/image/five.jpeg';

const textureLoader = new TextureLoader();

/*
  装修移动墙体的思路
  可以生成两套模型，一套是完成的带有墙体和柱子的模型
  在需要自定义墙体的位置时，可以隐藏墙体和柱子
  另外生成一套用来代表墙体和柱子的平面
  然后对平面进行操作，包括添加、移动、删除这些的操作
  在操作结束之后，根据平面的位置，生成新的墙体和柱子
*/

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
    const imgTex = textureLoader.load(assetImage);
    // const diagonal = Math.pow(Math.pow(4, 2) + Math.pow(40, 2), 0.5);
    for (let i = 0; i < 4; i++) {
      const material = new MeshStandardMaterial({
        color: new Color('#D8BFD8'),
      });
      // 墙体
      let wallGeometry = null;
      if (i < 2) {
        wallGeometry = new BoxGeometry(4, 40, 60 - 4);
      } else {
        wallGeometry = new BoxGeometry(60 - 4, 40, 4);
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

      const mesh = new Mesh(wallGeometry, material);
      mesh.userData = {
        ...mesh.userData,
        meshType: 'wall',
        meshIndex: i,
      };
      this.wallMeshList.push(mesh);
      this.scene.add(mesh);
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
        // color: new Color('#D8BFD8'),
        color: new Color('#ADD8E6'),
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

  setControlMode(control) {
    control.mouseButtons = {
      RIGHT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
    };
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
  }

  vertexConstantInit(vertex) {
    let res = vertex.replace(
      '#define STANDARD',
      `
      #define USE_UV true;
      #define USE_TRANSMISSION true;
      #define STANDARD
      `
    );

    return res;
  }

  fragmentConstantInit(fragment) {
    let res = fragment.replace(
      '#define STANDARD',
      `
      #define USE_UV true;
      #define USE_TRANSMISSION true;
      #define PHYSICAL true;
      #define STANDARD
      `
    );

    res = res.replace(
      '#include <common>',
      `
      uniform vec3 uMaxGeoSize;
      uniform float uCardSize;
      uniform vec2 uPointUV;
      uniform vec3 uUpFace;
      uniform vec3 uIntersectPoint;
      uniform sampler2D uTexture;
      #include <common>
      // uniform params end
      `
    );

    return res;
  }

  handleSetTexRender(fragment) {
    let res = fragment.replace(
      '// custom func end',
      `
      vec4 getTexColor(const in vec2 nowPoint, const in vec2 centerPoint) {
        // 直接计算当前坐标相对于方形区域的长度
        float x = -0.1;
        float y = -0.1;

        float diffXCenter = abs(nowPoint.x - centerPoint.x);
        float diffYCenter = abs(nowPoint.y - centerPoint.y);
        if (nowPoint.x <= centerPoint.x) {
          x = uCardSize / 2.0 - diffXCenter;
        } else {
          x = uCardSize / 2.0 + diffXCenter;
        }
        if (nowPoint.y < centerPoint.y) {
          y = uCardSize / 2.0 - diffYCenter;
        } else {
          y = uCardSize / 2.0 + diffYCenter;
        }

        vec2 renderVec = vec2(x / uCardSize, y / uCardSize);
        return texture2D(uTexture, renderVec);
      }
      // custom func end
      `
    );

    return res;
  }

  handleCheckFace(fragment) {
    let res = fragment.replace(
      '// custom func end',
      `
      bool checkFace(const in vec3 axesVec) {
        float deviation = 0.0001;
        return ( // 坐标轴正方向
          dot(uUpFace, axesVec) > 0.0
          && dot(vWorldPosition, axesVec) >= dot(uIntersectPoint, axesVec) - deviation
        )
        ||
        ( // 坐标轴负方向
          dot(uUpFace, axesVec) < 0.0
          && dot(vWorldPosition, axesVec) <= dot(uIntersectPoint, axesVec) + deviation
        );
      }
      // custom func end
      `
    );

    return res;
  }

  handleGetRealCenterPoint(fragment) {
    let res = fragment.replace(
      '// custom func end',
      `
      vec2 getRealCenterPoint(const in vec2 point, const in vec2 maxSize) {
        vec2 resultCenterPoint = vec2(point.xy);
        // 进行边缘校验，判断是否要特殊处理
        // 边缘校验结束之后，需要拿到新的中心点
        float diffXSide = maxSize.x - abs(point.x) - uCardSize / 2.0;
        float diffYSide = maxSize.y - abs(point.y) - uCardSize / 2.0;
        if (diffXSide < 0.0) {
          if (point.x > 0.0) {
            resultCenterPoint.x += diffXSide;
          } else {
            resultCenterPoint.x -= diffXSide;
          }
        }
        if (diffYSide < 0.0) {
          if (point.y > 0.0) {
            resultCenterPoint.y += diffYSide;
          } else {
            resultCenterPoint.y -= diffYSide;
          }
        }
        return resultCenterPoint;
      }
      // custom func end
      `
    );

    return res;
  }

  handleGetCardArea(fragment) {
    let res = fragment.replace(
      '// custom func end',
      `
      bool getCardArea(const in vec2 position, const in vec2 point) {
        // 普通的校验一个card区域
        bool sizeBool = (
          abs(position.x - point.x) <= uCardSize / 2.0
          && abs(position.y - point.y) <= uCardSize / 2.0
        );
        return sizeBool;
      }
      // custom func end
      `
    );

    return res;
  }

  handleRenderClickArea(fragment) {
    let res = fragment.replace(
      '// void main end',
      `
      // vWorldPosition
      if (uPointUV.x >= 0.0 && uPointUV.y >= 0.0) {
        if (
          (uUpFace.x != 0.0 || uUpFace.y != 0.0 || uUpFace.z != 0.0) // 选择了几何体的面
        ) {
          if (checkFace(vec3(1.0, 0.0, 0.0))) { // x轴的正负方向
            vec2 realPoint = getRealCenterPoint(uIntersectPoint.zy, uMaxGeoSize.zy);
            if (getCardArea(vWorldPosition.zy, realPoint)) {
              gl_FragColor = getTexColor(vWorldPosition.zy, realPoint);
            }
          } else if (checkFace(vec3(0.0, 1.0, 0.0))) { // y轴的正负方向
            vec2 realPoint = getRealCenterPoint(uIntersectPoint.xz, uMaxGeoSize.xz);
            if (getCardArea(vWorldPosition.xz, realPoint)) {
              gl_FragColor = getTexColor(vWorldPosition.xz, realPoint);
            }
          } else if (checkFace(vec3(0.0, 0.0, 1.0))) { // z轴的正负方向
            vec2 realPoint = getRealCenterPoint(uIntersectPoint.xy, uMaxGeoSize.xy);
            if (getCardArea(vWorldPosition.xy, realPoint)) {
              gl_FragColor = getTexColor(vWorldPosition.xy, realPoint);
            }
          }
        }
      }
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

    const interArr = ray.intersectObjects(this.wallMeshList);
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
          object,
          point,
          uv,
        },
      ] = interArr;
      const { meshIndex } = object.userData;
      this.uniformList[meshIndex].uPointUV.value = uv;
      this.uniformList[meshIndex].uUpFace.value = face.normal;
      this.uniformList[meshIndex].uIntersectPoint.value = point;
    }
  }
}

export default DecorationDesignRender;
