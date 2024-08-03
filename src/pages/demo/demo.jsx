import React, { useEffect, useState, useRef } from 'react';
import './demo.less';
import * as PIXI from 'pixi.js';
//如果只需要 Cubism 4
import { Live2DModel } from 'pixi-live2d-display/cubism4';

window.PIXI = PIXI;

const cubism4Model = './Yui/Yui.model3.json';
const App = () => {
  const canvasRef = useRef({});
  const init = async () => {
    if (!canvasRef.current) {
      return;
    }
    const app2d = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      resizeTo: window,
      //backgroundAlpha: 0,
    });
    // const response = await fetch(cubism4Model);
    // const file = await response.json();
    // console.log('file', file);
    const model = await Live2DModel.from(cubism4Model);
    model.width = 300;
    model.height = 500;
    model.position.set(-100, 0);
    model.scale.set(0.2, 0.2);
    app2d.stage.addChild(model);
    //app2d.registerInteraction

    // 交互
    model.on('hit', (hitAreas) => {
      if (hitAreas.includes('body')) {
        model.motion('tap_body');
      }
    });
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div>
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
};
export default App;
