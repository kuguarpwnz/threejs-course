import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import { Sky } from 'three/addons/objects/Sky'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

const textureLoader = new THREE.TextureLoader()

const floorAlphaTexture = textureLoader.load('/floor/alpha.webp')
const floorColorTexture = textureLoader.load('/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
floorColorTexture.repeat.set(8, 8)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping
floorColorTexture.colorSpace = THREE.SRGBColorSpace
const floorARMTexture = textureLoader.load('/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
floorARMTexture.repeat.set(8, 8)
floorARMTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
const floorNormalTexture = textureLoader.load('/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
floorNormalTexture.repeat.set(8, 8)
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
const floorDisplacementTexture = textureLoader.load('/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')
floorDisplacementTexture.repeat.set(8, 8)
floorDisplacementTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

// Wall
const wallColorTexture = textureLoader.load('/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
wallColorTexture.colorSpace = THREE.SRGBColorSpace
const wallARMTexture = textureLoader.load('/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')
const wallNormalTexture = textureLoader.load('/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')

// Roof
const roofColorTexture = textureLoader.load('/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp')
roofColorTexture.colorSpace = THREE.SRGBColorSpace
const roofARMTexture = textureLoader.load('/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp')
const roofNormalTexture = textureLoader.load('/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp')

roofColorTexture.repeat.set(3, 1)
roofColorTexture.wrapS = THREE.RepeatWrapping
roofARMTexture.repeat.set(3, 1)
roofARMTexture.wrapS = THREE.RepeatWrapping
roofNormalTexture.repeat.set(3, 1)
roofNormalTexture.wrapS = THREE.RepeatWrapping

// Bush
const bushColorTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
const bushARMTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')
const bushNormalTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')

bushColorTexture.colorSpace = THREE.SRGBColorSpace
bushColorTexture.repeat.set(2, 1)
bushARMTexture.repeat.set(2, 1)
bushNormalTexture.repeat.set(2, 1)

bushColorTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.wrapS = THREE.RepeatWrapping

// Grave
const graveColorTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp')
const graveARMTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp')
const graveNormalTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp')

graveColorTexture.colorSpace = THREE.SRGBColorSpace

graveColorTexture.repeat.set(0.3, 0.4)
graveARMTexture.repeat.set(0.3, 0.4)
graveNormalTexture.repeat.set(0.3, 0.4)

// Door
const doorColorTexture = textureLoader.load('./door/color.webp')
const doorAlphaTexture = textureLoader.load('./door/alpha.webp')
const doorAmbientOcclusionTexture = textureLoader.load('./door/ambientOcclusion.webp')
const doorHeightTexture = textureLoader.load('./door/height.webp')
const doorNormalTexture = textureLoader.load('./door/normal.webp')
const doorMetalnessTexture = textureLoader.load('./door/metalness.webp')
const doorRoughnessTexture = textureLoader.load('./door/roughness.webp')

doorColorTexture.colorSpace = THREE.SRGBColorSpace

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * House
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.1,
    })
)
floor.rotation.x = -1 * Math.PI * 0.5
scene.add(floor)
gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.01)
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.01)

const houseGroup = new THREE.Group()
scene.add(houseGroup)

const HOUSE_WALLS_HEIGHT = 2.5
const houseWalls = new THREE.Mesh(
    new THREE.BoxGeometry(4, HOUSE_WALLS_HEIGHT, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
    })
)
houseWalls.position.y = HOUSE_WALLS_HEIGHT * 0.5
houseGroup.add(houseWalls)

const houseRoof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
    })
)
houseRoof.position.set(0, HOUSE_WALLS_HEIGHT + 1.5 * 0.5, 0)
houseRoof.rotation.y = Math.PI * 0.25
houseGroup.add(houseRoof)

const houseDoor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
        displacementScale: 0.1,
        displacementBias: -0.04
    })
)
houseDoor.position.set(0, 2.2 * 0.5, 2 + 0.001)
houseGroup.add(houseDoor)

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture,
    color: '#ccffcc',
})

const bushes = [
    { position: [0.8, 0.2, 2.2], scale: 0.5 },
    { position: [1.4, 0.1, 2.1], scale: 0.25 },
    { position: [-0.8, 0.1, 2.2], scale: 0.4 },
    { position: [-1, 0.05, 2.6], scale: 0.15 },
]
for (const bush of bushes) {
    const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial)
    bushMesh.scale.setScalar(bush.scale) // same as .scale.set(bush.scale, bush.scale, bush.scale)
    bushMesh.position.set(...bush.position)
    bushMesh.rotation.x = -0.75
    houseGroup.add(bushMesh)
}

const gravesGroup = new THREE.Group()
houseGroup.add(gravesGroup)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture
})

for (let i = 0; i < 30; ++i) {
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)

    const angle = Math.PI * 2 * Math.random()
    const radius = Math.random() * 4 + 3
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    grave.position.set(x, Math.random() * 0.4, z)
    grave.rotation.y = (0.5 - Math.random()) * Math.PI * 0.4
    grave.rotation.x = (0.5 - Math.random()) * Math.PI * 0.4
    grave.rotation.x = (0.5 - Math.random()) * Math.PI * 0.4

    gravesGroup.add(grave)
}

gravesGroup.children.forEach(grave => {
    grave.castShadow = true
    grave.receiveShadow = true
})

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
houseGroup.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#8800ff', 6)
const ghost2 = new THREE.PointLight('#ff0088', 6)
const ghost3 = new THREE.PointLight('#ccff00', 6)
scene.add(ghost1, ghost2, ghost3)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

houseWalls.castShadow = true
houseRoof.castShadow = true

houseWalls.receiveShadow = true
floor.receiveShadow = true

// Mappings
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20

const sky = new Sky()
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)
sky.scale.setScalar(100)
scene.add(sky)

scene.fog = new THREE.FogExp2('#02343f', 0.1)

/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45)

    const ghost2Angle = elapsedTime * 0.9 * -1
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45)

    const ghost3Angle = elapsedTime * 0.23
    ghost3.position.x = Math.cos(ghost3Angle) * 6
    ghost3.position.z = Math.sin(ghost3Angle) * 6
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45)


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()