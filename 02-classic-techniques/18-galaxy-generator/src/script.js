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
 * Galaxy
 */
const parameters = {
    count: 20_000,
    size: 0.01,
    radius: 8,
    branches: 6,
    bias: 0.09,
    spin: 5,
    spread: 0.6,
    spreadPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}

function reGenerateGalaxy() {
    scene.children
        .filter(child => child.type === 'Points')
        .forEach(points => {
            points.geometry.dispose()
            points.material.dispose()
            scene.remove(points)
        })

    const points = generateGalaxy(parameters)
    scene.add(points)
}

gui.add(parameters, 'count').min(1).max(100_000).step(1).onChange(reGenerateGalaxy)
gui.add(parameters, 'size').min(0.01).max(0.1).step(0.01).onChange(reGenerateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onChange(reGenerateGalaxy)
gui.add(parameters, 'branches').min(1).max(20).step(1).onChange(reGenerateGalaxy)
gui.add(parameters, 'bias').min(0.01).max(0.3).step(0.001).onChange(reGenerateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onChange(reGenerateGalaxy)
gui.add(parameters, 'spread').min(0).max(2).step(0.01).onChange(reGenerateGalaxy)
gui.add(parameters, 'spreadPower').min(1).max(10).step(0.01).onChange(reGenerateGalaxy)
gui.addColor(parameters, 'insideColor').onChange(reGenerateGalaxy)
gui.addColor(parameters, 'outsideColor').onChange(reGenerateGalaxy)


function snap(value, roundTo) {
    return Math.round(value / roundTo) * roundTo
}

function generateGalaxy(parameters) {
    const position = new Float32Array(parameters.count * 3)
    const color = new Float32Array(parameters.count * 3)

    const countPerBranch = parameters.count / parameters.branches
    const anglePerBranch = Math.PI * 2 / parameters.branches

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let b = 0; b < parameters.branches; ++b) {
        const branchAngle = anglePerBranch * b
        const start = snap(countPerBranch * b, 3)
        const end = snap(countPerBranch * (b + 1), 3)

        for (let i = start; i < end; ++i) {
            const i3 = i * 3

            const radiusFactor = Math.random()
            const radius = radiusFactor * parameters.radius

            const angle = branchAngle + Math.sin(radius * parameters.bias) * parameters.spin

            const randomX = Math.pow(Math.random(), parameters.spreadPower) * parameters.spread * Math.sign(Math.random() - 0.5)
            const randomY = Math.pow(Math.random(), parameters.spreadPower) * parameters.spread * Math.sign(Math.random() - 0.5)
            const randomZ = Math.pow(Math.random(), parameters.spreadPower) * parameters.spread * Math.sign(Math.random() - 0.5)

            // x
            position[i3 + 0] = Math.cos(angle) * radius + randomX
            // y
            position[i3 + 1] = randomY
            // z
            position[i3 + 2] = Math.sin(angle) * radius + randomZ

            const mixedColor = colorInside.clone().lerp(colorOutside, radiusFactor)
            // r
            color[i3 + 0] = mixedColor.r
            // g
            color[i3 + 1] = mixedColor.g
            // b
            color[i3 + 2] = mixedColor.b
        }
    }

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(color, 3))

    const particlesMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    const points = new THREE.Points(particlesGeometry, particlesMaterial)

    return points
}

const points = generateGalaxy(parameters)
scene.add(points)

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
camera.position.x = 3
camera.position.y = 3
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

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()