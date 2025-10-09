import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
// const geometry = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3)

const trianglesCount = 5000
const position = new Float32Array(trianglesCount * 3 * 3)

const randomPoint = () => 5 * (Math.random() - 0.5)

for (let i = 0; i < trianglesCount; ++i) {
    // x
    position[9 * i + 0] = randomPoint()
    position[9 * i + 1] = randomPoint()
    position[9 * i + 2] = randomPoint()

    // y
    position[9 * i + 3] = randomPoint()
    position[9 * i + 4] = randomPoint()
    position[9 * i + 5] = randomPoint()

    // z
    position[9 * i + 6] = randomPoint()
    position[9 * i + 7] = randomPoint()
    position[9 * i + 8] = randomPoint()
}

console.log(position)

const positionAttribute = new THREE.BufferAttribute(position, 3)
const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', positionAttribute)

const material = new THREE.MeshBasicMaterial({ color: 0xccff00, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()