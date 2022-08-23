import {
  Clock,
} from 'three';
import MainRender from './src/js/main';
const mainRender = new MainRender();

const clock = new Clock();
let _oldTime = 0;
function animeRender() {
  requestAnimationFrame(animeRender);
  const nowTime = clock.getElapsedTime();
  mainRender.render(nowTime, nowTime - _oldTime);

  _oldTime = nowTime;
}

animeRender();
