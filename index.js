import MainRender from './src/js/main';
new MainRender();
function animeRender() {
  requestAnimationFrame(animeRender);
}

animeRender();
