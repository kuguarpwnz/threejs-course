import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let duckModel = null
gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf', (gltf) => {
    // gltf.scene.scale.setScalar(0.025)
    duckModel = gltf.scene
    scene.add(gltf.scene)
})

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


const raycaster = new THREE.Raycaster()

// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)

// raycaster.set(rayOrigin, rayDirection.normalize())

// const intersection = raycaster.intersectObject(object2)
// console.log(intersection)

// const intersections = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersections)


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

const cursor = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width * 2 - 1
    cursor.y = event.clientY / sizes.height * 2 - 1
    cursor.y *= -1
})

window.addEventListener('click', (event) => {
    if (currentIntersectedObjects.length > 0) {
        console.log('click on spheres', currentIntersectedObjects.map((object) => object.uuid))
    }
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

let previousIntersectedObjects = []
let currentIntersectedObjects = []

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    object1.position.y = Math.sin(2 * elapsedTime)
    object2.position.y = Math.sin(2 * elapsedTime + 5)
    object3.position.y = Math.sin(2 * elapsedTime + 10)

    const objectsToTest = [object1, object2, object3]

    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // raycaster.set(rayOrigin, rayDirection.normalize())

    raycaster.setFromCamera(cursor, camera)


    const intersections = raycaster.intersectObjects(objectsToTest)
    currentIntersectedObjects = intersections.map((intersection) => intersection.object)

    for (const object of objectsToTest) {
        object.material.color.set(new THREE.Color('#ff0000'))
    }

    for (const intersection of intersections) {
        intersection.object.material.color.set(new THREE.Color('#ccff00'))
    }

    for (const intersectedObject of currentIntersectedObjects) {
        if (!previousIntersectedObjects.includes(intersectedObject)) {
            console.log('enter', intersectedObject.uuid)
        }
    }

    for (const intersectedObject of previousIntersectedObjects) {
        if (!currentIntersectedObjects.includes(intersectedObject)) {
            console.log('leave', intersectedObject.uuid)
        }
    }

    previousIntersectedObjects = currentIntersectedObjects

    if (duckModel) {
        const duckIntersections = raycaster.intersectObject(duckModel)
        if (duckIntersections.length > 0) {
            duckModel.scale.set(
                duckModel.scale.x * 0.99,
                duckModel.scale.y * 0.99,
                duckModel.scale.z * 0.99,
            )
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()