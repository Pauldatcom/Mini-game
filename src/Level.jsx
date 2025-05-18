import * as THREE from 'three'
// import pour utiliser Rapier qui gère la physique
import { CuboidCollider, RigidBody } from '@react-three/rapier' 
import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// Permet de charger des models 3D
import { useGLTF } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({color: 'limegreen',})
const floor2Material = new THREE.MeshStandardMaterial({color: 'greenyellow',})
const obstacleMaterial = new THREE.MeshStandardMaterial({color: 'orangered',})
const wallMatherial = new THREE.MeshStandardMaterial({color: 'slategrey',})




// First floor 

export function BlockStart({ position = [ 0, 0, 0 ] }) 
{
    // la Base de la plate forme utiliser group pour chaque block 
    return (
        <group position={ position }>
        <mesh  
        geometry={ boxGeometry } 
        material={floor1Material}
        position={[ 0, -0.1, 0 ]} 
        scale={[ 4, 0.2, 4 ]} 
        receiveShadow/>
        </group>
    )
   
}




// End block de la plate forme

export function BlockEnd({ position = [ 0, 0, 0 ] })
{
    const hamburger = useGLTF('./hamburger.glb')

    // Ajoute une ombre au hamburger
      hamburger.scene.children.forEach((mesh) =>
    {
        mesh.castShadow = true
    })

    return <group position={ position }>
        <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, 0, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow/>
        {/*  Physique ajouter au hamburger  */}
        <RigidBody type="fixed" colliders="hull" position={ [ 0, 0.25, 0 ] } restitution={ 0.2 } friction={ 0 }>
        <primitive object={ hamburger.scene }  scale={ 0.2 } />
        </RigidBody>
    </group>
}




// Second floor

export function BlockSpinner({ position = [ 0, 0, 0 ] })
{
   // La base de l'obstacle garder le meme nom pour pouvoir l'utiliser plusieurs fois
    const obstacle = useRef()
    // useRef est une fonction de react-three-fiber qui permet de créer une référence à un objet
    // useState est une fonction de react qui permet de créer un état
    const [ speed ] = useState(() => Math.random() + 0.2)


    // Code qui permet de faire tourner l'obstacle
    // useFrame est une fonction de react-three-fiber qui permet de faire des animations
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        // console.log(time)
        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0)) 
        // on me demade de faire time * speed mais cela crée 2 obstacles je ne comprends pas. 
        // Pour l'instant je n'ajoute pas le * speed
        obstacle.current.setNextKinematicRotation(rotation)
    })


    return (
        <group position={ position }>
            <mesh  
            geometry={ boxGeometry }
            material={floor2Material} 
            position={[ 0, -0.1, 0 ]} 
            scale={[ 4, 0.2, 4 ]} 
            receiveShadow/>

        {/* // Premier obstacle avec un rigidBody donc une physique.  */}
            <RigidBody 
            ref={ obstacle }
            type='kinematicPosition' 
            position={[ 0, 0.3, 0 ]} 
            restitution={ 0.2 } 
            friction={ 0 } >
                <mesh 
                geometry={ boxGeometry }
                material={obstacleMaterial}
                scale={[ 3.5, 0.3, 0.3 ]} 
                castShadow 
                receiveShadow />
            </RigidBody>
        </group>
    )
   
}




// Troisième floor copie de BlockSpinner mais avec une rotation differente


export function BlockLimbo({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time * timeOffset) + 1.15 
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })
    })

    return <group position={ position }>
        <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}




// Quatrième floor copie de BlockLimbo mais problème avec le timeOffset donc pas implémenté 

export function BlockAxe({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

useFrame((state) =>
{
    const time = state.clock.getElapsedTime()

    const x = Math.sin(time + timeOffset) * 1.25
    obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })
})

    return <group position={ position }>
        <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1.5, 1.5, 0.3 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}




// La fonction Bounds permet de créer les murs et le sol de la map


function Bounds ({ length = 1 })
{
    
    return <>
    <RigidBody type="fixed" restitution={ 0.2 } friction={ 0 }  >
        <mesh 
        position={ [2.15, 0.75, -(length * 2) + 2 ]} 
        geometry={ boxGeometry }
        material={ wallMatherial}
        scale={[ 0.3, 1.5, 4 * length ]}
        castShadow
        />
        <mesh
        position={ [ -2.15, 0.75, -(length * 2) + 2 ]}
        geometry={ boxGeometry }
        material={ wallMatherial }
        scale={[ 0.3, 1.5, 4 * length ]}
        receiveShadow
        />
        <mesh
        position={ [ 0, 0.75, -(length * 4) + 2 ]}
        geometry={ boxGeometry }
        material={ wallMatherial }
        scale={[ 4, 1.5, 0.3 ]}
        receiveShadow
        />
        <CuboidCollider 
        args={[ 2, 0.1, 2 * length ]} 
        position={ [ 0, -0.1, -(length * 2) + 2 ]}
        restitution={ 0.2 }
        friction={ 1 }
        />
    </RigidBody>

    </>
}




export function Level({ count = 5, types = [ BlockSpinner, BlockLimbo, BlockAxe ]}) 
{
    // Va choisir entre les 3 différentes plateformes et en créee 5 mais le nombre peut être modifie 
    
    const blocks  = useMemo(() =>
    {
        const blocks = []
        for (let i = 0; i < count; i++)
        {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }

        return blocks
    }, [ count, types ])
    
    return (
        <>

          <BlockStart position={[ 0, 0, 0 ]} /> 

          { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, - (index + 1) * 4 ]} />) }   

            <BlockEnd position={[ 0, 0, - (count + 1) * 4 ]} />

           < Bounds length={ count + 2 }/>
        </>
    )
}