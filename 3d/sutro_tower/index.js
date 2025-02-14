import { BoundingBox, Color, Script, Vec3, MiniStats } from 'playcanvas';
import { createSogs } from 'sogs';
import { Annotation } from 'annotation'

import viewerSettings from "viewerSettings" with { type: "json" };

window.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', async () => {
    const position = viewerSettings.camera.position && new Vec3(viewerSettings.camera.position);
    const target = viewerSettings.camera.target && new Vec3(viewerSettings.camera.target);

    const appElement = await document.querySelector('pc-app').ready();
    const app = await appElement.app;

    const entityElement = await document.querySelector('pc-entity[name="camera"]').ready();
    const entity = entityElement.entity;
    

    class FrameScene extends Script {
        resetCamera(bbox) {
            this.entity.script.cameraControls.focus(target, position);
        }

        calcBound() {
            const gsplatComponents = this.app.root.findComponents('gsplat');
            return gsplatComponents?.[0]?.instance?.meshInstance?.aabb ?? new BoundingBox();
        }

        initCamera() {
            const cameraControls = window.cameraControls = this.entity.script.cameraControls;
            cameraControls.sceneSize = 5;
            cameraControls.lookSensitivity  = 0.1;
            cameraControls.moveSpeed = 0.1;
            cameraControls.moveFastSpeed = 0.2;
            cameraControls.moveSlowSpeed = 0.05;
            cameraControls.moveDamping = 0.98//0.995;
            cameraControls.rotateSpeed = 0.35;
            cameraControls.rotateDamping = 0.99;
            cameraControls.zoomDamping = window.isMobile ? 0.995 : 0.98;
            cameraControls.focusDamping = 0.99
            cameraControls.zoomMax = 1
            cameraControls.zoomPinchSens = 15

            cameraControls.on('clamp:position', (position) => {
                const xz_dist = Math.sqrt(position.x ** 2 + position.z ** 2);
                if (xz_dist > 5) {
                    position.x  = position.x / xz_dist * 5;
                    position.z  = position.z / xz_dist * 5;
                }
                position.y = Math.min(Math.max(0.2, position.y), 4);
            });

            cameraControls.on('clamp:angles', (angles) => {
                angles.x = Math.max(-90, Math.min(90, angles.x));
            });

            const bbox = this.calcBound();
            this.resetCamera(bbox);
            cameraControls._spinning = true

            window.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'r':
                        this.resetCamera(bbox);
                        break;
                }
            });

            app.on('annotation-focus', (cameraPos, target) => {
                cameraControls.refocus(target, cameraPos, true)
            })
            setInterval(() => {
                const pos = cameraControls.entity.getPosition()
                const arr = [pos.x, pos.y, pos.z]
                console.log(arr)
            }, 1000)

            setTimeout(updateAnnotationSetting, 1000);
        }

        postInitialize() {
            this.initCamera();
        }
    }

    const cameraElement = await document.querySelector('pc-entity[name="camera"]').ready();
    const camera = cameraElement.entity;
    window.camera = camera;

    camera.camera.clearColor = new Color(viewerSettings.background.color);
    camera.camera.fov = viewerSettings.camera.fov;
    camera.camera.nearClip = 0.00001;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('stats')) {
        new MiniStats(app);
    }

    const sogsEntity = await createSogs(app, 'data');
    sogsEntity.setEulerAngles(0, 0, 180);
    app.root.addChild(sogsEntity);
    entity.script.create(FrameScene);

    function updateAnnotationSetting() {
        document.getElementById('annotationToggle').checked ? Annotation.showAll() : Annotation.hideAll()
    }
    document.getElementById('annotationToggle').addEventListener('change', updateAnnotationSetting)
    Array.from(document.getElementsByTagName('a')).forEach((a) => a.setAttribute("target", "_blank"))


    // On entering/exiting AR, we need to set the camera clear color to transparent black
    let cameraEntity, skyType = null;
    const clearColor = new Color();

    app.xr.on('start', () => {
        if (app.xr.type === 'immersive-ar') {
            cameraEntity = app.xr.camera;
            clearColor.copy(cameraEntity.camera.clearColor);
            cameraEntity.camera.clearColor = new Color(0, 0, 0, 0);

            const sky = document.querySelector('pc-sky');
            if (sky && sky.type !== 'none') {
                skyType = sky.type;
                sky.type = 'none';
            }
        }
    });

    app.xr.on('end', () => {
        if (app.xr.type === 'immersive-ar') {
            cameraEntity.camera.clearColor = clearColor;

            const sky = document.querySelector('pc-sky');
            if (sky) {
                if (skyType) {
                    sky.type = skyType;
                    skyType = null;
                } else {
                    sky.removeAttribute('type');
                }
            }
        }
    });

    // Get button and info panel elements
    const dom = ['arMode', 'vrMode', 'enterFullscreen', 'exitFullscreen', 'info', 'infoPanel'].reduce((acc, id) => {
        acc[id] = document.getElementById(id);
        return acc;
    }, {});

    // AR
    if (app.xr.isAvailable('immersive-ar')) {
        dom.arMode.classList.remove('hidden');
        dom.arMode.addEventListener('click', () => app.xr.start(app.root.findComponent('camera'), 'immersive-ar', 'local-floor'));
    }

    // VR
    if (app.xr.isAvailable('immersive-vr')) {
        dom.vrMode.classList.remove('hidden');
        dom.vrMode.addEventListener('click', () => app.xr.start(app.root.findComponent('camera'), 'immersive-vr', 'local-floor'));
    }

    // Fullscreen
    if (document.documentElement.requestFullscreen && document.exitFullscreen) {
        dom.enterFullscreen.classList.remove('hidden');
        dom.enterFullscreen.addEventListener('click', () => document.documentElement.requestFullscreen());
        dom.exitFullscreen.addEventListener('click', () => document.exitFullscreen());
        document.addEventListener('fullscreenchange', () => {
            dom.enterFullscreen.classList[document.fullscreenElement ? 'add' : 'remove']('hidden');
            dom.exitFullscreen.classList[document.fullscreenElement ? 'remove' : 'add']('hidden');
        });
    }

    // Info
    dom.info.addEventListener('click', () => {
        dom.infoPanel.classList.toggle('hidden');
    });

    // Keyboard handler
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (app.xr.active) {
                app.xr.end();
            }
            dom.infoPanel.classList.add('hidden');
        }
    });
});