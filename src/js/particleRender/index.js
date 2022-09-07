import {
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  // PointsMaterial,
  Points,
} from 'three';

import vertex from './shader/vertex.glsl';
import fragment from './shader/fragment.glsl';

class Particle {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.init();
  }

  init() {
    const geometry = new BufferGeometry();
    const position = new Float32Array([0, 0, 0]);
    geometry.setAttribute('position', new BufferAttribute(position, 3));

    // const material = new PointsMaterial({
    //   color: 0xff0000,
    //   size: 10,
    // });
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const point = new Points(geometry, material);
    this.scene.add(point);
  }

  render() {}
}

export default Particle;
