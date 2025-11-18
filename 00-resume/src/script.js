import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import GUI from 'lil-gui'

/**
 * Base
 */
const configOverride = {
    "i": 0.2115,
    "r": 9.66,
    "w": 2.9323,
    "l": 1.34526,
    "size": 0.72,
    "camera": {
        "position": [
            16.852186444775842,
            -3.3593105758394985,
            3.2501679137606803
        ],
        "quaternion": [
            0.371443678664107,
            -0.4451038217016162,
            0.21000257510899834,
            0.7872808266017158
        ],
        "target": [
            20.257137388826493,
            1.4641016530553588,
            1.2014273515058513
        ]
    }
}

const config = {
    i: 0.09,
    r: 2,
    w: 0.5,
    l: 1,
    size: 0.2,
    linewidth: 0.8,
    ...configOverride,
}

let shouldUpdatePoints = false
function forceUpdate() {
    shouldUpdatePoints = true
}

const gui = new GUI({ width: 700 })
gui.add(config, 'i').min(0.01).max(0.5).step(0.0001).onChange(forceUpdate)
gui.add(config, 'r').min(0.0).max(10).step(0.01).onChange(forceUpdate)
gui.add(config, 'w').min(0.0).max(5).step(0.0001).onChange(forceUpdate)
gui.add(config, 'l').min(0.0).max(1.5).step(0.00001).onChange(forceUpdate)
gui.add(config, 'size').min(0.01).max(1.5).step(0.01).onChange(forceUpdate)
gui.add(config, 'linewidth')
    .min(0.01)
    .max(3)
    .step(0.0001)
    .name('line width')
    .onChange(value => {
        trianglesMaterial.linewidth = value
        trianglesMesh.computeLineDistances()
    })
gui.add({
    async copy() {
        try {
            const mergedConfig = {
                ...config,
                camera: {
                    position: camera.position.toArray(),
                    quaternion: camera.quaternion.toArray(),
                    target: controls.target.toArray(),
                }
            }

            const text = JSON.stringify(mergedConfig, null, 2)
            await navigator.clipboard.writeText(text)
        } catch (error) {
            console.error(error)
        }
    }
}, 'copy')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

function test(t, r, w, l) {
    return {
        x: t * l,
        y: r * Math.cos(w * t) * (Math.cos(t)),
        z: r * Math.sin(w * t) * (Math.cos(t)),
    }
}

const coord = test
const count = 1000

function generatePoints() {
    return Array.from({ length: count }).flatMap((_, index) => {
        const point = coord(index * config.i, config.r, config.w, config.l)
        return new THREE.Vector3(point.x, point.y, point.z)
    })
}

// Tangent utility
function getTangent(i, points) {
    const t = new THREE.Vector3()

    if (i === 0)
        t.subVectors(points[i + 1], points[i])
    else if (i === points.length - 1)
        t.subVectors(points[i], points[i - 1])
    else
        t.subVectors(points[i + 1], points[i - 1])

    return t.normalize()
}

// Frenet-like frame
function getFrames(i, points, prevNormal) {
    const tangent = getTangent(i, points)
    let normal, binormal

    if (!prevNormal) {
        const up = Math.abs(tangent.y) < 0.9
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0)

        binormal = new THREE.Vector3().crossVectors(tangent, up).normalize()
        normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()
    } else {
        normal = prevNormal.clone()
        binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
        normal.crossVectors(binormal, tangent).normalize()
    }

    return { tangent, normal, binormal }
}

// Build triangle
function buildTriangle(i, points, radius, prevNormal) {
    const { tangent, normal, binormal } = getFrames(i, points, prevNormal)
    const center = points[i]

    const v1 = center.clone().add(normal.clone().multiplyScalar(radius))
    const v2 = center.clone()
        .add(normal.clone().multiplyScalar(-radius / 2))
        .add(binormal.clone().multiplyScalar(Math.sqrt(3) * radius / 2))
    const v3 = center.clone()
        .add(normal.clone().multiplyScalar(-radius / 2))
        .add(binormal.clone().multiplyScalar(-Math.sqrt(3) * radius / 2))

    return { vertices: [v1, v2, v3], frame: { tangent, normal, binormal } }
}

function unwrapTriangle(a, b, c) {
    return [
        a.x, a.y, a.z, b.x, b.y, b.z,
        b.x, b.y, b.z, c.x, c.y, c.z,
        c.x, c.y, c.z, a.x, a.y, a.z,
        NaN, NaN, NaN
    ]
}

function getTrianglesColors(positions, colorStops) {
    const vertexCount = positions.length / 3
    const colors = new Float32Array(vertexCount * 3)
    const color = new THREE.Color()

    for (let i = 0; i < vertexCount; i++) {
        const t = i / (vertexCount - 1)

        let c0 = colorStops[0]
        let c1 = colorStops[colorStops.length - 1]

        for (let j = 0; j < colorStops.length - 1; j++) {
            if (t >= colorStops[j].stop && t <= colorStops[j + 1].stop) {
                c0 = colorStops[j]
                c1 = colorStops[j + 1]
                break
            }
        }

        const localT = (t - c0.stop) / (c1.stop - c0.stop)
        color.set(c0.color).lerp(new THREE.Color(c1.color), localT)

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
    }

    return colors
}

// Generate triangles
const points = generatePoints()
const positions = []
let prevNormal = null

for (let i = 0; i < points.length; ++i) {
    const { vertices, frame } = buildTriangle(i, points, config.size, prevNormal)
    const [v1, v2, v3] = vertices
    positions.push(...unwrapTriangle(v1, v2, v3))
    prevNormal = frame.normal.clone()
}

const gradientStops = [
    { stop: 0.0, color: '#7700ff' },
    { stop: 0.2, color: '#0095ff' },
    { stop: 0.4, color: '#00ffbf' },
    { stop: 1.0, color: '#3300ff' },
]

const colors = getTrianglesColors(positions, gradientStops)

// --- Line2 geometry and material ---
const trianglesGeometry = new LineGeometry()
trianglesGeometry.setPositions(positions)
trianglesGeometry.setColors(colors)

const trianglesMaterial = new LineMaterial({
    vertexColors: true,
    linewidth: config.linewidth,
})

trianglesMaterial.resolution.set(window.innerWidth, window.innerHeight)

const trianglesMesh = new Line2(trianglesGeometry, trianglesMaterial)
trianglesMesh.computeLineDistances()
scene.add(trianglesMesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // REQUIRED for LineMaterial
    trianglesMaterial.resolution.set(sizes.width, sizes.height)
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(120, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(25, 1.75, 4)
camera.lookAt(0, 0, 0)

if (config.camera) {
    camera.position.fromArray(config.camera.position)
    camera.quaternion.fromArray(config.camera.quaternion)
}

scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

if (config.camera)
    controls.target.fromArray(config.camera.target)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    controls.update()

    if (shouldUpdatePoints) {
        const pts = generatePoints()
        const newPositions = []
        let prevNormal = null

        for (let i = 0; i < pts.length; ++i) {
            const { vertices, frame } = buildTriangle(i, pts, config.size, prevNormal)
            const [v1, v2, v3] = vertices
            newPositions.push(...unwrapTriangle(v1, v2, v3))
            prevNormal = frame.normal.clone()
        }

        trianglesMesh.geometry.setPositions(newPositions)
        trianglesMesh.geometry.setColors(colors)
        trianglesMesh.computeLineDistances()

        shouldUpdatePoints = false
    }

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
