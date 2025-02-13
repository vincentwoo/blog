import { Vec2, Vec3, Ray, Plane, Mat4, Quat, Script, math } from 'playcanvas';

/** @import { AppBase, Entity, CameraComponent } from 'playcanvas' */

/**
 * @typedef {object} ScriptArgs
 * @property {AppBase} app - The app.
 * @property {Entity} entity - The entity.
 * @property {boolean} [enabled] - The enabled state.
 * @property {object} [attributes] - The attributes.
 */

const tmpVa = new Vec2();
const tmpV1 = new Vec3();
const tmpV2 = new Vec3();
const tmpM1 = new Mat4();
const tmpQ1 = new Quat();
const tmpR1 = new Ray();
const tmpP1 = new Plane();

/** @type {AddEventListenerOptions & EventListenerOptions} */
const PASSIVE = { passive: false };
const ZOOM_SCALE_SCENE_MULT = 10;
const EPSILON = 0.0001;

/**
 * Calculate the lerp rate.
 *
 * @param {number} damping - The damping.
 * @param {number} dt - The delta time.
 * @returns {number} - The lerp rate.
 */
const lerpRate = (damping, dt) => 1 - Math.pow(damping, dt * 1000);

function wrapAngleDegrees(angle) {
    // force angle into [0..360)
    return (angle % 360 + 360) % 360;
}

/**
 * Find the equivalent "shortest path" angle.
 * E.g. from 359° to 1°, this returns 361° as the target (so it's effectively +2°).
 */
function closestWrappedAngle(current, target) {
    // Distance in [ -359..+359 ]
    let delta = (target - current) % 360;
    if (delta > 180) {
        delta -= 360;
    } else if (delta < -180) {
        delta += 360;
    }
    // console.log(current, target, current+delta)
    // Return a target that’s within -180..+180 of the current
    return current + delta;
}

class CameraControls extends Script {
    /**
     * Fired to clamp the position (Vec3).
     *
     * @event
     * @example
     * cameraControls.on('clamp:position', (position) => {
     *     position.y = Math.max(0, position.y);
     * });
     */
    static EVENT_CLAMP_POSITION = 'clamp:position';

    /**
     * Fired to clamp the angles (Vec2).
     *
     * @event
     * @example
     * cameraControls.on('clamp:angles', (angles) => {
     *    angles.x = Math.max(-90, Math.min(90, angles.x));
     * });
     */
    static EVENT_CLAMP_ANGLES = 'clamp:angles';

    /**
     * @private
     * @type {CameraComponent | null}
     */
    _camera = null;

    /**
     * @private
     * @type {Vec3}
     */
    _origin = new Vec3();

    /**
     * @private
     * @type {Vec3}
     */
    _position = new Vec3();

    /**
     * @private
     * @type {Vec2}
     */
    _dir = new Vec2();

    /**
     * @private
     * @type {Vec3}
     */
    _angles = new Vec3();

    /**
     * @private
     * @type {Vec2}
     */
    _pitchRange = new Vec2(-360, 360);

    /**
     * @private
     * @type {number}
     */
    _zoomMin = 0;

    /**
     * @private
     * @type {number}
     */
    _zoomMax = 0;

    /**
     * @type {number}
     * @private
     */
    _zoomDist = 0;

    /**
     * @type {number}
     * @private
     */
    _cameraDist = 0;

    /**
     * @type {Map<number, PointerEvent>}
     * @private
     */
    _pointerEvents = new Map();

    /**
     * @type {number}
     * @private
     */
    _lastPinchDist = -1;

    /**
     * @type {Vec2}
     * @private
     */
    _lastPosition = new Vec2();

    /**
     * @type {boolean}
     * @private
     */
    _orbiting = false;

    /**
     * @type {boolean}
     * @private
     */
    _panning = false;

    /**
     * @type {boolean}
     * @private
     */
    _flying = false;

    /**
     * @type {boolean}
     * @private
     */
    _moving = false;

