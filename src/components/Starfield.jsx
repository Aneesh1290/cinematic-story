import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Starfield = ({ count = 2500, size = 1.0, scrollFactor = 0.05 }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        // --- Setup ---
        const scene = new THREE.Scene();
        // Fog for depth fading
        scene.fog = new THREE.FogExp2(0x1a0b2e, 0.002); // Adjust fog color to match app theme (deep-purple #1a0b2e)

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // --- Stars ---
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = count;
        const posArray = new Float32Array(starsCount * 3);
        const sizesArray = new Float32Array(starsCount);

        for (let i = 0; i < starsCount * 3; i++) {
            // Random distribution in a large sphere/box
            posArray[i] = (Math.random() - 0.5) * 500;
        }

        for (let i = 0; i < starsCount; i++) {
            sizesArray[i] = Math.random() * size;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

        // Note: Using PointsMaterial for simple dots. Custom shader would be heavier but nicer.
        // Let's stick to lightweight PointsMaterial.
        const starsMaterial = new THREE.PointsMaterial({
            size: size,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true, // Stars shrink with distance
            depthWrite: false,      // Better transparency blending
            blending: THREE.AdditiveBlending
        });

        // Could enhance with a circular sprite texture for round stars if needed (requires loading).
        // For lightweight, square points (default) or basic Points is very fast. 
        // Adding a simple canvas texture for round points:
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        starsMaterial.map = texture;
        starsMaterial.alphaMap = texture; // Use alpha map for transparency


        const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starsMesh);

        // --- Interaction State ---
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.05; // Reduced sensitivity
            mouseY = (event.clientY - windowHalfY) * 0.05;
        };

        const onScroll = () => {
            // Scroll affects camera Z position or star rotation speed
            const scrollY = window.scrollY;
            camera.position.z = 50 + scrollY * scrollFactor;
            // Also rotate stars slightly
            starsMesh.rotation.y = scrollY * 0.0005;
            starsMesh.rotation.x = scrollY * 0.0002;
        };

        document.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('scroll', onScroll);

        // --- Animation Loop ---
        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            targetX = mouseX * 0.05; // Smooth follow
            targetY = mouseY * 0.05;

            // Constant slow rotation
            starsMesh.rotation.y += 0.0005;
            starsMesh.rotation.x += 0.0002;

            // Simple parallax on mouse move
            starsMesh.rotation.y += 0.05 * (targetX - starsMesh.rotation.y);
            starsMesh.rotation.x += 0.05 * (targetY - starsMesh.rotation.x);

            renderer.render(scene, camera);
        };

        animate();

        // --- Resize ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // --- Cleanup ---
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', onDocumentMouseMove);
            window.removeEventListener('scroll', onScroll);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // Dispose Three.js objects
            starsGeometry.dispose();
            starsMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
            style={{
                background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)' // Fallback/Underlay gradient
            }}
        />
    );
};

export default Starfield;
