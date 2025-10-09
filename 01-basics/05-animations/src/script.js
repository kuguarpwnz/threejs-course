import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

function tick(frameTime) {
    mesh.rotation.y += 0.001 * frameTime
    mesh.rotation.y += 0.001 * frameTime
    mesh.rotation.z += 0.001 * frameTime
}

function render() {
    renderer.render(scene, camera)
}

function createFrameTimeGetter() {
    let previousTimstamp

    return function getFrameTime(timestamp) {
        const frameTime = previousTimstamp ? timestamp - previousTimstamp : 0
        previousTimstamp = timestamp

        return frameTime
    }
}

function createLoop() {
    let currentRafId

    function start() {
        const getFrameTime = createFrameTimeGetter()

        function loop(timestamp) {
            const frameTime = getFrameTime(timestamp)

            tick(frameTime)
            render()

            currentRafId = window.requestAnimationFrame(loop)
        }

        loop()
    }

    function stop() {
        window.cancelAnimationFrame(currentRafId)
    }

    return {
        start,
        stop,
    }
}


const loop = createLoop()
loop.start()