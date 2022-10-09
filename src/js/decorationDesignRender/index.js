import {
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import * as dat from 'dat.gui';

class DecorationDesignRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;
    this.mesh = null;

    this.init();
    this.guiInit();
  }

  init() {
    const geometry = new BoxGeometry(40, 40, 40);
    const material = new MeshStandardMaterial({
      color: 0xAABBBB,
    });

    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  guiInit() {
    const gui = new dat.GUI();
    gui.width = 300;
  }
}

export default DecorationDesignRender;
