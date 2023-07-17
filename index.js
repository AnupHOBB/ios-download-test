import { ImportManager } from './engine/ImportManager.js'
import * as CONSTANTS from './constants.js'

const sceneType = 'r1'

let importMap = new Map()
let origin = extractOrigin(window.location.href)
importMap.set('THREE', origin+'node_modules/three/src/Three.js')
//importMap.set('GLTF', origin+'node_modules/three/examples/jsm/loaders/GLTFLoader.js')
//importMap.set('DRACO', origin+'node_modules/three/examples/jsm/loaders/DRACOLoader.js')
importMap.set('ENGINE', origin+'engine/Engine.js')

window.onload = ()=>loadFiles(sceneType)
/**
 * Imports all the required modules present within the import map
 */
function loadFiles(sceneType)
{
    let pTag = document.querySelector('p')
    execute(importMap, (name, module, progress) => 
    {//Called after successfully importing each module
        showProgress(pTag, Math.round((progress * 33)/100))
        importMap.set(name, module)
    }, () => loadAssets(sceneType, p=>showProgress(pTag, Math.round((p * 67)/100) + 33)))
}

function loadAssets(sceneType, onProgress)
{
    let [textureMap, modelMap] = getAssetPaths(sceneType)
    //let GLTF = importMap.get('GLTF')
    //let DRACO = importMap.get('DRACO')
    console.log('downloaded js files')
    let THREE = importMap.get('THREE')
    let ENGINE = importMap.get('ENGINE')
    let loader = new ENGINE.AssetLoader()
    let textureNames = textureMap.keys()
    for (let textureName of textureNames)
        loader.addLoader(textureName, textureMap.get(textureName), new THREE.TextureLoader())
    /* let modelNames = modelMap.keys()
    for (let modelName of modelNames)
    {    
        let dracoLoader = new DRACO.DRACOLoader()
        dracoLoader.setDecoderPath(CONSTANTS.DRACO_DECODER_PATH)
        let gltfLoader = new GLTF.GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(modelName, modelMap.get(modelName), gltfLoader)
    } */
    loader.execute(onProgress, assetMap => showScene(THREE))
}

function getAssetPaths(sceneType)
{
    let textureMap = new Map()
    let modelMap = new Map()
    textureMap.set('Background', CONSTANTS.ENVMAP)
    textureMap.set('DirectLight', CONSTANTS.LENS_FLARE_TEXTURE)
    textureMap.set('Black', CONSTANTS.ROOF_TEXTURE_BLACK)
    textureMap.set('Bronze', CONSTANTS.ROOF_TEXTURE_BRONZE)
    textureMap.set('Clay', CONSTANTS.ROOF_TEXTURE_CLAY)
    textureMap.set('Normal', CONSTANTS.ROOF_TEXTURE_NORMAL)
    textureMap.set('Sandstone', CONSTANTS.ROOF_TEXTURE_SANDSTONE)
    textureMap.set('White', CONSTANTS.ROOF_TEXTURE_WHITE)
    modelMap.set('Roof', CONSTANTS.ROOF_MODEL)
    switch (sceneType)
    {
        case 'r2':
        {
            modelMap.set('Scene', CONSTANTS.RESIDENTIAL2_SCENE_MODEL)
            let instanceData = CONSTANTS.RESIDENTIAL2_INSTANCE_VALUES
            for (let key in instanceData)
                modelMap.set(key, CONSTANTS.RESIDENTIAL2_SCENE_MODELS_FOLDER + key + '.glb')
            break
        }
        case 'c1':
        {
            modelMap.set('Scene', CONSTANTS.COMMERCIAL1_SCENE_MODEL)
            let instanceData = CONSTANTS.COMMERCIAL1_INSTANCE_VALUES
            for (let key in instanceData)
                modelMap.set(key, CONSTANTS.COMMERCIAL1_SCENE_MODELS_FOLDER + key + '.glb')
            break
        }
        case 'c2':
        {
            modelMap.set('Scene', CONSTANTS.COMMERCIAL2_SCENE_MODEL)
            let instanceData = CONSTANTS.COMMERCIAL2_INSTANCE_VALUES
            for (let key in instanceData)
                modelMap.set(key, CONSTANTS.COMMERCIAL2_SCENE_MODELS_FOLDER + key + '.glb')
            break
        }
        default :
        {
            modelMap.set('Roof', CONSTANTS.ROOF_MODEL_EXTENDED)
            modelMap.set('Scene', CONSTANTS.RESIDENTIAL1_SCENE_MODEL)
            let instanceData = CONSTANTS.RESIDENTIAL1_INSTANCE_VALUES
            for (let key in instanceData)
                modelMap.set(key, CONSTANTS.RESIDENTIAL1_SCENE_MODELS_FOLDER + key + '.glb')
            break
        }
    }
    return [textureMap, modelMap]
}

function showScene(THREE)
{
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,0.1,100);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, -1);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
}

function showProgress(pTag, progress) { pTag.innerHTML = 'LOADING... '+progress+'%' }

function execute(pathMap, onProgress, onComplete)
{
    if (onProgress == undefined)
        onProgress = (p, s)=>{}
    if (onComplete == undefined)
        onComplete = (m)=>{}
    let names = pathMap.keys()
    let progress = 0
    for (let name of names)
    {    
        import(pathMap.get(name)).then((module)=>{
            onProgress(name, module, Math.round((progress++/pathMap.size) * 100))
            if (progress == pathMap.size)
                onComplete()
        })
    }
}

function extractOrigin(url)
{
    let urlParts = url.split('/')
    let origin = urlParts[0]
    for (let i=1; i<urlParts.length; i++)
    {
        if (urlParts[i] != 'app')
            origin += '/' + urlParts[i] 
        else
            break
    }
    return origin
}