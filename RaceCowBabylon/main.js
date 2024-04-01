import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF'

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas)


const createScene = async function () {
  // Создание сцены
  const scene = new BABYLON.Scene(engine)

  // Создаем свет
  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Создаём камеру
  var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 10, 0), scene);
  camera.attachControl(canvas, true);

  // Создание текста
  const fontData = await (await fetch('/Montserrat_Regular.json')).json();
  const text = new BABYLON.MeshBuilder.CreateText('', 'Race Cow', fontData, {
    size: 2,
    depth: 0.1,
    resolution: 64
  });

  // Создание коров
  let sizeCow = 20
  const step = 90
  let cows = []
  let cowsAnimations = []
  for (let i = 0; i < 4; i++){
    let name_gltf = 'Cow' + i.toString() + '.gltf';
    let cow = BABYLON.SceneLoader.ImportMesh(
      '',
      'models/',
      name_gltf,
      scene,
      function(meshes, particSystems, skeletons, animatiionGroups){
        const model = meshes[0]
        sizeCow = 20 * (1.5 / (Math.sqrt(i+1)))
        model.scaling = new BABYLON.Vector3(sizeCow, sizeCow, sizeCow)
        model.position.x += i * step
        animatiionGroups[5].speedRatio = (i + 1) / 2;
        animatiionGroups[5].play(true)

        cows.push(model)
        cowsAnimations.push(animatiionGroups)
      }
    )
  }
  // Создание трека
  const trackW = (step * 8) + (step * (cows.length - 1))
  const trackL = 1000000
  var track = BABYLON.Mesh.CreateGround("track", trackW, trackL, 2, scene)
  track.position.y = -25


  // Создание текстуры трека
  var trackMaterial = new BABYLON.StandardMaterial("trackMaterial", scene);
  trackMaterial.diffuseTexture = new BABYLON.Texture("images/road.jpg", scene);
  trackMaterial.diffuseTexture.uScale = 1
  trackMaterial.diffuseTexture.vScale = trackL / 1500;
  track.material = trackMaterial


  return {scene, camera, cows, cowsAnimations}
}

const result = await createScene()
const scene = result.scene
let cows = result.cows
let camera = result.camera
let cowsAnimations = result.cowsAnimations

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

  for (let j = 0; j < 100000; j++) {
    for (let i = 0; i < 4; i++) {
      if (cows[i] && cowsAnimations[i]) {
        cows[i].position.z -= getRandomNumber(1, 5);
        let random_chance = getRandomNumber(1, 200)
        if (random_chance == 7){
          for (let doping=0; doping<getRandomNumber(100, 1000); doping++){
            cows[i].position.z -= getRandomNumber(2, 15);
            await sleep(1);
          }
        }
      }
    }
    const maxZ = cows.reduce((max, cow) => Math.min(max, cow.position.z), 0);

    // Меняем позицию камеры в зависимости от максимального значения z
    // camera.position.z = maxZ
    camera.radius = maxZ + 20;
    camera.alpha = Math.PI / 2;
    camera.beta = Math.PI / 2;
    camera.target = new BABYLON.Vector3(0, 0, maxZ);
    await sleep(25);
  }
}

camera.position.y = 500
run()
