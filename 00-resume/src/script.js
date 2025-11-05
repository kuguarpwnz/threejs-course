import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
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

function generatePoints() {
    return Array.from({ length: count }).flatMap((_, index) => {
        const point = coord(index * config.i, config.r, config.w, config.l)

        // return [point.x, point.y, point.z]
        return new THREE.Vector3(point.x, point.y, point.z)
    })
}

// --- Utility: get tangent for a given point index ---
function getTangent(i, points) {
    const t = new THREE.Vector3()

    if (i === 0) {
        t.subVectors(points[i + 1], points[i])
    } else if (i === points.length - 1) {
        t.subVectors(points[i], points[i - 1])
    } else {
        t.subVectors(points[i + 1], points[i - 1])
    }

    return t.normalize()
}

// --- Utility: compute local Frenet-like frame at given index ---
function getFrames(i, points, prevNormal) {
    const tangent = getTangent(i, points)
    let normal, binormal

    // Initialize a default normal if none provided
    if (!prevNormal) {
        // Pick something not parallel to tangent
        const up = Math.abs(tangent.y) < 0.9
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0)

        binormal = new THREE.Vector3().crossVectors(tangent, up).normalize()
        normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()
    } else {
        // Parallel transport of previous frame
        normal = prevNormal.clone()
        binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
        normal.crossVectors(binormal, tangent).normalize()
    }

    return { tangent, normal, binormal }
}

// --- Build an equilateral triangle perpendicular to curve ---
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

/**
 * Particles
 */
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)
const particlesGeometry = new THREE.BufferGeometry()
const count = 1000
const points = generatePoints()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array(
        // Array.from({ length: count * 3 }).map(() => (Math.random() - 0.5) * 4)
        points.flatMap(point => [point.x, point.y, point.z])
    ), 3)
)
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(
    new Float32Array(
        Array.from({ length: count * 3 }).map(() => Math.random())
    ), 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    sizeAttenuation: true,
    // map: particlesTexture,
    // alphaMap: particlesTexture,
    transparent: true,
    // color: '#ccff00',
    // alphaTest: 0.01,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

/**
 * Triangles
 */
function unwrapTriangle(a, b, c,) {
    return [
        a.x, a.y, a.z, b.x, b.y, b.z,  // edge AB
        b.x, b.y, b.z, c.x, c.y, c.z,  // edge BC
        c.x, c.y, c.z, a.x, a.y, a.z   // edge CA
    ]
}

function getTrianglesColors(positions, colorStops) {
    const vertexCount = positions.count

    const colors = new Float32Array(vertexCount * 3)
    const color = new THREE.Color()

    for (let i = 0; i < vertexCount; i++) {
        const t = i / (vertexCount - 1)

        // Find the two gradient stops that t falls between
        let c0 = colorStops[0]
        let c1 = colorStops[colorStops.length - 1]
        for (let j = 0; j < colorStops.length - 1; j++) {
            if (t >= colorStops[j].stop && t <= colorStops[j + 1].stop) {
                c0 = colorStops[j]
                c1 = colorStops[j + 1]
                break
            }
        }

        // Interpolate between the two colors
        const localT = (t - c0.stop) / (c1.stop - c0.stop)
        color.set(c0.color).lerp(new THREE.Color(c1.color), localT)

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
    }

    return colors
}

const positions = []
let prevNormal = null

for (let i = 0; i < points.length; ++i) {
    const { vertices, frame } = buildTriangle(i, points, config.size, prevNormal);
    const [v1, v2, v3] = vertices;

    // add edges of the triangle
    positions.push(...unwrapTriangle(v1, v2, v3))

    // carry orientation forward for continuity
    prevNormal = frame.normal.clone();
}

const trianglesGeometry = new THREE.BufferGeometry()
trianglesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

// define gradient stops (like CSS)
const gradientStops = [
    { stop: 0.0, color: '#7700ff' },
    { stop: 0.2, color: '#0095ff' },
    { stop: 0.4, color: '#00ffbf' },
    { stop: 1.0, color: '#3300ff' },
]

const colors = getTrianglesColors(trianglesGeometry.getAttribute('position'), gradientStops)
trianglesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const trianglesMaterial = new THREE.LineBasicMaterial({ vertexColors: true })
const trianglesMesh = new THREE.LineSegments(trianglesGeometry, trianglesMaterial)
scene.add(trianglesMesh)

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
const camera = new THREE.PerspectiveCamera(120, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(25, 1.75, 4)
camera.lookAt(0, 0, 0)
if (config.camera) {
    camera.position.fromArray(config.camera.position)
    camera.quaternion.fromArray(config.camera.quaternion)
}
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
if (config.camera) {
    controls.target.fromArray(config.camera.target)
}

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


    if (shouldUpdatePoints) {
        // Particles
        const particlesPosition = particles.geometry.attributes.position
        const particlesPositionBuffer = particlesPosition.array
        const points = generatePoints()

        if (particlesPositionBuffer.length / 3 !== points.length) throw new Error('unmatched points count')
        for (let i = 0, length = points.length; i < length; ++i) {
            const point = points[i]
            particlesPositionBuffer[3 * i + 0] = point.x
            particlesPositionBuffer[3 * i + 1] = point.y
            particlesPositionBuffer[3 * i + 2] = point.z
        }
        particlesPosition.needsUpdate = true

        // Triangles
        const trianglesPosition = trianglesMesh.geometry.attributes.position
        const trianglesPositionBuffer = trianglesPosition.array

        trianglesPositionBuffer.fill(0)
        let prevNormal = null

        for (let i = 0; i < points.length; ++i) {
            const { vertices, frame } = buildTriangle(i, points, config.size, prevNormal);
            const [v1, v2, v3] = vertices;

            // add edges of the triangle
            const trianglePoints = unwrapTriangle(v1, v2, v3)
            const trianglePointsCount = trianglePoints.length
            for (let j = 0; j < trianglePointsCount; ++j) {
                trianglesPositionBuffer[trianglePointsCount * i + j] = trianglePoints[j]
            }

            // carry orientation forward for continuity
            prevNormal = frame.normal.clone();

        }
        trianglesPosition.needsUpdate = true

        shouldUpdatePoints = false
    }

    // const trianglesPosition = trianglesMesh.geometry.attributes.position
    // const trianglesPositionBuffer = trianglesPosition.array
    // for (let i = 0; i < trianglesPositionBuffer.length; ++i) {
    //     trianglesPositionBuffer
    // }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()