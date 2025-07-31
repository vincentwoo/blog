import { Asset, Entity, BoundingBox, Color, Script, Vec3, MiniStats } from 'playcanvas';
import { Annotation } from 'annotation'

const viewerSettingsResp = fetch('settings.json')

window.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', async () => {
    const viewerSettings = await (await viewerSettingsResp).json()
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
            cameraControls.focusDamping = 0.995
            cameraControls.zoomMax = 1
            cameraControls.zoomPinchSens = 15

            cameraControls.on('clamp:position', (position) => {
                const xz_dist = Math.sqrt(position.x ** 2 + position.z ** 2);
                if (xz_dist > 5) {
                    position.x  = position.x / xz_dist * 5;
                    position.z  = position.z / xz_dist * 5;
                }
                position.y = Math.min(Math.max(0.1, position.y), 4);
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
            // setInterval(() => {
            //     const pos = cameraControls.entity.getPosition()
            //     const arr = [pos.x, pos.y, pos.z]
            //     console.log(arr)
            // }, 1000)

            setTimeout(updateAnnotationSetting, 1000);

            const interval = setInterval(() => {
                document.getElementById('ambient').play()
                    .then(() => clearInterval(interval))
                    .catch(() => void 0)
            }, 100)
        }

        postInitialize() {
            this.initCamera();
            console.timeEnd('paint')
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
    if (urlParams.has('skip')) {
        document.getElementById('infoPanel').classList.add('hidden')
        document.getElementById('about').classList.add('hidden')
        document.getElementById('infoPanelContent').style.width = 'auto'
    }

    console.time('load')
    const url = {
        url: 'data/meta.json',
        filename: 'meta.json'
    }
    const asset = new Asset(url.filename, 'gsplat', url, null, {
        mapUrl: mapUrl => 'data/' + mapUrl
    });
    app.assets.add(asset);
    app.assets.load(asset);
    asset.on('load', () => {
        console.timeEnd('load')
        console.time('paint')
        const gsplatEntity = new Entity()
        gsplatEntity.addComponent('gsplat', { asset })
        gsplatEntity.gsplat.material.setDefine('GSPLAT_AA', true)
        gsplatEntity.gsplat.highQualitySH = true
        gsplatEntity.setEulerAngles(0, 0, 180)
        app.root.addChild(gsplatEntity)
        entity.script.create(FrameScene);
    });

    function updateAnnotationSetting() {
        document.getElementById('annotationToggle').checked ? Annotation.showAll() : Annotation.hideAll()
    }
    document.getElementById('annotationToggle').addEventListener('change', updateAnnotationSetting)

    function updateSoundSetting() {
        const audio = document.getElementById('ambient')
        document.getElementById('soundToggle').checked ? audio.play() : audio.pause()
    }
    document.getElementById('soundToggle').addEventListener('change', updateSoundSetting)
    Array.from(document.getElementsByTagName('a')).forEach((a) => a.setAttribute("target", "_blank"))

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
