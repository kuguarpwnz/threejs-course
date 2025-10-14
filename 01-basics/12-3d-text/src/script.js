import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import GUI from 'lil-gui'
import { FontLoader } from 'three/addons/loaders/FontLoader'
import { TextGeometry } from 'three/addons/geometries/TextGeometry'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper()

// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTextTexture = textureLoader.load('/textures/matcaps/4.png')
matcapTextTexture.colorSpace = THREE.SRGBColorSpace
const matcapTorusTexture = textureLoader.load('/textures/matcaps/7.png')
matcapTorusTexture.colorSpace = THREE.SRGBColorSpace

function onFontLoaded(font) {
    const textGeometry = new TextGeometry('DIMA', {
        font,
        size: 0.5,
        depth: 0.2,
        curveSegmens: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4,
    })
    const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTextTexture })
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textGeometry.computeBoundingBox()
    // textGeometry.translate(
    //     // adjust for bevel thickness and size
    //     (textGeometry.boundingBox.max.x - 0.02) * -0.5,
    //     (textGeometry.boundingBox.max.y - 0.02) * -0.5,
    //     (textGeometry.boundingBox.max.z - 0.03) * -0.5,
    // )
    textGeometry.center()

    scene.add(textMesh)
}

const fontLoader = new FontLoader()
const typefaceFont = fontLoader.load('/fonts/helvetiker_regular.typeface.json', onFontLoaded)

const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
const torusMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTorusTexture })

for (let i = 0; i < 100; ++i) {
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial)

    torusMesh.position.x = (Math.random() - 0.5) * 10
    torusMesh.position.y = (Math.random() - 0.5) * 10
    torusMesh.position.z = (Math.random() - 0.5) * 10
    torusMesh.rotation.x = Math.random() * Math.PI
    torusMesh.rotation.y = Math.random() * Math.PI

    const scale = Math.random()
    torusMesh.scale.set(scale, scale, scale)

    scene.add(torusMesh)
}


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()