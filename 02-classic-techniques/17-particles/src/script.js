import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load('/textures/particles/2.png')
/**
 * Particles
 */
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)
const particlesGeometry = new THREE.BufferGeometry()
const count = 5000
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array(
        Array.from({ length: count * 3 }).map(() => (Math.random() - 0.5) * 4)
    ), 3)
)
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(
    new Float32Array(
        Array.from({ length: count * 3 }).map(() => Math.random())
    ), 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    // map: particlesTexture,
    alphaMap: particlesTexture,
    transparent: true,
    // color: '#ccff00',
    // alphaTest: 0.01,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

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
camera.position.z = 3
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

    // Update particles
    // particles.rotation.y = elapsedTime * 0.2
    const particlesPosition = particles.geometry.attributes.position
    const particlesPositionBuffer = particlesPosition.array
    for (let i = 0, length = particlesPositionBuffer.length / 3; i < length; ++i) {
        const i3 = i * 3
        particlesPositionBuffer[i3 + 1] = Math.sin(elapsedTime + particlesPositionBuffer[i3])
    }
    particlesPosition.needsUpdate = true

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()