import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF'

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas)

const createScene = async function () {
  const scene = new BABYLON.Scene(engine)
  let camera = scene.createDefaultCameraOrLight(true, false, true)

  const fontData = await (await fetch('/Montserrat_Regular.json')).json();
  const text = new BABYLON.MeshBuilder.CreateText('', 'My Text', fontData, {
    size: 2,
    depth: 0.1,
    resolution: 64
  });

  let cows = []
  for (let i = 0; i < 4; i++){
    let name_gltf = 'Cow' + i.toString() + '.gltf';
    let cow = BABYLON.SceneLoader.ImportMesh(
      '',
      'models/',
      name_gltf,
      scene,
      function(meshes, particSystems, skeletons, animatiionGroups){
        const model = meshes[0]
        model.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15)
        model.position.x += i / 2

        animatiionGroups[5].play(true)

        cows.push(model)
      }
    )
  }
  return {scene, camera, cows}
}

const result = await createScene()
const scene = result.scene
let cows = result.cows
let camera = result.camera

engine.runRenderLoop(function(){
  scene.render()
})

window.addEventListener('resize', function() {
  engine.resize()
})

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function run() {
  let cowPositionSum = new BABYLON.Vector3(0, 0, 0);
  let cowCount = 0;

  for (let j = 0; j < 10000; j++) {
    cowPositionSum.set(0, 0, 0);
    cowCount = 0;

    for (let i = 0; i < 4; i++) {
      if (cows[i]) {
        cowPositionSum.addInPlace(cows[i].position);
        cowCount++;

        cows[i].position.z -= getRandomNumber(1, 2);
      }
    }

    if (cowCount > 0) {
      const averageCowPosition = cowPositionSum.scale(1 / cowCount);
      camera.position = new BABYLON.Vector3(averageCowPosition.x, 10, averageCowPosition.z - 20);
      camera.setTarget(averageCowPosition);
    }

    await sleep(150);
  }
}

run()