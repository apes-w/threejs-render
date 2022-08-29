import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import * as dat from 'dat.gui';

import LanternRender from './lanternRender';

// import vertexShader from './mainShader/vertex.glsl';
// import fragmentShader from './mainShader/fragment.glsl';

class MainRender {
  constructor() {
    this.scene = new THREE.Scene();
    this.sceneWidth = window.innerWidth;
    this.sceneHeight = window.innerHeight;
    this.loadManager = new THREE.LoadingManager();
    this.loadManager.onLoad = this.loadSuccess;
    this.loadManager.onError = this.loadError;
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sceneWidth / this.sceneHeight,
      0.1,
      1000
    );
    this.camera.position.set(60, 20, 60);
    this.camera.lookAt(this.scene.position);

    const light = new THREE.PointLight(0xffffff, 2, 1000);
    light.position.set(0, 100, 10);
    this.scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // const axesHelper = new THREE.AxesHelper(50);
    // this.scene.add(axesHelper);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.sceneWidth, this.sceneHeight);
    this.renderer.setClearColor(0x696969, 1);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.outputEncoding = THREE.sRGBEncoding; // 让颜色变化接近人眼感知的变化
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // （针对hdr的调整）调整色调，让整体的色调接近一种电影的调色的感觉
    this.renderer.toneMappingExposure = 0.25; // 调整曝光程度，实现夜晚的效果

    // 添加轨道控制器
    new OrbitControls(this.camera, this.renderer.domElement);

    // this.gui = new dat.GUI();

    this.init();
  }

  // 加载成功
  loadSuccess() {}
  // 加载失败
  loadError() {}

  // 初始化
  init() {

    this.lantern = new LanternRender(this.scene);
    console.log(this.lantern);

    // const shaderMaterial = new THREE.RawShaderMaterial({
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader,
    //   side: THREE.DoubleSide, // 双面渲染
    //   uniforms: {
    //     uTime: {
    //       value: 0,
    //     },
    //     uJsChange: {
    //       value: 10.0,
    //     },
    //   },
    // });

    // this.mesh = new THREE.Mesh(
    //   new THREE.PlaneGeometry(30, 20, 30, 30),
    //   shaderMaterial,
    // );

    // this.scene.add(this.mesh);

    // this.gui
    //   .add(shaderMaterial.uniforms.uJsChange, 'value')
    //   .min(6.0)
    //   .max(20.0)
    //   .step(0.1)
    //   .name('uJsChange');
  }

  /**
   * 
   * @description 实际用于渲染用的方法
   * @param {Number} clock 当前渲染对应的时间点
   * @param {Number} timeInterval 距上次渲染的时间
   */
  render() {
    // this.mesh.material.uniforms.uTime.value = clock;
    // console.log(this.lantern.meshList);
    // this.lantern.render();
    this.renderer.render(this.scene, this.camera);
  }
}

export default MainRender;
