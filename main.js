import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const uMouse = new THREE.Vector2(0,0);
const container = document.querySelector('.scene')

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const geometry = new THREE.PlaneGeometry( 7, 5);
const texture = new THREE.TextureLoader().load('graf.jpg');
const material = new THREE.MeshBasicMaterial( { map: texture } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

//renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

// post processing
const composer = new THREE.EffectComposer(renderer);
composer.setPixelRatio(window.devicePixelRatio)
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

//mouse move
document.addEventListener('mousemove', (e) => {
    uMouse.x = (e.clientX - container.offsetLeft) / container.clientWidth ;
    uMouse.y = 1. - ( (e.clientY - container.offsetTop)/ container.clientHeight );
});

//shaders
const myEffect = {
    uniforms: {
      "tDiffuse": { value: null },
      "resolution": { value: new THREE.Vector2(1.,window.innerHeight/window.innerWidth) },
      "uMouse": { value: new THREE.Vector2(-10,-10) },
      "uVelo": { value: 0 },
    },
    vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}`,
    fragmentShader: `uniform float time;
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;
    uniform vec2 uMouse;
    float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
      uv -= disc_center;
      uv*=resolution;
      float dist = sqrt(dot(uv, uv));
      return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
    }
    void main()  {
        vec2 newUV = vUv;
        float c = circle(vUv, uMouse, 0.0, 0.2);
        float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
        float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
        float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
        vec4 color = vec4(r, g, b, 1.);

        gl_FragColor = color;
    }`
  }

const customPass = new THREE.ShaderPass(myEffect);
customPass.renderToScreen = true;
composer.addPass(customPass);

//orbit controls
//const controls = new OrbitControls( camera, renderer.domElement );

function animate() {
    customPass.uniforms.uMouse.value = uMouse;
    requestAnimationFrame( animate );

    //renderer.render( scene, camera );
    //effect composer
    composer.render( scene, camera)
}
function reSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', reSize);
animate();
