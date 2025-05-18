import { useRapier, RigidBody } from '@react-three/rapier' 
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'




export default function Player ()
{
    const body = useRef()
    const [ subscribeKeys, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier() 

    // UseRapier permet d'utiliser le moteur physique rapier et world est le monde physique
    
    // SmoothedCameraPosition est une variable qui permet de lisser le mouvement de la caméra
    // useState est un hook qui permet de créer une variable d'état
    // Vector3 est une classe de Three.js qui permet de créer un vecteur 3D ce qui est utile pour la position de la caméra

    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())



    const jump = () =>
    {
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)

        if(hit.timeOfImpact < 0.15)
        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })

        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }

    // Pour les enregistrer les changements de touches
    // UnbsubscribeKeys est une fonction qui permet de se désabonner des changements de touches pour cleaner la mémoire
    
    useEffect(() =>
    {
        const unsubscribeJump = subscribeKeys( 
            (state) => state.jump, 
            (value)=>
            {
                if(value)
                    jump()
            }
            
        )
        return () =>
        {
        unsubscribeJump()
        }
    }, [])

    

    useFrame ((state, delta) =>
    {
        /**
         * Keyboard Controls
         */


        const { forward, backward, leftward, rightward } = getKeys()
        
        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta
        if(forward) 
        {  
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }
         if(rightward) 
        {  
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }
           if(backward) 
        {  
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }
         if(leftward) 
        {  
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }


        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)


        /**
         * Camera
         */
        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.y += 0.65    
        cameraPosition.z += 2.25

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        // Camera regarde le joueur

        state.camera.position.copy(cameraPosition)
        state.camera.lookAt(cameraTarget)
    })


    return <>
     <RigidBody ref={body} canSleep={ false } colliders="ball" restitution={ 0.2 } friction={ 1 } position={ [ 0, 1, 0 ] }>
     <mesh castShadow>
        <icosahedronGeometry args={[ 0.3, 1 ]} />
        <meshStandardMaterial color="mediumpurple" /> 
     </mesh>
     </RigidBody> 
    </>

}