import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Cannon from 'cannon'
import { Timer } from 'three/addons/misc/Timer.js'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

const objectsToUpdate = []

// Spheres

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})

function createSphere(radius, position) {
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.scale.setScalar(radius)
    scene.add(mesh)

    const shape = new Cannon.Sphere(radius)
    const body = new Cannon.Body({
        mass: 1,
        position: new Cannon.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
    })
    body.position.copy(position)
    body.addEventListener('collide', (event) => {
        if (event.contact.getImpactVelocityAlongNormal() > 1.5) {
            hitSound.volume = Math.random()
            hitSound.currentTime = 0
            hitSound.play()
        }
    })
    world.addBody(body)

    objectsToUpdate.push({ mesh, body })
}

// Boxes

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})

function createBox(size, position) {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.scale.setScalar(size)
    scene.add(mesh)

    const shape = new Cannon.Box(new Cannon.Vec3(size / 2, size / 2, size / 2))
    const body = new Cannon.Body({
        mass: 1,
        position: new Cannon.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
    })
    body.position.copy(position)
    body.addEventListener('collide', (event) => {
        if (event.contact.getImpactVelocityAlongNormal() > 1.5) {
            hitSound.volume = Math.random()
            hitSound.currentTime = 0
            hitSound.play()
        }
    })
    world.addBody(body)

    objectsToUpdate.push({ mesh, body })
}

const hitSound = new Audio('/sounds/hit.mp3')

const world = new Cannon.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new Cannon.SAPBroadphase(world)
world.allowSleep = true

// const concreteMaterial = new Cannon.Material('concrete')
// const plasticMaterial = new Cannon.Material('plastic')

// const concretePlasticContactMaterial = new Cannon.ContactMaterial(concreteMaterial, plasticMaterial, {
//     friction: 0.1,
//     restitution: 0.7,
// })
// world.addContactMaterial(concretePlasticContactMaterial)


const defaultMaterial = new Cannon.Material('default')

const defaultContactMaterial = new Cannon.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.7,
})
world.addContactMaterial(defaultContactMaterial)

// instead of providing material to every body
// world.defaultContactMaterial = defaultContactMaterialp

// const sphereShape = new Cannon.Sphere(0.5)
// const sphereBody = new Cannon.Body({
//     mass: 1,
//     position: new Cannon.Vec3(0, 3, 0),
//     shape: sphereShape,
//     material: defaultMaterial,
// })
// sphereBody.applyLocalForce(new Cannon.Vec3(150, 0, 0), new Cannon.Vec3(0, 0, 0))
// world.addBody(sphereBody)

const floorShape = new Cannon.Plane()
const floorBody = new Cannon.Body()
floorBody.mass = 0
floorBody.material = defaultMaterial
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new Cannon.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)


/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

createSphere(0.5, { x: 0, y: 3, z: 0 })

const guiObject = {
    spawnRandomSphere() {
        createSphere(Math.random() * 0.5, {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        })
    },
    spawnRandomBox() {
        createBox(Math.random() * 0.5, {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        })
    },
    reset() {
        objectsToUpdate.forEach(({ mesh, body }) => {
            // body.removeEventListener('collide', fn)
            world.removeBody(body)
            scene.remove(mesh)
        })
        objectsToUpdate.length = 0
    },
}
gui.add(guiObject, 'spawnRandomSphere').name('create a sphere')
gui.add(guiObject, 'spawnRandomBox').name('create a box')
gui.add(guiObject, 'reset')

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    const deltaTime = timer.getDelta()

    // sphereBody.applyForce(new Cannon.Vec3(-0.5, 0, 0), sphereBody.position)
    world.step(1 / 60, deltaTime, 3)
    // sphere.position.copy(sphereBody.position)

    objectsToUpdate.forEach(({ mesh, body }) => {
        mesh.position.copy(body.position)
        mesh.quaternion.copy(body.quaternion)
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()