import * as THREE from 'three'
import GUI from 'lil-gui'
import { Timer } from 'three/addons/misc/Timer.js'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#c076ed'
}

gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor)
    particles.material.color.set(parameters.materialColor)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('/textures/gradients/3.jpg')
texture.magFilter = THREE.NearestFilter

// Scene
const scene = new THREE.Scene()

const material = new THREE.MeshToonMaterial({ color: parameters.materialColor, gradientMap: texture })

const objectsDistance = -4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material,
)
mesh1.position.x = 2
mesh1.position.y = objectsDistance * 0

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material,
)
mesh2.position.x = -2
mesh2.position.y = objectsDistance * 1


const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material,
)
mesh3.position.x = 2
mesh3.position.y = objectsDistance * 2

const meshes = [mesh1, mesh2, mesh3]
scene.add(...meshes)

/**
 * Particles
 */
const count = 200
const particlesGeometry = new THREE.BufferGeometry()
const position = new Float32Array(count * 3)
for (let i = 0; i < count; ++i) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 10
    position[i * 3 + 1] = objectsDistance * -0.5 - Math.random() * objectsDistance * -meshes.length
    position[i * 3 + 2] = (Math.random() - 0.5) * 10
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.1,
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

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
const cameraGroup = new THREE.Group()

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

scene.add(cameraGroup)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function handleScrollChange() {
    scrollY = window.scrollY / sizes.height

    const previousSection = currentSection
    currentSection = Math.round(scrollY)

    if (previousSection !== currentSection) {
        gsap.to(meshes[currentSection].rotation, {
            duration: 1.5,
            easing: 'power2.inOut',
            x: '+= 6',
            y: '+= 3',
            z: '+= 1.5',
        })
    }
}

let scrollY
let currentSection
handleScrollChange()

window.addEventListener('scroll', handleScrollChange)

let cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (event) => {
    Object.assign(cursor, {
        x: event.clientX / sizes.width - 0.5,
        y: event.clientY / sizes.height - 0.5,
    })
})

/**
 * Animate
 */
const timer = new Timer()

const tick = (timestamp) => {
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    timer.update(timestamp)
    const elapsedTime = timer.getElapsed()
    const deltaTime = timer.getDelta()

    // Animate meshes
    for (const mesh of meshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    camera.position.y = scrollY * objectsDistance

    const parallaxX = cursor.x
    const parallaxY = -cursor.y

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime

    // Render
    renderer.render(scene, camera)
}

tick()