    /**
     * @type {boolean}
     * @private
     */
    _focusing = false;

    _spinning = false;
    _spinTimer = null;
    _spinYDir = -1;

    /**
     * @type {Record<string, boolean>}
     * @private
     */
    _key = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        sprint: false,
        crouch: false
    };

    /**
     * @type {HTMLElement}
     * @private
     */
    _element = this.app.graphicsDevice.canvas;

    /**
     * @type {Mat4}
     * @private
     */
    _cameraTransform = new Mat4();

    /**
     * @type {Mat4}
     * @private
     */
    _baseTransform = new Mat4();

    /**
     * @attribute
     * @title Scene Size
     * @description The scene size. The zoom, pan and fly speeds are relative to this size.
     * @type {number}
     */
    sceneSize = 100;

    /**
     * Enable orbit camera controls.
     *
     * @attribute
     * @title Enable Orbit
     * @description Enable orbit camera controls.
     * @type {boolean}
     */
    enableOrbit = true;

    /**
     * @attribute
     * @title Enable Pan
     * @description Enable pan camera controls.
     * @type {boolean}
     */
    enablePan = true;

    /**
     * @attribute
     * @title Enable Fly
     * @description Enable fly camera controls.
     * @type {boolean}
     */
    enableFly = true;

    /**
     * @attribute
     * @title Focus Damping
     * @description The damping applied when calling {@link CameraControls#focus}. A higher value means
     * more damping. A value of 0 means no damping.
     * @type {number}
     */
    focusDamping = 0.99;

    /**
     * @attribute
     * @title Rotate Speed
     * @description The rotation speed.
     * @type {number}
     */
    rotateSpeed = 0.2;

    /**
     * @attribute
     * @title Rotate Damping
     * @description The rotation damping. A higher value means more damping. A value of 0 means no damping.
     * @type {number}
     */
    rotateDamping = 0.98;

    /**
     * @attribute
     * @title Move Speed
     * @description The fly move speed relative to the scene size.
     * @type {number}
     */
    moveSpeed = 2;

    /**
     * @attribute
     * @title Move Fast Speed
     * @description The fast fly move speed relative to the scene size.
     * @type {number}
     */
    moveFastSpeed = 4;

    /**
     * @attribute
     * @title Move Slow Speed
     * @description The slow fly move speed relative to the scene size.
     * @type {number}
     */
    moveSlowSpeed = 1;

    /**
     * @attribute
     * @title Move Damping
     * @description The movement damping. A higher value means more damping. A value of 0 means no damping.
     * @type {number}
     */
    moveDamping = 0.98;

    /**
     * @attribute
     * @title Zoom Speed
     * @description The zoom speed relative to the scene size.
     * @type {number}
     */
    zoomSpeed = 0.005;

    /**
     * @attribute
     * @title Zoom Pinch Sensitivity
     * @description The touch zoom pinch sensitivity.
     * @type {number}
     */
    zoomPinchSens = 5;

    /**
     * @attribute
     * @title Zoom Damping
     * @description The zoom damping. A higher value means more damping. A value of 0 means no damping.
     * @type {number}
     */
    zoomDamping = 0.98;

    /**
     * @attribute
     * @title Zoom Scale Min
     * @description The minimum scale the camera can zoom (absolute value).
     * @type {number}
     */
    zoomScaleMin = 0;

    /** @private */
    _maybeOrbit = false;

    /** @private */
    _orbitCandidateTime = 0;

    /** @private */
    _orbitStartPos = new Vec2();

    /** @private {number} Time in ms before we commit to orbit if only 1 finger is down. */
    _orbitTimeDelay = 50;

    /** @private {number} Distance (pixels) to move before we commit to orbit. */
    _orbitThreshold = 5;

    initialize() {
        this._onWheel = this._onWheel.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);

        if (!this.entity.camera) {
            throw new Error('CameraControls script requires a camera component');
        }
        this.attach(this.entity.camera);

        this.focusPoint = this._origin ?? this.focusPoint;
        this.pitchRange = this._pitchRange ?? this.pitchRange;
        this.zoomMin = this._zoomMin ?? this.zoomMin;
        this.zoomMax = this._zoomMax ?? this.zoomMax;

        this.on('destroy', this.destroy, this);
    }

    /**
     * The element to attach the camera controls to.
     *
     * @type {HTMLElement}
     */
    set element(value) {
        this._element = value;

        const camera = this._camera;
        this.detach();
        if (camera) {
            this.attach(camera);
        }
    }

    get element() {
        return this._element;
    }

    /**
     * @attribute
     * @title Focus Point
     * @description The camera's focus point.
     * @type {Vec3}
     * @default [0, 0, 0]
     */
    set focusPoint(point) {
        if (!this._camera) {
            if (point instanceof Vec3) {
                this._origin.copy(point);
            }
            return;
        }
        this.focus(point, this.entity.getPosition(), false);
    }

    get focusPoint() {
        return this._origin;
    }

    /**
     * @attribute
     * @title Pitch Range
     * @description The camera's pitch range. Having a value of -360 means no minimum pitch and 360
     * means no maximum pitch.
     * @type {Vec2}
     * @default [-360, 360]
     */
    set pitchRange(value) {
        if (!(value instanceof Vec2)) {
            return;
        }
        this._pitchRange.copy(value);
        this._clampAngles(this._dir);
        this._smoothTransform(-1);
    }

    get pitchRange() {
        return this._pitchRange;
    }

    /**
     * @attribute
     * @title Zoom Min
     * @description The minimum zoom distance relative to the scene size.
     * @type {number}
     * @default 0
     */
    set zoomMin(value) {
        this._zoomMin = value ?? this._zoomMin;
        this._zoomDist = this._clampZoom(this._zoomDist);
        this._smoothZoom(-1);
    }

    get zoomMin() {
        return this._zoomMin;
    }

    /**
     * @attribute
     * @title Zoom Max
     * @description The maximum zoom distance relative to the scene size. Having a value less than
     * or equal to zoomMin means no maximum zoom.
     * @type {number}
     * @default 0
     */
    set zoomMax(value) {
        this._zoomMax = value ?? this._zoomMax;
        this._zoomDist = this._clampZoom(this._zoomDist);
        this._smoothZoom(-1);

    }

    get zoomMax() {
        return this._zoomMax;
    }


    /**
     * @param {Vec3} out - The output vector.
     * @returns {Vec3} - The focus vector.
     */
    _focusDir(out) {
        return out.copy(this.entity.forward).mulScalar(this._zoomDist);
    }

    /**
     * @private
     * @param {Vec2} angles - The value to clamp.
     */
    _clampAngles(angles) {
        const min = this._pitchRange.x === -360 ? -Infinity : this._pitchRange.x;
        const max = this._pitchRange.y === 360 ? Infinity : this._pitchRange.y;
        angles.x = math.clamp(angles.x, min, max);
        angles.x = angles.x % 360

        // emit clamp event
        this.fire(CameraControls.EVENT_CLAMP_ANGLES, angles);
    }

    /**
     * @private
     * @param {Vec3} position - The position to clamp.
     */
    _clampPosition(position) {
        if (this._flying) {
            tmpV1.set(0, 0, 0);
        } else {
            this._focusDir(tmpV1);
        }

        // emit clamp event
        position.sub(tmpV1);
        this.fire(CameraControls.EVENT_CLAMP_POSITION, position);
        position.add(tmpV1);
    }

    /**
     * @private
     * @param {number} value - The value to clamp.
     * @returns {number} - The clamped value.
     */
    _clampZoom(value) {
        const min = (this._camera?.nearClip ?? 0) + this.zoomMin * this.sceneSize;
        const max = this.zoomMax <= this.zoomMin ? Infinity : this.zoomMax * this.sceneSize;
        return math.clamp(value, min, max);
    }

    /**
     * @private
     * @param {MouseEvent} event - The mouse event.
     */
    _onContextMenu(event) {
        event.preventDefault();
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     * @returns {boolean} Whether the mouse pan should start.
     */
    _isStartMousePan(event) {
        if (!this.enablePan) {
            return false;
        }
        if (event.shiftKey) {
            return true;
        }
        if (!this.enableOrbit && !this.enableFly) {
            return event.button === 0 || event.button === 1 || event.button === 2;
        }
        if (!this.enableOrbit || !this.enableFly) {
            return event.button === 1 || event.button === 2;
        }
        return event.button === 1;
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     * @returns {boolean} Whether the fly should start.
     */
    _isStartFly(event) {
        if (!this.enableFly) {
            return false;
        }
        if (!this.enableOrbit && !this.enablePan) {
            return event.button === 0 || event.button === 1 || event.button === 2;
        }
        if (!this.enableOrbit) {
            return event.button === 0;
        }
        return event.button === 2;
    }

    /**
     * @param {PointerEvent} event - The pointer event.
     * @returns {boolean} Whether the orbit should start.
     * @private
     */
    _isStartOrbit(event) {
        if (!this.enableOrbit) {
            return false;
        }
        if (!this.enableFly && !this.enablePan) {
            return event.button === 0 || event.button === 1 || event.button === 2;
        }
        return event.button === 0;
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     */
    _onPointerDown(event) {
        this._stopSpin()
        if (!this._camera) {
            return;
        }

        this._element.setPointerCapture(event.pointerId);
        this._pointerEvents.set(event.pointerId, event);

        // Prevent any active focus-smoothing from messing up new gestures
        if (this._focusing) {
            this._cancelSmoothTransform();
            this._focusing = false;
        }

        // Check how many pointers we now have
        const pointerCount = this._pointerEvents.size;

        // If exactly 2 pointers -> definitely a pan/pinch gesture
        if (pointerCount === 2) {
            if (this.enablePan) {
                this._lastPinchDist = this._getPinchDist();
                this._getMidPoint(this._lastPosition);
                this._panning = true;
            }
            // Make sure we aren't orbiting or "maybe orbiting" at this point
            this._maybeOrbit = false;
            this._orbiting = false;
            return;
        }

        // If only 1 pointer -> might orbit, might pan, or might fly
        if (pointerCount === 1) {
            const startTouchPan = this.enablePan && this._pointerEvents.size === 2; // not relevant for single-finger
            const startMousePan = this._isStartMousePan(event);
            const startFly      = this._isStartFly(event);
            const startOrbit    = this._isStartOrbit(event);

            // If user pressed the fly mouse button
            if (startFly) {
                this._zoomDist = this._cameraDist;
                this._origin.copy(this.entity.getPosition());
                this._position.copy(this._origin);
                this._cameraTransform.setTranslate(0, 0, 0);
                this._flying = true;
                return;
            }

            // If user pressed the "pan" mouse button
            if (startMousePan) {
                this._lastPosition.set(event.clientX, event.clientY);
                this._panning = true;
                return;
            }

            // If user pressed the "orbit" mouse button
            if (startOrbit) {
                // Instead of orbiting immediately, we mark "maybe orbit".
                this._maybeOrbit = true;
                this._orbitCandidateTime = performance.now();
                this._orbitStartPos.set(event.clientX, event.clientY);

                // Do NOT set `this._orbiting = true` yet.
                // We'll confirm orbit in _onPointerMove once we know
                // no second finger is arriving and the user has moved enough.
            }
        }
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     */
    _onPointerMove(event) {
        if (this._pointerEvents.size === 0) {
            return;
        }

        // Update our stored pointer event
        this._pointerEvents.set(event.pointerId, event);

        const pointerCount = this._pointerEvents.size;

        // If we ever get two pointers, we switch to two-finger panning/pinch
        if (pointerCount === 2) {
            // The moment we see 2 fingers, kill any "maybe orbit."
            this._maybeOrbit = false;
            this._orbiting = false;

            // Continue or start pan/pinch logic
            if (this.enablePan) {
                // If not panning already, start now
                if (!this._panning) {
                    this._panning = true;
                    this._lastPinchDist = this._getPinchDist();
                    this._getMidPoint(this._lastPosition);
                }

                // Pan logic
                this._pan(this._getMidPoint(tmpVa));
            }

            // Pinch zoom logic
            const pinchDist = this._getPinchDist();
            if (this._lastPinchDist > 0 && this.enableOrbit) {
                this._zoom((this._lastPinchDist - pinchDist) * this.zoomPinchSens);
            }
            this._lastPinchDist = pinchDist;

            return;
        }

        // If there's exactly 1 pointer:
        if (pointerCount === 1) {
            // 1) Are we "maybe orbiting" but not confirmed yet?
            if (this._maybeOrbit && !this._orbiting) {
                const now = performance.now();
                const dt  = now - this._orbitCandidateTime;

                const dx = event.clientX - this._orbitStartPos.x;
                const dy = event.clientY - this._orbitStartPos.y;
                const distSq = dx * dx + dy * dy;

                // If the user has moved enough pixels or waited enough ms,
                // confirm that it's a real orbit drag:
                if (distSq > this._orbitThreshold * this._orbitThreshold ||
                    dt > this._orbitTimeDelay)
                {
                    // Now we commit to orbit
                    this._maybeOrbit = false;
                    this._orbiting   = true;

                    // We can do your one-time orbit init here if needed.
                    // E.g. forcibly set your orbit center or angles, if you
                    // originally had that in _onPointerDown. For example:
                    this._origin.x = 0;  // your existing logic
                    this._origin.z = 0;

                    const currentCamPos = this.entity.getPosition();
                    tmpV1.sub2(currentCamPos, this._origin);

                    // nearest angle from current
                    this._dir.y = closestWrappedAngle(
                        this._angles.y,
                        Math.atan2(tmpV1.x, tmpV1.z) * math.RAD_TO_DEG
                    );

                    const pitchRad = this._angles.x * math.DEG_TO_RAD;
                    const horizontalDist = Math.sqrt(currentCamPos.x ** 2 + currentCamPos.z ** 2);
                    this._origin.y = Math.max(Math.min(currentCamPos.y + Math.tan(pitchRad) * horizontalDist, 2), 0.2);
                    tmpV1.sub2(currentCamPos, this._origin);
                    const elev = Math.atan2(tmpV1.y, Math.sqrt(tmpV1.x * tmpV1.x + tmpV1.z * tmpV1.z)) * math.RAD_TO_DEG;
                    this._clampAngles(this._dir.set(-elev, this._dir.y));


                    tmpV1.sub2(currentCamPos, this._origin);
                    this._zoomDist = tmpV1.length();
                }
            }

            // 2) If we ended up orbiting, do the normal orbit look:
            if (this._orbiting) {
                this._look(event);
                return;
            }

            // 3) If we are panning, keep panning:
            if (this._panning) {
                this._pan(tmpVa.set(event.clientX, event.clientY));
                return;
            }

            // 4) If we are flying, do normal look while flying:
            if (this._flying) {
                this._look(event);
            }
        }
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     */
    _onPointerUp(event) {
        this._element.releasePointerCapture(event.pointerId);
        this._pointerEvents.delete(event.pointerId);

        const pointerCount = this._pointerEvents.size;

        // If we were "maybe orbiting" but never hit threshold, just cancel
        if (this._maybeOrbit) {
            this._maybeOrbit = false;
        }

        // If we were orbiting, stop
        if (this._orbiting) {
            this._orbiting = false;
        }

        // If fewer than 2 pointers remain, kill pinch
        if (pointerCount < 2) {
            this._lastPinchDist = -1;
            this._panning = false;
        }

        // If we were flying, finish
        if (this._flying) {
            this._focusDir(tmpV1);
            this._origin.add(tmpV1);
            this._position.add(tmpV1);
            this._flying = false;
        }
    }

    /**
     * @private
     * @param {WheelEvent} event - The wheel event.
     */
    _onWheel(event) {
        event.preventDefault();
        this._stopSpin()
        let delta = event.deltaY
        delta = Math.abs(delta) > 25 ? delta : delta * 10
        this._zoom(delta);
    }

    _stopSpin() {
        this._spinning = false
        clearTimeout(this._spinTimer)
        this._spinTimer = setTimeout(() => this._spinning = true, 30000)
    }

    /**
     * @private
     * @param {KeyboardEvent} event - The keyboard event.
     */
    _onKeyDown(event) {
        event.stopPropagation();
        this._stopSpin()
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this._key.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this._key.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this._key.left = true;
                break;
            case 'd':
            case 'arrowright':
                this._key.right = true;
                break;
            case 'q':
                this._key.up = true;
                break;
            case 'e':
                this._key.down = true;
                break;
            case 'shift':
                this._key.sprint = true;
                break;
            case 'control':
                this._key.crouch = true;
                break;
        }
    }

    /**
     * @private
     * @param {KeyboardEvent} event - The keyboard event.
     */
    _onKeyUp(event) {
        event.stopPropagation();
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this._key.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this._key.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this._key.left = false;
                break;
            case 'd':
            case 'arrowright':
                this._key.right = false;
                break;
            case 'q':
                this._key.up = false;
                break;
            case 'e':
                this._key.down = false;
                break;
            case 'shift':
                this._key.sprint = false;
                break;
            case 'control':
                this._key.crouch = false;
                break;
        }
    }

    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     */
    _look(event) {
        if (event.target !== this.app.graphicsDevice.canvas) {
            return;
        }
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        this._dir.x -= movementY * this.rotateSpeed;
        this._dir.y -= movementX * this.rotateSpeed;
        this._clampAngles(this._dir);
    }

    /**
     * @param {number} dt - The delta time.
     */
    _move(dt) {
        if (!this.enableFly) {
            return;
        }

        tmpV1.set(0, 0, 0);
        if (this._key.forward) {
            tmpV1.add(this.entity.forward);
        }
        if (this._key.backward) {
            tmpV1.sub(this.entity.forward);
        }
        if (this._key.left) {
            tmpV1.sub(this.entity.right);
        }
        if (this._key.right) {
            tmpV1.add(this.entity.right);
        }
        if (this._key.up) {
            tmpV1.add(this.entity.up);
        }
        if (this._key.down) {
            tmpV1.sub(this.entity.up);
        }
        tmpV1.normalize();
        this._moving = tmpV1.length() > 0;
        const speed = this._key.crouch ? this.moveSlowSpeed : this._key.sprint ? this.moveFastSpeed : this.moveSpeed;
        tmpV1.mulScalar(this.sceneSize * speed * dt);
        this._origin.add(tmpV1);

        // clamp movement if locked
        if (this._moving) {
            if (this._focusing) {
                this._cancelSmoothTransform();
                this._focusing = false;
            }

            this._clampPosition(this._origin);
        }
    }

    /**
     * @private
     * @param {Vec2} out - The output vector.
     * @returns {Vec2} The mid point.
     */
    _getMidPoint(out) {
        const [a, b] = this._pointerEvents.values();
        const dx = a.clientX - b.clientX;
        const dy = a.clientY - b.clientY;
        return out.set(b.clientX + dx * 0.5, b.clientY + dy * 0.5);
    }

    /**
     * @private
     * @returns {number} The pinch distance.
     */
    _getPinchDist() {
        const [a, b] = this._pointerEvents.values();
        const dx = a.clientX - b.clientX;
        const dy = a.clientY - b.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * @private
     * @param {Vec2} pos - The screen position.
     * @param {Vec3} point - The output point.
     */
    _screenToWorldPan(pos, point) {
        if (!this._camera) {
            return;
        }
        const mouseW = this._camera.screenToWorld(pos.x, pos.y, 1);
        const cameraPos = this.entity.getPosition();

        const focusDir = this._focusDir(tmpV1);
        const focalPos = tmpV2.add2(cameraPos, focusDir);
        const planeNormal = focusDir.mulScalar(-1).normalize();

        const plane = tmpP1.setFromPointNormal(focalPos, planeNormal);
        const ray = tmpR1.set(cameraPos, mouseW.sub(cameraPos).normalize());

        plane.intersectsRay(ray, point);
    }

    /**
     * @private
     * @param {Vec2} pos - The screen position.
     */
    _pan(pos) {
        if (!this.enablePan) {
            return;
        }

        const start = new Vec3();
        const end = new Vec3();

        this._screenToWorldPan(this._lastPosition, start);
        this._screenToWorldPan(pos, end);

        tmpV1.sub2(start, end);
        this._origin.add(tmpV1);

        this._lastPosition.copy(pos);
    }

    /**
     * @private
     * @param {number} delta - The delta.
     */
    _zoom(delta) {
        if (!this.enableOrbit && !this.enablePan) {
            return;
        }
        if (this._flying) {
            return;
        }

        if (!this._camera) {
            return;
        }
        const distNormalized = this._zoomDist / (ZOOM_SCALE_SCENE_MULT * this.sceneSize);
        const scale = math.clamp(distNormalized, this.zoomScaleMin, 1);
        this._zoomDist += (delta * this.zoomSpeed * this.sceneSize * scale);
        this._zoomDist = this._clampZoom(this._zoomDist);
    }

    /**
     * @private
     * @param {number} dt - The delta time.
     */
    _smoothZoom(dt) {
        const a = dt === -1 ? 1 : lerpRate(this.zoomDamping, dt);
        this._cameraDist = math.lerp(this._cameraDist, this._zoomDist, a);
        this._cameraTransform.setTranslate(0, 0, this._cameraDist);
    }

    /**
     * @private
     * @param {number} dt - The delta time.
     */
    _smoothTransform(dt) {
        const ar = dt === -1 ? 1 : lerpRate(this._focusing ? this.focusDamping : this.rotateDamping, dt);
        const am = dt === -1 ? 1 : lerpRate(this._focusing ? this.focusDamping : this.moveDamping, dt);
        this._angles.x = math.lerp(this._angles.x, this._dir.x, ar);
        this._angles.y = math.lerp(this._angles.y, this._dir.y, ar);

        // Smooth position as before
        this._position.lerp(this._position, this._origin, am);
        this._baseTransform.setTRS(this._position, tmpQ1.setFromEulerAngles(this._angles), Vec3.ONE);

        const focusDelta = this._position.distance(this._origin) +
            Math.abs(this._angles.x - this._dir.x) +
            Math.abs(this._angles.y - this._dir.y);
        if (this._focusing && focusDelta < EPSILON) {
            this._focusing = false;
        }
    }

    /**
     * @private
     */
    _cancelSmoothZoom() {
        this._cameraDist = this._zoomDist;
    }

    /**
     * @private
     */
    _cancelSmoothTransform() {
        this._origin.copy(this._position);
        this._dir.set(this._angles.x, this._angles.y);
    }

    /**
     * @private
     */
    _updateTransform() {
        tmpM1.copy(this._baseTransform).mul(this._cameraTransform);
        this.entity.setPosition(tmpM1.getTranslation());
        this.entity.setEulerAngles(tmpM1.getEulerAngles());
    }

    /**
     * Focus the camera on a point.
     *
     * @param {Vec3} point - The focus point.
     * @param {Vec3} [start] - The camera start position.
     * @param {boolean} [smooth] - Whether to smooth the focus.
     */
    focus(point, start, smooth = true) {
        if (!this._camera) {
            return;
        }
        if (this._flying) {
            return;
        }

        if (start) {
            tmpV1.sub2(start, point);
            const elev = Math.atan2(tmpV1.y, Math.sqrt(tmpV1.x ** 2 + tmpV1.z ** 2)) * math.RAD_TO_DEG;
            const azim = closestWrappedAngle(this._dir.y, Math.atan2(tmpV1.x, tmpV1.z) * math.RAD_TO_DEG);

            this._clampAngles(this._dir.set(-elev, azim));

            this._origin.copy(point);

            this._cameraTransform.setTranslate(0, 0, 0);

            const pos = this.entity.getPosition();
            const rot = this.entity.getRotation();
            this._baseTransform.setTRS(pos, rot, Vec3.ONE);

            this._zoomDist = this._clampZoom(tmpV1.length());

            if (!smooth) {
                this._smoothZoom(-1);
                this._smoothTransform(-1);
            }

            this._updateTransform();
        } else {
            this._origin.copy(point);
            if (!smooth) {
                this._position.copy(point);
            }
        }

        if (smooth) {
            this._focusing = true;
        }
    }

    /**
     * Reset the zoom. For orbit and panning only.
     *
     * @param {number} [zoomDist] - The zoom distance.
     * @param {boolean} [smooth] - Whether to smooth the zoom.
     */
    resetZoom(zoomDist = 0, smooth = true) {
        this._zoomDist = zoomDist;
        if (!smooth) {
            this._cameraDist = zoomDist;
        }
    }

    /**
     * Refocus the camera.
     *
     * @param {Vec3} point - The point.
     * @param {Vec3} [start] - The start.
     * @param {number} [zoomDist] - The zoom distance.
     * @param {boolean} [smooth] - Whether to smooth the refocus.
     */
    refocus(point, start, zoomDist, smooth = true) {
        if (typeof zoomDist === 'number') {
            this.resetZoom(zoomDist, smooth);
        }
        this.focus(point, start, smooth);
    }

    /**
     * @param {CameraComponent} camera - The camera component.
     */
    attach(camera) {
        if (this._camera === camera) {
            return;
        }
        this._camera = camera;

        // Attach events to canvas instead of window
        this._element.addEventListener('wheel', this._onWheel, PASSIVE);
        this._element.addEventListener('pointerdown', this._onPointerDown);
        this._element.addEventListener('pointermove', this._onPointerMove);
        this._element.addEventListener('pointerup', this._onPointerUp);
        this._element.addEventListener('contextmenu', this._onContextMenu);

        // These can stay on window since they're keyboard events
        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);
    }

    detach() {
        if (!this._camera) {
            return;
        }

        // Remove from canvas instead of window
        this._element.removeEventListener('wheel', this._onWheel, PASSIVE);
        this._element.removeEventListener('pointermove', this._onPointerMove);
        this._element.removeEventListener('pointerdown', this._onPointerDown);
        this._element.removeEventListener('pointerup', this._onPointerUp);
        this._element.removeEventListener('contextmenu', this._onContextMenu);

        // Remove keyboard events from window
        window.removeEventListener('keydown', this._onKeyDown, false);
        window.removeEventListener('keyup', this._onKeyUp, false);

        this._camera = null;

        this._cancelSmoothZoom();
        this._cancelSmoothTransform();

        this._pointerEvents.clear();
        this._lastPinchDist = -1;
        this._panning = false;
        this._key = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            sprint: false,
            crouch: false
        };
    }

    /**
     * @param {number} dt - The delta time.
     */
    update(dt) {
        if (this.app.xr?.active) {
            return;
        }

        if (!this._camera) {
            return;
        }

        if (this._spinning) {
            this._dir.y -= 1.5 * dt
            if (this._origin.y < 0.4) this._spinYDir = 1;
            if (this._origin.y > 1.5) this._spinYDir = -1;
            this._origin.y += this._spinYDir * 0.001 * dt
        }
        this._move(dt);

        if (!this._flying) {
            this._smoothZoom(dt);
        }
        this._smoothTransform(dt);
        this._updateTransform();
    }

    destroy() {
        this.detach();
    }
}

export { CameraControls };