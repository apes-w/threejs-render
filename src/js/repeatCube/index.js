import {
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  TextureLoader,
  Texture,
  MeshBasicMaterial,
  CubeReflectionMapping,
  CubeRefractionMapping,
  RepeatWrapping,
} from 'three';
import mergeImg from '@/assets/image/merge.png';

const textureLoader = new TextureLoader();

class CubeRender {
  constructor(val) {
    const { scene } = val;
    this.scene = scene;

    this.repeatTimes = 3;

    // this.mergeTex = textureLoader.load(mergeImg);
    this.init();
  }

  init() {
    // 添加立方体
    const geometry = new BoxGeometry(40, 40, 40);
    let materialList = [];

    // 生成纹理
    const image = new Image();
    image.src = mergeImg;
    image.onload = (e) => {
      materialList = this.generateMaterial(e, image);

      const mesh = new Mesh(geometry, materialList);
      this.scene.add(mesh);
    }
  }

  generateMaterial(e, image) {
    const { width, height } = e.path[0];
    // 图片的宽高
    const singleWidth = width / 3;
    const singleHeight = height / 2;
    const canvasMaterialArr = [];

    const newCanvasSize = 100;
    // 需要绘制的图片的大小
    const renderImageSize = Math.pow(Math.pow(newCanvasSize, 2) / 2, 0.5);
    const startLocation = (newCanvasSize - renderImageSize) / 2;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = newCanvasSize;
        newCanvas.height = newCanvasSize;
        const ctx = newCanvas.getContext('2d');
        // 对绘制的图片进行缩放，长宽要可以做到使对角线的长度等于canvas的长宽
        ctx.translate(newCanvasSize / 2, newCanvasSize / 2);
        ctx.rotate(Math.PI / 4);
        // // 中 - 中
        // ctx.drawImage(
        //   image,
        //   i * singleWidth, j * singleHeight,
        //   singleWidth, singleHeight,
        //   -renderImageSize / 2, -renderImageSize / 2,
        //   renderImageSize, renderImageSize,
        // );

        // 中 - 中
        ctx.drawImage(
          image,
          i * singleWidth, j * singleHeight,
          singleWidth, singleHeight,
          // startLocation, startLocation,
          -renderImageSize / 2, -renderImageSize / 2,
          renderImageSize, renderImageSize,
        );
        // 左 - 中
        // 左上角
        ctx.drawImage(
          image,
          i * singleWidth, j * singleHeight,
          singleWidth, singleHeight,
          // startLocation - renderImageSize, startLocation,
          -renderImageSize / 2 * 3, -renderImageSize / 2,
          renderImageSize, renderImageSize
        );
        // 上 - 中
        // 右上角
        ctx.drawImage(
          image,
          i * singleWidth, j * singleHeight,
          singleWidth, singleHeight,
          // startLocation, startLocation - renderImageSize,
          -renderImageSize / 2, -renderImageSize / 2 * 3,
          renderImageSize, renderImageSize
        );
        // 右 - 中
        // 右下角
        ctx.drawImage(
          image,
          i * singleWidth, j * singleHeight,
          singleWidth, singleHeight,
          // startLocation + renderImageSize, startLocation,
          renderImageSize / 2, -renderImageSize / 2,
          renderImageSize, renderImageSize
        );
        // 下 - 中
        // 左下角
        ctx.drawImage(
          image,
          i * singleWidth, j * singleHeight,
          singleWidth, singleHeight,
          // startLocation, startLocation + renderImageSize,
          -renderImageSize / 2, renderImageSize / 2,
          renderImageSize, renderImageSize
        );

        const texture = new Texture(newCanvas);
        texture.needsUpdate = true;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.x = this.repeatTimes;
        texture.repeat.y = this.repeatTimes;
        const material = new MeshBasicMaterial({
          map: texture,
        });
        canvasMaterialArr.push(material);
      }
    }

    return canvasMaterialArr;
  }
}

export default CubeRender;
