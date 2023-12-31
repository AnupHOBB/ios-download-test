import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

const BrightnessShader =
{
    vertexShader: `
        varying vec2 vUv;
        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D baseTexture;
        uniform float brightness;
        varying vec2 vUv;
        
        void main() 
        {
            vec4 final_color = texture2D(baseTexture, vUv);
            final_color.xyz += (final_color.xyz * brightness);
            gl_FragColor = final_color;
        }
    `
}

export class BrightnessPass extends ShaderPass
{
    constructor(brightness)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            { 
                baseTexture: { value: null },
                brightness: { value: brightness }
            },
            vertexShader : BrightnessShader.vertexShader,
            fragmentShader : BrightnessShader.fragmentShader,
        }), 'baseTexture')
    }

    setBrightness(brightness) { this.material.uniforms.brightness.value = brightness }
}