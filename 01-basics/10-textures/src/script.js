import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// function createImageTexture(src) {
//     const image = new Image()
//     const texture = new THREE.Texture(image)
//     texture.colorSpace =  THREE.SRGBColorSpace

//     image.onload = () => {
//         texture.needsUpdate = true
//     }
//     image.src = src

//     return texture
// }


// const texture = createImageTexture('/textures/door/color.jpg')

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
// const texture = textureLoader.load('/textures/door/color.jpg')
// const texture = textureLoader.load('/textures/checkerboard-1024x1024.png')
// const texture = textureLoader.load('/textures/checkerboard-8x8.png')
const texture = textureLoader.load('/textures/minecraft.png')
texture.colorSpace = THREE.SRGBColorSpace

// texture.repeat.x = 2
// texture.repeat.y = 3
// texture.wrapS = THREE.MirroredRepeatWrapping
// texture.wrapT = THREE.RepeatWrapping
// texture.center.set(0.5, 0.5)

// texture.rotation = (2 * Math.PI) * (1 / 8)

// texture.offset.x = 0.5

// texture.generateMipmaps = false
// texture.minFilter = THREE.NearestFilter

texture.magFilter = THREE.NearestFilter



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: texture })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.z = 1
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