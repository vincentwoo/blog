import { S as Script, K as KEY_P, V as Vec3, a as KEY_N, p as platform, A as Asset, E as Entity, L as LAYERID_WORLD, b as SEMANTIC_POSITION, I as INDEXFORMAT_UINT32, C as Color, M as Mat4, m as math$1, B as BoundingSphere, T as TYPE_UINT32, Q as Quat, c as Texture, P as PIXELFORMAT_RGBA8, d as StorageBuffer, e as BUFFERUSAGE_COPY_DST, f as BindGroupFormat, g as BindUniformBufferFormat, h as BindStorageBufferFormat, i as BindStorageTextureFormat, j as SHADERSTAGE_COMPUTE, k as TEXTUREDIMENSION_2D, U as UniformBufferFormat, l as UniformFormat, n as UNIFORMTYPE_MAT4, o as UNIFORMTYPE_UINT, q as UNIFORMTYPE_FLOAT, r as Shader, s as SHADERLANGUAGE_WGSL, t as Compute, u as ShaderMaterial, v as CULLFACE_NONE, w as BLEND_PREMULTIPLIED, x as PRIMITIVE_TRIANGLES, y as Mesh, z as Layer, D as SORTMODE_MANUAL, F as CULLFACE_BACK, G as BLEND_NORMAL, H as MeshInstance, J as FUNC_EQUAL, N as StandardMaterial, O as FUNC_LESSEQUAL, R as RENDERSTYLE_WIREFRAME, W as PROJECTION_PERSPECTIVE, X as EventHandler, Y as PROJECTION_ORTHOGRAPHIC, Z as Vec4, _ as ShaderChunks, $ as ADDRESS_CLAMP_TO_EDGE, a0 as FILTER_NEAREST, a1 as PIXELFORMAT_RGBA16F, a2 as RenderTarget, a3 as RenderPassPicker, a4 as BlendState, a5 as BLENDEQUATION_ADD, a6 as BLENDMODE_ONE, a7 as BLENDMODE_ONE_MINUS_SRC_ALPHA, a8 as BLENDMODE_ZERO, a9 as RenderPassShaderQuad, aa as ShaderUtils, ab as BLENDMODE_SRC_ALPHA, ac as CameraFrame$1, ad as TEXTURETYPE_RGBP, ae as ADDRESS_REPEAT, af as MiniStats } from './index.mjs';

function _define_property$K(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class InputHandler extends Script{initialize(){this._onGesture=e=>e.preventDefault();["gesturestart","gesturechange","gestureend"].forEach(name=>document.addEventListener(name,this._onGesture,{passive:false}));this.on("destroy",()=>{["gesturestart","gesturechange","gestureend"].forEach(name=>document.removeEventListener(name,this._onGesture));});this.app.keyboard.on("keydown",e=>{switch(e.key){case KEY_N:this.app.fire("toggle:night");break;case KEY_P:{const cam=this.app.root.findComponent("camera")?.entity;if(cam){const pos=cam.getPosition();const tgt=new Vec3().add2(pos,cam.forward);const r3=v=>[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];console.log(JSON.stringify({position:r3(pos),target:r3(tgt),fov:+cam.camera.fov.toFixed(1)}));}break}}});}update(dt){}}_define_property$K(InputHandler,"scriptName","inputHandler");

var inputHander = /*#__PURE__*/Object.freeze({
    __proto__: null,
    InputHandler: InputHandler
});

function _define_property$J(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class ModeManager extends Script{initialize(){this.app.on("ui:next",this.next,this);this.app.on("ui:prev",this.prev,this);this.app.on("ui:setmode",this.setMode,this);this.on("destroy",()=>{this.app.off("ui:next",this.next,this);this.app.off("ui:prev",this.prev,this);this.app.off("ui:setmode",this.setMode,this);});}postInitialize(){this.setMode(this.modes[this.activeMode]);}setMode(name){if(this.transitioning){return}const index=this.modes.indexOf(name);if(index<0){return}this.pendingMode=index;this.transitioning=true;this.app.fire("mode:change",this.modes[index],()=>this.completeTransition());}completeTransition(){if(!this.transitioning){return}this.activeMode=this.pendingMode;this.transitioning=false;}next(){if(this.modes.length>0){this.setMode(this.modes[(this.activeMode+1)%this.modes.length]);}}prev(){if(this.modes.length>0){this.setMode(this.modes[(this.activeMode-1+this.modes.length)%this.modes.length]);}}update(dt){}constructor(...args){super(...args),_define_property$J(this,"modes",[]),_define_property$J(this,"activeMode",0),_define_property$J(this,"transitioning",false),_define_property$J(this,"pendingMode",0);}}_define_property$J(ModeManager,"scriptName","modeManager");

var modeManager = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ModeManager: ModeManager
});

function _define_property$I(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const splats={inside:"https://d28zzqy0iyovbz.cloudfront.net/02d5f4eb/v3/lod-meta.json",outside:["https://d28zzqy0iyovbz.cloudfront.net/b8b1fd14/v1/lod-meta.json","https://d28zzqy0iyovbz.cloudfront.net/ca5fc884/v1/meta.json"]};const budgets={mobile:{low:1,high:1.4},desktop:{low:2,high:3.5}};class GsplatManager extends Script{initialize(){this.gsplat??(this.gsplat=this.entity);this.activeSplat="";this.assets=[];this.entities=[];const sceneGsplat=this.app.scene.gsplat;sceneGsplat.lodUpdateAngle=90;sceneGsplat.lodBehindPenalty=5;sceneGsplat.radialSorting=true;this.app.on("performanceMode:changed",this.onPerformanceModeChanged,this);this.app.on("gsplat:load",this.onLoadRequest,this);this.app.systems.gsplat.on("frame:request",this.onFrameRequest,this);this.app.graphicsDevice.on("resizecanvas",this.onFrameRequest,this);this.app.once("gsplat:ready",this.onFirstReady,this);this.on("destroy",()=>{this.app.off("performanceMode:changed",this.onPerformanceModeChanged,this);this.app.off("gsplat:load",this.onLoadRequest,this);this.app.systems.gsplat.off("frame:request",this.onFrameRequest,this);this.app.graphicsDevice.off("resizecanvas",this.onFrameRequest,this);this.app.off("gsplat:ready",this.onFirstReady,this);});}onFrameRequest(){this.app.renderNextFrame=true;}onFirstReady(){this.app.autoRender=false;}async onLoadRequest(name,done){await this.load(name);done?.();}onPerformanceModeChanged(enabled){this.performanceMode=enabled;this.applyPerfSettings();}applyPerfSettings(){const sceneGsplat=this.app.scene.gsplat;const quality=platform.mobile?budgets.mobile:budgets.desktop;const millions=this.budget>0?this.budget:this.performanceMode?quality.low:quality.high;sceneGsplat.splatBudget=millions*1e6;for(const entity of this.entities){entity.gsplat.lodRangeMin=0;entity.gsplat.lodRangeMax=99;}sceneGsplat.colorUpdateAngle=this.performanceMode?4:2;sceneGsplat.minContribution=this.performanceMode?1:2;this.app.renderNextFrame=true;}async load(name){const urls=splats[name];if(!urls){this.app.fire("gsplat:ready");return}if(name===this.activeSplat&&this.assets.length){this.app.fire("gsplat:ready");return}await this.evict();this.activeSplat=name;const assets=(Array.isArray(urls)?urls:[urls]).map((url,i)=>new Asset(`${name}-${i}`,"gsplat",{url,filename:url.split("/").pop()}));this.assets=assets;await Promise.all(assets.map(asset=>new Promise(resolve=>{asset.once("load",()=>resolve());asset.once("error",err=>{console.error("GsplatManager: asset load error",asset.name,err);resolve();});this.app.assets.add(asset);this.app.assets.load(asset);})));if(this.assets!==assets){return}for(const asset of assets){if(!asset.loaded){continue}const entity=new Entity(`gsplat:${asset.name}`);const gsplat=entity.addComponent("gsplat");gsplat.unified=true;const lodLevels=asset.resource?.octree?.lodLevels;if(lodLevels){gsplat.lodRangeMin=name==="inside"?Math.max(0,lodLevels-2):lodLevels-1;gsplat.lodRangeMax=lodLevels-1;}this.gsplat.addChild(entity);gsplat.asset=asset;this.entities.push(entity);}if(!this.entities.length){this.app.fire("gsplat:ready");return}await new Promise(resolve=>{let started=false;const onFrameReady=(camera,layer,ready,loading)=>{if(layer.id!==LAYERID_WORLD){return}if(loading>0){started=true;}else if(started&&ready){this.app.systems.gsplat.off("frame:ready",onFrameReady);resolve();}};this.app.systems.gsplat.on("frame:ready",onFrameReady);});this.applyPerfSettings();this.app.fire("gsplat:ready");}evict(){if(!this.assets.length){return Promise.resolve()}const assets=this.assets;const entities=this.entities;this.assets=[];this.entities=[];return new Promise(resolve=>{this.app.once("framerender",()=>{entities.forEach(entity=>entity.destroy());assets.forEach(asset=>this.app.assets.remove(asset));this.app.renderNextFrame=true;let skippedFrame=false;const onFrameReady=(camera,layer,ready,loading)=>{if(layer.id!==LAYERID_WORLD){return}if(!skippedFrame){skippedFrame=true;return}if(!ready){return}this.app.systems.gsplat.off("frame:ready",onFrameReady);assets.forEach(asset=>asset.unload());};this.app.systems.gsplat.on("frame:ready",onFrameReady);resolve();});})}update(dt){}constructor(...args){super(...args),_define_property$I(this,"gsplat",void 0),_define_property$I(this,"budget",0),_define_property$I(this,"performanceMode",false);}}_define_property$I(GsplatManager,"scriptName","gsplatManager");

var gsplatManager = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GsplatManager: GsplatManager
});

const DEFAULT_VOXEL_RESOLUTION=.05;const PENETRATION_EPSILON=1e-4;const MAX_RESOLVE_ITERATIONS=4;function resolveIterative(cx,cy,cz,findPenetration,constraintNormals,scratch,out){let resolvedX=cx;let resolvedY=cy;let resolvedZ=cz;let totalPushX=0;let totalPushY=0;let totalPushZ=0;let hadCollision=false;let numNormals=0;for(let iter=0;iter<MAX_RESOLVE_ITERATIONS;iter++){if(!findPenetration(resolvedX,resolvedY,resolvedZ,scratch))break;hadCollision=true;let px=scratch.x;let py=scratch.y;let pz=scratch.z;for(let i=0;i<numNormals;i++){const n=constraintNormals[i];const dot=px*n.x+py*n.y+pz*n.z;if(dot<0){px-=dot*n.x;py-=dot*n.y;pz-=dot*n.z;}}const len=Math.sqrt(scratch.x*scratch.x+scratch.y*scratch.y+scratch.z*scratch.z);if(len>PENETRATION_EPSILON&&numNormals<3){const invLen=1/len;const n=constraintNormals[numNormals];n.x=scratch.x*invLen;n.y=scratch.y*invLen;n.z=scratch.z*invLen;numNormals++;}resolvedX+=px;resolvedY+=py;resolvedZ+=pz;totalPushX+=px;totalPushY+=py;totalPushZ+=pz;}const totalPushSq=totalPushX*totalPushX+totalPushY*totalPushY+totalPushZ*totalPushZ;const hasSignificantPush=hadCollision&&totalPushSq>PENETRATION_EPSILON*PENETRATION_EPSILON;if(hasSignificantPush){out.x=totalPushX;out.y=totalPushY;out.z=totalPushZ;}return hasSignificantPush}

var collision = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEFAULT_VOXEL_RESOLUTION: DEFAULT_VOXEL_RESOLUTION,
    PENETRATION_EPSILON: PENETRATION_EPSILON,
    resolveIterative: resolveIterative
});

function _define_property$H(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const MAX_LEAF_TRIS=4;function computeTriangleBounds(tris,idx,out){const i=tris.indices[idx];out.minX=Math.min(tris.v0x[i],tris.v1x[i],tris.v2x[i]);out.minY=Math.min(tris.v0y[i],tris.v1y[i],tris.v2y[i]);out.minZ=Math.min(tris.v0z[i],tris.v1z[i],tris.v2z[i]);out.maxX=Math.max(tris.v0x[i],tris.v1x[i],tris.v2x[i]);out.maxY=Math.max(tris.v0y[i],tris.v1y[i],tris.v2y[i]);out.maxZ=Math.max(tris.v0z[i],tris.v1z[i],tris.v2z[i]);}function buildBVH(tris,start,count){const bounds={minX:Infinity,minY:Infinity,minZ:Infinity,maxX:-Infinity,maxY:-Infinity,maxZ:-Infinity};const tb={minX:0,minY:0,minZ:0,maxX:0,maxY:0,maxZ:0};for(let i=start;i<start+count;i++){computeTriangleBounds(tris,i,tb);bounds.minX=Math.min(bounds.minX,tb.minX);bounds.minY=Math.min(bounds.minY,tb.minY);bounds.minZ=Math.min(bounds.minZ,tb.minZ);bounds.maxX=Math.max(bounds.maxX,tb.maxX);bounds.maxY=Math.max(bounds.maxY,tb.maxY);bounds.maxZ=Math.max(bounds.maxZ,tb.maxZ);}if(count<=MAX_LEAF_TRIS){return {...bounds,left:null,right:null,triStart:start,triCount:count}}const dx=bounds.maxX-bounds.minX;const dy=bounds.maxY-bounds.minY;const dz=bounds.maxZ-bounds.minZ;const axis=dx>=dy&&dx>=dz?0:dy>=dz?1:2;const mid=axis===0?(bounds.minX+bounds.maxX)*.5:axis===1?(bounds.minY+bounds.maxY)*.5:(bounds.minZ+bounds.maxZ)*.5;let left=start;let right=start+count-1;while(left<=right){const i=tris.indices[left];const cx=axis===0?(tris.v0x[i]+tris.v1x[i]+tris.v2x[i])/3:axis===1?(tris.v0y[i]+tris.v1y[i]+tris.v2y[i])/3:(tris.v0z[i]+tris.v1z[i]+tris.v2z[i])/3;if(cx<mid){left++;}else {const tmp=tris.indices[left];tris.indices[left]=tris.indices[right];tris.indices[right]=tmp;right--;}}let leftCount=left-start;if(leftCount===0||leftCount===count)leftCount=count>>1;return {...bounds,left:buildBVH(tris,start,leftCount),right:buildBVH(tris,start+leftCount,count-leftCount),triStart:0,triCount:0}}function rayAABB(ox,oy,oz,idx,idy,idz,minX,minY,minZ,maxX,maxY,maxZ,maxDist){const t1x=(minX-ox)*idx;const t2x=(maxX-ox)*idx;const t1y=(minY-oy)*idy;const t2y=(maxY-oy)*idy;const t1z=(minZ-oz)*idz;const t2z=(maxZ-oz)*idz;const tmin=Math.max(Math.min(t1x,t2x),Math.min(t1y,t2y),Math.min(t1z,t2z));const tmax=Math.min(Math.max(t1x,t2x),Math.max(t1y,t2y),Math.max(t1z,t2z));if(tmax<0||tmin>tmax||tmin>maxDist)return  -1;return tmin>=0?tmin:0}function rayTriangle(ox,oy,oz,dx,dy,dz,ax,ay,az,bx,by,bz,cx,cy,cz){const e1x=bx-ax,e1y=by-ay,e1z=bz-az;const e2x=cx-ax,e2y=cy-ay,e2z=cz-az;const px=dy*e2z-dz*e2y;const py=dz*e2x-dx*e2z;const pz=dx*e2y-dy*e2x;const det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-10)return  -1;const invDet=1/det;const tx=ox-ax,ty=oy-ay,tz=oz-az;const u=(tx*px+ty*py+tz*pz)*invDet;if(u<0||u>1)return  -1;const qx=ty*e1z-tz*e1y;const qy=tz*e1x-tx*e1z;const qz=tx*e1y-ty*e1x;const v=(dx*qx+dy*qy+dz*qz)*invDet;if(v<0||u+v>1)return  -1;const t=(e2x*qx+e2y*qy+e2z*qz)*invDet;return t>=0?t:-1}function sphereAABBOverlap(cx,cy,cz,radius,minX,minY,minZ,maxX,maxY,maxZ){const nx=Math.max(minX,Math.min(cx,maxX));const ny=Math.max(minY,Math.min(cy,maxY));const nz=Math.max(minZ,Math.min(cz,maxZ));const dx=cx-nx,dy=cy-ny,dz=cz-nz;return dx*dx+dy*dy+dz*dz<=radius*radius}function closestPointOnTriangle(px,py,pz,ax,ay,az,bx,by,bz,cx,cy,cz,out){const abx=bx-ax,aby=by-ay,abz=bz-az;const acx=cx-ax,acy=cy-ay,acz=cz-az;const apx=px-ax,apy=py-ay,apz=pz-az;const d1=abx*apx+aby*apy+abz*apz;const d2=acx*apx+acy*apy+acz*apz;if(d1<=0&&d2<=0){out.x=ax;out.y=ay;out.z=az;return}const bpx=px-bx,bpy=py-by,bpz=pz-bz;const d3=abx*bpx+aby*bpy+abz*bpz;const d4=acx*bpx+acy*bpy+acz*bpz;if(d3>=0&&d4<=d3){out.x=bx;out.y=by;out.z=bz;return}const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);out.x=ax+abx*v;out.y=ay+aby*v;out.z=az+abz*v;return}const cpx=px-cx,cpy=py-cy,cpz=pz-cz;const d5=abx*cpx+aby*cpy+abz*cpz;const d6=acx*cpx+acy*cpy+acz*cpz;if(d6>=0&&d5<=d6){out.x=cx;out.y=cy;out.z=cz;return}const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);out.x=ax+acx*w;out.y=ay+acy*w;out.z=az+acz*w;return}const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0){const w=(d4-d3)/(d4-d3+(d5-d6));out.x=bx+(cx-bx)*w;out.y=by+(cy-by)*w;out.z=bz+(cz-bz)*w;return}const denom=1/(va+vb+vc);const v=vb*denom;const w=vc*denom;out.x=ax+abx*v+acx*w;out.y=ay+aby*v+acy*w;out.z=az+abz*v+acz*w;}function closestPointOnSegment(px,py,pz,ax,ay,az,bx,by,bz,out){const abx=bx-ax,aby=by-ay,abz=bz-az;const lenSq=abx*abx+aby*aby+abz*abz;if(lenSq<1e-20){out.x=ax;out.y=ay;out.z=az;return}const apx=px-ax,apy=py-ay,apz=pz-az;let t=(apx*abx+apy*aby+apz*abz)/lenSq;t=Math.max(0,Math.min(1,t));out.x=ax+abx*t;out.y=ay+aby*t;out.z=az+abz*t;}const _segPt={x:0,y:0,z:0};const _triPt={x:0,y:0,z:0};const _tmpSegPt={x:0,y:0,z:0};const _tmpTriPt={x:0,y:0,z:0};function closestSegmentTriangle(s0x,s0y,s0z,s1x,s1y,s1z,ax,ay,az,bx,by,bz,cx,cy,cz,outSeg,outTri){const SAMPLES=5;let bestDistSq=Infinity;for(let i=0;i<=SAMPLES;i++){const t=i/SAMPLES;const sx=s0x+(s1x-s0x)*t;const sy=s0y+(s1y-s0y)*t;const sz=s0z+(s1z-s0z)*t;closestPointOnTriangle(sx,sy,sz,ax,ay,az,bx,by,bz,cx,cy,cz,_tmpTriPt);const dx=sx-_tmpTriPt.x,dy=sy-_tmpTriPt.y,dz=sz-_tmpTriPt.z;const distSq=dx*dx+dy*dy+dz*dz;if(distSq<bestDistSq){bestDistSq=distSq;_segPt.x=sx;_segPt.y=sy;_segPt.z=sz;_triPt.x=_tmpTriPt.x;_triPt.y=_tmpTriPt.y;_triPt.z=_tmpTriPt.z;}}closestPointOnSegment(_triPt.x,_triPt.y,_triPt.z,s0x,s0y,s0z,s1x,s1y,s1z,_tmpSegPt);closestPointOnTriangle(_tmpSegPt.x,_tmpSegPt.y,_tmpSegPt.z,ax,ay,az,bx,by,bz,cx,cy,cz,_tmpTriPt);const dx=_tmpSegPt.x-_tmpTriPt.x;const dy=_tmpSegPt.y-_tmpTriPt.y;const dz=_tmpSegPt.z-_tmpTriPt.z;const distSq=dx*dx+dy*dy+dz*dz;if(distSq<bestDistSq){bestDistSq=distSq;_segPt.x=_tmpSegPt.x;_segPt.y=_tmpSegPt.y;_segPt.z=_tmpSegPt.z;_triPt.x=_tmpTriPt.x;_triPt.y=_tmpTriPt.y;_triPt.z=_tmpTriPt.z;}outSeg.x=_segPt.x;outSeg.y=_segPt.y;outSeg.z=_segPt.z;outTri.x=_triPt.x;outTri.y=_triPt.y;outTri.z=_triPt.z;return bestDistSq}const _closest={x:0,y:0,z:0};const _segClosest={x:0,y:0,z:0};const _triClosest={x:0,y:0,z:0};class MeshCollision{get triangles(){return this._tris}queryRay(ox,oy,oz,dx,dy,dz,maxDist){const len=Math.sqrt(dx*dx+dy*dy+dz*dz);if(len<1e-10)return null;const invLen=1/len;dx*=invLen;dy*=invLen;dz*=invLen;const idx=1/(Math.abs(dx)>1e-12?dx:dx>=0?1e-12:-1e-12);const idy=1/(Math.abs(dy)>1e-12?dy:dy>=0?1e-12:-1e-12);const idz=1/(Math.abs(dz)>1e-12?dz:dz>=0?1e-12:-1e-12);const hit=this._queryRayBVH(ox,oy,oz,dx,dy,dz,idx,idy,idz,maxDist);if(!hit)return null;return {x:ox+dx*hit.t,y:oy+dy*hit.t,z:oz+dz*hit.t}}querySphere(cx,cy,cz,radius,out){return resolveIterative(cx,cy,cz,(rx,ry,rz,push)=>this._deepestSpherePenetration(rx,ry,rz,radius,push),this._constraintNormals,this._push,out)}queryCapsule(cx,cy,cz,halfHeight,radius,out){return resolveIterative(cx,cy,cz,(rx,ry,rz,push)=>this._deepestCapsulePenetration(rx,ry,rz,halfHeight,radius,push),this._constraintNormals,this._push,out)}isFreeAt(x,y,z){return !this._deepestSpherePenetration(x,y,z,this.voxelResolution*.5,this._push)}querySurfaceNormal(x,y,z,rdx,rdy,rdz){const len=Math.sqrt(rdx*rdx+rdy*rdy+rdz*rdz);if(len<1e-10){this._normalResult.nx=0;this._normalResult.ny=1;this._normalResult.nz=0;return this._normalResult}const invLen=1/len;const dx=rdx*invLen;const dy=rdy*invLen;const dz=rdz*invLen;const idx=1/(Math.abs(dx)>1e-12?dx:dx>=0?1e-12:-1e-12);const idy=1/(Math.abs(dy)>1e-12?dy:dy>=0?1e-12:-1e-12);const idz=1/(Math.abs(dz)>1e-12?dz:dz>=0?1e-12:-1e-12);const hit=this._queryRayBVH(x,y,z,dx,dy,dz,idx,idy,idz,1);const result=this._normalResult;if(hit){const i=hit.triIdx;result.nx=this._tris.nx[i];result.ny=this._tris.ny[i];result.nz=this._tris.nz[i];const dot=result.nx*dx+result.ny*dy+result.nz*dz;if(dot>0){result.nx=-result.nx;result.ny=-result.ny;result.nz=-result.nz;}}else {result.nx=0;result.ny=1;result.nz=0;}return result}_queryRayBVH(ox,oy,oz,dx,dy,dz,idx,idy,idz,maxDist){const root=this._root;if(rayAABB(ox,oy,oz,idx,idy,idz,root.minX,root.minY,root.minZ,root.maxX,root.maxY,root.maxZ,maxDist)<0){return null}const stack=this._stack;let top=0;stack[top++]=root;let bestT=maxDist+1;let bestTriIdx=-1;const{_tris:tris}=this;while(top>0){const node=stack[--top];if(node.left===null){for(let j=node.triStart;j<node.triStart+node.triCount;j++){const i=tris.indices[j];const ht=rayTriangle(ox,oy,oz,dx,dy,dz,tris.v0x[i],tris.v0y[i],tris.v0z[i],tris.v1x[i],tris.v1y[i],tris.v1z[i],tris.v2x[i],tris.v2y[i],tris.v2z[i]);if(ht>=0&&ht<=maxDist&&ht<bestT){bestT=ht;bestTriIdx=i;}}continue}const tLeft=rayAABB(ox,oy,oz,idx,idy,idz,node.left.minX,node.left.minY,node.left.minZ,node.left.maxX,node.left.maxY,node.left.maxZ,bestT);const tRight=rayAABB(ox,oy,oz,idx,idy,idz,node.right.minX,node.right.minY,node.right.minZ,node.right.maxX,node.right.maxY,node.right.maxZ,bestT);if(tLeft>=0&&tRight>=0){if(tLeft<=tRight){stack[top++]=node.right;stack[top++]=node.left;}else {stack[top++]=node.left;stack[top++]=node.right;}}else if(tLeft>=0){stack[top++]=node.left;}else if(tRight>=0){stack[top++]=node.right;}}if(bestTriIdx<0)return null;const result=this._rayResult;result.t=bestT;result.triIdx=bestTriIdx;return result}_deepestSpherePenetration(cx,cy,cz,radius,out){let bestPen=PENETRATION_EPSILON;let bestPx=0,bestPy=0,bestPz=0;let found=false;this._sphereBVH(this._root,cx,cy,cz,radius,triIdx=>{const tris=this._tris;closestPointOnTriangle(cx,cy,cz,tris.v0x[triIdx],tris.v0y[triIdx],tris.v0z[triIdx],tris.v1x[triIdx],tris.v1y[triIdx],tris.v1z[triIdx],tris.v2x[triIdx],tris.v2y[triIdx],tris.v2z[triIdx],_closest);const dx=cx-_closest.x;const dy=cy-_closest.y;const dz=cz-_closest.z;const distSq=dx*dx+dy*dy+dz*dz;if(distSq>=radius*radius)return;const dist=Math.sqrt(distSq);const penetration=radius-dist;if(penetration>bestPen){bestPen=penetration;if(dist>1e-10){const invDist=1/dist;bestPx=dx*invDist*penetration;bestPy=dy*invDist*penetration;bestPz=dz*invDist*penetration;}else {bestPx=tris.nx[triIdx]*penetration;bestPy=tris.ny[triIdx]*penetration;bestPz=tris.nz[triIdx]*penetration;}found=true;}});if(found){out.x=bestPx;out.y=bestPy;out.z=bestPz;}return found}_deepestCapsulePenetration(cx,cy,cz,halfHeight,radius,out){let bestPen=PENETRATION_EPSILON;let bestPx=0,bestPy=0,bestPz=0;let found=false;const s0x=cx,s0y=cy-halfHeight,s0z=cz;const s1x=cx,s1y=cy+halfHeight,s1z=cz;const capsuleRadius=radius;const capsuleCenterY=cy;const capsuleHalfExtentY=halfHeight+radius;this._capsuleBVH(this._root,cx,capsuleCenterY,cz,capsuleHalfExtentY,capsuleRadius,triIdx=>{const tris=this._tris;closestSegmentTriangle(s0x,s0y,s0z,s1x,s1y,s1z,tris.v0x[triIdx],tris.v0y[triIdx],tris.v0z[triIdx],tris.v1x[triIdx],tris.v1y[triIdx],tris.v1z[triIdx],tris.v2x[triIdx],tris.v2y[triIdx],tris.v2z[triIdx],_segClosest,_triClosest);const dx=_segClosest.x-_triClosest.x;const dy=_segClosest.y-_triClosest.y;const dz=_segClosest.z-_triClosest.z;const distSq=dx*dx+dy*dy+dz*dz;if(distSq>=radius*radius)return;const dist=Math.sqrt(distSq);const penetration=radius-dist;if(penetration>bestPen){bestPen=penetration;if(dist>1e-10){const invDist=1/dist;bestPx=dx*invDist*penetration;bestPy=dy*invDist*penetration;bestPz=dz*invDist*penetration;}else {bestPx=tris.nx[triIdx]*penetration;bestPy=tris.ny[triIdx]*penetration;bestPz=tris.nz[triIdx]*penetration;}found=true;}});if(found){out.x=bestPx;out.y=bestPy;out.z=bestPz;}return found}_sphereBVH(root,cx,cy,cz,radius,callback){const stack=this._stack;let top=0;stack[top++]=root;while(top>0){const node=stack[--top];if(!sphereAABBOverlap(cx,cy,cz,radius,node.minX,node.minY,node.minZ,node.maxX,node.maxY,node.maxZ)){continue}if(node.left===null){const{_tris:tris}=this;for(let j=node.triStart;j<node.triStart+node.triCount;j++){callback(tris.indices[j]);}continue}stack[top++]=node.right;stack[top++]=node.left;}}_capsuleBVH(root,cx,cy,cz,halfExtentY,radius,callback){const capMinX=cx-radius;const capMaxX=cx+radius;const capMinY=cy-halfExtentY;const capMaxY=cy+halfExtentY;const capMinZ=cz-radius;const capMaxZ=cz+radius;const stack=this._stack;let top=0;stack[top++]=root;while(top>0){const node=stack[--top];if(capMaxX<node.minX||capMinX>node.maxX||capMaxY<node.minY||capMinY>node.maxY||capMaxZ<node.minZ||capMinZ>node.maxZ){continue}if(node.left===null){const{_tris:tris}=this;for(let j=node.triStart;j<node.triStart+node.triCount;j++){callback(tris.indices[j]);}continue}stack[top++]=node.right;stack[top++]=node.left;}}static fromGlb(app,url){return new Promise((resolve,reject)=>{const asset=new Asset(url,"container",{url});const cleanup=()=>{app.assets.remove(asset);asset.unload();};asset.on("load",()=>{const renders=asset.resource.renders;if(!renders||renders.length===0){cleanup();reject(new Error("GLB contains no mesh data"));return}const allPositions=[];const allIndices=[];let vertexOffset=0;for(const renderAsset of renders){const render=renderAsset.resource;for(let m=0;m<render.meshes.length;m++){const mesh=render.meshes[m];const vb=mesh.vertexBuffer;const ib=mesh.indexBuffer[0];if(!vb||!ib)continue;const format=vb.format;let posElement=null;for(let e=0;e<format.elements.length;e++){if(format.elements[e].name===SEMANTIC_POSITION){posElement=format.elements[e];break}}if(!posElement)continue;const data=new Float32Array(vb.storage);const stride=format.size/4;const offset=posElement.offset/4;const numVerts=vb.numVertices;for(let v=0;v<numVerts;v++){const base=v*stride+offset;allPositions.push(data[base],data[base+1],data[base+2]);}const indexData=ib.format===INDEXFORMAT_UINT32?new Uint32Array(ib.storage):new Uint16Array(ib.storage);for(const prim of mesh.primitive){for(let i=0;i<prim.count;i++){allIndices.push(indexData[prim.base+i]+vertexOffset);}}vertexOffset+=numVerts;}}if(allIndices.length===0){cleanup();reject(new Error("GLB meshes contain no triangle data"));return}const collision=new MeshCollision(new Float32Array(allPositions),new Uint32Array(allIndices));cleanup();resolve(collision);});asset.on("error",err=>{cleanup();reject(new Error(err));});app.assets.add(asset);app.assets.load(asset);})}constructor(positions,indices){_define_property$H(this,"voxelResolution",DEFAULT_VOXEL_RESOLUTION);_define_property$H(this,"_tris",void 0);_define_property$H(this,"_root",void 0);_define_property$H(this,"_normalResult",{nx:0,ny:0,nz:0});_define_property$H(this,"_push",{x:0,y:0,z:0});_define_property$H(this,"_constraintNormals",[{x:0,y:0,z:0},{x:0,y:0,z:0},{x:0,y:0,z:0}]);_define_property$H(this,"_stack",[]);_define_property$H(this,"_rayResult",{t:-1,triIdx:-1});const numTris=Math.floor(indices.length/3);const tris={v0x:new Float32Array(numTris),v0y:new Float32Array(numTris),v0z:new Float32Array(numTris),v1x:new Float32Array(numTris),v1y:new Float32Array(numTris),v1z:new Float32Array(numTris),v2x:new Float32Array(numTris),v2y:new Float32Array(numTris),v2z:new Float32Array(numTris),nx:new Float32Array(numTris),ny:new Float32Array(numTris),nz:new Float32Array(numTris),indices:new Uint32Array(numTris),count:numTris};for(let i=0;i<numTris;i++){const i0=indices[i*3]*3;const i1=indices[i*3+1]*3;const i2=indices[i*3+2]*3;tris.v0x[i]=positions[i0];tris.v0y[i]=positions[i0+1];tris.v0z[i]=positions[i0+2];tris.v1x[i]=positions[i1];tris.v1y[i]=positions[i1+1];tris.v1z[i]=positions[i1+2];tris.v2x[i]=positions[i2];tris.v2y[i]=positions[i2+1];tris.v2z[i]=positions[i2+2];const e1x=tris.v1x[i]-tris.v0x[i];const e1y=tris.v1y[i]-tris.v0y[i];const e1z=tris.v1z[i]-tris.v0z[i];const e2x=tris.v2x[i]-tris.v0x[i];const e2y=tris.v2y[i]-tris.v0y[i];const e2z=tris.v2z[i]-tris.v0z[i];let fnx=e1y*e2z-e1z*e2y;let fny=e1z*e2x-e1x*e2z;let fnz=e1x*e2y-e1y*e2x;const len=Math.sqrt(fnx*fnx+fny*fny+fnz*fnz);if(len>1e-10){const invLen=1/len;fnx*=invLen;fny*=invLen;fnz*=invLen;}tris.nx[i]=fnx;tris.ny[i]=fny;tris.nz[i]=fnz;tris.indices[i]=i;}this._tris=tris;this._root=buildBVH(tris,0,numTris);}}

var meshCollision = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MeshCollision: MeshCollision
});

function _define_property$G(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const SOLID_LEAF_MARKER=0xff000000>>>0;const FLAT_R=2;const INV_SQRT2$1=1/Math.sqrt(2);const SURFACE_CANDIDATES=[[1,0,0,0,1,0,0,0,1],[0,1,0,1,0,0,0,0,1],[0,0,1,1,0,0,0,1,0],[1,0,1,0,1,0,-1,0,1],[1,0,-1,0,1,0,1,0,1],[1,1,0,0,0,1,-1,1,0],[1,-1,0,0,0,1,1,1,0],[0,1,1,1,0,0,0,-1,1],[0,1,-1,1,0,0,0,1,1]];function scoreSurfaceCandidate(collision,ix,iy,iz,sx,sy,sz,t1x,t1y,t1z,t2x,t2y,t2z){let best=0;for(let depth=1;depth>=-1;depth--){let s=0;for(let da=-FLAT_R;da<=FLAT_R;da++){for(let db=-FLAT_R;db<=FLAT_R;db++){const px=ix+da*t1x+db*t2x-sx*depth;const py=iy+da*t1y+db*t2y-sy*depth;const pz=iz+da*t1z+db*t2z-sz*depth;if(collision.isVoxelSolid(px,py,pz)&&!collision.isVoxelSolid(px+sx,py+sy,pz+sz)){s++;}}}if(s>best)best=s;}return best}function popcount(n){n>>>=0;n-=n>>>1&0x55555555;n=(n&0x33333333)+(n>>>2&0x33333333);return (n+(n>>>4)&0xf0f0f0f)*0x1010101>>>24}class VoxelCollision{get gridMinX(){return this._gridMinX}get gridMinY(){return this._gridMinY}get gridMinZ(){return this._gridMinZ}get numVoxelsX(){return this._numVoxelsX}get numVoxelsY(){return this._numVoxelsY}get numVoxelsZ(){return this._numVoxelsZ}get voxelResolution(){return this._voxelResolution}get leafSize(){return this._leafSize}get treeDepth(){return this._treeDepth}get nodes(){return this._nodes}get leafData(){return this._leafData}get flipXY(){return false}isFreeAt(x,y,z){if(this._nodes.length===0){return false}const res=this._voxelResolution;const ix=Math.floor((x-this._gridMinX)/res);const iy=Math.floor((y-this._gridMinY)/res);const iz=Math.floor((z-this._gridMinZ)/res);if(ix<0||iy<0||iz<0||ix>=this._numVoxelsX||iy>=this._numVoxelsY||iz>=this._numVoxelsZ){return false}return !this.isVoxelSolid(ix,iy,iz)}querySurfaceNormal(x,y,z,rdx,rdy,rdz){const nudge=this._voxelResolution*.25;const ix=Math.floor((x+Math.sign(rdx)*nudge-this._gridMinX)/this._voxelResolution);const iy=Math.floor((y+Math.sign(rdy)*nudge-this._gridMinY)/this._voxelResolution);const iz=Math.floor((z+Math.sign(rdz)*nudge-this._gridMinZ)/this._voxelResolution);const result=this._normalResult;let bestScore=-1;let bestNx=0;let bestNy=1;let bestNz=0;for(let c=0;c<SURFACE_CANDIDATES.length;c++){const cand=SURFACE_CANDIDATES[c];const dx=cand[0];const dy=cand[1];const dz=cand[2];const dot=rdx*dx+rdy*dy+rdz*dz;if(Math.abs(dot)<1e-6)continue;const sign=dot<0?1:-1;const sx=dx*sign;const sy=dy*sign;const sz=dz*sign;const score=scoreSurfaceCandidate(this,ix,iy,iz,sx,sy,sz,cand[3],cand[4],cand[5],cand[6],cand[7],cand[8]);if(score>bestScore){bestScore=score;const mag=Math.abs(dx)+Math.abs(dy)+Math.abs(dz)>1?INV_SQRT2$1:1;bestNx=sx*mag;bestNy=sy*mag;bestNz=sz*mag;}}result.nx=bestNx;result.ny=bestNy;result.nz=bestNz;return result}queryRay(ox,oy,oz,dx,dy,dz,maxDist){if(this._nodes.length===0){return null}const res=this._voxelResolution;const gMinX=this._gridMinX;const gMinY=this._gridMinY;const gMinZ=this._gridMinZ;const gMaxX=gMinX+this._numVoxelsX*res;const gMaxY=gMinY+this._numVoxelsY*res;const gMaxZ=gMinZ+this._numVoxelsZ*res;const EPS=1e-12;let tNear=0;let tFar=maxDist;if(Math.abs(dx)>EPS){let t1=(gMinX-ox)/dx;let t2=(gMaxX-ox)/dx;if(t1>t2){const tmp=t1;t1=t2;t2=tmp;}if(t1>tNear){tNear=t1;}tFar=Math.min(tFar,t2);if(tNear>tFar)return null}else if(ox<gMinX||ox>=gMaxX){return null}if(Math.abs(dy)>EPS){let t1=(gMinY-oy)/dy;let t2=(gMaxY-oy)/dy;if(t1>t2){const tmp=t1;t1=t2;t2=tmp;}if(t1>tNear){tNear=t1;}tFar=Math.min(tFar,t2);if(tNear>tFar)return null}else if(oy<gMinY||oy>=gMaxY){return null}if(Math.abs(dz)>EPS){let t1=(gMinZ-oz)/dz;let t2=(gMaxZ-oz)/dz;if(t1>t2){const tmp=t1;t1=t2;t2=tmp;}if(t1>tNear){tNear=t1;}tFar=Math.min(tFar,t2);if(tNear>tFar)return null}else if(oz<gMinZ||oz>=gMaxZ){return null}const entryX=ox+dx*tNear;const entryY=oy+dy*tNear;const entryZ=oz+dz*tNear;let ix=Math.max(0,Math.min(Math.floor((entryX-gMinX)/res),this._numVoxelsX-1));let iy=Math.max(0,Math.min(Math.floor((entryY-gMinY)/res),this._numVoxelsY-1));let iz=Math.max(0,Math.min(Math.floor((entryZ-gMinZ)/res),this._numVoxelsZ-1));const stepX=dx>0?1:dx<0?-1:0;const stepY=dy>0?1:dy<0?-1:0;const stepZ=dz>0?1:dz<0?-1:0;const invDx=Math.abs(dx)>EPS?1/dx:0;const invDy=Math.abs(dy)>EPS?1/dy:0;const invDz=Math.abs(dz)>EPS?1/dz:0;let tMaxX=Math.abs(dx)>EPS?(gMinX+(ix+(dx>0?1:0))*res-ox)*invDx:Infinity;let tMaxY=Math.abs(dy)>EPS?(gMinY+(iy+(dy>0?1:0))*res-oy)*invDy:Infinity;let tMaxZ=Math.abs(dz)>EPS?(gMinZ+(iz+(dz>0?1:0))*res-oz)*invDz:Infinity;const tDeltaX=Math.abs(dx)>EPS?res*Math.abs(invDx):Infinity;const tDeltaY=Math.abs(dy)>EPS?res*Math.abs(invDy):Infinity;const tDeltaZ=Math.abs(dz)>EPS?res*Math.abs(invDz):Infinity;let currentT=tNear;const maxSteps=this._numVoxelsX+this._numVoxelsY+this._numVoxelsZ;for(let step=0;step<maxSteps;step++){if(this.isVoxelSolid(ix,iy,iz)){return {x:ox+dx*currentT,y:oy+dy*currentT,z:oz+dz*currentT}}if(tMaxX<tMaxY){if(tMaxX<tMaxZ){currentT=tMaxX;ix+=stepX;tMaxX+=tDeltaX;}else {currentT=tMaxZ;iz+=stepZ;tMaxZ+=tDeltaZ;}}else if(tMaxY<tMaxZ){currentT=tMaxY;iy+=stepY;tMaxY+=tDeltaY;}else {currentT=tMaxZ;iz+=stepZ;tMaxZ+=tDeltaZ;}if(ix<0||iy<0||iz<0||ix>=this._numVoxelsX||iy>=this._numVoxelsY||iz>=this._numVoxelsZ||currentT>maxDist){return null}}return null}querySphere(cx,cy,cz,radius,out){if(this.nodes.length===0){return false}return resolveIterative(cx,cy,cz,(rx,ry,rz,push)=>this.resolveDeepestPenetration(rx,ry,rz,radius,push),this._constraintNormals,this._push,out)}queryCapsule(cx,cy,cz,halfHeight,radius,out){if(this.nodes.length===0){return false}return resolveIterative(cx,cy,cz,(rx,ry,rz,push)=>this.resolveDeepestPenetrationCapsule(rx,ry,rz,halfHeight,radius,push),this._constraintNormals,this._push,out)}resolveDeepestPenetration(cx,cy,cz,radius,out){const{voxelResolution,gridMinX,gridMinY,gridMinZ}=this;const radiusSq=radius*radius;const ixMin=Math.floor((cx-radius-gridMinX)/voxelResolution);const iyMin=Math.floor((cy-radius-gridMinY)/voxelResolution);const izMin=Math.floor((cz-radius-gridMinZ)/voxelResolution);const ixMax=Math.floor((cx+radius-gridMinX)/voxelResolution);const iyMax=Math.floor((cy+radius-gridMinY)/voxelResolution);const izMax=Math.floor((cz+radius-gridMinZ)/voxelResolution);let bestPushX=0;let bestPushY=0;let bestPushZ=0;let bestPenetration=PENETRATION_EPSILON;let found=false;for(let iz=izMin;iz<=izMax;iz++){for(let iy=iyMin;iy<=iyMax;iy++){for(let ix=ixMin;ix<=ixMax;ix++){if(!this.isVoxelSolid(ix,iy,iz)){continue}const vMinX=gridMinX+ix*voxelResolution;const vMinY=gridMinY+iy*voxelResolution;const vMinZ=gridMinZ+iz*voxelResolution;const vMaxX=vMinX+voxelResolution;const vMaxY=vMinY+voxelResolution;const vMaxZ=vMinZ+voxelResolution;const nearX=Math.max(vMinX,Math.min(cx,vMaxX));const nearY=Math.max(vMinY,Math.min(cy,vMaxY));const nearZ=Math.max(vMinZ,Math.min(cz,vMaxZ));const dx=cx-nearX;const dy=cy-nearY;const dz=cz-nearZ;const distSq=dx*dx+dy*dy+dz*dz;if(distSq>=radiusSq){continue}let px;let py;let pz;let penetration;if(distSq>1e-12){const dist=Math.sqrt(distSq);penetration=radius-dist;const invDist=1/dist;px=dx*invDist*penetration;py=dy*invDist*penetration;pz=dz*invDist*penetration;}else {const distNegX=cx-vMinX;const distPosX=vMaxX-cx;const distNegY=cy-vMinY;const distPosY=vMaxY-cy;const distNegZ=cz-vMinZ;const distPosZ=vMaxZ-cz;const escapeX=distNegX<distPosX?-(distNegX+radius):distPosX+radius;const escapeY=distNegY<distPosY?-(distNegY+radius):distPosY+radius;const escapeZ=distNegZ<distPosZ?-(distNegZ+radius):distPosZ+radius;const absX=Math.abs(escapeX);const absY=Math.abs(escapeY);const absZ=Math.abs(escapeZ);px=0;py=0;pz=0;if(absX<=absY&&absX<=absZ){px=escapeX;penetration=absX;}else if(absY<=absZ){py=escapeY;penetration=absY;}else {pz=escapeZ;penetration=absZ;}}if(penetration>bestPenetration){bestPenetration=penetration;bestPushX=px;bestPushY=py;bestPushZ=pz;found=true;}}}}if(found){out.x=bestPushX;out.y=bestPushY;out.z=bestPushZ;}return found}resolveDeepestPenetrationCapsule(cx,cy,cz,halfHeight,radius,out){const{voxelResolution,gridMinX,gridMinY,gridMinZ}=this;const radiusSq=radius*radius;const segBottomY=cy-halfHeight;const segTopY=cy+halfHeight;const ixMin=Math.floor((cx-radius-gridMinX)/voxelResolution);const iyMin=Math.floor((segBottomY-radius-gridMinY)/voxelResolution);const izMin=Math.floor((cz-radius-gridMinZ)/voxelResolution);const ixMax=Math.floor((cx+radius-gridMinX)/voxelResolution);const iyMax=Math.floor((segTopY+radius-gridMinY)/voxelResolution);const izMax=Math.floor((cz+radius-gridMinZ)/voxelResolution);let bestPushX=0;let bestPushY=0;let bestPushZ=0;let bestPenetration=PENETRATION_EPSILON;let found=false;for(let iz=izMin;iz<=izMax;iz++){for(let iy=iyMin;iy<=iyMax;iy++){for(let ix=ixMin;ix<=ixMax;ix++){if(!this.isVoxelSolid(ix,iy,iz)){continue}const vMinX=gridMinX+ix*voxelResolution;const vMinY=gridMinY+iy*voxelResolution;const vMinZ=gridMinZ+iz*voxelResolution;const vMaxX=vMinX+voxelResolution;const vMaxY=vMinY+voxelResolution;const vMaxZ=vMinZ+voxelResolution;let segY;if(segTopY<vMinY){segY=segTopY;}else if(segBottomY>vMaxY){segY=segBottomY;}else {const aabbCenterY=(vMinY+vMaxY)*.5;segY=Math.max(segBottomY,Math.min(segTopY,aabbCenterY));}const nearX=Math.max(vMinX,Math.min(cx,vMaxX));const nearY=Math.max(vMinY,Math.min(segY,vMaxY));const nearZ=Math.max(vMinZ,Math.min(cz,vMaxZ));const dx=cx-nearX;const dy=segY-nearY;const dz=cz-nearZ;const distSq=dx*dx+dy*dy+dz*dz;if(distSq>=radiusSq){continue}let px;let py;let pz;let penetration;if(distSq>1e-12){const dist=Math.sqrt(distSq);penetration=radius-dist;const invDist=1/dist;px=dx*invDist*penetration;py=dy*invDist*penetration;pz=dz*invDist*penetration;}else {const distNegX=cx-vMinX;const distPosX=vMaxX-cx;const distNegY=segY-vMinY;const distPosY=vMaxY-segY;const distNegZ=cz-vMinZ;const distPosZ=vMaxZ-cz;const escapeX=distNegX<distPosX?-(distNegX+radius):distPosX+radius;const escapeY=distNegY<distPosY?-(distNegY+radius):distPosY+radius;const escapeZ=distNegZ<distPosZ?-(distNegZ+radius):distPosZ+radius;const absX=Math.abs(escapeX);const absY=Math.abs(escapeY);const absZ=Math.abs(escapeZ);px=0;py=0;pz=0;if(absX<=absY&&absX<=absZ){px=escapeX;penetration=absX;}else if(absY<=absZ){py=escapeY;penetration=absY;}else {pz=escapeZ;penetration=absZ;}}if(penetration>bestPenetration){bestPenetration=penetration;bestPushX=px;bestPushY=py;bestPushZ=pz;found=true;}}}}if(found){out.x=bestPushX;out.y=bestPushY;out.z=bestPushZ;}return found}isVoxelSolid(ix,iy,iz){if(this.nodes.length===0||ix<0||iy<0||iz<0||ix>=this.numVoxelsX||iy>=this.numVoxelsY||iz>=this.numVoxelsZ){return false}const{leafSize,treeDepth}=this;const blockX=Math.floor(ix/leafSize);const blockY=Math.floor(iy/leafSize);const blockZ=Math.floor(iz/leafSize);let nodeIndex=0;for(let level=treeDepth-1;level>=0;level--){const node=this.nodes[nodeIndex]>>>0;if(node===SOLID_LEAF_MARKER){return true}const childMask=node>>>24&255;if(childMask===0){return this.checkLeafByIndex(node,ix,iy,iz)}const bitX=blockX>>>level&1;const bitY=blockY>>>level&1;const bitZ=blockZ>>>level&1;const octant=bitZ<<2|bitY<<1|bitX;if((childMask&1<<octant)===0){return false}const baseOffset=node&0xffffff;const prefix=(1<<octant)-1;const childOffset=popcount(childMask&prefix);nodeIndex=baseOffset+childOffset;}const node=this.nodes[nodeIndex]>>>0;if(node===SOLID_LEAF_MARKER){return true}return this.checkLeafByIndex(node,ix,iy,iz)}checkLeafByIndex(node,ix,iy,iz){const leafDataIndex=node&0xffffff;const vx=ix&3;const vy=iy&3;const vz=iz&3;const bitIndex=vz*16+vy*4+vx;if(bitIndex<32){const lo=this.leafData[leafDataIndex*2]>>>0;return (lo>>>bitIndex&1)===1}const hi=this.leafData[leafDataIndex*2+1]>>>0;return (hi>>>bitIndex-32&1)===1}constructor(metadata,nodes,leafData){_define_property$G(this,"_gridMinX",void 0);_define_property$G(this,"_gridMinY",void 0);_define_property$G(this,"_gridMinZ",void 0);_define_property$G(this,"_numVoxelsX",void 0);_define_property$G(this,"_numVoxelsY",void 0);_define_property$G(this,"_numVoxelsZ",void 0);_define_property$G(this,"_voxelResolution",void 0);_define_property$G(this,"_leafSize",void 0);_define_property$G(this,"_treeDepth",void 0);_define_property$G(this,"_nodes",void 0);_define_property$G(this,"_leafData",void 0);_define_property$G(this,"_push",{x:0,y:0,z:0});_define_property$G(this,"_normalResult",{nx:0,ny:0,nz:0});_define_property$G(this,"_constraintNormals",[{x:0,y:0,z:0},{x:0,y:0,z:0},{x:0,y:0,z:0}]);this._gridMinX=metadata.gridBounds.min[0];this._gridMinY=metadata.gridBounds.min[1];this._gridMinZ=metadata.gridBounds.min[2];const res=metadata.voxelResolution;this._numVoxelsX=Math.round((metadata.gridBounds.max[0]-metadata.gridBounds.min[0])/res);this._numVoxelsY=Math.round((metadata.gridBounds.max[1]-metadata.gridBounds.min[1])/res);this._numVoxelsZ=Math.round((metadata.gridBounds.max[2]-metadata.gridBounds.min[2])/res);this._voxelResolution=res;this._leafSize=metadata.leafSize;this._treeDepth=metadata.treeDepth;this._nodes=nodes;this._leafData=leafData;}}class FlippedVoxelCollision extends VoxelCollision{get flipXY(){return true}querySurfaceNormal(x,y,z,rdx,rdy,rdz){const result=super.querySurfaceNormal(-x,-y,z,-rdx,-rdy,rdz);result.nx=-result.nx;result.ny=-result.ny;return result}queryRay(ox,oy,oz,dx,dy,dz,maxDist){const hit=super.queryRay(-ox,-oy,oz,-dx,-dy,dz,maxDist);if(hit){hit.x=-hit.x;hit.y=-hit.y;}return hit}querySphere(cx,cy,cz,radius,out){const result=super.querySphere(-cx,-cy,cz,radius,out);if(result){out.x=-out.x;out.y=-out.y;}return result}queryCapsule(cx,cy,cz,halfHeight,radius,out){const result=super.queryCapsule(-cx,-cy,cz,halfHeight,radius,out);if(result){out.x=-out.x;out.y=-out.y;}return result}isFreeAt(x,y,z){return super.isFreeAt(-x,-y,z)}}const loadVoxelCollision=async jsonUrl=>{const metaResponse=await fetch(jsonUrl);if(!metaResponse.ok){throw new Error(`Failed to fetch voxel metadata: ${metaResponse.statusText}`)}const metadata=await metaResponse.json();const binUrl=jsonUrl.replace(".voxel.json",".voxel.bin");const binResponse=await fetch(binUrl);if(!binResponse.ok){throw new Error(`Failed to fetch voxel binary: ${binResponse.statusText}`)}const buffer=await binResponse.arrayBuffer();const view=new Uint32Array(buffer);const nodes=view.slice(0,metadata.nodeCount);const leafData=view.slice(metadata.nodeCount,metadata.nodeCount+metadata.leafDataCount);const isLegacy=!metadata.version||parseFloat(metadata.version)<1.1;if(isLegacy){return new FlippedVoxelCollision(metadata,nodes,leafData)}return new VoxelCollision(metadata,nodes,leafData)};

var voxelCollision = /*#__PURE__*/Object.freeze({
    __proto__: null,
    VoxelCollision: VoxelCollision,
    loadVoxelCollision: loadVoxelCollision
});

var index$4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MeshCollision: MeshCollision,
    VoxelCollision: VoxelCollision,
    loadVoxelCollision: loadVoxelCollision
});

function _define_property$F(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const target=new Vec3;let CameraSettings$1 = class CameraSettings{constructor(){_define_property$F(this,"fov",90);_define_property$F(this,"clearColor",new Color(0,0,0));_define_property$F(this,"sharpness",.2);}};class WalkMode extends Script{initialize(){this._collision=null;this._wantWalk=false;this._lastPose=null;this._loadCollision();this.app.on("mode:change",this.onModeChange,this);this.on("destroy",()=>{this.app.off("mode:change",this.onModeChange,this);});}async _loadCollision(){const asset=this.collisionAsset;if(!asset){return}try{const url=asset.getFileUrl();this._collision=url.toLowerCase().includes(".glb")?await MeshCollision.fromGlb(this.app,url):await loadVoxelCollision(url);this._applyCollision();this._activateIfReady();}catch(err){console.warn("WalkMode: collision load failed",err);}}_applyCollision(){const bridge=this.cameraEntity?.script?.cameraBridge;if(!bridge||!this._collision){return false}if(typeof bridge.setCollision==="function"){bridge.setCollision(this._collision);}else {const walk=bridge.getController?.("walk");if(!walk){return false}walk.collision=this._collision;}return true}_activateIfReady(){const bridge=this.cameraEntity?.script?.cameraBridge;if(!bridge||!this._wantWalk||!this._collision){return}if(!this._applyCollision()){return}const walk=bridge.getController("walk");walk.fov=this.camera.fov;walk.eyeHeight=this.eyeHeight;walk.moveGroundSpeed=this.moveSpeed;if(this._lastPose){bridge.frame(this._lastPose.position,this._lastPose.target,this.camera.fov);}else {const marker=this.poseMarker??this.entity;const eye=marker.getPosition();target.add2(eye,marker.forward);bridge.frame(eye,target,this.camera.fov);}bridge.activate("walk");}onModeChange(name,done){if(name!=="walk"){if(this._wantWalk){const bridge=this.cameraEntity?.script?.cameraBridge;if(bridge?.getPose){this._lastPose=bridge.getPose();}}this._wantWalk=false;return}const bridge=this.cameraEntity?.script?.cameraBridge;if(!bridge){console.error("WalkMode: cameraBridge not found on cameraEntity");done?.();return}this.cameraEntity.camera.clearColor=this.camera.clearColor;const cameraFrame=this.cameraEntity.script.cameraFrame;if(cameraFrame){cameraFrame.rendering.sharpness=this.camera.sharpness;}this._wantWalk=true;this._activateIfReady();this.app.fire("gsplat:load","inside",done);}constructor(...args){super(...args),_define_property$F(this,"cameraEntity",void 0),_define_property$F(this,"poseMarker",void 0),_define_property$F(this,"collisionAsset",null),_define_property$F(this,"camera",new CameraSettings$1),_define_property$F(this,"eyeHeight",1.6),_define_property$F(this,"moveSpeed",7);}}_define_property$F(WalkMode,"scriptName","walkMode");

var walkMode = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WalkMode: WalkMode
});

const damp=(damping,dt)=>1-Math.pow(damping,dt*1e3);const easeOut=x=>(1-2**(-10*x))/(1-2**-10);const mod=(n,m)=>(n%m+m)%m;const nearlyEquals=(a,b,epsilon=1e-4)=>{return !a.some((v,i)=>Math.abs(v-b[i])>=epsilon)};const vecToAngles=(result,vec)=>{const radToDeg=180/Math.PI;const horizLenSq=vec.x*vec.x+vec.z*vec.z;result.x=Math.asin(Math.max(-1,Math.min(1,vec.y)))*radToDeg;result.y=horizLenSq>1e-8?Math.atan2(-vec.x,-vec.z)*radToDeg:0;result.z=0;return result};

var math = /*#__PURE__*/Object.freeze({
    __proto__: null,
    damp: damp,
    easeOut: easeOut,
    mod: mod,
    nearlyEquals: nearlyEquals,
    vecToAngles: vecToAngles
});

function _define_property$E(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const MAX_CUTOUT_SHAPES=16;const _scale$1=new Vec3;const _box=new Mat4;const _invViewProj=new Mat4;const _deviceVP=new Mat4;const _screenSize=new Float32Array(4);const _triggerInv=new Mat4;const _triggerHalf=new Vec3;const _camLocal=new Vec3;function sdBox(p,b){const qx=Math.abs(p.x)-b.x,qy=Math.abs(p.y)-b.y,qz=Math.abs(p.z)-b.z;const ox=Math.max(qx,0),oy=Math.max(qy,0),oz=Math.max(qz,0);return Math.sqrt(ox*ox+oy*oy+oz*oz)+Math.min(Math.max(qx,Math.max(qy,qz)),0)}const WEBGPU_DEPTH_RANGE=new Mat4().set([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]);const _invMatrixData=new Float32Array(16*MAX_CUTOUT_SHAPES);const _halfExtentData=new Float32Array(4*MAX_CUTOUT_SHAPES);const _edgeRGB=new Float32Array(3);const _flagScale=new Vec3;const _flagSphere=new BoundingSphere;const _flagCenterData=new Float32Array(3);const _flagHalfData=new Float32Array(3);const _flagParamsData=new Float32Array(4);const cutoutModifyVS_glsl=`
    uniform int cutoutCount;
    uniform float cutoutSplatMargin;                   // world-units half-width of the border band
    uniform mat4 cutoutInvMatrix[16];                  // world -> box-local rigid (rot+trans, no scale)
    uniform vec4 cutoutHalfExtent[16];                 // xyz: box half-extents (world units); w: 0..1 blend weight

    // Per-splat world-space radius, populated in modifySplatRotationScale (called first) and
    // read in modifySplatColor. Widens the border band per-splat so a big flat-wall gaussian
    // isn't wrongly classified as "fully inside" while its footprint reaches past the cut edge —
    // otherwise splats that physically span the box boundary get whole-splat culled, popping
    // chunks off the edge. 2x scale ≈ the visible extent (the shader draws to ~2σ).
    float _cutoutSplatRadius = 0.0;

    // exact signed distance to an axis-aligned box of half-size b (negative inside)
    float cutoutSdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    uniform vec4 flagParams;                           // x: amplitude (world), y: wave number k, z: angular speed, w: time
    uniform vec3 flagCenter;                           // flag box centre (world; the box is assumed axis-aligned)
    uniform vec3 flagHalfExtent;                       // flag box half-extents (world units)

    // Displaced-surface slope at this splat (dz/dx, dz/dy), set by modifySplatCenter and consumed
    // by modifySplatRotationScale to tilt the gaussian onto the waving cloth.
    float _flagZx = 0.0;
    float _flagZy = 0.0;

    // How strongly splats tilt onto the waved surface: 1 = glued to the analytic slope (reads as
    // over-articulated), 0 = no tilt (shingles at crests).
    const float FLAG_TILT = 0.25;

    // Flag flap (rides here because this chunk replaces the engine default wholesale and the flag
    // is never peeked): gaussians inside the authored AXIS-ALIGNED flag box are displaced along
    // world Z by a travelling wave. Amplitude ramps from 0 at the pole edge (the box's +X face)
    // to full at the free edge (-X) so the cloth stays attached, and the crests travel away from
    // the pole; a detuned harmonic breaks up the pure sine. Inert at amplitude 0 (uniform branch
    // — unconfigured, or culled by the host when the box is off-screen / beyond maxDistance).
    void modifySplatCenter(inout vec3 center) {
        _flagZx = 0.0;
        _flagZy = 0.0;
        if (flagParams.x <= 0.0) {
            return;
        }
        vec3 p = center - flagCenter;
        vec3 q = abs(p) - flagHalfExtent;
        if (max(q.x, max(q.y, q.z)) > 0.0) {
            return;                                    // outside the flag box
        }
        float ramp = clamp((flagHalfExtent.x - p.x) / (2.0 * flagHalfExtent.x), 0.0, 1.0);
        float phase = flagParams.y * (p.x + 0.35 * p.y) + flagParams.z * flagParams.w;
        float wave = sin(phase) + 0.45 * sin(1.83 * phase + 1.3);
        center.z += flagParams.x * ramp * ramp * wave;
        // Slope of z = A * ramp^2 * wave for the rotation stage (dRamp/dx = -1/(2hx)) — from the
        // PRIMARY sine only: the harmonic's slope swings 1.83x faster and steeper, and driving
        // the tilt with it reads as splats snapping/flipping at every crest. The harmonic stays
        // in the displacement, where it looks like flutter.
        float waveD = cos(phase);
        float dRamp = -1.0 / (2.0 * flagHalfExtent.x);
        _flagZx = flagParams.x * (2.0 * ramp * dRamp * sin(phase) + ramp * ramp * waveD * flagParams.y);
        _flagZy = flagParams.x * ramp * ramp * waveD * flagParams.y * 0.35;
    }

    void modifySplatRotationScale(vec3 originalCenter, vec3 modifiedCenter, inout vec4 rotation, inout vec3 scale) {
        _cutoutSplatRadius = 2.0 * max(max(scale.x, scale.y), scale.z);

        // Tilt flag gaussians onto the displaced cloth: the shortest-arc rotation taking +Z to
        // the waved surface normal, premultiplied onto the splat orientation, so flat cloth
        // splats follow the wave instead of shingling at crests. The modify hook contract passes
        // quats as (x, y, z, w) — scalar LAST (the engine converts its (w,x,y,z) storage on the
        // way in and out; see compute-gsplat-project-common.js).
        if (_flagZx != 0.0 || _flagZy != 0.0) {
            // scaled + clamped so the tilt can never exceed ~28 degrees, however steep the wave
            float tx = clamp(_flagZx * FLAG_TILT, -0.53, 0.53);
            float ty = clamp(_flagZy * FLAG_TILT, -0.53, 0.53);
            vec3 n = normalize(vec3(-tx, -ty, 1.0));
            vec4 t = normalize(vec4(-n.y, n.x, 0.0, 1.0 + n.z));
            rotation = vec4(
                t.w * rotation.xyz + rotation.w * t.xyz + cross(t.xyz, rotation.xyz),
                t.w * rotation.w - dot(t.xyz, rotation.xyz)
            );
        }
    }

    void modifySplatColor(vec3 center, inout vec4 color) {
        // effective margin is the configured band PLUS the splat's own extent, so any splat
        // whose footprint might reach across the cut surface goes to the fragment stage
        float margin = cutoutSplatMargin + _cutoutSplatRadius;
        float fade = 0.0;
        uint bits = 0u;
        for (int i = 0; i < 16; i++) {
            if (i >= cutoutCount) break;
            float w = cutoutHalfExtent[i].w;
            if (w <= 0.0) continue;                    // fully closed — no cut
            vec3 p = (cutoutInvMatrix[i] * vec4(center, 1.0)).xyz;
            float d = cutoutSdBox(p, cutoutHalfExtent[i].xyz);
            if (d < -margin) {
                fade = max(fade, w);                   // fully inside (with radius slack): whole splat
            } else if (d < margin) {
                bits |= (1u << uint(i));               // border band: fragment stage decides
            }
        }
        color.a *= (1.0 - fade);
        setCutoutBits(bits);
    }
`;const cutoutModifyVS_wgsl=`
    uniform cutoutCount: i32;
    uniform cutoutSplatMargin: f32;                    // world-units half-width of the border band
    uniform cutoutInvMatrix: array<mat4x4f, 16>;       // world -> box-local rigid (rot+trans, no scale)
    uniform cutoutHalfExtent: array<vec4f, 16>;        // xyz: box half-extents (world units); w: 0..1 blend weight

    // Per-splat world-space radius; see the GLSL twin for the rationale.
    var<private> _cutoutSplatRadius: f32 = 0.0;

    // exact signed distance to an axis-aligned box of half-size b (negative inside)
    fn cutoutSdBox(p: vec3f, b: vec3f) -> f32 {
        let q: vec3f = abs(p) - b;
        return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    uniform flagParams: vec4f;                         // x: amplitude (world), y: wave number k, z: angular speed, w: time
    uniform flagCenter: vec3f;                         // flag box centre (world; the box is assumed axis-aligned)
    uniform flagHalfExtent: vec3f;                     // flag box half-extents (world units)

    // Displaced-surface slope at this splat; see the GLSL twin.
    var<private> _flagZx: f32 = 0.0;
    var<private> _flagZy: f32 = 0.0;

    // How strongly splats tilt onto the waved surface — see the GLSL twin.
    const FLAG_TILT: f32 = 0.25;

    // Flag flap — see the GLSL twin for the rationale.
    fn modifySplatCenter(center: ptr<function, vec3f>) {
        _flagZx = 0.0;
        _flagZy = 0.0;
        if (uniform.flagParams.x <= 0.0) {
            return;
        }
        let p: vec3f = *center - uniform.flagCenter;
        let q: vec3f = abs(p) - uniform.flagHalfExtent;
        if (max(q.x, max(q.y, q.z)) > 0.0) {
            return;                                    // outside the flag box
        }
        let ramp: f32 = clamp((uniform.flagHalfExtent.x - p.x) / (2.0 * uniform.flagHalfExtent.x), 0.0, 1.0);
        let phase: f32 = uniform.flagParams.y * (p.x + 0.35 * p.y) + uniform.flagParams.z * uniform.flagParams.w;
        let wave: f32 = sin(phase) + 0.45 * sin(1.83 * phase + 1.3);
        (*center).z = (*center).z + uniform.flagParams.x * ramp * ramp * wave;
        // slope from the PRIMARY sine only — see the GLSL twin (harmonic-driven tilt reads as
        // splats snapping at crests)
        let waveD: f32 = cos(phase);
        let dRamp: f32 = -1.0 / (2.0 * uniform.flagHalfExtent.x);
        _flagZx = uniform.flagParams.x * (2.0 * ramp * dRamp * sin(phase) + ramp * ramp * waveD * uniform.flagParams.y);
        _flagZy = uniform.flagParams.x * ramp * ramp * waveD * uniform.flagParams.y * 0.35;
    }

    fn modifySplatRotationScale(originalCenter: vec3f, modifiedCenter: vec3f, rotation: ptr<function, vec4f>, scale: ptr<function, vec3f>) {
        _cutoutSplatRadius = 2.0 * max(max((*scale).x, (*scale).y), (*scale).z);

        // Tilt flag gaussians onto the displaced cloth — see the GLSL twin. The modify hook
        // contract passes quats as (x, y, z, w) — scalar LAST.
        if (_flagZx != 0.0 || _flagZy != 0.0) {
            // scaled + clamped so the tilt can never exceed ~28 degrees, however steep the wave
            let tx: f32 = clamp(_flagZx * FLAG_TILT, -0.53, 0.53);
            let ty: f32 = clamp(_flagZy * FLAG_TILT, -0.53, 0.53);
            let n: vec3f = normalize(vec3f(-tx, -ty, 1.0));
            let t: vec4f = normalize(vec4f(-n.y, n.x, 0.0, 1.0 + n.z));
            let r: vec4f = *rotation;
            *rotation = vec4f(
                t.w * r.xyz + r.w * t.xyz + cross(t.xyz, r.xyz),
                t.w * r.w - dot(t.xyz, r.xyz)
            );
        }
    }

    fn modifySplatColor(center: vec3f, color: ptr<function, vec4f>) {
        let margin: f32 = uniform.cutoutSplatMargin + _cutoutSplatRadius;
        var fade: f32 = 0.0;
        var bits: u32 = 0u;
        for (var i: i32 = 0; i < 16; i = i + 1) {
            if (i >= uniform.cutoutCount) { break; }
            let w: f32 = uniform.cutoutHalfExtent[i].w;
            if (w <= 0.0) { continue; }                // fully closed — no cut
            let p: vec3f = (uniform.cutoutInvMatrix[i] * vec4f(center, 1.0)).xyz;
            let d: f32 = cutoutSdBox(p, uniform.cutoutHalfExtent[i].xyz);
            if (d < -margin) {
                fade = max(fade, w);                   // fully inside (with radius slack): whole splat
            } else if (d < margin) {
                bits = bits | (1u << u32(i));          // border band: fragment stage decides
            }
        }
        (*color).a = (*color).a * (1.0 - fade);
        setCutoutBits(bits);
    }
`;const cutoutModifyPS_glsl=`
    uniform mat4 matrix_viewProjectionInverse;         // inverse of engine matrix_viewProjection; uploaded per-frame
    uniform vec4 cutoutScreenSize;                     // xy: viewport size, zw: 1/size (uploaded by the host)
    uniform float cutoutEdgeWidth;                     // rim thickness in SCREEN PIXELS (scaled to world per-fragment)
    uniform float cutoutProjScaleY;                    // projection[1][1] (= 1/tan(fovY/2)); drives the px->world scale
    uniform vec3 cutoutEdgeColor;                      // rim glow colour (already * intensity, may be HDR)
    uniform mat4 cutoutInvMatrix[16];                  // world -> box-local rigid (rot+trans, no scale)
    uniform vec4 cutoutHalfExtent[16];                 // xyz: box half-extents (world units); w: 0..1 blend weight

    // reconstruct the fragment's world position from its own depth (no scene depth map)
    vec3 cutoutWorldPos() {
        vec2 ndcXY = gl_FragCoord.xy * cutoutScreenSize.zw * 2.0 - 1.0;
        float ndcZ = gl_FragCoord.z * 2.0 - 1.0;       // GLSL only runs on WebGL: z in [-1, 1]
        vec4 world = matrix_viewProjectionInverse * vec4(ndcXY, ndcZ, 1.0);
        return world.xyz / world.w;
    }

    // exact signed distance to an axis-aligned box of half-size b (negative inside)
    float cutoutSdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    void modifySplatColor(vec2 gaussianUV, inout vec4 color) {
        uint bits = getCutoutBits();
        if (bits == 0u) {
            return;                                    // splat not in any border band
        }

        // world width that covers cutoutEdgeWidth screen pixels at this fragment's depth, so the
        // rim keeps a constant on-screen thickness regardless of the cut's distance
        float viewZ = 1.0 / gl_FragCoord.w;            // linear eye-space depth
        float worldPerPixel = 2.0 * viewZ / (cutoutScreenSize.y * cutoutProjScaleY);
        float widthWorld = max(cutoutEdgeWidth * worldPerPixel, 1e-6);

        // sample the cutout union at the fragment's world position, flagged boxes only. The box is
        // always full-size; its 0..1 blend weight drives an alpha fade instead of growing the box.
        vec3 wp = cutoutWorldPos();
        float fade = 0.0;                              // strongest weight among boxes CONTAINING wp
        float rim = 0.0;                               // strongest edge-glow factor just OUTSIDE a surface
        for (int i = 0; i < 16; i++) {
            if ((bits & (1u << uint(i))) == 0u) continue;
            float w = cutoutHalfExtent[i].w;
            vec3 p = (cutoutInvMatrix[i] * vec4(wp, 1.0)).xyz;
            float d = cutoutSdBox(p, cutoutHalfExtent[i].xyz);
            if (d < 0.0) {
                fade = max(fade, w);                   // inside: fade the fragment out by its weight
            } else {
                rim = max(rim, (1.0 - smoothstep(0.0, widthWorld, d)) * w);
            }
        }

        color.a *= (1.0 - fade);                       // alpha fade where the cut is open
        // bright rim hugging the cut surface (brightest at d = 0), gated by the splat's own opacity
        // so the glow only shows on solid splats — not faint/near-empty fragments
        color.rgb = mix(color.rgb, cutoutEdgeColor, rim * color.a);
    }
`;const cutoutModifyPS_wgsl=`
    uniform matrix_viewProjectionInverse: mat4x4f;     // inverse of the DEVICE view-projection; uploaded per-frame
    uniform cutoutScreenSize: vec4f;                   // xy: viewport size, zw: 1/size (uploaded by the host)
    uniform cutoutEdgeWidth: f32;                      // rim thickness in SCREEN PIXELS (scaled to world per-fragment)
    uniform cutoutProjScaleY: f32;                     // projection[1][1] (= 1/tan(fovY/2)); drives the px->world scale
    uniform cutoutEdgeColor: vec3f;                    // rim glow colour (already * intensity, may be HDR)
    uniform cutoutInvMatrix: array<mat4x4f, 16>;       // world -> box-local rigid (rot+trans, no scale)
    uniform cutoutHalfExtent: array<vec4f, 16>;        // xyz: box half-extents (world units); w: 0..1 blend weight

    // reconstruct the fragment's world position from its own depth (no scene depth map)
    fn cutoutWorldPos() -> vec3f {
        let uv: vec2f = pcPosition.xy * uniform.cutoutScreenSize.zw;
        let ndc: vec3f = vec3f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, pcPosition.z);
        let world: vec4f = uniform.matrix_viewProjectionInverse * vec4f(ndc, 1.0);
        return world.xyz / world.w;
    }

    // exact signed distance to an axis-aligned box of half-size b (negative inside)
    fn cutoutSdBox(p: vec3f, b: vec3f) -> f32 {
        let q: vec3f = abs(p) - b;
        return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    fn modifySplatColor(gaussianUV: vec2f, color: ptr<function, vec4f>) {
        let bits: u32 = getCutoutBits();
        if (bits == 0u) {
            return;                                    // splat not in any border band
        }

        // world width that covers cutoutEdgeWidth screen pixels at this fragment's depth, so the
        // rim keeps a constant on-screen thickness regardless of the cut's distance
        let viewZ: f32 = 1.0 / pcPosition.w;           // linear eye-space depth
        let worldPerPixel: f32 = 2.0 * viewZ / (uniform.cutoutScreenSize.y * uniform.cutoutProjScaleY);
        let widthWorld: f32 = max(uniform.cutoutEdgeWidth * worldPerPixel, 1e-6);

        // sample the cutout union at the fragment's world position, flagged boxes only. The box is
        // always full-size; its 0..1 blend weight drives an alpha fade instead of growing the box.
        let wp: vec3f = cutoutWorldPos();
        var fade: f32 = 0.0;                           // strongest weight among boxes CONTAINING wp
        var rim: f32 = 0.0;                            // strongest edge-glow factor just OUTSIDE a surface
        for (var i: i32 = 0; i < 16; i = i + 1) {
            if ((bits & (1u << u32(i))) == 0u) { continue; }
            let w: f32 = uniform.cutoutHalfExtent[i].w;
            let p: vec3f = (uniform.cutoutInvMatrix[i] * vec4f(wp, 1.0)).xyz;
            let d: f32 = cutoutSdBox(p, uniform.cutoutHalfExtent[i].xyz);
            if (d < 0.0) {
                fade = max(fade, w);                   // inside: fade the fragment out by its weight
            } else {
                rim = max(rim, (1.0 - smoothstep(0.0, widthWorld, d)) * w);
            }
        }

        (*color).a = (*color).a * (1.0 - fade);        // alpha fade where the cut is open
        // bright rim hugging the cut surface (brightest at d = 0), gated by the splat's own opacity
        // so the glow only shows on solid splats — not faint/near-empty fragments
        (*color) = vec4f(mix((*color).rgb, uniform.cutoutEdgeColor, rim * (*color).a), (*color).a);
    }
`;class CameraSettings{constructor(){_define_property$E(this,"fov",60);_define_property$E(this,"clearColor",new Color(.81176471,.95686275,.97254902));_define_property$E(this,"sharpness",.5);}}class Animation{constructor(){_define_property$E(this,"animAsset",null);_define_property$E(this,"idleReturnDelay",10);}}class Envelope{constructor(){_define_property$E(this,"orbitBox",void 0);_define_property$E(this,"cornerRadius",4);_define_property$E(this,"standoffMin",6);_define_property$E(this,"standoffMax",40);_define_property$E(this,"elevationMin",-15);_define_property$E(this,"elevationMax",70);_define_property$E(this,"orbitInertia",.5);_define_property$E(this,"orbitSmoothing",.1);_define_property$E(this,"orbitSensitivity",1);}}class Cutout{constructor(){_define_property$E(this,"triggers",[]);_define_property$E(this,"edgeWidth",2);_define_property$E(this,"edgeColor",new Color(1,.7,.3));_define_property$E(this,"edgeIntensity",4);_define_property$E(this,"blendDamping",.997);_define_property$E(this,"splatMargin",.4);}}class Flag{constructor(){_define_property$E(this,"box",null);_define_property$E(this,"amplitude",.25);_define_property$E(this,"wavelength",1.5);_define_property$E(this,"speed",1.2);_define_property$E(this,"maxDistance",120);}}class DollhouseMode extends Script{initialize(){this._rendering=false;this._flagTime=0;this._flagActive=false;this._material=this.app.scene.gsplat.material;this._weights=[];this._forceOpen=false;this._clipEnabled=false;this._warnedNoBoxes=false;this._annoActive=false;this._clipPrev=null;this._animTrack=null;this._played=false;const animAsset=this.animation.animAsset;if(animAsset){animAsset.ready(asset=>{const data=asset.resource;if(data?.startMode==="animTrack"){this._animTrack=data.animTracks?.[0]??null;}});this.app.assets.load(animAsset);}if(this.cameraEntity?.camera){this.cameraEntity.camera.camera.clearDepth=1;}this.app.on("mode:change",this.onModeChange,this);this.app.on("ui:cliptoggle",this.onClipToggle,this);this.app.on("annotation:change",this.onAnnotationChange,this);this.on("destroy",()=>{this.app.off("mode:change",this.onModeChange,this);this.app.off("ui:cliptoggle",this.onClipToggle,this);this.app.off("annotation:change",this.onAnnotationChange,this);this._setRendering(false);});this.app.on("prerender",this.updateUniforms,this);}update(dt){if(!this._rendering||!this.cameraEntity){return}const camPos=this.cameraEntity.getPosition();const triggers=this.cutout.triggers;const k=damp(this.cutout.blendDamping,dt);let animating=false;let closestIndex=-1;if(this._clipEnabled&&!this._forceOpen){let closestDist=Infinity;for(let i=0;i<triggers.length;i++){const trigger=triggers[i];if(!trigger){continue}trigger.getWorldTransform().getScale(_triggerHalf);_triggerHalf.mulScalar(.5);_triggerInv.setTRS(trigger.getPosition(),trigger.getRotation(),Vec3.ONE).invert();_triggerInv.transformPoint(camPos,_camLocal);const d=sdBox(_camLocal,_triggerHalf);if(d<closestDist){closestDist=d;closestIndex=i;}}}for(let i=0;i<triggers.length;i++){const trigger=triggers[i];if(!trigger){continue}let targetW;if(!this._clipEnabled){targetW=0;}else if(this._forceOpen){targetW=1;}else {targetW=i===closestIndex?1:0;}this._weights[i]=math$1.lerp(this._weights[i]??0,targetW,k);if(Math.abs(this._weights[i]-targetW)>.001){animating=true;}}if(animating){this.app.renderNextFrame=true;}this._flagActive=false;const flag=this.flag;if(flag?.box&&(flag.amplitude??0)>0){const e=flag.box;e.getWorldTransform().getScale(_flagScale);_flagSphere.center.copy(e.getPosition());_flagSphere.radius=.5*_flagScale.length()+flag.amplitude;const cam=this.cameraEntity.camera?.camera;if(camPos.distance(_flagSphere.center)<=(flag.maxDistance??120)&&cam&&cam.frustum.containsSphere(_flagSphere)>0){this._flagActive=true;this._flagTime+=dt;this.app.renderNextFrame=true;}}}onModeChange(name,done){const bridge=this.cameraEntity?.script?.cameraBridge;if(name!=="dollhouse"){if(bridge&&this.envelope.orbitBox){const orbit=bridge.getController("churchOrbit");if(orbit&&(bridge.mode==="anim"||!orbit.hasState())){orbit.onEnter(bridge.cam);}}this._setRendering(false);bridge?.stopAnim?.();return}if(!bridge){console.error("DollhouseMode: cameraBridge not found on cameraEntity");done?.();return}this.cameraEntity.camera.clearColor=this.camera.clearColor;const cameraFrame=this.cameraEntity.script.cameraFrame;if(cameraFrame){cameraFrame.rendering.sharpness=this.camera.sharpness;}this._setRendering(true);this.app.fire("cutout:change",this._clipEnabled);const orbitName=this.envelope.orbitBox?"churchOrbit":"orbit";if(this.envelope.orbitBox){const orbit=bridge.getController("churchOrbit");orbit.fov=this.camera.fov;orbit.box=this.envelope.orbitBox;orbit.corner=this.envelope.cornerRadius;orbit.standoffMin=this.envelope.standoffMin;orbit.standoffMax=this.envelope.standoffMax;orbit.elevationMin=this.envelope.elevationMin;orbit.elevationMax=this.envelope.elevationMax;orbit.orbitSensitivity=this.envelope.orbitSensitivity;orbit.coastTau=this.envelope.orbitInertia;orbit.followTau=this.envelope.orbitSmoothing;}else {bridge.getController("orbit").fov=this.camera.fov;}if(this._animTrack&&bridge.setAnim){bridge.setAnim(this._animTrack,{interruptTo:orbitName,idleDelay:this.animation.idleReturnDelay});if(!this._played){this._played=true;bridge.playAnim();}else {this._activateOrbit(bridge,orbitName);}}else {this._activateOrbit(bridge,orbitName);}this.app.fire("gsplat:load","outside",done);}_activateOrbit(bridge,orbitName){const orbit=orbitName==="churchOrbit"?bridge.getController("churchOrbit"):null;if(orbit?.hasState?.()){bridge.activate("churchOrbit",{seed:false});}else {bridge.activate(orbitName);}}onClipToggle(){this._clipEnabled=!this._clipEnabled;this.app.fire("cutout:change",this._clipEnabled);}onAnnotationChange(s){if(!this._rendering||s.active===this._annoActive){return}this._annoActive=s.active;if(s.active){this._clipPrev=this._clipEnabled;this._clipEnabled=false;}else {setTimeout(()=>{this._clipEnabled=this._clipPrev??this._clipEnabled;},2e3);}this.app.fire("cutout:change",this._clipEnabled);}_setRendering(on){if(on===this._rendering){return}this._rendering=on;this._patchCutout(on);}_patchCutout(on){const material=this._material;if(!material){return}const glsl=material.shaderChunks.glsl;const wgsl=material.shaderChunks.wgsl;const varyings=this.app.scene.gsplat.varyings;let dirty=false;if(on){if(glsl.get("gsplatModifyVS")!==cutoutModifyVS_glsl){glsl.set("gsplatModifyVS",cutoutModifyVS_glsl);glsl.set("gsplatModifyPS",cutoutModifyPS_glsl);wgsl.set("gsplatModifyVS",cutoutModifyVS_wgsl);wgsl.set("gsplatModifyPS",cutoutModifyPS_wgsl);varyings.add([{name:"cutoutBits",type:TYPE_UINT32,components:1}]);dirty=true;}}else {if(glsl.has("gsplatModifyVS")){glsl.delete("gsplatModifyVS");glsl.delete("gsplatModifyPS");wgsl.delete("gsplatModifyVS");wgsl.delete("gsplatModifyPS");varyings.remove(["cutoutBits"]);dirty=true;}}if(dirty){material.update();}}updateUniforms(){if(!this._rendering||!this._material){return}const cam=this.cameraEntity?.camera?.camera;if(!cam){return}if(this.app.graphicsDevice.isWebGPU){_deviceVP.mul2(cam.projectionMatrix,cam.viewMatrix);_invViewProj.mul2(WEBGPU_DEPTH_RANGE,_deviceVP).invert();}else {_invViewProj.mul2(cam.projectionMatrix,cam.viewMatrix).invert();}let n=0;let maxW=0;const triggers=this.cutout.triggers;for(let i=0;i<triggers.length&&n<MAX_CUTOUT_SHAPES;i++){const trigger=triggers[i];if(!trigger){continue}const boxes=trigger.children;if(boxes.length===0&&!this._warnedNoBoxes){this._warnedNoBoxes=true;console.warn("DollhouseMode: cutout trigger has no child boxes; it will cut nothing");}const w=this._weights[i]??0;for(let j=0;j<boxes.length&&n<MAX_CUTOUT_SHAPES;j++){const e=boxes[j];e.getWorldTransform().getScale(_scale$1);_box.setTRS(e.getPosition(),e.getRotation(),Vec3.ONE).invert();_invMatrixData.set(_box.data,n*16);_halfExtentData[n*4]=.5*_scale$1.x;_halfExtentData[n*4+1]=.5*_scale$1.y;_halfExtentData[n*4+2]=.5*_scale$1.z;_halfExtentData[n*4+3]=w;n++;}if(boxes.length>0&&w>maxW){maxW=w;}}const c=this.cutout.edgeColor;const k=this.cutout.edgeIntensity;_edgeRGB[0]=c.r*k;_edgeRGB[1]=c.g*k;_edgeRGB[2]=c.b*k;const gd=this.app.graphicsDevice;_screenSize[0]=gd.width;_screenSize[1]=gd.height;_screenSize[2]=1/gd.width;_screenSize[3]=1/gd.height;const m=this._material;m.setParameter("matrix_viewProjectionInverse",_invViewProj.data);m.setParameter("cutoutScreenSize",_screenSize);m.setParameter("cutoutInvMatrix[0]",_invMatrixData);m.setParameter("cutoutHalfExtent[0]",_halfExtentData);m.setParameter("cutoutCount",this._clipEnabled||maxW>.001?n:0);m.setParameter("cutoutSplatMargin",this.cutout.splatMargin??.4);m.setParameter("cutoutEdgeWidth",this.cutout.edgeWidth);m.setParameter("cutoutProjScaleY",cam.projectionMatrix.data[5]);m.setParameter("cutoutEdgeColor",_edgeRGB);const flag=this.flag;if(this._flagActive){const e=flag.box;e.getWorldTransform().getScale(_flagScale);_flagHalfData[0]=.5*_flagScale.x;_flagHalfData[1]=.5*_flagScale.y;_flagHalfData[2]=.5*_flagScale.z;const bp=e.getPosition();_flagCenterData[0]=bp.x;_flagCenterData[1]=bp.y;_flagCenterData[2]=bp.z;}else {_flagHalfData.fill(0);_flagCenterData.fill(0);}_flagParamsData[0]=this._flagActive?flag.amplitude:0;_flagParamsData[1]=2*Math.PI/Math.max(flag?.wavelength??1.5,.01);_flagParamsData[2]=2*Math.PI*(flag?.speed??1.2);_flagParamsData[3]=this._flagTime;m.setParameter("flagParams",_flagParamsData);m.setParameter("flagCenter",_flagCenterData);m.setParameter("flagHalfExtent",_flagHalfData);m.update();}constructor(...args){super(...args),_define_property$E(this,"cameraEntity",void 0),_define_property$E(this,"camera",new CameraSettings),_define_property$E(this,"animation",new Animation),_define_property$E(this,"envelope",new Envelope),_define_property$E(this,"cutout",new Cutout),_define_property$E(this,"flag",new Flag);}}_define_property$E(DollhouseMode,"scriptName","dollhouseMode");

var dollhouseMode = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DollhouseMode: DollhouseMode
});

function _define_property$D(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class AnimCursor{update(deltaTime){this.timer+=deltaTime;this.cursor+=deltaTime;if(this.cursor>=this.duration){switch(this.loopMode){case "none":this.cursor=this.duration;break;case "repeat":this.cursor%=this.duration;break;case "pingpong":this.cursor%=this.duration*2;break}}}reset(duration,loopMode){this.duration=duration;this.loopMode=loopMode;this.timer=0;this.cursor=0;}set value(value){this.cursor=mod(value,this.duration);}get value(){return this.cursor>this.duration?2*this.duration-this.cursor:this.cursor}constructor(duration,loopMode){_define_property$D(this,"duration",0);_define_property$D(this,"loopMode","none");_define_property$D(this,"timer",0);_define_property$D(this,"cursor",0);this.reset(duration,loopMode);}}

var animCursor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimCursor: AnimCursor
});

function _define_property$C(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class CubicSpline{evaluate(time,result){const{times}=this;const last=times.length-1;if(time<=times[0]){this.getKnot(0,result);}else if(time>=times[last]){this.getKnot(last,result);}else {let seg=0;while(time>=times[seg+1]){seg++;}this.evaluateSegment(seg,(time-times[seg])/(times[seg+1]-times[seg]),result);}}getKnot(index,result){const{knots,dim}=this;const idx=index*3*dim;for(let i=0;i<dim;++i){result[i]=knots[idx+i*3+1];}}evaluateSegment(segment,t,result){const{knots,dim}=this;const t2=t*t;const twot=t+t;const omt=1-t;const omt2=omt*omt;let idx=segment*dim*3;for(let i=0;i<dim;++i){const p0=knots[idx+1];const m0=knots[idx+2];const m1=knots[idx+dim*3];const p1=knots[idx+dim*3+1];idx+=3;result[i]=p0*((1+twot)*omt2)+m0*(t*omt2)+p1*(t2*(3-twot))+m1*(t2*(t-1));}}static calcKnots(times,points,smoothness){const n=times.length;const dim=points.length/n;const knots=new Array(n*dim*3);for(let i=0;i<n;i++){const t=times[i];for(let j=0;j<dim;j++){const idx=i*dim+j;const p=points[idx];let tangent;if(i===0){tangent=(points[idx+dim]-p)/(times[i+1]-t);}else if(i===n-1){tangent=(p-points[idx-dim])/(t-times[i-1]);}else {tangent=(points[idx+dim]-points[idx-dim])/(times[i+1]-times[i-1]);}const inScale=i>0?times[i]-times[i-1]:times[1]-times[0];const outScale=i<n-1?times[i+1]-times[i]:times[i]-times[i-1];knots[idx*3]=tangent*inScale*smoothness;knots[idx*3+1]=p;knots[idx*3+2]=tangent*outScale*smoothness;}}return knots}static fromPoints(times,points,smoothness=1){return new CubicSpline(times,CubicSpline.calcKnots(times,points,smoothness))}static fromPointsLooping(length,times,points,smoothness=1){if(times.length<2){return CubicSpline.fromPoints(times,points)}const dim=points.length/times.length;const newTimes=times.slice();const newPoints=points.slice();newTimes.push(length+times[0],length+times[1]);newPoints.push(...points.slice(0,dim*2));newTimes.splice(0,0,times[times.length-2]-length,times[times.length-1]-length);newPoints.splice(0,0,...points.slice(points.length-dim*2));return CubicSpline.fromPoints(newTimes,newPoints,smoothness)}constructor(times,knots){_define_property$C(this,"times",void 0);_define_property$C(this,"knots",void 0);_define_property$C(this,"dim",void 0);this.times=times;this.knots=knots;this.dim=knots.length/times.length/3;}}

var spline = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CubicSpline: CubicSpline
});

function _define_property$B(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class AnimState{update(dt){const{cursor,result,spline,frameRate,position,target}=this;cursor.update(dt);spline.evaluate(cursor.value*frameRate,result);if(result.every(isFinite)){position.set(result[0],result[1],result[2]);target.set(result[3],result[4],result[5]);this.fov=result[6];}}seek(value){this.cursor.value=value;this.update(0);}seekClosest(position,samples=200){const{spline,frameRate,cursor,result}=this;const duration=cursor.duration;let bestT=0;let bestDist=Infinity;for(let i=0;i<samples;i++){const t=i/samples*duration;spline.evaluate(t*frameRate,result);const dx=result[0]-position.x;const dy=result[1]-position.y;const dz=result[2]-position.z;const dist=dx*dx+dy*dy+dz*dz;if(dist<bestDist){bestDist=dist;bestT=t;}}this.seek(bestT);}static fromTrack(track){const{keyframes,duration,frameRate,loopMode,smoothness}=track;const{times,values}=keyframes;const{position,target,fov}=values;const points=[];for(let i=0;i<times.length;i++){points.push(position[i*3],position[i*3+1],position[i*3+2]);points.push(target[i*3],target[i*3+1],target[i*3+2]);points.push(fov[i]);}const extra=duration===times[times.length-1]/frameRate?1:0;const spline=CubicSpline.fromPointsLooping((duration+extra)*frameRate,times,points,smoothness);return new AnimState(spline,duration,loopMode,frameRate)}constructor(spline,duration,loopMode,frameRate){_define_property$B(this,"spline",void 0);_define_property$B(this,"cursor",new AnimCursor(0,"none"));_define_property$B(this,"frameRate",void 0);_define_property$B(this,"result",[]);_define_property$B(this,"position",new Vec3);_define_property$B(this,"target",new Vec3);_define_property$B(this,"fov",90);this.spline=spline;this.cursor.reset(duration,loopMode);this.frameRate=frameRate;}}

var animState = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimState: AnimState
});

const createRotateTrack=(position,target,fov,keys=12,duration=20)=>{const times=new Array(keys).fill(0).map((_,i)=>i/keys*duration);const positions=[];const targets=[];const fovs=new Array(keys).fill(fov);const dx=position.x-target.x;const dy=position.y-target.y;const dz=position.z-target.z;const horizontalRadius=Math.sqrt(dx*dx+dz*dz);const totalDist=Math.sqrt(dx*dx+dy*dy+dz*dz);const minRadius=totalDist*.3;const radius=Math.max(horizontalRadius,minRadius);const startAngle=Math.atan2(dx,dz);for(let i=0;i<keys;++i){const angle=startAngle-i/keys*Math.PI*2;positions.push(target.x+radius*Math.sin(angle));positions.push(target.y+dy);positions.push(target.z+radius*Math.cos(angle));targets.push(target.x);targets.push(target.y);targets.push(target.z);}return {name:"rotate",duration,frameRate:1,loopMode:"repeat",interpolation:"spline",smoothness:1,keyframes:{times,values:{position:positions,target:targets,fov:fovs}}}};

var createRotateTrack$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createRotateTrack: createRotateTrack
});

const createFigure8Track=(position,target,fov,size=1,keys=24,duration=20)=>{const times=new Array(keys).fill(0).map((_,i)=>i/keys*duration);const positions=[];const targets=[];const fovs=new Array(keys).fill(fov);const amplitude=size*.5;const dx=position.x-target.x;const dz=position.z-target.z;const horizontalDist=Math.sqrt(dx*dx+dz*dz);let rightX,rightZ;let fwdX,fwdZ;if(horizontalDist>.001){fwdX=dx/horizontalDist;fwdZ=dz/horizontalDist;rightX=-fwdZ;rightZ=fwdX;}else {fwdX=0;fwdZ=1;rightX=1;rightZ=0;}for(let i=0;i<keys;++i){const t=i/keys*Math.PI*2;const offsetRight=amplitude*Math.sin(t);const offsetFwd=amplitude*Math.sin(2*t)/2;positions.push(position.x+rightX*offsetRight+fwdX*offsetFwd);positions.push(position.y);positions.push(position.z+rightZ*offsetRight+fwdZ*offsetFwd);targets.push(target.x);targets.push(target.y);targets.push(target.z);}return {name:"figure8",duration,frameRate:1,loopMode:"repeat",interpolation:"spline",smoothness:1,keyframes:{times,values:{position:positions,target:targets,fov:fovs}}}};

var createFigure8Track$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createFigure8Track: createFigure8Track
});

const _dir=new Vec3;const _ang=new Vec3;const APPROACH_DIST=2;const createFlightTrack=(start,end,waypoints=[],opts={})=>{const{speed=12,minDuration=1.5,maxDuration=9,smoothness=1}=opts;const lookTarget=end.target;const keys=[];const gazeTo=(p,t)=>{_dir.sub2(t,p);const len=_dir.length();if(len<.001){const prev=keys[keys.length-1];return prev?{yaw:prev.yaw,pitch:prev.pitch,dist:prev.dist}:{yaw:0,pitch:0,dist:1}}vecToAngles(_ang,_dir.mulScalar(1/len));return {yaw:_ang.y,pitch:_ang.x,dist:len}};keys.push({pos:start.position,...gazeTo(start.position,start.target)});for(const p of waypoints){keys.push({pos:p,...gazeTo(p,lookTarget)});}const lastPos=keys[keys.length-1].pos;_dir.sub2(end.position,lastPos);const legLen=_dir.length();if(legLen>APPROACH_DIST*1.5){_dir.mulScalar(APPROACH_DIST/legLen);const apos=new Vec3().sub2(end.position,_dir);keys.push({pos:apos,...gazeTo(apos,lookTarget)});}keys.push({pos:end.position,...gazeTo(end.position,lookTarget)});const pts=[];for(const k of keys){if(pts.length===0||pts[pts.length-1].pos.distance(k.pos)>.001){pts.push(k);}}const endKey=keys[keys.length-1];if(pts[pts.length-1]!==endKey){if(pts.length>1){pts[pts.length-1]=endKey;}else {pts.push(endKey);}}for(let i=1;i<pts.length;i++){pts[i].yaw-=360*Math.round((pts[i].yaw-pts[i-1].yaw)/360);}const seg=[0];let total=0;for(let i=1;i<pts.length;i++){total+=Math.max(pts[i].pos.distance(pts[i-1].pos),.001);seg.push(total);}const duration=math$1.clamp(total/speed,minDuration,maxDuration);const times=[];const position=[];const yaw=[];const pitch=[];const dist=[];const fov=[];for(let i=0;i<pts.length;i++){times.push(seg[i]/total*duration);const k=pts[i];position.push(k.pos.x,k.pos.y,k.pos.z);yaw.push(k.yaw);pitch.push(k.pitch);dist.push(k.dist);fov.push(math$1.lerp(start.fov,end.fov,seg[i]/total));}return {name:"flight",duration,frameRate:1,loopMode:"none",interpolation:"spline",smoothness,keyframes:{times,values:{position,yaw,pitch,dist,fov}}}};const reverseFlightTrack=(track,speed=1)=>{const{times,values}=track.keyframes;const n=times.length;const rTimes=[];const position=[];const yaw=[];const pitch=[];const dist=[];const fov=[];for(let i=0;i<n;i++){const j=n-1-i;rTimes.push((track.duration-times[j])/speed);position.push(values.position[j*3],values.position[j*3+1],values.position[j*3+2]);yaw.push(values.yaw[j]);pitch.push(values.pitch[j]);dist.push(values.dist[j]);fov.push(values.fov[j]);}return {...track,duration:track.duration/speed,keyframes:{times:rTimes,values:{position,yaw,pitch,dist,fov}}}};

var createFlightTrack$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createFlightTrack: createFlightTrack,
    reverseFlightTrack: reverseFlightTrack
});

var index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimCursor: AnimCursor,
    AnimState: AnimState,
    createFigure8Track: createFigure8Track,
    createFlightTrack: createFlightTrack,
    createRotateTrack: createRotateTrack,
    reverseFlightTrack: reverseFlightTrack
});

function _define_property$A(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const RAD_TO_DEG=180/Math.PI;const shortestAngle=angle=>(angle%360+540)%360-180;const smoothstep$1=(edge0,edge1,value)=>{const t=math$1.clamp((value-edge0)/(edge1-edge0),0,1);return t*t*(3-2*t)};const approach=(value,target,maxDelta)=>{if(value<target){return Math.min(target,value+maxDelta)}return Math.max(target,value-maxDelta)};const smoothTurnRate=(currentRate,angleDiff,maxTurnRate,turnGain,dt)=>{if(dt<=0){return currentRate}const desiredRate=math$1.clamp(angleDiff*turnGain,-maxTurnRate,maxTurnRate);const smoothing=1-Math.exp(-4*turnGain*dt);return currentRate+(desiredRate-currentRate)*smoothing};const clampTurnStep=(rate,remaining,dt)=>{const step=rate*dt;if(Math.abs(remaining)<1e-4){return 0}return Math.sign(step)===Math.sign(remaining)&&Math.abs(step)>Math.abs(remaining)?remaining:step};const getYawToTarget=(dx,dz)=>Math.atan2(-dx,-dz)*RAD_TO_DEG;const getYawDiffToTarget=(dx,dz,yaw)=>{return shortestAngle(getYawToTarget(dx,dz)-yaw)};const getPitchToDirection=dirY=>{return Math.asin(math$1.clamp(dirY,-1,1))*RAD_TO_DEG};class ProgressTracker{reset(){this._blockedTime=0;this._prevDist=Infinity;}update(distance,dt,blockedSpeed,blockedDuration,active=true){if(active&&this._prevDist!==Infinity&&dt>0){const speed=(this._prevDist-distance)/dt;if(speed<blockedSpeed){this._blockedTime+=dt;if(this._blockedTime>=blockedDuration){this._prevDist=distance;return true}}else {this._blockedTime=0;}}this._prevDist=distance;return false}constructor(){_define_property$A(this,"_blockedTime",0);_define_property$A(this,"_prevDist",Infinity);}}

var targetNavigation = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ProgressTracker: ProgressTracker,
    approach: approach,
    clampTurnStep: clampTurnStep,
    getPitchToDirection: getPitchToDirection,
    getYawDiffToTarget: getYawDiffToTarget,
    getYawToTarget: getYawToTarget,
    shortestAngle: shortestAngle,
    smoothTurnRate: smoothTurnRate,
    smoothstep: smoothstep$1
});

const DEFAULT_CONTROLLER_DAMPING=.95;const rotation$1=new Quat;const applyFrameRotation=(angles,rotate,minPitch=-90,maxPitch=90)=>{angles.x-=rotate[1];angles.y-=rotate[0];angles.z=0;angles.x=math$1.clamp(angles.x,minPitch,maxPitch);return angles};const setCameraBasis=(angles,forward,right,up)=>{rotation$1.setFromEulerAngles(angles);rotation$1.transformVector(Vec3.FORWARD,forward);rotation$1.transformVector(Vec3.RIGHT,right);rotation$1.transformVector(Vec3.UP,up);};const setCameraForward=(angles,forward)=>{rotation$1.setFromEulerAngles(angles);rotation$1.transformVector(Vec3.FORWARD,forward);};const setYawBasis=(yaw,forward,right)=>{rotation$1.setFromEulerAngles(0,yaw,0);rotation$1.transformVector(Vec3.FORWARD,forward);rotation$1.transformVector(Vec3.RIGHT,right);};const setBasisOffset=(out,x,y,z,forward,right,up)=>{out.set(right.x*x+up.x*y+forward.x*z,right.y*x+up.y*y+forward.y*z,right.z*x+up.z*y+forward.z*z);return out};const dampAngles=(angles,target,damping,dt)=>{if(dt<=0){return angles}const t=damp(damping,dt);angles.y=mod(angles.y,360);angles.z=mod(angles.z,360);target.y=mod(target.y,360);target.z=mod(target.z,360);angles.x=math$1.lerpAngle(angles.x,target.x,t);angles.y=math$1.lerpAngle(angles.y,target.y,t);angles.z=math$1.lerpAngle(angles.z,target.z,t);return angles};const drainInputFrame=frame=>{frame.read();};

var cameraUtils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEFAULT_CONTROLLER_DAMPING: DEFAULT_CONTROLLER_DAMPING,
    applyFrameRotation: applyFrameRotation,
    dampAngles: dampAngles,
    drainInputFrame: drainInputFrame,
    setBasisOffset: setBasisOffset,
    setCameraBasis: setCameraBasis,
    setCameraForward: setCameraForward,
    setYawBasis: setYawBasis
});

function _define_property$z(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class SpawnState{get has(){return this._has}store(position,angles,distance){this._position.copy(position);this._angles.copy(angles);this._distance=distance;this._has=true;}clear(){this._has=false;}restore(position,angles){position.copy(this._position);angles.copy(this._angles);return this._distance}constructor(){_define_property$z(this,"_position",new Vec3);_define_property$z(this,"_angles",new Vec3);_define_property$z(this,"_distance",1);_define_property$z(this,"_has",false);}}

var spawnState = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SpawnState: SpawnState
});

function _define_property$y(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const COLLISION_SKIN=.001;const MAX_SLIDE_ITERATIONS=3;const MIN_MOVE_SQ=1e-10;const INV_SQRT2=1/Math.sqrt(2);const SWEEP_RAY_OFFSETS=[[0,0,true],[1,0,false],[-1,0,false],[0,1,false],[0,-1,false],[INV_SQRT2,INV_SQRT2,false],[-INV_SQRT2,INV_SQRT2,false],[-INV_SQRT2,-INV_SQRT2,false],[INV_SQRT2,-INV_SQRT2,false]];const v$4=new Vec3;const remainingMove=new Vec3;const collisionPush=new Vec3;const sweepDir=new Vec3;const sweepNormal=new Vec3;const sweepTangent=new Vec3;const sweepBitangent=new Vec3;const sweepOrigin=new Vec3;const worldUp=new Vec3(0,1,0);const worldRight=new Vec3(1,0,0);const pushOut={x:0,y:0,z:0};const sweepHit={x:0,y:0,z:0,nx:0,ny:1,nz:0,travel:0};class SphereMover{reset(position){this._setLastClearPosition(position);}move(position,move){if(!this.collision){position.add(move);this._setLastClearPosition(position);return}remainingMove.copy(move);if(this._isMoveComplete(remainingMove)){this.resolve(position);return}for(let i=0;i<MAX_SLIDE_ITERATIONS;i++){if(this._isMoveComplete(remainingMove)){break}if(!this._moveAndSlide(position,remainingMove)){break}}}resolve(position){if(!this.collision){this._setLastClearPosition(position);return}this._resolveSphere(position,collisionPush);if(!this._isSphereClear(position)&&this._hasLastClearPosition){position.copy(this._lastClearPosition);}if(this._isSphereClear(position)){this._setLastClearPosition(position);}}_moveAndSlide(position,move){const moveSq=move.x*move.x+move.y*move.y+move.z*move.z;const distance=Math.sqrt(moveSq);sweepDir.copy(move).mulScalar(1/distance);if(!this._querySweep(position,sweepDir,distance,sweepHit)){position.add(move);this.resolve(position);return false}position.add(v$4.copy(sweepDir).mulScalar(sweepHit.travel));this.resolve(position);sweepNormal.set(sweepHit.nx,sweepHit.ny,sweepHit.nz);move.add(v$4.copy(sweepDir).mulScalar(-sweepHit.travel));this._clipMove(move,sweepNormal);return true}_querySweep(position,dir,distance,out){if(Math.abs(dir.y)<.99){sweepTangent.cross(dir,worldUp).normalize();}else {sweepTangent.cross(dir,worldRight).normalize();}sweepBitangent.cross(dir,sweepTangent).normalize();let found=false;let bestTravel=Infinity;for(let i=0;i<SWEEP_RAY_OFFSETS.length;i++){const[tx,ty,centerRay]=SWEEP_RAY_OFFSETS[i];const radiusOffset=centerRay?0:this.radius;const rayExtension=centerRay?this.radius:0;sweepOrigin.copy(position);if(!centerRay){sweepOrigin.add(v$4.copy(sweepTangent).mulScalar(tx*radiusOffset));sweepOrigin.add(v$4.copy(sweepBitangent).mulScalar(ty*radiusOffset));}const hit=this.collision.queryRay(sweepOrigin.x,sweepOrigin.y,sweepOrigin.z,dir.x,dir.y,dir.z,distance+rayExtension+COLLISION_SKIN);if(!hit){continue}const hx=hit.x-sweepOrigin.x;const hy=hit.y-sweepOrigin.y;const hz=hit.z-sweepOrigin.z;const hitDistance=Math.max(0,hx*dir.x+hy*dir.y+hz*dir.z);const clearance=centerRay?this.radius:0;const travel=math$1.clamp(hitDistance-clearance-COLLISION_SKIN,0,distance);if(travel>=bestTravel){continue}const surfaceNormal=this.collision.querySurfaceNormal(hit.x,hit.y,hit.z,dir.x,dir.y,dir.z);found=true;bestTravel=travel;out.x=hit.x;out.y=hit.y;out.z=hit.z;out.nx=surfaceNormal.nx;out.ny=surfaceNormal.ny;out.nz=surfaceNormal.nz;out.travel=travel;}return found}_resolveSphere(position,push){if(!this.collision.querySphere(position.x,position.y,position.z,this.radius,pushOut)){push.set(0,0,0);return false}position.x+=pushOut.x;position.y+=pushOut.y;position.z+=pushOut.z;push.x=pushOut.x;push.y=pushOut.y;push.z=pushOut.z;return true}_clipMove(move,push){const normalSq=push.x*push.x+push.y*push.y+push.z*push.z;if(normalSq<=MIN_MOVE_SQ){return}const invPushLen=1/Math.sqrt(normalSq);const nx=push.x*invPushLen;const ny=push.y*invPushLen;const nz=push.z*invPushLen;const dot=move.x*nx+move.y*ny+move.z*nz;if(dot<0){move.x-=dot*nx;move.y-=dot*ny;move.z-=dot*nz;}}_isMoveComplete(move){return move.x*move.x+move.y*move.y+move.z*move.z<=MIN_MOVE_SQ}_isSphereClear(position){return !this.collision.querySphere(position.x,position.y,position.z,this.radius,pushOut)}_setLastClearPosition(position){this._lastClearPosition.copy(position);this._hasLastClearPosition=!this.collision||this._isSphereClear(position);}constructor(radius){_define_property$y(this,"collision",null);_define_property$y(this,"radius",void 0);_define_property$y(this,"_lastClearPosition",new Vec3);_define_property$y(this,"_hasLastClearPosition",false);this.radius=radius;}}

var sphereMover = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SphereMover: SphereMover
});

const SEARCH_RADIUS=5;const SEARCH_RADIUS_SQ=SEARCH_RADIUS*SEARCH_RADIUS;const RAY_MAX_DIST=1e3;const scratchPush={x:0,y:0,z:0};const findSphereSpawn=(collision,ox,oy,oz,radius,out)=>{const step=collision.voxelResolution;const maxCells=Math.ceil(SEARCH_RADIUS/step);let bestDistSq=Infinity;let found=false;for(let r=0;r<=maxCells;r++){const shellMinDistSq=r*step*(r*step);if(shellMinDistSq>=bestDistSq)break;for(let dy=-r;dy<=r;dy++){const absDy=dy<0?-dy:dy;for(let dz=-r;dz<=r;dz++){const absDz=dz<0?-dz:dz;for(let dx=-r;dx<=r;dx++){const absDx=dx<0?-dx:dx;if(absDx<r&&absDy<r&&absDz<r)continue;const distSq=(dx*dx+dy*dy+dz*dz)*step*step;if(distSq>=bestDistSq||distSq>SEARCH_RADIUS_SQ)continue;const cx=ox+dx*step;const cy=oy+dy*step;const cz=oz+dz*step;if(collision.querySphere(cx,cy,cz,radius,scratchPush))continue;bestDistSq=distSq;out.x=cx;out.y=cy;out.z=cz;found=true;}}}}return found};const findCylinderSpawn=(collision,ox,oy,oz,halfHeight,radius,out)=>{const step=collision.voxelResolution;const maxCells=Math.ceil(SEARCH_RADIUS/step);const footCells=Math.ceil(radius/step);const radiusSq=radius*radius;let bestDistSq=Infinity;let found=false;for(let r=0;r<=maxCells;r++){const shellMinDistSq=r*step*(r*step);if(shellMinDistSq>=bestDistSq)break;for(let dy=-r;dy<=r;dy++){const absDy=dy<0?-dy:dy;for(let dz=-r;dz<=r;dz++){const absDz=dz<0?-dz:dz;for(let dx=-r;dx<=r;dx++){const absDx=dx<0?-dx:dx;if(absDx<r&&absDy<r&&absDz<r)continue;const distSq=(dx*dx+dy*dy+dz*dz)*step*step;if(distSq>=bestDistSq||distSq>SEARCH_RADIUS_SQ)continue;const cx=ox+dx*step;const cy=oy+dy*step;const cz=oz+dz*step;if(!collision.isFreeAt(cx,cy,cz))continue;let floor=-Infinity;let ceiling=Infinity;let supported=true;for(let i=-footCells;i<=footCells&&supported;i++){const fxOff=i*step;const fxOffSq=fxOff*fxOff;for(let j=-footCells;j<=footCells;j++){const fzOff=j*step;if(fxOffSq+fzOff*fzOff>radiusSq)continue;const fx=cx+fxOff;const fz=cz+fzOff;const down=collision.queryRay(fx,cy,fz,0,-1,0,RAY_MAX_DIST);if(!down){supported=false;break}if(down.y>floor)floor=down.y;const up=collision.queryRay(fx,cy,fz,0,1,0,RAY_MAX_DIST);if(up&&up.y<ceiling)ceiling=up.y;}}if(!supported)continue;if(floor+2*halfHeight>ceiling)continue;bestDistSq=distSq;out.x=cx;out.y=floor;out.z=cz;found=true;}}}}return found};

var findSpawn = /*#__PURE__*/Object.freeze({
    __proto__: null,
    findCylinderSpawn: findCylinderSpawn,
    findSphereSpawn: findSphereSpawn
});

function _define_property$x(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const CAMERA_RADIUS=.2;const forward$3=new Vec3;const right$2=new Vec3;const up$1=new Vec3;const offset$3=new Vec3;const spawnProbe$1=new Vec3;class FlyController{set collision(value){this._mover.collision=value;this._mover.reset(this._position);}get collision(){return this._mover.collision}onEnter(camera){this.goto(camera);if(this.collision&&findSphereSpawn(this.collision,this._position.x,this._position.y,this._position.z,CAMERA_RADIUS,spawnProbe$1)){this._position.copy(spawnProbe$1);this._mover.reset(this._position);}this._storeSpawn();}update(deltaTime,inputFrame,camera){const{move,rotate}=inputFrame.read();applyFrameRotation(this._targetAngles,rotate);dampAngles(this._angles,this._targetAngles,this.rotateDamping,deltaTime);this._step(move);camera.position.copy(this._position);camera.angles.set(this._angles.x,this._angles.y,0);camera.distance=this._distance;camera.fov=this.fov;}onExit(_camera){}goto(camera){this._position.copy(camera.position);this._angles.set(camera.angles.x,camera.angles.y,0);this._targetAngles.copy(this._angles);this._distance=camera.distance;this._mover.reset(this._position);}resetToSpawn(camera){if(!this._spawn.has){return false}this._distance=this._spawn.restore(this._position,this._angles);this._targetAngles.copy(this._angles);this._mover.reset(this._position);camera.position.copy(this._position);camera.angles.copy(this._angles);camera.distance=this._distance;camera.fov=this.fov;return true}_storeSpawn(){this._spawn.store(this._position,this._angles,this._distance);}_step(move){setCameraBasis(this._angles,forward$3,right$2,up$1);setBasisOffset(offset$3,move[0],move[1],move[2],forward$3,right$2,up$1);this._mover.move(this._position,offset$3);}constructor(){_define_property$x(this,"fov",90);_define_property$x(this,"rotateDamping",DEFAULT_CONTROLLER_DAMPING);_define_property$x(this,"_position",new Vec3);_define_property$x(this,"_angles",new Vec3);_define_property$x(this,"_targetAngles",new Vec3);_define_property$x(this,"_distance",1);_define_property$x(this,"_spawn",new SpawnState);_define_property$x(this,"_mover",new SphereMover(CAMERA_RADIUS));}}

var flyController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FlyController: FlyController
});

function _define_property$w(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const DEG_TO_RAD=Math.PI/180;const STOP_VIEW_RADIUS=.75;const MIN_STOP_DIST=.75;const MAX_STOP_DIST=4;const ARRIVAL_EPSILON=.03;const ARRIVAL_SPEED=.05;const ARRIVAL_RATE=1.75;const BLOCKED_SPEED$1=.25;const BLOCKED_DURATION$1=.5;const toTarget=new Vec3;const forward$2=new Vec3;const postTurnAngles=new Vec3;const getStopDistance=fov=>{const halfFov=math$1.clamp(fov,15,120)*DEG_TO_RAD*.5;return math$1.clamp(STOP_VIEW_RADIUS/Math.tan(halfFov),MIN_STOP_DIST,MAX_STOP_DIST)};class FlySource{get isActive(){return this._target!==null}navigateTo(target,speedMul=1){const wasFlying=this._target!==null;if(!this._target){this._target=new Vec3;}this._target.copy(target);this._speedMul=speedMul;if(!wasFlying){this._yawRate=0;this._pitchRate=0;this._speed=0;}this._progress.reset();}cancel(){if(this._target){this._target=null;this._yawRate=0;this._pitchRate=0;this._speed=0;this._progress.reset();this.onComplete?.();}}update(dt,camera,frame){if(!this._target)return;const target=this._target;const cameraPosition=camera.position;const cameraAngles=camera.angles;toTarget.sub2(target,cameraPosition);const dist=toTarget.length();const stopDistance=getStopDistance(camera.fov);const remainingDist=dist-stopDistance;const activeRemainingDist=Math.max(0,remainingDist);if(activeRemainingDist<=ARRIVAL_EPSILON&&this._speed<=ARRIVAL_SPEED){this.cancel();return}if(dt<=0){return}const invDist=1/dist;const dirX=toTarget.x*invDist;const dirY=toTarget.y*invDist;const dirZ=toTarget.z*invDist;const yawDiff=getYawDiffToTarget(toTarget.x,toTarget.z,cameraAngles.y);const pitchDiff=getPitchToDirection(dirY)-cameraAngles.x;this._yawRate=smoothTurnRate(this._yawRate,yawDiff,this.maxTurnRate,this.turnGain,dt);this._pitchRate=smoothTurnRate(this._pitchRate,pitchDiff,this.maxTurnRate,this.turnGain,dt);const yawStep=clampTurnStep(this._yawRate,yawDiff,dt);const pitchStep=clampTurnStep(this._pitchRate,pitchDiff,dt);this._yawRate=yawStep/dt;this._pitchRate=pitchStep/dt;frame.accumulate("rotate",[-yawStep,-pitchStep,0]);postTurnAngles.set(cameraAngles.x+pitchStep,cameraAngles.y+yawStep,0);setCameraForward(postTurnAngles,forward$2);const alignment=math$1.clamp(forward$2.x*dirX+forward$2.y*dirY+forward$2.z*dirZ,0,1);const alignmentScale=smoothstep$1(.05,.95,alignment);const brakeSpeed=Math.sqrt(2*this.moveDeceleration*activeRemainingDist);const arrivalSpeed=activeRemainingDist*ARRIVAL_RATE;const maxSpeed=Math.min(this.flySpeed*this._speedMul,brakeSpeed,arrivalSpeed);if(maxSpeed>this._speed){this._speed=approach(this._speed,maxSpeed,this.moveAcceleration*alignmentScale*dt);}else {this._speed=approach(this._speed,maxSpeed,this.moveDeceleration*dt);}const arrivalMove=activeRemainingDist*(1-Math.exp(-ARRIVAL_RATE*dt));const moveDist=Math.min(this._speed*dt,arrivalMove);if(moveDist>0){frame.accumulate("move",[0,0,moveDist]);}if(this._progress.update(dist,dt,BLOCKED_SPEED$1,BLOCKED_DURATION$1,alignment>.5&&this._speed>BLOCKED_SPEED$1)){this.cancel();}}constructor(){_define_property$w(this,"flySpeed",4);_define_property$w(this,"maxTurnRate",180);_define_property$w(this,"turnGain",4);_define_property$w(this,"moveAcceleration",6);_define_property$w(this,"moveDeceleration",8);_define_property$w(this,"onComplete",null);_define_property$w(this,"_target",null);_define_property$w(this,"_yawRate",0);_define_property$w(this,"_pitchRate",0);_define_property$w(this,"_speed",0);_define_property$w(this,"_progress",new ProgressTracker);_define_property$w(this,"_speedMul",1);}}

var flySource = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FlySource: FlySource
});

function _define_property$v(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const rotation=new Quat;const avec=new Vec3;const bvec=new Vec3;class Camera{copy(source){this.position.copy(source.position);this.angles.copy(source.angles);this.distance=source.distance;this.fov=source.fov;}lerp(a,b,t){a.calcFocusPoint(avec);b.calcFocusPoint(bvec);this.position.lerp(a.position,b.position,t);avec.lerp(avec,bvec,t).sub(this.position);this.distance=avec.length();vecToAngles(this.angles,avec.mulScalar(1/this.distance));this.fov=math$1.lerp(a.fov,b.fov,t);}look(from,to){this.position.copy(from);this.distance=from.distance(to);const dir=avec.sub2(to,from).normalize();vecToAngles(this.angles,dir);}calcFocusPoint(result){rotation.setFromEulerAngles(this.angles).transformVector(Vec3.FORWARD,result).mulScalar(this.distance).add(this.position);}constructor(other){_define_property$v(this,"position",new Vec3);_define_property$v(this,"angles",new Vec3);_define_property$v(this,"distance",1);_define_property$v(this,"fov",65);if(other){this.copy(other);}}}

var camera = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Camera: Camera
});

function _define_property$u(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const forward$1=new Vec3;const offset$2=new Vec3;const ORBIT_LIMIT=15;const BREATH_YAW=3;const BREATH_PITCH=1.6;const BREATH_RAMP_TIME=7.5;const MAX_PULL=ORBIT_LIMIT*3;const SPRING_FREQUENCY=6;const SPRING_EPSILON=1e-4;const smootherstep=t=>t*t*t*(t*(t*6-15)+10);class AnnotationOrbitController{onEnter(camera){camera.calcFocusPoint(this._focus);this._focus.add(camera.position).mulScalar(.5);this._baseAngles.copy(camera.angles);this._drag.set(0,0,0);this._pull.set(0,0,0);this._pullVelocity.set(0,0,0);this._pulling=false;this._distance=camera.distance*.5;this._fov=camera.fov;this._time=0;}update(deltaTime,inputFrame,camera){const{rotate,rotateActive}=inputFrame.read();if(rotateActive[0]){if(!this._pulling){this._drag.x=ORBIT_LIMIT*Math.atanh(math$1.clamp(this._pull.x/ORBIT_LIMIT,-0.999,.999));this._drag.y=ORBIT_LIMIT*Math.atanh(math$1.clamp(this._pull.y/ORBIT_LIMIT,-0.999,.999));}this._drag.x=math$1.clamp(this._drag.x-rotate[1],-MAX_PULL,MAX_PULL);this._drag.y=math$1.clamp(this._drag.y-rotate[0],-MAX_PULL,MAX_PULL);this._pull.x=ORBIT_LIMIT*Math.tanh(this._drag.x/ORBIT_LIMIT);this._pull.y=ORBIT_LIMIT*Math.tanh(this._drag.y/ORBIT_LIMIT);this._pullVelocity.set(0,0,0);this._pulling=true;}else {this._pulling=false;this._spring(deltaTime,"x");this._spring(deltaTime,"y");}this._time+=deltaTime;const breathRamp=smootherstep(Math.min(this._time/BREATH_RAMP_TIME,1));const breathYaw=breathRamp*BREATH_YAW*(.7*Math.sin(this._time*.31)+.3*Math.sin(this._time*.67));const breathPitch=breathRamp*BREATH_PITCH*(.65*Math.sin(this._time*.23)+.35*Math.sin(this._time*.53));camera.angles.set(this._baseAngles.x+math$1.clamp(this._pull.x+breathPitch,-ORBIT_LIMIT,ORBIT_LIMIT),this._baseAngles.y+math$1.clamp(this._pull.y+breathYaw,-ORBIT_LIMIT,ORBIT_LIMIT),0);setCameraForward(camera.angles,forward$1);camera.position.sub2(this._focus,offset$2.copy(forward$1).mulScalar(this._distance));camera.distance=this._distance;camera.fov=this._fov;}_spring(deltaTime,axis){const position=this._pull[axis];const velocity=this._pullVelocity[axis];if(Math.abs(position)+Math.abs(velocity)<SPRING_EPSILON){this._pull[axis]=0;this._pullVelocity[axis]=0;return}const decay=Math.exp(-SPRING_FREQUENCY*deltaTime);const change=velocity+SPRING_FREQUENCY*position;this._pull[axis]=(position+change*deltaTime)*decay;this._pullVelocity[axis]=(velocity-SPRING_FREQUENCY*change*deltaTime)*decay;}onExit(_camera){}constructor(){_define_property$u(this,"_focus",new Vec3);_define_property$u(this,"_baseAngles",new Vec3);_define_property$u(this,"_drag",new Vec3);_define_property$u(this,"_pull",new Vec3);_define_property$u(this,"_pullVelocity",new Vec3);_define_property$u(this,"_pulling",false);_define_property$u(this,"_distance",1);_define_property$u(this,"_fov",60);_define_property$u(this,"_time",0);}}

var annotationOrbitController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnnotationOrbitController: AnnotationOrbitController
});

function _define_property$t(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const hDir=new Vec3;const nH=new Vec3;const pH=new Vec3;const _hLocal=new Vec3;const _nLocal=new Vec3;const _sLocal=new Vec3;const _P=new Vec3;const _N=new Vec3;const camPos=new Vec3;const offset$1=new Vec3;const _scale=new Vec3;const _qInv=new Quat;const _st=new Vec3;const _focusEst=new Vec3;const ROOF_PITCH=80*math$1.DEG_TO_RAD;class ChurchOrbitController{onEnter(camera){if(!this.box){this._seeded=true;return}this.box.getWorldTransform().getScale(_scale);this._headingToLocalPoint(camera.angles.y);this._arcH=this._localPointToArc(_sLocal.x,_sLocal.z);this._targetArcH=this._arcH;this._surface(this._arcH,0);const lProfile=this._verticalProfileLen();const halfProfile=_scale.y*.5-this._roundRadiusV();camera.calcFocusPoint(_focusEst);this._arcV=math$1.clamp(_focusEst.y-(pH.y-Math.max(halfProfile,0)),0,lProfile);this._targetArcV=this._arcV;this._surface(this._arcH,this._arcV);offset$1.sub2(camera.position,_P);this._standoff=math$1.clamp(offset$1.dot(_N),this.standoffMin,this.standoffMax);this._targetStandoff=this._standoff;this._vel.set(0,0,0);this._zoomVel=0;this._yPan=0;this._targetYPan=0;this._seeded=true;}hasState(){return this._seeded}captureState(){return {arcH:this._arcH,arcV:this._arcV,standoff:this._standoff}}applyState(s){this._arcH=s.arcH;this._arcV=s.arcV;this._targetArcH=this._arcH;this._targetArcV=this._arcV;this._standoff=s.standoff;this._targetStandoff=s.standoff;this._vel.set(0,0,0);this._zoomVel=0;this._yPan=0;this._targetYPan=0;this._seeded=true;}getCameraPose(){this._surface(this._arcH,this._arcV);camPos.copy(_P).add(_st.copy(_N).mulScalar(this._standoff));_P.y+=this._yPan;camPos.y+=this._yPan;return {position:camPos.clone(),target:_P.clone(),fov:this.fov}}_longWallBlend(arcH){const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const wallX=2*bx;const wallZ=2*bz;const cornerArc=r*Math.PI*.5;const P=4*(bx+bz)+2*Math.PI*r;let s=(arcH%P+P)%P;if(s<wallZ){return wallZ>wallX?this._wallInteriorBlend(s,wallZ):0}s-=wallZ;if(s<cornerArc)return 0;s-=cornerArc;if(s<wallX){return wallX>wallZ?this._wallInteriorBlend(s,wallX):0}s-=wallX;if(s<cornerArc)return 0;s-=cornerArc;if(s<wallZ){return wallZ>wallX?this._wallInteriorBlend(s,wallZ):0}s-=wallZ;if(s<cornerArc)return 0;s-=cornerArc;if(s<wallX){return wallX>wallZ?this._wallInteriorBlend(s,wallX):0}return 0}_wallInteriorBlend(distance,length){const transition=Math.min(this.longWallTransition,length*.5);if(transition<=1e-6)return 1;const fromStart=math$1.clamp(distance/transition,0,1);const fromEnd=math$1.clamp((length-distance)/transition,0,1);const t=Math.min(fromStart,fromEnd);return t*t*(3-2*t)}update(deltaTime,inputFrame,camera){const{move,rotate}=inputFrame.read();const ref=1.2*this.orbitSensitivity*this._maxExtent()*math$1.DEG_TO_RAD;const coast=Math.max(this.coastTau,.01);const friction=Math.exp(-deltaTime/coast);if(move[1]!==0&&this.box){this._targetYPan+=move[1];}if(deltaTime>0){const gain=(1-friction)/deltaTime;this._vel.y=this._vel.y*friction+rotate[0]*ref*gain;this._vel.x=this._vel.x*friction+rotate[1]*ref*gain;this._zoomVel=this._zoomVel*friction+Math.log(Math.max(1+move[2],.1))*gain;if(Math.abs(this._vel.x)<.01)this._vel.x=0;if(Math.abs(this._vel.y)<.01)this._vel.y=0;if(Math.abs(this._zoomVel)<.005)this._zoomVel=0;}const P=this._perimeter();const rH=this._roundRadiusH();const factorH=rH>1e-6&&this._onCornerH(this._targetArcH)?rH/(rH+this._standoff):1;const longWallBlend=this._longWallBlend(this._targetArcH);const wallPacing=math$1.lerp(1,this.longWallSpeed,longWallBlend);const zoomH=(P+2*Math.PI*this._standoff)/(P+2*Math.PI*this.standoffMin);this._targetArcH+=this._vel.y*zoomH*factorH*wallPacing*deltaTime;this._targetArcH=(this._targetArcH%P+P)%P;const lProfile=this._verticalProfileLen();const rV=this._roundRadiusV();const factorV=rV>1e-6&&this._onRoofArcV(this._targetArcV)?rV/(rV+this._standoff):1;const zoomV=(lProfile+ROOF_PITCH*this._standoff)/(lProfile+ROOF_PITCH*this.standoffMin);this._targetArcV=math$1.clamp(this._targetArcV+this._vel.x*zoomV*factorV*deltaTime,0,lProfile);this._targetStandoff=math$1.clamp(this._targetStandoff*Math.exp(this._zoomVel*deltaTime),this.standoffMin,this.standoffMax);if(this.box){this.box.getWorldTransform().getScale(_scale);const halfY=_scale.y;const boxY=this.box.getPosition().y;this._surface(this._arcH,this._arcV);const referenceY=_P.y;this._targetYPan=math$1.clamp(this._targetYPan,boxY-halfY-referenceY,boxY+halfY-referenceY);}if(this._targetArcV===0&&this._vel.x<0||this._targetArcV===lProfile&&this._vel.x>0){this._vel.x=0;}if(this._targetStandoff===this.standoffMin&&this._zoomVel<0||this._targetStandoff===this.standoffMax&&this._zoomVel>0){this._zoomVel=0;}const follow=Math.max(this.followTau,.01);const alpha=1-Math.exp(-deltaTime/follow);let dh=this._targetArcH-this._arcH;if(dh>P*.5)dh-=P;else if(dh<-P*.5)dh+=P;this._arcH=(this._arcH+dh*alpha)%P;if(this._arcH<0)this._arcH+=P;this._arcV=math$1.lerp(this._arcV,this._targetArcV,alpha);this._standoff=math$1.lerp(this._standoff,this._targetStandoff,alpha);this._yPan=math$1.lerp(this._yPan,this._targetYPan,alpha);this._surface(this._arcH,this._arcV);camPos.copy(_P).add(_st.copy(_N).mulScalar(this._standoff));_P.y+=this._yPan;camPos.y+=this._yPan;camera.look(camPos,_P);camera.fov=this.fov;}onExit(_camera){}_maxExtent(){if(!this.box)return 1;this.box.getWorldTransform().getScale(_scale);return Math.max(_scale.x,_scale.y,_scale.z)*.5||1}_roundRadiusH(){return Math.min(this.corner,_scale.x*.5,_scale.z*.5)}_roundRadiusV(){return Math.min(this.corner,_scale.y*.5)}_onCornerH(arcH){const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const wallX=2*bx;const wallZ=2*bz;const cornerArc=r*Math.PI*.5;const P=4*(bx+bz)+2*Math.PI*r;let s=P>1e-6?(arcH%P+P)%P:0;if((s-=wallZ)<0)return false;if((s-=cornerArc)<0)return true;if((s-=wallX)<0)return false;if((s-=cornerArc)<0)return true;if((s-=wallZ)<0)return false;if((s-=cornerArc)<0)return true;if((s-=wallX)<0)return false;return true}_onRoofArcV(arcV){const r=this._roundRadiusV();return r>1e-6&&arcV>2*Math.max(_scale.y*.5-r,0)}_perimeter(){if(!this.box)return 1;this.box.getWorldTransform().getScale(_scale);const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const P=4*(bx+bz)+2*Math.PI*r;return Math.max(P,1e-4)}_verticalProfileLen(){if(!this.box)return 1;this.box.getWorldTransform().getScale(_scale);const hy=_scale.y*.5;const r=this._roundRadiusV();const wallSpan=Math.max(hy-r,0);return Math.max(2*wallSpan+ROOF_PITCH*r,1e-4)}_perimeterAt(arcH){if(!this.box){nH.set(0,0,1);pH.set(0,0,0);_scale.set(1,1,1);return}this.box.getWorldTransform().getScale(_scale);const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const wallX=2*bx;const wallZ=2*bz;const cornerArc=r*Math.PI*.5;const P=4*(bx+bz)+2*Math.PI*r;let s=P>1e-6?(arcH%P+P)%P:0;let x,z,nx,nz;if(s<wallZ){x=hx;z=-bz+s;nx=1;nz=0;}else if((s-=wallZ)<cornerArc){const a=s/r;x=bx+r*Math.cos(a);z=bz+r*Math.sin(a);nx=Math.cos(a);nz=Math.sin(a);}else if((s-=cornerArc)<wallX){x=bx-s;z=hz;nx=0;nz=1;}else if((s-=wallX)<cornerArc){const a=Math.PI*.5+s/r;x=-bx+r*Math.cos(a);z=bz+r*Math.sin(a);nx=Math.cos(a);nz=Math.sin(a);}else if((s-=cornerArc)<wallZ){x=-hx;z=bz-s;nx=-1;nz=0;}else if((s-=wallZ)<cornerArc){const a=Math.PI+s/r;x=-bx+r*Math.cos(a);z=-bz+r*Math.sin(a);nx=Math.cos(a);nz=Math.sin(a);}else if((s-=cornerArc)<wallX){x=-bx+s;z=-hz;nx=0;nz=-1;}else {s-=wallX;const a=Math.PI*1.5+s/r;x=bx+r*Math.cos(a);z=-bz+r*Math.sin(a);nx=Math.cos(a);nz=Math.sin(a);}_sLocal.set(x,0,z);_nLocal.set(nx,0,nz);const rot=this.box.getRotation();rot.transformVector(_nLocal,nH);rot.transformVector(_sLocal,pH);pH.add(this.box.getPosition());}_surface(arcH,arcV){if(!this.box){_P.set(0,0,0);_N.set(0,0,1);return}this._perimeterAt(arcH);const hy=_scale.y*.5;const r=this._roundRadiusV();const wallSpan=Math.max(hy-r,0);const lWall=2*wallSpan;const p=math$1.clamp(arcV,0,lWall+ROOF_PITCH*r);if(p<=lWall||r<1e-6){const y=-wallSpan+Math.min(p,lWall);_P.set(pH.x,pH.y+y,pH.z);_N.copy(nH);}else {const phi=(p-lWall)/r;const c=Math.cos(phi);const s=Math.sin(phi);_P.set(pH.x-r*(1-c)*nH.x,pH.y+wallSpan+r*s,pH.z-r*(1-c)*nH.z);_N.set(nH.x*c,s,nH.z*c);}}_headingToLocalPoint(az){const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const a=az*math$1.DEG_TO_RAD;hDir.set(Math.sin(a),0,Math.cos(a));_qInv.copy(this.box.getRotation()).invert();_qInv.transformVector(hDir,_hLocal);const ax=Math.abs(_hLocal.x);const azAbs=Math.abs(_hLocal.z);const tx=ax>1e-6?hx/ax:Infinity;const tz=azAbs>1e-6?hz/azAbs:Infinity;const t=Math.min(tx,tz);const px=_hLocal.x*t;const pz=_hLocal.z*t;const qx=math$1.clamp(px,-bx,bx);const qz=math$1.clamp(pz,-bz,bz);let nx=px-qx;let nz=pz-qz;let len=Math.sqrt(nx*nx+nz*nz);if(len<1e-6){if(tx<=tz){nx=_hLocal.x<0?-1:1;nz=0;}else {nx=0;nz=_hLocal.z<0?-1:1;}len=1;}nx/=len;nz/=len;_sLocal.set(qx+r*nx,0,qz+r*nz);}_localPointToArc(x,z){const hx=_scale.x*.5;const hz=_scale.z*.5;const r=this._roundRadiusH();const bx=Math.max(hx-r,0);const bz=Math.max(hz-r,0);const wallX=2*bx;const wallZ=2*bz;const cornerArc=r*Math.PI*.5;if(x>=bx){if(z>=bz){if(r<1e-6)return wallZ;const ang=Math.atan2(z-bz,x-bx);return wallZ+math$1.clamp(ang,0,Math.PI*.5)*r}if(z<=-bz){if(r<1e-6)return 2*(wallZ+cornerArc+wallX);let ang=Math.atan2(z+bz,x-bx);if(ang<0)ang+=2*Math.PI;return 2*(wallZ+cornerArc+wallX)+math$1.clamp(ang-Math.PI*1.5,0,Math.PI*.5)*r}return math$1.clamp(z+bz,0,wallZ)}if(x<=-bx){if(z>=bz){if(r<1e-6)return wallZ+cornerArc+wallX;const ang=Math.atan2(z-bz,x+bx);return wallZ+cornerArc+wallX+math$1.clamp(ang-Math.PI*.5,0,Math.PI*.5)*r}if(z<=-bz){if(r<1e-6)return 2*(wallZ+cornerArc)+wallX;let ang=Math.atan2(z+bz,x+bx);if(ang<0)ang+=2*Math.PI;return 2*(wallZ+cornerArc)+wallX+math$1.clamp(ang-Math.PI,0,Math.PI*.5)*r}return wallZ+cornerArc+wallX+cornerArc+math$1.clamp(bz-z,0,wallZ)}if(z>=bz){return wallZ+cornerArc+math$1.clamp(bx-x,0,wallX)}return 2*(wallZ+cornerArc)+wallX+cornerArc+math$1.clamp(x+bx,0,wallX)}constructor(){_define_property$t(this,"fov",60);_define_property$t(this,"coastTau",.5);_define_property$t(this,"followTau",.1);_define_property$t(this,"box",null);_define_property$t(this,"corner",6);_define_property$t(this,"standoffMin",4);_define_property$t(this,"standoffMax",40);_define_property$t(this,"elevationMin",-45);_define_property$t(this,"elevationMax",80);_define_property$t(this,"orbitSensitivity",1);_define_property$t(this,"_arcH",0);_define_property$t(this,"_targetArcH",0);_define_property$t(this,"_arcV",0);_define_property$t(this,"_targetArcV",0);_define_property$t(this,"_standoff",10);_define_property$t(this,"_targetStandoff",10);_define_property$t(this,"_yPan",0);_define_property$t(this,"_targetYPan",0);_define_property$t(this,"_vel",new Vec3);_define_property$t(this,"_zoomVel",0);_define_property$t(this,"_seeded",false);_define_property$t(this,"longWallSpeed",.25);_define_property$t(this,"longWallTransition",4);}}

var churchOrbitController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ChurchOrbitController: ChurchOrbitController
});

function _define_property$s(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const FIXED_DT=1/60;const MAX_SUBSTEPS=10;const out={x:0,y:0,z:0};const v$3=new Vec3;const d=new Vec3;const forward=new Vec3;const right$1=new Vec3;const moveStep=[0,0,0];const offset=new Vec3;const spawnProbe=new Vec3;class WalkController{onEnter(camera){this.goto(camera);if(this.collision){this._spawn.clear();if(findCylinderSpawn(this.collision,camera.position.x,camera.position.y,camera.position.z,(this.capsuleHeight+this.hoverHeight)*.5,this.capsuleRadius,spawnProbe)){this._position.set(spawnProbe.x,spawnProbe.y+this.hoverHeight+this.eyeHeight,spawnProbe.z);this._grounded=true;this._velocity.y=0;this._storeSpawn();}this._prevPosition.copy(this._position);}}update(deltaTime,inputFrame,camera){const{move,rotate}=inputFrame.read();applyFrameRotation(this._targetAngles,rotate);dampAngles(this._angles,this._targetAngles,this.rotateDamping,deltaTime);this._pendingMove[0]+=move[0];this._pendingMove[1]=this._pendingMove[1]||move[1];this._pendingMove[2]+=move[2];this._accumulator=Math.min(this._accumulator+deltaTime,MAX_SUBSTEPS*FIXED_DT);const numSteps=Math.floor(this._accumulator/FIXED_DT);if(numSteps>0){const invSteps=1/numSteps;moveStep[0]=this._pendingMove[0]*invSteps;moveStep[1]=this._pendingMove[1];moveStep[2]=this._pendingMove[2]*invSteps;for(let i=0;i<numSteps;i++){this._prevPosition.copy(this._position);this._step(FIXED_DT,moveStep);this._accumulator-=FIXED_DT;}this._pendingMove[0]=0;this._pendingMove[1]=0;this._pendingMove[2]=0;}const alpha=this._accumulator/FIXED_DT;camera.position.lerp(this._prevPosition,this._position,alpha);camera.angles.set(this._angles.x,this._angles.y,0);camera.distance=this._distance;camera.fov=this.fov;}_step(dt,move){const groundY=this._probeGround(this._position);const hasGround=groundY!==null;if(this._velocity.y<0){this._jumping=false;}if(move[1]&&!this._jumping&&this._grounded&&!this._jumpHeld){this._jumping=true;this._velocity.y=this.jumpSpeed;this._grounded=false;}this._jumpHeld=!!move[1];if(hasGround&&!this._jumping){const targetY=groundY+this.hoverHeight+this.eyeHeight;const displacement=this._position.y-targetY;if(displacement>.1){this._velocity.y-=this.gravity*dt;const nextY=this._position.y+this._velocity.y*dt;if(nextY<=targetY){this._position.y=targetY;this._velocity.y=0;}this._grounded=false;}else {const springForce=-this.springStiffness*displacement-this.springDamping*this._velocity.y;this._velocity.y+=springForce*dt;this._grounded=true;}}else {this._velocity.y-=this.gravity*dt;this._grounded=false;}setYawBasis(this._angles.y,forward,right$1);setBasisOffset(offset,move[0],0,move[2],forward,right$1,Vec3.UP);this._velocity.add(offset.mulScalar(this._grounded?this.moveGroundSpeed:this.moveAirSpeed));const dampFactor=this._grounded?this.velocityDampingGround:this.velocityDampingAir;const alpha=damp(dampFactor,dt);this._velocity.x=math$1.lerp(this._velocity.x,0,alpha);this._velocity.z=math$1.lerp(this._velocity.z,0,alpha);this._position.add(v$3.copy(this._velocity).mulScalar(dt));this._checkCollision(this._position,d);}onExit(_camera){}goto(camera){this._position.copy(camera.position);this._prevPosition.copy(this._position);this._angles.set(camera.angles.x,camera.angles.y,0);this._targetAngles.copy(this._angles);this._distance=camera.distance;this._resetMotion();}resetToSpawn(camera){if(!this._spawn.has){return false}this._distance=this._spawn.restore(this._position,this._angles);this._prevPosition.copy(this._position);this._targetAngles.copy(this._angles);this._resetMotion();this._grounded=this._spawnGrounded;camera.position.copy(this._position);camera.angles.copy(this._angles);camera.distance=this._distance;camera.fov=this.fov;return true}_storeSpawn(){this._spawn.store(this._position,this._angles,this._distance);this._spawnGrounded=this._grounded;}_resetMotion(){this._velocity.set(0,0,0);this._grounded=false;this._jumping=false;this._jumpHeld=false;this._pendingMove[0]=0;this._pendingMove[1]=0;this._pendingMove[2]=0;this._accumulator=0;}_probeGround(pos){if(!this.collision)return null;const oy=pos.y-this.eyeHeight;const r=this.capsuleRadius;const range=this.groundProbeRange;let totalY=0;let hitCount=0;for(let i=0;i<5;i++){let ox=pos.x;let oz=pos.z;if(i===1)ox-=r;else if(i===2)ox+=r;else if(i===3)oz+=r;else if(i===4)oz-=r;const hit=this.collision.queryRay(ox,oy,oz,0,-1,0,range);if(hit){totalY+=hit.y;hitCount++;}}return hitCount>0?totalY/hitCount:null}_checkCollision(pos,disp){const center=pos.y-this.eyeHeight+this.capsuleHeight*.5;const half=this.capsuleHeight*.5-this.capsuleRadius;if(this.collision.queryCapsule(pos.x,center,pos.z,half,this.capsuleRadius,out)){disp.set(out.x,out.y,out.z);pos.add(disp);if(disp.y<0&&this._velocity.y>0){this._velocity.y=0;}if(!this._grounded&&disp.y>0&&this._velocity.y<0){this._velocity.y=0;this._grounded=true;}}}constructor(){_define_property$s(this,"collision",null);_define_property$s(this,"fov",90);_define_property$s(this,"capsuleHeight",1.5);_define_property$s(this,"capsuleRadius",.2);_define_property$s(this,"eyeHeight",1.3);_define_property$s(this,"gravity",9.8);_define_property$s(this,"jumpSpeed",4);_define_property$s(this,"moveGroundSpeed",7);_define_property$s(this,"moveAirSpeed",1);_define_property$s(this,"rotateDamping",DEFAULT_CONTROLLER_DAMPING);_define_property$s(this,"velocityDampingGround",.99);_define_property$s(this,"velocityDampingAir",.998);_define_property$s(this,"hoverHeight",.2);_define_property$s(this,"springStiffness",800);_define_property$s(this,"springDamping",57);_define_property$s(this,"groundProbeRange",1);_define_property$s(this,"_position",new Vec3);_define_property$s(this,"_prevPosition",new Vec3);_define_property$s(this,"_angles",new Vec3);_define_property$s(this,"_targetAngles",new Vec3);_define_property$s(this,"_distance",1);_define_property$s(this,"_spawn",new SpawnState);_define_property$s(this,"_spawnGrounded",false);_define_property$s(this,"_velocity",new Vec3);_define_property$s(this,"_pendingMove",[0,0,0]);_define_property$s(this,"_accumulator",0);_define_property$s(this,"_grounded",false);_define_property$s(this,"_jumping",false);_define_property$s(this,"_jumpHeld",false);}}

var walkController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WalkController: WalkController
});

function _define_property$r(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class AnimController{onEnter(camera){camera.look(this.animState.position,this.animState.target);camera.fov=this.animState.fov;}seek(value){this.animState.seek(value);}seekClosest(position){this.animState.seekClosest(position);}update(deltaTime,inputFrame,camera){this.animState.update(deltaTime);camera.look(this.animState.position,this.animState.target);camera.fov=this.animState.fov;drainInputFrame(inputFrame);}onExit(camera){}constructor(animTrack){_define_property$r(this,"animState",void 0);this.animState=AnimState.fromTrack(animTrack);this.animState.update(0);}}

var animController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimController: AnimController
});

function _define_property$q(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const smoothstep=t=>t*t*(3-2*t);const GAZE_TAU=.35;const GAZE_TAU_FRACTION=.15;const GAZE_LOCK_START=.45;class FlightController{get done(){return this.time>=this.duration}_evaluate(u){const{spline,result,position}=this;spline.evaluate(u*this.duration,result);if(result.every(isFinite)){position.set(result[0],result[1],result[2]);this.yaw=result[3];this.pitch=result[4];this.dist=result[5];this.fov=result[6];}}_apply(camera){camera.position.copy(this.position);camera.angles.set(this._pitchSoft,this._yawSoft,0);camera.distance=Math.max(this.dist,.01);camera.fov=this.fov;}onEnter(camera){this._apply(camera);}update(deltaTime,inputFrame,camera){this.time=Math.min(this.time+deltaTime,this.duration);const u=this.time/this.duration;this._evaluate(smoothstep(u));const lock=u<GAZE_LOCK_START?0:smoothstep((u-GAZE_LOCK_START)/(1-GAZE_LOCK_START));const tau=this._gazeTau*(1-lock);const alpha=tau>.001?1-Math.exp(-deltaTime/tau):1;this._yawSoft+=(this.yaw-this._yawSoft)*alpha;this._pitchSoft+=(this.pitch-this._pitchSoft)*alpha;this._apply(camera);drainInputFrame(inputFrame);}onExit(_camera){}constructor(track){_define_property$q(this,"spline",void 0);_define_property$q(this,"duration",void 0);_define_property$q(this,"time",0);_define_property$q(this,"result",[]);_define_property$q(this,"position",new Vec3);_define_property$q(this,"yaw",0);_define_property$q(this,"pitch",0);_define_property$q(this,"dist",1);_define_property$q(this,"fov",void 0);const{keyframes,duration,smoothness}=track;const{times,values}=keyframes;const{position,yaw,pitch,dist,fov}=values;const points=[];for(let i=0;i<times.length;i++){points.push(position[i*3],position[i*3+1],position[i*3+2]);points.push(yaw[i],pitch[i],dist[i],fov[i]);}this.spline=CubicSpline.fromPoints(times,points,smoothness);this.duration=duration;this.fov=fov[0];this._evaluate(0);this._yawSoft=this.yaw;this._pitchSoft=this.pitch;this._gazeTau=Math.min(GAZE_TAU,duration*GAZE_TAU_FRACTION);}}

var flightController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FlightController: FlightController
});

function _define_property$p(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const ARRIVAL_DIST=.5;const BLOCKED_SPEED=.6;const BLOCKED_DURATION=.2;class WalkSource{get isActive(){return this._target!==null}navigateTo(target,speedMul=1){if(!this._target){this._target=new Vec3;}this._target.copy(target);this._speedMul=speedMul;this._progress.reset();}cancel(){if(this._target){this._target=null;this._yawRate=0;this._progress.reset();this.onComplete?.();}}update(dt,camera,frame){if(!this._target)return;const target=this._target;const cameraPosition=camera.position;const cameraAngles=camera.angles;const dx=target.x-cameraPosition.x;const dz=target.z-cameraPosition.z;const xzDist=Math.sqrt(dx*dx+dz*dz);if(xzDist<ARRIVAL_DIST){this.cancel();return}if(this._progress.update(xzDist,dt,BLOCKED_SPEED,BLOCKED_DURATION)){this.cancel();return}const yawDiff=getYawDiffToTarget(dx,dz,cameraAngles.y);this._yawRate=smoothTurnRate(this._yawRate,yawDiff,this.maxTurnRate,this.turnGain,dt);const yawStep=clampTurnStep(this._yawRate,yawDiff,dt);this._yawRate=dt>0?yawStep/dt:this._yawRate;frame.accumulate("rotate",[-yawStep,0,0]);const alignment=Math.max(0,Math.cos(yawDiff*Math.PI/180));frame.accumulate("move",[0,0,this.walkSpeed*this._speedMul*dt*alignment]);}constructor(){_define_property$p(this,"walkSpeed",4);_define_property$p(this,"maxTurnRate",192);_define_property$p(this,"turnGain",5);_define_property$p(this,"onComplete",null);_define_property$p(this,"_target",null);_define_property$p(this,"_yawRate",0);_define_property$p(this,"_progress",new ProgressTracker);_define_property$p(this,"_speedMul",1);}}

var walkSource = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WalkSource: WalkSource
});

var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimController: AnimController,
    AnnotationOrbitController: AnnotationOrbitController,
    Camera: Camera,
    ChurchOrbitController: ChurchOrbitController,
    FlightController: FlightController,
    FlyController: FlyController,
    FlySource: FlySource,
    WalkController: WalkController,
    WalkSource: WalkSource
});

function _define_property$o(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const voxelOverlayWGSL=`

// Solid leaf sentinel: childMask=0xFF, baseOffset=0
const SOLID_LEAF_MARKER: u32 = 0xFF000000u;

// Maximum DDA steps to prevent infinite loops
const MAX_STEPS: u32 = 512u;

// Target wireframe edge width in pixels
const EDGE_PIXELS: f32 = 1.5;

// Wireframe edge alpha (1.0 = pure black opaque edges, matching the mesh
// overlay's wireframe pass).
const EDGE_ALPHA: f32 = 0.8;

// Interior fill alpha (matching the mesh overlay's surface alpha).
const FILL_ALPHA: f32 = 0.30;

struct Uniforms {
    invVP: mat4x4<f32>,
    screenWidth: u32,
    screenHeight: u32,
    gridMinX: f32,
    gridMinY: f32,
    gridMinZ: f32,
    voxelRes: f32,
    numVoxelsX: u32,
    numVoxelsY: u32,
    numVoxelsZ: u32,
    leafSize: u32,
    treeDepth: u32,
    projScaleY: f32,
    displayMode: u32,
    inverted: u32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> nodes: array<u32>;
@group(0) @binding(2) var<storage, read> leafData: array<u32>;
@group(0) @binding(3) var outputTexture: texture_storage_2d<rgba8unorm, write>;

// ---- helpers ----

// Traverse the octree for block (bx, by, bz). Returns vec2u(result, skipLevel):
//   result: 0 = empty, 1 = solid, 2+ = mixed leaf (2 + leafDataIndex)
//   skipLevel: octree level for multi-block skipping (meaningful when result == 0 or 1)
fn queryBlock(bx: i32, by: i32, bz: i32) -> vec2u {
    let depth = uniforms.treeDepth;
    var nodeIndex: u32 = 0u;

    for (var level: u32 = depth - 1u; ; ) {
        let node = nodes[nodeIndex];

        // Solid leaf sentinel -- return level + 1 so the caller can skip 2^(level+1) blocks
        if (node == SOLID_LEAF_MARKER) {
            return vec2u(1u, level + 1u);
        }

        let childMask = (node >> 24u) & 0xFFu;

        // childMask == 0 means this is a mixed leaf node
        if (childMask == 0u) {
            let leafIdx = node & 0x00FFFFFFu;
            return vec2u(2u + leafIdx, 0u);
        }

        // Determine octant at this level
        let bitX = (u32(bx) >> level) & 1u;
        let bitY = (u32(by) >> level) & 1u;
        let bitZ = (u32(bz) >> level) & 1u;
        let octant = (bitZ << 2u) | (bitY << 1u) | bitX;

        // Check if child exists
        if ((childMask & (1u << octant)) == 0u) {
            return vec2u(0u, level);
        }

        // Compute child index
        let baseOffset = node & 0x00FFFFFFu;
        let prefix = (1u << octant) - 1u;
        let childOffset = countOneBits(childMask & prefix);
        nodeIndex = baseOffset + childOffset;

        if (level == 0u) { break; }
        level -= 1u;
    }

    // Reached leaf level
    let node = nodes[nodeIndex];
    if (node == SOLID_LEAF_MARKER) {
        return vec2u(1u, 0u);
    }
    let leafIdx = node & 0x00FFFFFFu;
    return vec2u(2u + leafIdx, 0u);
}

// Ray-AABB intersection returning (tNear, tFar). If tNear > tFar → miss.
fn intersectAABB(ro: vec3f, invDir: vec3f, bmin: vec3f, bmax: vec3f) -> vec2f {
    let t1 = (bmin - ro) * invDir;
    let t2 = (bmax - ro) * invDir;
    let tmin = min(t1, t2);
    let tmax = max(t1, t2);
    let tNear = max(max(tmin.x, tmin.y), tmin.z);
    let tFar  = min(min(tmax.x, tmax.y), tmax.z);
    return vec2f(tNear, tFar);
}

// Compute wireframe edge factor (0 = interior, 1 = on edge) for a hit point on a voxel cube.
// Uses the median of the three per-axis face distances so it works on ANY face.
fn edgeFactor(hitPos: vec3f, voxMin: vec3f, voxSize: f32, edgeWidth: f32) -> f32 {
    let local = (hitPos - voxMin) / voxSize;

    // Distance to nearest face boundary for each axis
    let fx = min(local.x, 1.0 - local.x);
    let fy = min(local.y, 1.0 - local.y);
    let fz = min(local.z, 1.0 - local.z);

    // Median of three values = second smallest = edge distance.
    // On a face, one of fx/fy/fz is ~0 (the face normal axis).
    // The median gives the smaller of the other two = distance to nearest edge.
    let edgeDist = max(min(fx, fy), min(max(fx, fy), fz));

    return 1.0 - smoothstep(0.0, edgeWidth, edgeDist);
}

// Shade a voxel hit, returning premultiplied RGBA. Uses the same face-axis
// grayscale palette as the mesh collision overlay (0.85 / 0.55 / 0.30 by
// dominant axis), with pure black at face edges to mimic that overlay's
// wireframe pass.
fn shadeVoxelHit(hitPos: vec3f, voxMin: vec3f, voxelRes: f32, ro: vec3f) -> vec4f {
    let dist = length(hitPos - ro);
    let pixelWorld = 2.0 * dist / (f32(uniforms.screenHeight) * uniforms.projScaleY);
    let ew = clamp(EDGE_PIXELS * pixelWorld / voxelRes, 0.01, 0.5);

    let ef = edgeFactor(hitPos, voxMin, voxelRes, ew);

    let local = (hitPos - voxMin) / voxelRes;
    let fx = min(local.x, 1.0 - local.x);
    let fy = min(local.y, 1.0 - local.y);
    let fz = min(local.z, 1.0 - local.z);

    var faceAxis: u32 = 0u;
    if (fy <= fx && fy <= fz) {
        faceAxis = 1u;
    } else if (fz <= fx) {
        faceAxis = 2u;
    }

    var baseColor: vec3f;
    if (faceAxis == 0u) { baseColor = vec3f(0.85); }
    else if (faceAxis == 1u) { baseColor = vec3f(0.55); }
    else { baseColor = vec3f(0.30); }

    // Mix the surface base color toward black as the edge factor approaches 1
    // and ramp alpha from FILL_ALPHA up to EDGE_ALPHA so face edges read as
    // opaque black lines while the interior stays at the surface tint.
    let color = mix(baseColor, vec3f(0.0), ef);
    let alpha = mix(FILL_ALPHA, EDGE_ALPHA, ef);

    return vec4f(color * alpha, alpha);
}

// Blue (0) -> Cyan (0.25) -> Green (0.5) -> Yellow (0.75) -> Red (1.0)
fn heatmap(t: f32) -> vec3f {
    let c = clamp(t, 0.0, 1.0);
    let r = clamp(min(c - 0.5, 1.0) * 2.0, 0.0, 1.0);
    let g = select(clamp(c * 4.0, 0.0, 1.0), clamp((1.0 - c) * 4.0, 0.0, 1.0), c > 0.5);
    let b = clamp(1.0 - c * 2.0, 0.0, 1.0);
    return vec3f(r, g, b);
}

// ---- main ----

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let px = i32(gid.x);
    let py = i32(gid.y);
    let sw = i32(uniforms.screenWidth);
    let sh = i32(uniforms.screenHeight);

    if (px >= sw || py >= sh) {
        return;
    }

    // Reconstruct world-space ray from pixel coordinates
    let ndcX = (f32(px) + 0.5) / f32(sw) * 2.0 - 1.0;
    let ndcY = -((f32(py) + 0.5) / f32(sh) * 2.0 - 1.0);

    let clipNear = vec4f(ndcX, ndcY, 0.0, 1.0);
    let clipFar  = vec4f(ndcX, ndcY, 1.0, 1.0);

    var worldNear = uniforms.invVP * clipNear;
    worldNear = worldNear / worldNear.w;
    var worldFar = uniforms.invVP * clipFar;
    worldFar = worldFar / worldFar.w;

    let ro = worldNear.xyz;
    let rd = normalize(worldFar.xyz - worldNear.xyz);

    // Grid AABB
    let gridMin = vec3f(uniforms.gridMinX, uniforms.gridMinY, uniforms.gridMinZ);
    let gridMax = gridMin + vec3f(
        f32(uniforms.numVoxelsX),
        f32(uniforms.numVoxelsY),
        f32(uniforms.numVoxelsZ)
    ) * uniforms.voxelRes;

    let invDir = 1.0 / rd;
    let gridHit = intersectAABB(ro, invDir, gridMin, gridMax);

    if (gridHit.x > gridHit.y) {
        textureStore(outputTexture, vec2i(px, py), vec4f(0.0));
        return;
    }

    let tEntry = max(gridHit.x, 0.0) + 0.0001;

    // Entry point in voxel-index space
    let entryWorld = ro + rd * tEntry;
    let voxelRes = uniforms.voxelRes;
    let lsf = f32(uniforms.leafSize);
    let blockRes = voxelRes * lsf;
    let leafSz = i32(uniforms.leafSize);

    // Block-level DDA setup
    let entryBlock = (entryWorld - gridMin) / blockRes;
    let numBlocksX = i32(uniforms.numVoxelsX / uniforms.leafSize);
    let numBlocksY = i32(uniforms.numVoxelsY / uniforms.leafSize);
    let numBlocksZ = i32(uniforms.numVoxelsZ / uniforms.leafSize);

    var bx = clamp(i32(floor(entryBlock.x)), 0, numBlocksX - 1);
    var by = clamp(i32(floor(entryBlock.y)), 0, numBlocksY - 1);
    var bz = clamp(i32(floor(entryBlock.z)), 0, numBlocksZ - 1);

    let stepX = select(-1, 1, rd.x >= 0.0);
    let stepY = select(-1, 1, rd.y >= 0.0);
    let stepZ = select(-1, 1, rd.z >= 0.0);

    let tDeltaX = abs(blockRes / rd.x);
    let tDeltaY = abs(blockRes / rd.y);
    let tDeltaZ = abs(blockRes / rd.z);

    // tMax: t value to reach next block boundary along each axis
    let blockMinWorld = gridMin + vec3f(f32(bx), f32(by), f32(bz)) * blockRes;
    let nextBoundX = select(blockMinWorld.x, blockMinWorld.x + blockRes, rd.x >= 0.0);
    let nextBoundY = select(blockMinWorld.y, blockMinWorld.y + blockRes, rd.y >= 0.0);
    let nextBoundZ = select(blockMinWorld.z, blockMinWorld.z + blockRes, rd.z >= 0.0);

    var tMaxX = (nextBoundX - ro.x) / rd.x;
    var tMaxY = (nextBoundY - ro.y) / rd.y;
    var tMaxZ = (nextBoundZ - ro.z) / rd.z;

    let inv = uniforms.inverted != 0u;
    var totalWork: u32 = 0u;

    for (var step: u32 = 0u; step < MAX_STEPS; step++) {
        totalWork += 1u;

        let qResult = queryBlock(bx, by, bz);
        let blockResult = qResult.x;
        let skipLevel = qResult.y;

        // Normal: skip large empty regions.  Inverted: skip large solid regions.
        let shouldSkip = select(
            blockResult == 0u && skipLevel >= 1u,
            blockResult == 1u && skipLevel >= 1u,
            inv
        );

        if (shouldSkip) {
            let cellBlocks = i32(1u << skipLevel);
            let cellMask = ~(cellBlocks - 1);
            let cellXMin = bx & cellMask;
            let cellYMin = by & cellMask;
            let cellZMin = bz & cellMask;

            for (var skip: u32 = 0u; skip < 128u; skip++) {
                totalWork += 1u;

                if (tMaxX < tMaxY && tMaxX < tMaxZ) {
                    bx += stepX;
                    tMaxX += tDeltaX;
                    if (bx < cellXMin || bx >= cellXMin + cellBlocks) { break; }
                } else if (tMaxY < tMaxZ) {
                    by += stepY;
                    tMaxY += tDeltaY;
                    if (by < cellYMin || by >= cellYMin + cellBlocks) { break; }
                } else {
                    bz += stepZ;
                    tMaxZ += tDeltaZ;
                    if (bz < cellZMin || bz >= cellZMin + cellBlocks) { break; }
                }
            }
        } else {
            // Normal: enter voxel DDA for non-empty blocks.
            // Inverted: enter voxel DDA for non-solid blocks (empty or mixed).
            let enterDDA = select(blockResult != 0u, blockResult != 1u, inv);

            if (enterDDA) {
                let blockOrigin = gridMin + vec3f(f32(bx), f32(by), f32(bz)) * blockRes;

                let blockMax = blockOrigin + vec3f(blockRes);
                let bHit = intersectAABB(ro, invDir, blockOrigin, blockMax);
                let tBlockEntry = max(bHit.x, 0.0);

                // Voxel-level DDA within the block
                let entryVoxWorld = ro + rd * (tBlockEntry + 0.0001);
                let entryLocal = (entryVoxWorld - blockOrigin) / voxelRes;
                var vx = clamp(i32(floor(entryLocal.x)), 0, leafSz - 1);
                var vy = clamp(i32(floor(entryLocal.y)), 0, leafSz - 1);
                var vz = clamp(i32(floor(entryLocal.z)), 0, leafSz - 1);

                let vTDeltaX = abs(voxelRes / rd.x);
                let vTDeltaY = abs(voxelRes / rd.y);
                let vTDeltaZ = abs(voxelRes / rd.z);

                let voxOrigin = blockOrigin + vec3f(f32(vx), f32(vy), f32(vz)) * voxelRes;
                let vNextX = select(voxOrigin.x, voxOrigin.x + voxelRes, rd.x >= 0.0);
                let vNextY = select(voxOrigin.y, voxOrigin.y + voxelRes, rd.y >= 0.0);
                let vNextZ = select(voxOrigin.z, voxOrigin.z + voxelRes, rd.z >= 0.0);

                var vTMaxX = (vNextX - ro.x) / rd.x;
                var vTMaxY = (vNextY - ro.y) / rd.y;
                var vTMaxZ = (vNextZ - ro.z) / rd.z;

                var maskLo: u32 = 0u;
                var maskHi: u32 = 0u;
                if (blockResult > 1u) {
                    let leafIdx = blockResult - 2u;
                    maskLo = leafData[leafIdx * 2u];
                    maskHi = leafData[leafIdx * 2u + 1u];
                }

                for (var vStep: u32 = 0u; vStep < 12u; vStep++) {
                    totalWork += 1u;

                    var isSolid = false;

                    if (blockResult == 1u) {
                        isSolid = true;
                    } else {
                        let bitIndex = u32(vz) * 16u + u32(vy) * 4u + u32(vx);
                        isSolid = select(
                            (maskHi & (1u << (bitIndex - 32u))) != 0u,
                            (maskLo & (1u << bitIndex)) != 0u,
                            bitIndex < 32u
                        );
                    }

                    let isHit = select(isSolid, !isSolid, inv);

                    if (isHit) {
                        if (uniforms.displayMode == 0u) {
                            let voxMin = blockOrigin + vec3f(f32(vx), f32(vy), f32(vz)) * voxelRes;
                            let vHit = intersectAABB(ro, invDir, voxMin, voxMin + vec3f(voxelRes));
                            let hitPos = ro + rd * max(vHit.x, 0.0);
                            let result = shadeVoxelHit(hitPos, voxMin, voxelRes, ro);
                            textureStore(outputTexture, vec2i(px, py), result);
                        } else {
                            let effort = f32(totalWork) / 256.0;
                            let color = heatmap(effort);
                            textureStore(outputTexture, vec2i(px, py), vec4f(color, 1.0));
                        }
                        return;
                    }

                    // Advance voxel DDA
                    if (vTMaxX < vTMaxY && vTMaxX < vTMaxZ) {
                        vx += stepX;
                        vTMaxX += vTDeltaX;
                        if (vx < 0 || vx >= leafSz) { break; }
                    } else if (vTMaxY < vTMaxZ) {
                        vy += stepY;
                        vTMaxY += vTDeltaY;
                        if (vy < 0 || vy >= leafSz) { break; }
                    } else {
                        vz += stepZ;
                        vTMaxZ += vTDeltaZ;
                        if (vz < 0 || vz >= leafSz) { break; }
                    }
                }
            }

            // Advance block DDA
            if (tMaxX < tMaxY && tMaxX < tMaxZ) {
                bx += stepX;
                tMaxX += tDeltaX;
            } else if (tMaxY < tMaxZ) {
                by += stepY;
                tMaxY += tDeltaY;
            } else {
                bz += stepZ;
                tMaxZ += tDeltaZ;
            }
        }

        if (bx < 0 || by < 0 || bz < 0 ||
            bx >= numBlocksX || by >= numBlocksY || bz >= numBlocksZ) {
            break;
        }
    }

    textureStore(outputTexture, vec2i(px, py), vec4f(0.0));
}
`;class VoxelDebugOverlay{createStorageTexture(width,height){return new Texture(this.app.graphicsDevice,{name:"VoxelOverlay-Storage",width,height,format:PIXELFORMAT_RGBA8,mipmaps:false,addressU:3,addressV:3,storage:true})}update(){if(!this.enabled)return;const{app,camera,compute,collision}=this;const device=app.graphicsDevice;const width=device.width;const height=device.height;if(width<=0||height<=0)return;if(width!==this.currentWidth||height!==this.currentHeight){this.storageTexture.destroy();this.currentWidth=width;this.currentHeight=height;this.storageTexture=this.createStorageTexture(width,height);this.overlayMaterial.setParameter("colorMap",this.storageTexture);this.overlayMaterial.update();}const cam=camera.camera;this.vpTemp.mul2(cam.projectionMatrix,cam.viewMatrix);this.invVP.copy(this.vpTemp).invert();if(collision.flipXY){const d=this.invVP.data;d[0]=-d[0];d[1]=-d[1];d[4]=-d[4];d[5]=-d[5];d[8]=-d[8];d[9]=-d[9];d[12]=-d[12];d[13]=-d[13];}compute.setParameter("invVP",this.invVP.data);compute.setParameter("screenWidth",width);compute.setParameter("screenHeight",height);compute.setParameter("gridMinX",collision.gridMinX);compute.setParameter("gridMinY",collision.gridMinY);compute.setParameter("gridMinZ",collision.gridMinZ);compute.setParameter("voxelRes",collision.voxelResolution);compute.setParameter("numVoxelsX",collision.numVoxelsX);compute.setParameter("numVoxelsY",collision.numVoxelsY);compute.setParameter("numVoxelsZ",collision.numVoxelsZ);compute.setParameter("leafSize",collision.leafSize);compute.setParameter("treeDepth",collision.treeDepth);compute.setParameter("projScaleY",cam.projectionMatrix.data[5]);compute.setParameter("displayMode",this.mode==="heatmap"?1:0);const camPos=camera.getPosition();let wx=camPos.x,wy=camPos.y;const wz=camPos.z;if(collision.flipXY){wx=-wx;wy=-wy;}const ix=Math.floor((wx-collision.gridMinX)/collision.voxelResolution);const iy=Math.floor((wy-collision.gridMinY)/collision.voxelResolution);const iz=Math.floor((wz-collision.gridMinZ)/collision.voxelResolution);compute.setParameter("inverted",collision.isVoxelSolid(ix,iy,iz)?1:0);compute.setParameter("nodes",this.nodesBuffer);compute.setParameter("leafData",this.leafDataBuffer);compute.setParameter("outputTexture",this.storageTexture);const workgroupsX=Math.ceil(width/8);const workgroupsY=Math.ceil(height/8);compute.setupDispatch(workgroupsX,workgroupsY,1);device.computeDispatch([compute],"VoxelDebugOverlay");app.drawTexture(0,0,2,2,null,this.overlayMaterial);}destroy(){this.nodesBuffer?.destroy();this.leafDataBuffer?.destroy();this.storageTexture?.destroy();}constructor(app,collision,camera){_define_property$o(this,"app",void 0);_define_property$o(this,"camera",void 0);_define_property$o(this,"compute",void 0);_define_property$o(this,"storageTexture",void 0);_define_property$o(this,"overlayMaterial",void 0);_define_property$o(this,"nodesBuffer",void 0);_define_property$o(this,"leafDataBuffer",void 0);_define_property$o(this,"collision",void 0);_define_property$o(this,"currentWidth",0);_define_property$o(this,"currentHeight",0);_define_property$o(this,"invVP",new Mat4);_define_property$o(this,"vpTemp",new Mat4);_define_property$o(this,"enabled",false);_define_property$o(this,"mode","overlay");this.app=app;this.camera=camera;this.collision=collision;const device=app.graphicsDevice;const nodesData=collision.nodes;const nodesByteSize=Math.max(nodesData.byteLength,4);this.nodesBuffer=new StorageBuffer(device,nodesByteSize,BUFFERUSAGE_COPY_DST);if(nodesData.byteLength>0){this.nodesBuffer.write(0,nodesData,0,nodesData.length);}const leafDataArr=collision.leafData;const leafByteSize=Math.max(leafDataArr.byteLength,4);this.leafDataBuffer=new StorageBuffer(device,leafByteSize,BUFFERUSAGE_COPY_DST);if(leafDataArr.byteLength>0){this.leafDataBuffer.write(0,leafDataArr,0,leafDataArr.length);}this.currentWidth=Math.max(device.width,1);this.currentHeight=Math.max(device.height,1);this.storageTexture=this.createStorageTexture(this.currentWidth,this.currentHeight);const shaderDefinition={name:"VoxelDebugOverlay",shaderLanguage:SHADERLANGUAGE_WGSL,cshader:voxelOverlayWGSL,computeUniformBufferFormats:{uniforms:new UniformBufferFormat(device,[new UniformFormat("invVP",UNIFORMTYPE_MAT4),new UniformFormat("screenWidth",UNIFORMTYPE_UINT),new UniformFormat("screenHeight",UNIFORMTYPE_UINT),new UniformFormat("gridMinX",UNIFORMTYPE_FLOAT),new UniformFormat("gridMinY",UNIFORMTYPE_FLOAT),new UniformFormat("gridMinZ",UNIFORMTYPE_FLOAT),new UniformFormat("voxelRes",UNIFORMTYPE_FLOAT),new UniformFormat("numVoxelsX",UNIFORMTYPE_UINT),new UniformFormat("numVoxelsY",UNIFORMTYPE_UINT),new UniformFormat("numVoxelsZ",UNIFORMTYPE_UINT),new UniformFormat("leafSize",UNIFORMTYPE_UINT),new UniformFormat("treeDepth",UNIFORMTYPE_UINT),new UniformFormat("projScaleY",UNIFORMTYPE_FLOAT),new UniformFormat("displayMode",UNIFORMTYPE_UINT),new UniformFormat("inverted",UNIFORMTYPE_UINT)])},computeBindGroupFormat:new BindGroupFormat(device,[new BindUniformBufferFormat("uniforms",SHADERSTAGE_COMPUTE),new BindStorageBufferFormat("nodes",SHADERSTAGE_COMPUTE,true),new BindStorageBufferFormat("leafData",SHADERSTAGE_COMPUTE,true),new BindStorageTextureFormat("outputTexture",PIXELFORMAT_RGBA8,TEXTUREDIMENSION_2D)])};const shader=new Shader(device,shaderDefinition);this.compute=new Compute(device,shader,"VoxelDebugOverlay");this.overlayMaterial=new ShaderMaterial;this.overlayMaterial.cull=CULLFACE_NONE;this.overlayMaterial.blendType=BLEND_PREMULTIPLIED;this.overlayMaterial.depthTest=false;this.overlayMaterial.depthWrite=false;this.overlayMaterial.setParameter("colorMap",this.storageTexture);this.overlayMaterial.shaderDesc={uniqueName:"VoxelOverlayComposite",vertexGLSL:`
                attribute vec2 vertex_position;
                uniform mat4 matrix_model;
                varying vec2 uv0;
                void main(void) {
                    gl_Position = matrix_model * vec4(vertex_position, 0, 1);
                    uv0 = vertex_position.xy + 0.5;
                }
            `,vertexWGSL:`
                attribute vertex_position: vec2f;
                uniform matrix_model: mat4x4f;
                varying uv0: vec2f;
                @vertex fn vertexMain(input: VertexInput) -> VertexOutput {
                    var output: VertexOutput;
                    output.position = uniform.matrix_model * vec4f(input.vertex_position, 0.0, 1.0);
                    output.uv0 = input.vertex_position.xy + vec2f(0.5);
                    return output;
                }
            `,fragmentGLSL:`
                varying vec2 uv0;
                uniform sampler2D colorMap;
                void main(void) {
                    gl_FragColor = texture2D(colorMap, uv0);
                }
            `,fragmentWGSL:`
                varying uv0: vec2f;
                var colorMap: texture_2d<f32>;
                var colorMapSampler: sampler;
                @fragment fn fragmentMain(input: FragmentInput) -> FragmentOutput {
                    var output: FragmentOutput;
                    output.color = textureSample(colorMap, colorMapSampler, input.uv0);
                    return output;
                }
            `,attributes:{vertex_position:SEMANTIC_POSITION}};this.overlayMaterial.update();}}

var voxelDebugOverlay = /*#__PURE__*/Object.freeze({
    __proto__: null,
    VoxelDebugOverlay: VoxelDebugOverlay
});

function _define_property$n(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const SURFACE_GRAY_X=.85;const SURFACE_GRAY_Y=.55;const SURFACE_GRAY_Z=.3;const SURFACE_ALPHA=.3;const encodeFlatColors=(tris,cameraFrameEnabled,out)=>{const encode=v=>Math.round((cameraFrameEnabled?v:Math.pow(v,2.2))*255);const grayX=encode(SURFACE_GRAY_X);const grayY=encode(SURFACE_GRAY_Y);const grayZ=encode(SURFACE_GRAY_Z);const alpha=Math.round(SURFACE_ALPHA*255);const numTris=tris.count;const colors=out??new Uint8Array(numTris*12);for(let i=0;i<numTris;i++){const ax=Math.abs(tris.nx[i]);const ay=Math.abs(tris.ny[i]);const az=Math.abs(tris.nz[i]);let gray;if(ax>ay&&ax>az){gray=grayX;}else if(ay>az){gray=grayY;}else {gray=grayZ;}const oc=i*12;for(let j=0;j<3;j++){const k=oc+j*4;colors[k]=gray;colors[k+1]=gray;colors[k+2]=gray;colors[k+3]=alpha;}}return colors};const buildFlatMesh=(tris,cameraFrameEnabled)=>{const numTris=tris.count;const flatPositions=new Float32Array(numTris*9);const flatColors=encodeFlatColors(tris,cameraFrameEnabled);const flatIndices=new Uint32Array(numTris*3);for(let i=0;i<numTris;i++){const op=i*9;flatPositions[op]=tris.v0x[i];flatPositions[op+1]=tris.v0y[i];flatPositions[op+2]=tris.v0z[i];flatPositions[op+3]=tris.v1x[i];flatPositions[op+4]=tris.v1y[i];flatPositions[op+5]=tris.v1z[i];flatPositions[op+6]=tris.v2x[i];flatPositions[op+7]=tris.v2y[i];flatPositions[op+8]=tris.v2z[i];const oi=i*3;flatIndices[oi]=oi;flatIndices[oi+1]=oi+1;flatIndices[oi+2]=oi+2;}return {flatPositions,flatColors,flatIndices}};const makeSurfaceMaterial=()=>{const m=new StandardMaterial;m.useLighting=false;m.useSkybox=false;m.useFog=false;m.useTonemap=false;m.ambient=new Color(0,0,0);m.diffuse=new Color(0,0,0);m.specular=new Color(0,0,0);m.emissive=new Color(1,1,1);m.emissiveVertexColor=true;m.emissiveVertexColorChannel="rgb";m.opacityVertexColor=true;m.opacityVertexColorChannel="a";m.opacity=1;return m};class MeshDebugOverlay{set enabled(value){this._enabled=value;this.entity.enabled=value;this.layer.enabled=value;}get enabled(){return this._enabled}setCameraFrameEnabled(cameraFrameEnabled){encodeFlatColors(this.triangles,cameraFrameEnabled,this.flatColors);this.mesh.setColors32(this.flatColors);this.mesh.update(PRIMITIVE_TRIANGLES);}destroy(){this.entity?.destroy();for(const m of this.materials)m.destroy();this.materials.length=0;this.app.scene.layers.remove(this.layer);this.camera.camera.layers=this.camera.camera.layers.filter(id=>id!==this.layer.id);}constructor(app,collision,camera,cameraFrameEnabled){_define_property$n(this,"app",void 0);_define_property$n(this,"camera",void 0);_define_property$n(this,"layer",void 0);_define_property$n(this,"entity",void 0);_define_property$n(this,"mesh",void 0);_define_property$n(this,"triangles",void 0);_define_property$n(this,"flatColors",void 0);_define_property$n(this,"materials",void 0);_define_property$n(this,"_enabled",false);this.app=app;this.camera=camera;this.triangles=collision.triangles;const device=app.graphicsDevice;const{flatPositions,flatColors,flatIndices}=buildFlatMesh(this.triangles,cameraFrameEnabled);this.flatColors=flatColors;const mesh=new Mesh(device);mesh.setPositions(flatPositions);mesh.setColors32(flatColors);mesh.setIndices(flatIndices);mesh.update(PRIMITIVE_TRIANGLES);mesh.generateWireframe();this.mesh=mesh;this.layer=new Layer({name:"CollisionOverlay",enabled:false,clearColorBuffer:false,clearDepthBuffer:true,opaqueSortMode:SORTMODE_MANUAL,transparentSortMode:SORTMODE_MANUAL});app.scene.layers.push(this.layer);camera.camera.layers=[...camera.camera.layers,this.layer.id];const depthMaterial=makeSurfaceMaterial();depthMaterial.cull=CULLFACE_BACK;depthMaterial.blendType=BLEND_NORMAL;depthMaterial.depthTest=true;depthMaterial.depthWrite=true;depthMaterial.depthBias=1;depthMaterial.slopeDepthBias=1;depthMaterial.redWrite=false;depthMaterial.greenWrite=false;depthMaterial.blueWrite=false;depthMaterial.alphaWrite=false;depthMaterial.update();const depthInstance=new MeshInstance(mesh,depthMaterial);depthInstance.drawOrder=0;const depthEntity=new Entity("CollisionDepthPrepass");depthEntity.addComponent("render",{meshInstances:[depthInstance],layers:[this.layer.id]});const surfaceMaterial=makeSurfaceMaterial();surfaceMaterial.cull=CULLFACE_BACK;surfaceMaterial.blendType=BLEND_NORMAL;surfaceMaterial.depthTest=true;surfaceMaterial.depthFunc=FUNC_EQUAL;surfaceMaterial.depthWrite=false;surfaceMaterial.depthBias=1;surfaceMaterial.slopeDepthBias=1;surfaceMaterial.update();const surfaceInstance=new MeshInstance(mesh,surfaceMaterial);surfaceInstance.drawOrder=1;const surfaceEntity=new Entity("CollisionSurface");surfaceEntity.addComponent("render",{meshInstances:[surfaceInstance],layers:[this.layer.id]});const wireframeMaterial=new StandardMaterial;wireframeMaterial.useLighting=false;wireframeMaterial.useSkybox=false;wireframeMaterial.useFog=false;wireframeMaterial.useTonemap=false;wireframeMaterial.ambient=new Color(0,0,0);wireframeMaterial.diffuse=new Color(0,0,0);wireframeMaterial.specular=new Color(0,0,0);wireframeMaterial.emissive=new Color(0,0,0);wireframeMaterial.opacity=1;wireframeMaterial.blendType=BLEND_NORMAL;wireframeMaterial.depthTest=true;wireframeMaterial.depthFunc=FUNC_LESSEQUAL;wireframeMaterial.depthWrite=false;wireframeMaterial.cull=CULLFACE_NONE;wireframeMaterial.update();const wireframeInstance=new MeshInstance(mesh,wireframeMaterial);wireframeInstance.drawOrder=2;const wireframeEntity=new Entity("CollisionWireframe");wireframeEntity.addComponent("render",{meshInstances:[wireframeInstance],layers:[this.layer.id]});wireframeEntity.render.renderStyle=RENDERSTYLE_WIREFRAME;this.materials=[depthMaterial,surfaceMaterial,wireframeMaterial];this.entity=new Entity("MeshCollisionDebug");this.entity.addChild(depthEntity);this.entity.addChild(surfaceEntity);this.entity.addChild(wireframeEntity);this.entity.enabled=false;app.root.addChild(this.entity);}}

var meshDebugOverlay = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MeshDebugOverlay: MeshDebugOverlay
});

function _define_property$m(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class InputFrame{accumulate(name,offsets){const value=this._values[name];for(let i=0;i<value.length;i++){value[i]+=offsets[i]||0;}}read(){const frame={};for(const name in this._values){const value=this._values[name];frame[name]=value.slice();value.fill(0);}return frame}constructor(data){_define_property$m(this,"_values",void 0);this._values={};for(const name in data){this._values[name]=data[name].slice();}}}

var inputFrame = /*#__PURE__*/Object.freeze({
    __proto__: null,
    InputFrame: InputFrame
});

function _define_property$l(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class DomEvent{on(handler){this._handlers.push(handler);}dispatch(event){const handlers=this._handlers;for(let i=0;i<handlers.length;i++){if(handlers[i](event)===true){break}}}constructor(){_define_property$l(this,"_handlers",[]);}}class DomEventSource{attach(canvas){this.canvas=canvas;this._bind(canvas,"wheel",this.wheel);this._bind(canvas,"pointerdown",this.pointerdown);this._bind(canvas,"pointermove",this.pointermove);this._bind(canvas,"pointerup",this.pointerup);this._bind(canvas,"pointercancel",this.pointercancel);this._bind(canvas,"pointerleave",this.pointerleave);this._bind(canvas,"lostpointercapture",this.lostpointercapture);this._bind(canvas,"contextmenu",this.contextmenu);this._bind(window,"keydown",this.keydown);this._bind(window,"keyup",this.keyup);this._bind(window,"blur",this.blur);}detach(){for(const{target,type,fn}of this._bound){target.removeEventListener(type,fn);}this._bound=[];this.canvas=null;}_bind(target,type,event){const fn=e=>event.dispatch(e);target.addEventListener(type,fn,type==="wheel"?{passive:false}:undefined);this._bound.push({target,type,fn});}constructor(){_define_property$l(this,"canvas",null);_define_property$l(this,"wheel",new DomEvent);_define_property$l(this,"pointerdown",new DomEvent);_define_property$l(this,"pointermove",new DomEvent);_define_property$l(this,"pointerup",new DomEvent);_define_property$l(this,"pointercancel",new DomEvent);_define_property$l(this,"pointerleave",new DomEvent);_define_property$l(this,"lostpointercapture",new DomEvent);_define_property$l(this,"contextmenu",new DomEvent);_define_property$l(this,"keydown",new DomEvent);_define_property$l(this,"keyup",new DomEvent);_define_property$l(this,"blur",new DomEvent);_define_property$l(this,"_bound",[]);}}

var domEventSource = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DomEvent: DomEvent,
    DomEventSource: DomEventSource
});

function _define_property$k(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const BUTTON_CODES={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,SELECT:8,START:9,LEFT_STICK:10,RIGHT_STICK:11};const BUTTON_COUNT=Object.keys(BUTTON_CODES).length;const buttonScratch=new Array(BUTTON_COUNT).fill(0);class GamepadDevice{_read(){const gamepads=navigator.getGamepads();for(let i=0;i<gamepads.length;i++){const gp=gamepads[i];if(!gp){continue}if(gp.mapping!=="standard"){continue}if(gp.axes.length<4){continue}if(gp.buttons.length<BUTTON_COUNT){continue}for(let j=0;j<this._buttonPrev.length;j++){const state=+gp.buttons[j].pressed;buttonScratch[j]=state-this._buttonPrev[j];this._buttonPrev[j]=state;}this._raw.accumulate("buttons",buttonScratch);this._raw.accumulate("leftStick",[gp.axes[0],gp.axes[1]]);this._raw.accumulate("rightStick",[gp.axes[2],gp.axes[3]]);}return this._raw.read()}update(){const{leftStick,rightStick}=this._read();this.leftStick[0]=leftStick[0];this.leftStick[1]=leftStick[1];this.rightStick[0]=rightStick[0];this.rightStick[1]=rightStick[1];}constructor(){_define_property$k(this,"leftStick",[0,0]);_define_property$k(this,"rightStick",[0,0]);_define_property$k(this,"_raw",new InputFrame({buttons:new Array(BUTTON_COUNT).fill(0),leftStick:[0,0],rightStick:[0,0]}));_define_property$k(this,"_buttonPrev",new Array(BUTTON_COUNT).fill(0));}}_define_property$k(GamepadDevice,"buttonCode",BUTTON_CODES);

var gamepad = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GamepadDevice: GamepadDevice
});

const movementState=()=>{const state=new Map;return {down:event=>{state.set(event.pointerId,[event.screenX,event.screenY]);},move:event=>{const prev=state.get(event.pointerId);if(!prev){return [0,0]}const mvX=event.screenX-prev[0];const mvY=event.screenY-prev[1];prev[0]=event.screenX;prev[1]=event.screenY;return [mvX,mvY]},up:event=>{state.delete(event.pointerId);}}};

var movementState$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    movementState: movementState
});

function _define_property$j(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const KEY_CODES={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,"0":26,"1":27,"2":28,"3":29,"4":30,"5":31,"6":32,"7":33,"8":34,"9":35,UP:36,DOWN:37,LEFT:38,RIGHT:39,SPACE:40,SHIFT:41,CTRL:42};const KEY_COUNT=Object.keys(KEY_CODES).length;const keyScratch=new Array(KEY_COUNT).fill(0);const tmpV1=new Vec3;class KeyboardMouseDevice{set pointerLock(value){this._pointerLock=value;}get pointerLock(){return this._pointerLock}_clearButtons(){for(let i=0;i<this._button.length;i++){this._button[i]=this._button[i]===1?-1:0;}}_setKey(code,value){const index=this._keyMap.get(code);if(index===undefined){return}this._keyNow[index]=value;}_read(){for(let i=0;i<KEY_COUNT;i++){keyScratch[i]=this._keyNow[i]-this._keyPrev[i];this._keyPrev[i]=this._keyNow[i];}this._raw.accumulate("key",keyScratch);return this._raw.read()}register(source){this._element=source.canvas;source.wheel.on(this.onWheel);source.pointerdown.on(this.onPointerDown);source.pointermove.on(this.onPointerMove);source.pointerup.on(this.onPointerUp);source.pointercancel.on(this.onPointerUp);source.pointerleave.on(this.onPointerUp);source.lostpointercapture.on(this.onPointerUp);source.contextmenu.on(this.onContextMenu);source.keydown.on(this.onKeyDown);source.keyup.on(this.onKeyUp);}update(){const{keyCode}=KeyboardMouseDevice;const{key,button,mouse,wheel}=this._read();this.axis.add(tmpV1.set(key[keyCode.D]-key[keyCode.A]+(key[keyCode.RIGHT]-key[keyCode.LEFT]),key[keyCode.E]-key[keyCode.Q],key[keyCode.W]-key[keyCode.S]+(key[keyCode.UP]-key[keyCode.DOWN])));this.jump+=key[keyCode.SPACE];this.shift+=key[keyCode.SHIFT];this.ctrl+=key[keyCode.CTRL];const n=Math.min(button.length,this.buttons.length);for(let i=0;i<n;i++){this.buttons[i]+=button[i];this.buttonEdge[i]=button[i];}this.mouse[0]=mouse[0];this.mouse[1]=mouse[1];this.wheel=wheel[0];}constructor(){_define_property$j(this,"axis",new Vec3);_define_property$j(this,"shift",0);_define_property$j(this,"ctrl",0);_define_property$j(this,"jump",0);_define_property$j(this,"buttons",[0,0,0]);_define_property$j(this,"buttonEdge",[0,0,0]);_define_property$j(this,"mouse",[0,0]);_define_property$j(this,"wheel",0);_define_property$j(this,"_raw",new InputFrame({key:new Array(KEY_COUNT).fill(0),button:[0,0,0],mouse:[0,0],wheel:[0]}));_define_property$j(this,"_element",null);_define_property$j(this,"_movement",movementState());_define_property$j(this,"_pointerId",-1);_define_property$j(this,"_pointerLock",false);_define_property$j(this,"_keyMap",new Map);_define_property$j(this,"_keyPrev",new Array(KEY_COUNT).fill(0));_define_property$j(this,"_keyNow",new Array(KEY_COUNT).fill(0));_define_property$j(this,"_button",[0,0,0]);_define_property$j(this,"onWheel",event=>{event.preventDefault();this._raw.accumulate("wheel",[event.deltaY]);});_define_property$j(this,"onPointerDown",event=>{this._movement.down(event);if(event.pointerType!=="mouse"){return}if(this._pointerLock){if(document.pointerLockElement!==this._element){this._element?.requestPointerLock();}}else {this._element?.setPointerCapture(event.pointerId);}this._clearButtons();this._button[event.button]=1;this._raw.accumulate("button",this._button);if(this._pointerId!==-1){return}this._pointerId=event.pointerId;});_define_property$j(this,"onPointerMove",event=>{const[movementX,movementY]=this._pointerLock&&document.pointerLockElement===this._element?[event.movementX,event.movementY]:this._movement.move(event);if(event.pointerType!=="mouse"){return}if(event.target!==this._element){return}if(this._pointerLock){if(document.pointerLockElement!==this._element){return}}else if(this._pointerId!==event.pointerId){return}this._raw.accumulate("mouse",[movementX,movementY]);});_define_property$j(this,"onPointerUp",event=>{this._movement.up(event);if(event.pointerType!=="mouse"){return}if(!this._pointerLock){this._element?.releasePointerCapture(event.pointerId);}this._clearButtons();this._raw.accumulate("button",this._button);if(this._pointerId!==event.pointerId){return}this._pointerId=-1;});_define_property$j(this,"onContextMenu",event=>{event.preventDefault();});_define_property$j(this,"onKeyDown",event=>{if(event.key==="Meta"){this._keyNow.fill(0);return}if(event.metaKey){return}if(this._pointerLock&&document.pointerLockElement!==this._element){return}event.stopPropagation();this._setKey(event.code,1);});_define_property$j(this,"onKeyUp",event=>{if(event.key==="Meta"){this._keyNow.fill(0);return}if(event.metaKey){return}event.stopPropagation();this._setKey(event.code,0);});const{keyCode}=KeyboardMouseDevice;for(let i=0;i<26;i++){this._keyMap.set(`Key${String.fromCharCode("A".charCodeAt(0)+i)}`,keyCode.A+i);}for(let i=0;i<10;i++){this._keyMap.set(`Digit${i}`,keyCode["0"]+i);}this._keyMap.set("ArrowUp",keyCode.UP);this._keyMap.set("ArrowDown",keyCode.DOWN);this._keyMap.set("ArrowLeft",keyCode.LEFT);this._keyMap.set("ArrowRight",keyCode.RIGHT);this._keyMap.set("Space",keyCode.SPACE);this._keyMap.set("ShiftLeft",keyCode.SHIFT);this._keyMap.set("ShiftRight",keyCode.SHIFT);this._keyMap.set("ControlLeft",keyCode.CTRL);this._keyMap.set("ControlRight",keyCode.CTRL);}}_define_property$j(KeyboardMouseDevice,"keyCode",KEY_CODES);

var keyboardMouse = /*#__PURE__*/Object.freeze({
    __proto__: null,
    KeyboardMouseDevice: KeyboardMouseDevice
});

const DISPLACEMENT_SCALE=1/60;const TAP_EPSILON=15;const tmpHalfSize=new Vec3;const screenToWorld=(camera,dx,dy,dz,out=new Vec3)=>{const{system,fov,aspectRatio,horizontalFov,projection,orthoHeight}=camera;const{width,height}=system.app.graphicsDevice.clientRect;out.set(-(dx/width)*2,dy/height*2,0);const halfSize=tmpHalfSize.set(0,0,0);if(projection===PROJECTION_PERSPECTIVE){const halfSlice=dz*Math.tan(.5*fov*math$1.DEG_TO_RAD);if(horizontalFov){halfSize.set(halfSlice,halfSlice/aspectRatio,0);}else {halfSize.set(halfSlice*aspectRatio,halfSlice,0);}}else {halfSize.set(orthoHeight*aspectRatio,orthoHeight,0);}out.mul(halfSize);return out};const flipZForOrbit=(mode,z)=>mode==="orbit"||mode==="churchOrbit"?-z:z;

var shared = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DISPLACEMENT_SCALE: DISPLACEMENT_SCALE,
    TAP_EPSILON: TAP_EPSILON,
    flipZForOrbit: flipZForOrbit,
    screenToWorld: screenToWorld
});

function _define_property$i(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class TouchDevice{get touchCount(){return this._touchCount}setJoystick(x,y){this.joystick[0]=x;this.joystick[1]=y;}_midPoint(){if(this._pointerEvents.size<2){return [0,0]}const[a,b]=this._pointerEvents.values();const dx=a.clientX-b.clientX;const dy=a.clientY-b.clientY;return [b.clientX+dx*.5,b.clientY+dy*.5]}_pinch(){if(this._pointerEvents.size<2){return 0}const[a,b]=this._pointerEvents.values();const dx=a.clientX-b.clientX;const dy=a.clientY-b.clientY;return Math.sqrt(dx*dx+dy*dy)}register(source){this._element=source.canvas;source.pointerdown.on(this.onPointerDown);source.pointermove.on(this.onPointerMove);source.pointerup.on(this.onPointerUp);source.pointercancel.on(this.onPointerUp);source.contextmenu.on(this.onContextMenu);}update(){const{touch,pinch,count}=this._raw.read();this._touchCount+=count[0];this.touch[0]=touch[0];this.touch[1]=touch[1];this.pinch=pinch[0];this.tapped=false;this.dragExceeded=false;const prevTaps=this._tapTouches;this._tapTouches=Math.max(0,this._tapTouches+count[0]);if(prevTaps===0&&this._tapTouches>0){this._tapDelta=0;}if(this._tapTouches>0){this._tapMaxTouches=Math.max(this._tapMaxTouches,this._tapTouches);}if(this._tapTouches>0){const prevDelta=this._tapDelta;this._tapDelta+=Math.abs(touch[0])+Math.abs(touch[1])+Math.abs(pinch[0]);if(prevDelta<TAP_EPSILON&&this._tapDelta>=TAP_EPSILON){this.dragExceeded=true;}}if(prevTaps>0&&this._tapTouches===0){if(this._tapDelta<TAP_EPSILON&&this._tapMaxTouches===1){this.tapped=true;}this._tapMaxTouches=0;}}constructor(){_define_property$i(this,"touch",[0,0]);_define_property$i(this,"pinch",0);_define_property$i(this,"joystick",[0,0]);_define_property$i(this,"tapped",false);_define_property$i(this,"dragExceeded",false);_define_property$i(this,"_raw",new InputFrame({touch:[0,0],count:[0],pinch:[0]}));_define_property$i(this,"_element",null);_define_property$i(this,"_movement",movementState());_define_property$i(this,"_pointerEvents",new Map);_define_property$i(this,"_posX",0);_define_property$i(this,"_posY",0);_define_property$i(this,"_pinchDist",-1);_define_property$i(this,"_touchCount",0);_define_property$i(this,"_tapTouches",0);_define_property$i(this,"_tapMaxTouches",0);_define_property$i(this,"_tapDelta",0);_define_property$i(this,"onPointerDown",event=>{this._movement.down(event);if(event.pointerType!=="touch"){return}this._element?.setPointerCapture(event.pointerId);this._pointerEvents.set(event.pointerId,event);this._raw.accumulate("count",[1]);if(this._pointerEvents.size>1){const[mx,my]=this._midPoint();this._posX=mx;this._posY=my;this._pinchDist=this._pinch();}});_define_property$i(this,"onPointerMove",event=>{const[movementX,movementY]=this._movement.move(event);if(event.pointerType!=="touch"){return}if(event.target!==this._element){return}if(this._pointerEvents.size===0){return}this._pointerEvents.set(event.pointerId,event);if(this._pointerEvents.size>1){const[mx,my]=this._midPoint();this._raw.accumulate("touch",[mx-this._posX,my-this._posY]);this._posX=mx;this._posY=my;const pinchDist=this._pinch();if(this._pinchDist>0){this._raw.accumulate("pinch",[this._pinchDist-pinchDist]);}this._pinchDist=pinchDist;}else {this._raw.accumulate("touch",[movementX,movementY]);}});_define_property$i(this,"onPointerUp",event=>{this._movement.up(event);if(event.pointerType!=="touch"){return}this._element?.releasePointerCapture(event.pointerId);this._pointerEvents.delete(event.pointerId);this._raw.accumulate("count",[-1]);if(this._pointerEvents.size<2){this._pinchDist=-1;}this._posX=0;this._posY=0;});_define_property$i(this,"onContextMenu",event=>{event.preventDefault();});}}

var touch = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TouchDevice: TouchDevice
});

function _define_property$h(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class TrackpadDevice{register(source){source.wheel.on(this.onWheel);source.keydown.on(this.onKeyDown);source.keyup.on(this.onKeyUp);source.blur.on(this.onBlur);}update(){this.orbit[0]=this._orbit[0];this.orbit[1]=this._orbit[1];this.pan[0]=this._pan[0];this.pan[1]=this._pan[1];this.zoom=this._zoom;this.claimed=this._claimed;this._orbit[0]=this._orbit[1]=0;this._pan[0]=this._pan[1]=0;this._zoom=0;this._claimed=false;}constructor(){_define_property$h(this,"orbit",[0,0]);_define_property$h(this,"pan",[0,0]);_define_property$h(this,"zoom",0);_define_property$h(this,"claimed",false);_define_property$h(this,"_orbit",[0,0]);_define_property$h(this,"_pan",[0,0]);_define_property$h(this,"_zoom",0);_define_property$h(this,"_claimed",false);_define_property$h(this,"_ctrlDown",false);_define_property$h(this,"onKeyDown",event=>{if(event.key==="Control"){this._ctrlDown=true;}});_define_property$h(this,"onKeyUp",event=>{if(event.key==="Control"){this._ctrlDown=false;}});_define_property$h(this,"onBlur",()=>{this._ctrlDown=false;});_define_property$h(this,"onWheel",event=>{const isPinch=event.ctrlKey&&!this._ctrlDown;const isCtrlRotate=event.ctrlKey&&this._ctrlDown;const isShiftPan=event.shiftKey;if(!isPinch&&!isCtrlRotate&&!isShiftPan){return}event.preventDefault();this._claimed=true;const{deltaX,deltaY}=event;if(isPinch){this._zoom+=deltaY;}else if(isCtrlRotate){this._orbit[0]+=deltaX;this._orbit[1]+=deltaY;}else {this._pan[0]+=deltaX;this._pan[1]+=deltaY;}return true});}}

var trackpad = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TrackpadDevice: TrackpadDevice
});

const panActive=(kb,touchCount)=>kb.buttons[2]||+(kb.buttonEdge[2]===-1)||+(touchCount>1);

var controlScheme = /*#__PURE__*/Object.freeze({
    __proto__: null,
    panActive: panActive
});

const TUNING={rotateSpeed:18,moveSpeed:4,wheelSpeed:.06,pinchSpeed:.4,mouseRotateSensitivity:.5,touchRotateSensitivity:1.5,gamepadRotateSensitivity:1,trackpadOrbitSensitivity:.75,trackpadPanSensitivity:1,trackpadZoomSensitivity:2,flyMoveAccelerationDamping:.992,flyMoveDecelerationDamping:.993};

var tuning = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TUNING: TUNING
});

function _define_property$g(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const v$2=new Vec3;const t$2=new Vec3;const flyKeyTarget=new Vec3;class FlyScheme{enter(){this._flyVelocity.set(0,0,0);}map(devices,ctx,frame){const{keyboardMouse:kb,touch,trackpad,gamepad}=devices;const{dt,distance,cameraComponent,mode,gamingControls,events}=ctx;const orbitFactor=cameraComponent.fov/120;const double=touch.touchCount>1?1:0;const pan=panActive(kb,ctx.touchCount);const directFirstPerson=gamingControls?0:1;const dragInvert=gamingControls?1:-1;if(kb.axis.x!==0||kb.axis.y!==0||kb.axis.z!==0||kb.wheel!==0||(gamingControls||pan)&&(kb.mouse[0]!==0||kb.mouse[1]!==0)||gamingControls&&(touch.joystick[0]!==0||touch.joystick[1]!==0)||touch.dragExceeded||gamepad.leftStick[0]!==0||gamepad.leftStick[1]!==0||gamepad.rightStick[0]!==0||gamepad.rightStick[1]!==0||trackpad.claimed){events.fire("navigateCancel");}if(touch.tapped&&!gamingControls){events.fire("mobileTap");}flyKeyTarget.copy(kb.axis);flyKeyTarget.normalize();flyKeyTarget.mulScalar(TUNING.moveSpeed*(kb.shift?4:kb.ctrl?.25:1));const damping=flyKeyTarget.lengthSq()>this._flyVelocity.lengthSq()?TUNING.flyMoveAccelerationDamping:TUNING.flyMoveDecelerationDamping;this._flyVelocity.lerp(this._flyVelocity,flyKeyTarget,damp(damping,dt));if(flyKeyTarget.lengthSq()===0&&this._flyVelocity.lengthSq()<1e-4){this._flyVelocity.set(0,0,0);}v$2.set(0,0,0);v$2.add(t$2.copy(this._flyVelocity).mulScalar(dt));screenToWorld(cameraComponent,kb.mouse[0],kb.mouse[1],distance,t$2);v$2.add(t$2.mulScalar(pan));v$2.z+=-kb.wheel*TUNING.wheelSpeed*DISPLACEMENT_SCALE;frame.accumulate("move",[v$2.x,v$2.y,flipZForOrbit(mode,v$2.z)]);t$2.set(kb.mouse[0],kb.mouse[1],0).mulScalar((1-pan)*TUNING.rotateSpeed*orbitFactor*TUNING.mouseRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$2.x,t$2.y,0]);v$2.set(0,0,0);screenToWorld(cameraComponent,touch.touch[0],touch.touch[1],distance,t$2);v$2.add(t$2.mulScalar(directFirstPerson*double));if(gamingControls){v$2.add(t$2.set(touch.joystick[0],0,-touch.joystick[1]).mulScalar(TUNING.moveSpeed*dt));}v$2.z+=-directFirstPerson*touch.pinch*double*TUNING.pinchSpeed*DISPLACEMENT_SCALE;frame.accumulate("move",[v$2.x,v$2.y,v$2.z]);t$2.set(touch.touch[0]*dragInvert,touch.touch[1]*dragInvert,0).mulScalar((1-double)*TUNING.rotateSpeed*orbitFactor*TUNING.touchRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$2.x,t$2.y,0]);t$2.set(trackpad.orbit[0],trackpad.orbit[1],0).mulScalar(TUNING.rotateSpeed*orbitFactor*TUNING.trackpadOrbitSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$2.x,t$2.y,0]);screenToWorld(cameraComponent,trackpad.pan[0],trackpad.pan[1],distance,t$2);t$2.mulScalar(TUNING.trackpadPanSensitivity);frame.accumulate("move",[t$2.x,t$2.y,0]);frame.accumulate("move",[0,0,-trackpad.zoom*TUNING.wheelSpeed*TUNING.trackpadZoomSensitivity*DISPLACEMENT_SCALE]);v$2.set(gamepad.leftStick[0],0,-gamepad.leftStick[1]).mulScalar(TUNING.moveSpeed*dt);frame.accumulate("move",[v$2.x,v$2.y,v$2.z]);t$2.set(gamepad.rightStick[0],gamepad.rightStick[1],0).mulScalar(TUNING.rotateSpeed*orbitFactor*TUNING.gamepadRotateSensitivity*dt);frame.accumulate("rotate",[t$2.x,t$2.y,t$2.z]);}constructor(){_define_property$g(this,"_flyVelocity",new Vec3);}}

var fly = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FlyScheme: FlyScheme
});

const v$1=new Vec3;const t$1=new Vec3;class OrbitScheme{map(devices,ctx,frame){const{keyboardMouse:kb,touch,trackpad,gamepad}=devices;const{dt,distance,cameraComponent,mode,events}=ctx;const orbitFactor=1;const double=touch.touchCount>1?1:0;const pan=panActive(kb,ctx.touchCount);if(touch.tapped){events.fire("mobileTap");}v$1.set(0,0,0);screenToWorld(cameraComponent,kb.mouse[0],kb.mouse[1],distance,t$1);v$1.add(t$1.mulScalar(pan));v$1.z+=-kb.wheel*TUNING.wheelSpeed*DISPLACEMENT_SCALE;frame.accumulate("move",[v$1.x,v$1.y,flipZForOrbit(mode,v$1.z)]);t$1.set(kb.mouse[0],kb.mouse[1],0).mulScalar((1-pan)*TUNING.rotateSpeed*orbitFactor*TUNING.mouseRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$1.x,t$1.y,0]);v$1.set(0,0,0);screenToWorld(cameraComponent,touch.touch[0],touch.touch[1],distance,t$1);v$1.add(t$1.mulScalar(double));v$1.z+=touch.pinch*double*TUNING.pinchSpeed*DISPLACEMENT_SCALE;frame.accumulate("move",[v$1.x,v$1.y,v$1.z]);t$1.set(touch.touch[0],touch.touch[1],0).mulScalar((1-double)*TUNING.rotateSpeed*TUNING.touchRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$1.x,t$1.y,0]);t$1.set(trackpad.orbit[0],trackpad.orbit[1],0).mulScalar(TUNING.rotateSpeed*TUNING.trackpadOrbitSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t$1.x,t$1.y,0]);screenToWorld(cameraComponent,trackpad.pan[0],trackpad.pan[1],distance,t$1);t$1.mulScalar(TUNING.trackpadPanSensitivity);frame.accumulate("move",[t$1.x,t$1.y,0]);frame.accumulate("move",[0,0,trackpad.zoom*TUNING.wheelSpeed*TUNING.trackpadZoomSensitivity*DISPLACEMENT_SCALE]);v$1.set(gamepad.leftStick[0],0,-gamepad.leftStick[1]).mulScalar(TUNING.moveSpeed*dt);frame.accumulate("move",[v$1.x,v$1.y,v$1.z]);t$1.set(gamepad.rightStick[0],gamepad.rightStick[1],0).mulScalar(TUNING.rotateSpeed*orbitFactor*TUNING.gamepadRotateSensitivity*dt);frame.accumulate("rotate",[t$1.x,t$1.y,t$1.z]);const rotateActive=kb.buttons[0]&&!pan||touch.touchCount===1||Math.abs(trackpad.orbit[0])+Math.abs(trackpad.orbit[1])>1e-6||Math.abs(gamepad.rightStick[0])+Math.abs(gamepad.rightStick[1])>.05;frame.accumulate("rotateActive",[+rotateActive]);}}

var orbit = /*#__PURE__*/Object.freeze({
    __proto__: null,
    OrbitScheme: OrbitScheme
});

const v=new Vec3;const t=new Vec3;const km=new Vec3;class WalkScheme{map(devices,ctx,frame){const{keyboardMouse:kb,touch,trackpad,gamepad}=devices;const{dt,distance,cameraComponent,mode,gamingControls,events}=ctx;const orbitFactor=cameraComponent.fov/120;const double=touch.touchCount>1?1:0;const pan=panActive(kb,ctx.touchCount);const directFirstPerson=gamingControls?0:1;const dragInvert=gamingControls?1:-1;if(kb.axis.x!==0||kb.axis.z!==0||!gamingControls&&touch.dragExceeded){events.fire("navigateCancel");}if(touch.tapped&&!gamingControls){events.fire("mobileTap");}v.set(0,0,0);km.copy(kb.axis);km.y=0;km.normalize();km.mulScalar(TUNING.moveSpeed*(kb.shift?2:kb.ctrl?.5:1));v.add(t.copy(km).mulScalar(dt));v.y=kb.jump>0?1:0;screenToWorld(cameraComponent,kb.mouse[0],kb.mouse[1],distance,t);v.add(t.mulScalar(pan));v.z+=-kb.wheel*TUNING.wheelSpeed*DISPLACEMENT_SCALE;frame.accumulate("move",[v.x,v.y,flipZForOrbit(mode,v.z)]);t.set(kb.mouse[0],kb.mouse[1],0).mulScalar((1-pan)*TUNING.rotateSpeed*orbitFactor*TUNING.mouseRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t.x,t.y,0]);v.set(0,0,0);screenToWorld(cameraComponent,touch.touch[0],touch.touch[1],distance,t);t.y=0;v.add(t.mulScalar(directFirstPerson*double));if(gamingControls){v.add(t.set(touch.joystick[0],0,-touch.joystick[1]).mulScalar(TUNING.moveSpeed*dt));}v.z+=-directFirstPerson*touch.pinch*double*TUNING.pinchSpeed*DISPLACEMENT_SCALE;if(touch.tapped&&gamingControls){v.y=1;}frame.accumulate("move",[v.x,v.y,v.z]);t.set(touch.touch[0]*dragInvert,touch.touch[1]*dragInvert,0).mulScalar((1-double)*TUNING.rotateSpeed*orbitFactor*TUNING.touchRotateSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t.x,t.y,0]);t.set(trackpad.orbit[0],trackpad.orbit[1],0).mulScalar(TUNING.rotateSpeed*orbitFactor*TUNING.trackpadOrbitSensitivity*DISPLACEMENT_SCALE);frame.accumulate("rotate",[t.x,t.y,0]);screenToWorld(cameraComponent,trackpad.pan[0],trackpad.pan[1],distance,t);t.mulScalar(TUNING.trackpadPanSensitivity);frame.accumulate("move",[t.x,t.y,0]);frame.accumulate("move",[0,0,-trackpad.zoom*TUNING.wheelSpeed*TUNING.trackpadZoomSensitivity*DISPLACEMENT_SCALE]);v.set(gamepad.leftStick[0],0,-gamepad.leftStick[1]).mulScalar(TUNING.moveSpeed*dt);frame.accumulate("move",[v.x,v.y,v.z]);t.set(gamepad.rightStick[0],gamepad.rightStick[1],0).mulScalar(TUNING.rotateSpeed*orbitFactor*TUNING.gamepadRotateSensitivity*dt);frame.accumulate("rotate",[t.x,t.y,t.z]);}}

var walk = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WalkScheme: WalkScheme
});

function _define_property$f(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class InputController{get domSource(){return this._domSource}get keyboardMouse(){return this._keyboardMouse}get events(){return this._events}update(dt,distance){const cameraComponent=this._host.cameraComponent;this._touch.update();this._keyboardMouse.update();this._trackpad.update();this._gamepad.update();const preMode=this._host.cameraMode;if(preMode!=="fly"&&preMode!=="walk"&&this._keyboardMouse.axis.length()>0){this._events.fire("inputEvent","requestFirstPerson");}const mode=this._host.cameraMode;const isOrbit=mode==="orbit";const isFly=mode==="fly";const isWalk=mode==="walk";const isFirstPerson=isFly||isWalk;if(mode!==this._prevMode){this._schemes[mode]?.enter?.();this._prevMode=mode;}const ctx={dt,distance,cameraComponent,mode,isOrbit,isFly,isWalk,isFirstPerson,gamingControls:this._host.gamingControls,touchCount:this._touch.touchCount,events:this._events};this._schemes[mode]?.map(this._devices,ctx,this.frame);}constructor(host){_define_property$f(this,"frame",new InputFrame({move:[0,0,0],rotate:[0,0,0],rotateActive:[0]}));_define_property$f(this,"_host",void 0);_define_property$f(this,"_trackpad",new TrackpadDevice);_define_property$f(this,"_keyboardMouse",new KeyboardMouseDevice);_define_property$f(this,"_touch",new TouchDevice);_define_property$f(this,"_gamepad",new GamepadDevice);_define_property$f(this,"_domSource",new DomEventSource);_define_property$f(this,"_events",new EventHandler);_define_property$f(this,"_devices",void 0);_define_property$f(this,"_schemes",void 0);_define_property$f(this,"_prevMode",null);this._host=host;this._devices={keyboardMouse:this._keyboardMouse,touch:this._touch,gamepad:this._gamepad,trackpad:this._trackpad};this._schemes={annotationOrbit:new OrbitScheme,churchOrbit:new OrbitScheme,fly:new FlyScheme,walk:new WalkScheme};const canvas=host.canvas;const src=this._domSource;src.attach(canvas);const interrupt=event=>{this._events.fire("inputEvent","interrupt",event);};const interact=event=>{this._events.fire("inputEvent","interact",event);};src.wheel.on(interrupt);src.pointerdown.on(interrupt);src.contextmenu.on(interrupt);src.keydown.on(interrupt);src.pointermove.on(interact);this._trackpad.register(src);this._keyboardMouse.register(src);this._touch.register(src);this._events.on("joystickInput",value=>{this._touch.setJoystick(value.x,value.y);});}}

var inputController = /*#__PURE__*/Object.freeze({
    __proto__: null,
    InputController: InputController
});

var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DomEvent: DomEvent,
    DomEventSource: DomEventSource,
    InputController: InputController,
    InputFrame: InputFrame
});

function _define_property$e(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const SVGNS="http://www.w3.org/2000/svg";const NUM_SAMPLES=12;const BASE_OUTER_RADIUS=.2;const INNER_OUTER_RATIO=.17/.2;const BEZIER_K=1/6;const NORMAL_SMOOTH_FACTOR=.25;const NORMAL_SNAP_ANGLE=Math.PI/4;const NORMAL_EPSILON$1=1e-6;const createNormalSnapDirections=()=>{const result=[];for(let pitchStep=-2;pitchStep<=2;pitchStep++){const pitch=pitchStep*NORMAL_SNAP_ANGLE;const cp=Math.cos(pitch);const sy=Math.sin(pitch);if(Math.abs(cp)<=NORMAL_EPSILON$1){result.push(new Vec3(0,sy>0?1:-1,0));continue}for(let yawStep=0;yawStep<8;yawStep++){const yaw=yawStep*NORMAL_SNAP_ANGLE;result.push(new Vec3(Math.cos(yaw)*cp,sy,Math.sin(yaw)*cp));}}return result};const NORMAL_SNAP_DIRECTIONS=createNormalSnapDirections();const snapNormal=(nx,ny,nz,out)=>{const len=Math.sqrt(nx*nx+ny*ny+nz*nz);if(len<=NORMAL_EPSILON$1){return out.set(0,1,0)}const invLen=1/len;const x=nx*invLen;const y=ny*invLen;const z=nz*invLen;let best=NORMAL_SNAP_DIRECTIONS[0];let bestDot=-Infinity;for(let i=0;i<NORMAL_SNAP_DIRECTIONS.length;i++){const candidate=NORMAL_SNAP_DIRECTIONS[i];const dot=candidate.x*x+candidate.y*y+candidate.z*z;if(dot>bestDot){bestDot=dot;best=candidate;}}return out.copy(best)};const tmpV=new Vec3;const tmpScreen=new Vec3;const tangent=new Vec3;const bitangent=new Vec3;const worldPt=new Vec3;const up=new Vec3(0,1,0);const right=new Vec3(1,0,0);const worldRadiusForPixels=(camera,canvasHeight,pos,pixelDiameter)=>{const cam=camera.camera;if(cam.projection===PROJECTION_ORTHOGRAPHIC){return pixelDiameter*cam.orthoHeight/canvasHeight}const camPos=camera.getPosition();const dx=pos.x-camPos.x;const dy=pos.y-camPos.y;const dz=pos.z-camPos.z;const distance=Math.sqrt(dx*dx+dy*dy+dz*dz);const halfFovTan=Math.tan(cam.fov*Math.PI/360);return pixelDiameter*distance*halfFovTan/canvasHeight};const buildBezierRing=(sx,sy)=>{const n=sx.length;let p=`M${sx[0].toFixed(1)},${sy[0].toFixed(1)}`;for(let i=0;i<n;i++){const i0=(i-1+n)%n;const i1=i;const i2=(i+1)%n;const i3=(i+2)%n;const cp1x=sx[i1]+(sx[i2]-sx[i0])*BEZIER_K;const cp1y=sy[i1]+(sy[i2]-sy[i0])*BEZIER_K;const cp2x=sx[i2]-(sx[i3]-sx[i1])*BEZIER_K;const cp2y=sy[i2]-(sy[i3]-sy[i1])*BEZIER_K;p+=` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${sx[i2].toFixed(1)},${sy[i2].toFixed(1)}`;}return `${p} Z`};class CursorRing{projectCircle(px,py,pz,nx,ny,nz,radius,outX,outY){const normal=tmpV.set(nx,ny,nz);if(Math.abs(normal.y)<.99){tangent.cross(normal,up).normalize();}else {tangent.cross(normal,right).normalize();}bitangent.cross(normal,tangent);const cam=this.camera.camera;const angleStep=2*Math.PI/NUM_SAMPLES;for(let i=0;i<NUM_SAMPLES;i++){const theta=i*angleStep;const ct=Math.cos(theta);const st=Math.sin(theta);const tx=ct*tangent.x+st*bitangent.x;const ty=ct*tangent.y+st*bitangent.y;const tz=ct*tangent.z+st*bitangent.z;worldPt.set(px+tx*radius,py+ty*radius,pz+tz*radius);cam.worldToScreen(worldPt,tmpScreen);outX[i]=tmpScreen.x;outY[i]=tmpScreen.y;}}render(pos,normal,screenPixels){snapNormal(normal.x,normal.y,normal.z,tmpV);let nx=tmpV.x;let ny=tmpV.y;let nz=tmpV.z;if(this.smoothing){if(this.hasSmoothedNormal){const t=NORMAL_SMOOTH_FACTOR;nx=this.smoothNx+(nx-this.smoothNx)*t;ny=this.smoothNy+(ny-this.smoothNy)*t;nz=this.smoothNz+(nz-this.smoothNz)*t;const len=Math.sqrt(nx*nx+ny*ny+nz*nz);if(len>1e-6){const invLen=1/len;nx*=invLen;ny*=invLen;nz*=invLen;}}this.smoothNx=nx;this.smoothNy=ny;this.smoothNz=nz;this.hasSmoothedNormal=true;}const outerRadius=screenPixels!==null?worldRadiusForPixels(this.camera,this.canvas.clientHeight||1,pos,screenPixels):BASE_OUTER_RADIUS;const innerRadius=outerRadius*INNER_OUTER_RATIO;this.projectCircle(pos.x,pos.y,pos.z,nx,ny,nz,outerRadius,this.outerX,this.outerY);this.projectCircle(pos.x,pos.y,pos.z,nx,ny,nz,innerRadius,this.innerX,this.innerY);this.path.setAttribute("d",`${buildBezierRing(this.outerX,this.outerY)} ${buildBezierRing(this.innerX,this.innerY)}`);this.path.style.display="";this.svg.style.display="";}hide(){this.path.style.display="none";this.hasSmoothedNormal=false;}constructor(svg,canvas,camera,smoothing){_define_property$e(this,"path",void 0);_define_property$e(this,"svg",void 0);_define_property$e(this,"canvas",void 0);_define_property$e(this,"camera",void 0);_define_property$e(this,"smoothing",void 0);_define_property$e(this,"smoothNx",0);_define_property$e(this,"smoothNy",1);_define_property$e(this,"smoothNz",0);_define_property$e(this,"hasSmoothedNormal",false);_define_property$e(this,"outerX",new Float64Array(NUM_SAMPLES));_define_property$e(this,"outerY",new Float64Array(NUM_SAMPLES));_define_property$e(this,"innerX",new Float64Array(NUM_SAMPLES));_define_property$e(this,"innerY",new Float64Array(NUM_SAMPLES));this.svg=svg;this.canvas=canvas;this.camera=camera;this.smoothing=smoothing;this.path=document.createElementNS(SVGNS,"path");this.path.setAttribute("fill","white");this.path.setAttribute("fill-opacity","0.6");this.path.setAttribute("fill-rule","evenodd");this.path.setAttribute("stroke","none");this.path.style.display="none";svg.appendChild(this.path);}}

var cursorRing = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CursorRing: CursorRing,
    SVGNS: SVGNS
});

const tmpDir=new Vec3;const scratch={position:new Vec3,normal:new Vec3};const probeCollision=(camera,collision,offsetX,offsetY,out)=>{const cameraPos=camera.getPosition();camera.camera.screenToWorld(offsetX,offsetY,1,tmpDir);tmpDir.sub(cameraPos).normalize();const hit=collision.queryRay(cameraPos.x,cameraPos.y,cameraPos.z,tmpDir.x,tmpDir.y,tmpDir.z,camera.camera.farClip);if(!hit){return false}const sn=collision.querySurfaceNormal(hit.x,hit.y,hit.z,tmpDir.x,tmpDir.y,tmpDir.z);out.position.set(hit.x,hit.y,hit.z);out.normal.set(sn.nx,sn.ny,sn.nz);return true};const probeSurface=(camera,collision,picker,canvas,offsetX,offsetY)=>{if(collision&&probeCollision(camera,collision,offsetX,offsetY,scratch)){return Promise.resolve({position:scratch.position.clone(),normal:scratch.normal.clone()})}return picker.pickSurface(offsetX/canvas.clientWidth,offsetY/canvas.clientHeight)};

var sceneProbe = /*#__PURE__*/Object.freeze({
    __proto__: null,
    probeCollision: probeCollision,
    probeSurface: probeSurface
});

function _define_property$d(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const SCREEN_OUTER_PIXELS=48;class NavCursor{screenPixelsForRing(){return this.host.walkAllowed?null:SCREEN_OUTER_PIXELS}setTarget(pos,normal,mode){this.targetPos=pos.clone();this.targetNormal=normal.clone();this.targetMode=mode;this.hoverRing.hide();this.targetRing.hide();}clearTarget(){this.targetPos=null;this.targetNormal=null;this.targetMode=null;this.targetRing.hide();}updateCursor(offsetX,offsetY){if(!this.hoverActive||this.navigating){this.hoverRing.hide();return}if(!this.collision||!probeCollision(this.camera,this.collision,offsetX,offsetY,this.collisionTarget)){this.hoverRing.hide();return}this.hoverRing.render(this.collisionTarget.position,this.collisionTarget.normal,this.screenPixelsForRing());}updateTarget(){if(!this.targetPos||!this.targetNormal||!this.targetMode){return}const camPos=this.camera.getPosition();const dist=camPos.distance(this.targetPos);if(this.targetMode!=="orbit"&&dist<2){this.targetRing.hide();return}this.targetRing.render(this.targetPos,this.targetNormal,this.screenPixelsForRing());}destroy(){this.app.off("prerender",this.onPrerender);this.svg.remove();}constructor(app,host,collision,events,source){_define_property$d(this,"svg",void 0);_define_property$d(this,"hoverRing",void 0);_define_property$d(this,"targetRing",void 0);_define_property$d(this,"camera",void 0);_define_property$d(this,"collision",void 0);_define_property$d(this,"canvas",void 0);_define_property$d(this,"host",void 0);_define_property$d(this,"app",void 0);_define_property$d(this,"onPrerender",void 0);_define_property$d(this,"hoverActive",false);_define_property$d(this,"navigating",false);_define_property$d(this,"targetPos",null);_define_property$d(this,"targetNormal",null);_define_property$d(this,"targetMode",null);_define_property$d(this,"onPointerMove",void 0);_define_property$d(this,"onPointerLeave",void 0);_define_property$d(this,"collisionTarget",{position:new Vec3,normal:new Vec3});this.camera=host.camera;this.collision=collision;this.canvas=app.graphicsDevice.canvas;this.host=host;this.app=app;this.svg=document.createElementNS(SVGNS,"svg");this.svg.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:1";this.canvas.parentElement.appendChild(this.svg);this.hoverRing=new CursorRing(this.svg,this.canvas,this.camera,true);this.targetRing=new CursorRing(this.svg,this.canvas,this.camera,false);this.svg.style.display="none";this.onPointerMove=e=>{if(e.pointerType==="touch"||e.buttons){this.hoverRing.hide();return}this.updateCursor(e.offsetX,e.offsetY);};this.onPointerLeave=()=>{this.hoverRing.hide();};source.pointermove.on(this.onPointerMove);source.pointerleave.on(this.onPointerLeave);const updateActive=()=>{this.hoverActive=host.cameraMode==="walk"&&!host.gamingControls;this.hoverRing.hide();if(this.targetMode&&this.targetMode!==host.cameraMode){this.navigating=false;this.clearTarget();}};events.on("cameraMode:changed",updateActive);events.on("inputMode:changed",updateActive);events.on("gamingControls:changed",updateActive);events.on("navigateTo",()=>{this.navigating=true;this.hoverRing.hide();});events.on("navigateCancel",()=>{this.navigating=false;this.clearTarget();});events.on("navigateComplete",()=>{this.navigating=false;this.clearTarget();});events.on("navTarget:set",(pos,normal)=>{const mode=host.cameraMode==="walk"||host.cameraMode==="fly"?host.cameraMode:"walk";this.setTarget(pos,normal,mode);});events.on("navTarget:clear",()=>{this.clearTarget();});events.on("orbitTarget:set",(pos,normal)=>{this.navigating=false;this.setTarget(pos,normal,"orbit");});events.on("orbitTarget:clear",()=>{if(this.targetMode==="orbit"){this.clearTarget();}});this.onPrerender=()=>{this.updateTarget();};app.on("prerender",this.onPrerender);updateActive();}}

var navCursor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NavCursor: NavCursor
});

function _define_property$c(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const canTargetFly=host=>host.cameraMode==="fly"&&!(host.inputMode==="desktop"&&host.gamingControls);const computeClickSpeedMul=(event,mode)=>{if(!event)return 1;if(mode==="walk"){if(event.shiftKey)return 2;if(event.ctrlKey)return .5}else if(mode==="fly"){if(event.shiftKey)return 4;if(event.ctrlKey)return .25}return 1};class NavInteraction{async _flyToPickedPosition(offsetX,offsetY,event){const host=this._host;const events=this._events;if(!host||!events||!canTargetFly(host))return;const request=++this._targetPickRequest;const target=await probeSurface(host.camera,this.collision,this._picker,host.canvas,offsetX,offsetY);if(target&&request===this._targetPickRequest&&this._host&&canTargetFly(this._host)){const speedMul=computeClickSpeedMul(event,this._host.cameraMode);events.fire("navigateTo",target.position,target.normal,speedMul);}}async _focusPickedPosition(offsetX,offsetY){const host=this._host;const events=this._events;if(!host||!events||host.cameraMode!=="orbit")return;const request=++this._targetPickRequest;const target=await probeSurface(host.camera,this.collision,this._picker,host.canvas,offsetX,offsetY);if(target&&request===this._targetPickRequest&&this._host?.cameraMode==="orbit"){events.fire("orbitTarget:set",target.position,target.normal);events.fire("pick",target.position);}}attach(host,events,source){this._host=host;this._events=events;source.pointerdown.on(this._onPointerDown);source.pointermove.on(this._onPointerMove);source.pointerup.on(this._onPointerUp);events.on("inputEvent",this._onInputEvent);events.on("mobileTap",this._onMobileTap);events.on("cameraMode:changed",this._onCameraModeChanged);events.on("inputMode:changed",this._updateCursor);events.on("gamingControls:changed",this._updateCursor);}detach(){const events=this._events;if(events){events.off("inputEvent",this._onInputEvent);events.off("mobileTap",this._onMobileTap);events.off("cameraMode:changed",this._onCameraModeChanged);events.off("inputMode:changed",this._updateCursor);events.off("gamingControls:changed",this._updateCursor);}this._host=null;this._events=null;}constructor(picker){_define_property$c(this,"collision",null);_define_property$c(this,"_picker",void 0);_define_property$c(this,"_host",null);_define_property$c(this,"_events",null);_define_property$c(this,"_lastPointerOffsetX",0);_define_property$c(this,"_lastPointerOffsetY",0);_define_property$c(this,"_mouseClickTracking",false);_define_property$c(this,"_mouseClickDelta",0);_define_property$c(this,"_suppressClick",false);_define_property$c(this,"_targetPickRequest",0);_define_property$c(this,"_lastTap",{time:0,x:0,y:0});_define_property$c(this,"_updateCursor",()=>{const host=this._host;if(!host)return;const{canvas}=host;const canClickTarget=host.inputMode==="desktop"&&(host.cameraMode==="walk"&&!host.gamingControls||canTargetFly(host)||host.cameraMode==="orbit");if(canClickTarget){canvas.style.cursor=this._mouseClickTracking?"default":"pointer";}else {canvas.style.cursor="";}});_define_property$c(this,"_onCameraModeChanged",()=>{this._targetPickRequest++;this._updateCursor();});_define_property$c(this,"_onPointerDown",event=>{const host=this._host;const events=this._events;if(!host||!events)return;this._lastPointerOffsetX=event.offsetX;this._lastPointerOffsetY=event.offsetY;if(event.pointerType!=="touch"&&event.button===0){this._mouseClickTracking=true;this._mouseClickDelta=0;this._updateCursor();}const now=Date.now();const delay=Math.max(0,now-this._lastTap.time);if(delay<300&&Math.abs(event.clientX-this._lastTap.x)<8&&Math.abs(event.clientY-this._lastTap.y)<8){this._suppressClick=true;events.fire("inputEvent","dblclick",event);this._lastTap.time=0;}else {this._lastTap.time=now;this._lastTap.x=event.clientX;this._lastTap.y=event.clientY;}});_define_property$c(this,"_onPointerMove",event=>{const host=this._host;const events=this._events;if(!host||!events)return;if(this._mouseClickTracking&&event.pointerType!=="touch"){const prev=this._mouseClickDelta;this._mouseClickDelta+=Math.abs(event.movementX)+Math.abs(event.movementY);if(prev<TAP_EPSILON&&this._mouseClickDelta>=TAP_EPSILON){if(host.cameraMode==="walk"&&!host.gamingControls||canTargetFly(host)){events.fire("navigateCancel");}}}});_define_property$c(this,"_onPointerUp",event=>{const host=this._host;const events=this._events;if(!host||!events)return;if(this._mouseClickTracking&&event.pointerType!=="touch"&&event.button===0){this._mouseClickTracking=false;this._updateCursor();if(this._suppressClick){this._suppressClick=false;return}if(this._mouseClickDelta<TAP_EPSILON){if(host.cameraMode==="walk"&&!host.gamingControls){const target={position:new Vec3,normal:new Vec3};if(this.collision&&probeCollision(host.camera,this.collision,this._lastPointerOffsetX,this._lastPointerOffsetY,target)){const speedMul=computeClickSpeedMul(event,host.cameraMode);events.fire("navigateTo",target.position,target.normal,speedMul);}}else if(host.cameraMode==="fly"){this._flyToPickedPosition(this._lastPointerOffsetX,this._lastPointerOffsetY,event);}else if(host.cameraMode==="orbit"){this._focusPickedPosition(this._lastPointerOffsetX,this._lastPointerOffsetY);}}}});_define_property$c(this,"_onInputEvent",async(eventName,event)=>{const host=this._host;const events=this._events;if(!host||!events)return;if(eventName!=="dblclick")return;if(!(event instanceof MouseEvent))return;const request=++this._targetPickRequest;const target=await probeSurface(host.camera,this.collision,this._picker,host.canvas,event.offsetX,event.offsetY);if(!target||request!==this._targetPickRequest)return;const currentMode=this._host?.cameraMode;if(currentMode==="fly"){events.fire("pick",target.position);events.fire("orbitTarget:set",target.position,target.normal);}else if(currentMode==="orbit"||currentMode==="walk"){events.fire("inputEvent","requestFirstPerson");const speedMul=computeClickSpeedMul(event,"fly");events.fire("navigateTo",target.position,target.normal,speedMul);}});_define_property$c(this,"_onMobileTap",()=>{const host=this._host;const events=this._events;if(!host||!events)return;if(this._suppressClick){this._suppressClick=false;return}if(host.cameraMode==="walk"&&!host.gamingControls){const target={position:new Vec3,normal:new Vec3};if(this.collision&&probeCollision(host.camera,this.collision,this._lastPointerOffsetX,this._lastPointerOffsetY,target)){events.fire("navigateTo",target.position,target.normal);}}else if(host.cameraMode==="fly"){this._flyToPickedPosition(this._lastPointerOffsetX,this._lastPointerOffsetY);}else if(host.cameraMode==="orbit"){this._focusPickedPosition(this._lastPointerOffsetX,this._lastPointerOffsetY);}});this._picker=picker;}}

var navInteraction = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NavInteraction: NavInteraction
});

function _define_property$b(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const pickDepthGlsl=`
vec4 encodePickOutput(uint id) {
    const vec4 inv = vec4(1.0 / 255.0);
    const uvec4 shifts = uvec4(16, 8, 0, 24);
    uvec4 col = (uvec4(id) >> shifts) & uvec4(0xff);
    return vec4(col) * inv;
}

#ifdef GSPLAT_PICK_DEPTH
    #ifndef CAMERAPLANES
        #define CAMERAPLANES
        uniform vec4 camera_params; // x: 1/far, y: far, z: near, w: isOrtho
    #endif

    vec4 getPickOutput() {
        float normalizedDepth;
        if (camera_params.w > 0.5) {
            normalizedDepth = gl_FragCoord.z;
        } else {
            float linearDepth = 1.0 / gl_FragCoord.w;
            normalizedDepth = (linearDepth - camera_params.z) / (camera_params.y - camera_params.z);
        }

        return vec4(gaussianColor.a * normalizedDepth, 0.0, 0.0, gaussianColor.a);
    }
#else
    #ifndef PICK_CUSTOM_ID
        uniform uint meshInstanceId;

        vec4 getPickOutput() {
            return encodePickOutput(meshInstanceId);
        }
    #endif
#endif

#ifdef DEPTH_PICK_PASS
    #include "floatAsUintPS"
    #ifndef CAMERAPLANES
        #define CAMERAPLANES
        uniform vec4 camera_params; // x: 1/far, y: far, z: near, w: isOrtho
    #endif

    vec4 getPickDepth() {
        float linearDepth;
        if (camera_params.w > 0.5) {
            linearDepth = gl_FragCoord.z;
        } else {
            float viewDist = 1.0 / gl_FragCoord.w;
            linearDepth = (viewDist - camera_params.z) / (camera_params.y - camera_params.z);
        }
        return float2uint(linearDepth);
    }
#endif
`;const pickDepthWgsl=`
fn encodePickOutput(id: u32) -> vec4f {
    let inv: vec4f = vec4f(1.0 / 255.0);
    let shifts: vec4u = vec4u(16u, 8u, 0u, 24u);
    let col: vec4u = (vec4u(id) >> shifts) & vec4u(0xffu);
    return vec4f(col) * inv;
}

#ifdef GSPLAT_PICK_DEPTH
    #ifndef CAMERAPLANES
        #define CAMERAPLANES
        uniform camera_params: vec4f; // x: 1/far, y: far, z: near, w: isOrtho
    #endif

    fn getPickOutput() -> vec4f {
        var normalizedDepth: f32;
        if (uniform.camera_params.w > 0.5) {
            normalizedDepth = pcPosition.z;
        } else {
            let linearDepth = 1.0 / pcPosition.w;
            normalizedDepth = (linearDepth - uniform.camera_params.z) / (uniform.camera_params.y - uniform.camera_params.z);
        }

        let a = f32(gaussianColor.a);
        return vec4f(a * normalizedDepth, 0.0, 0.0, a);
    }
#else
    #ifndef PICK_CUSTOM_ID
        uniform meshInstanceId: u32;

        fn getPickOutput() -> vec4f {
            return encodePickOutput(uniform.meshInstanceId);
        }
    #endif
#endif

#ifdef DEPTH_PICK_PASS
    #include "floatAsUintPS"
    #ifndef CAMERAPLANES
        #define CAMERAPLANES
        uniform camera_params: vec4f; // x: 1/far, y: far, z: near, w: isOrtho
    #endif

    fn getPickDepth() -> vec4f {
        var linearDepth: f32;
        if (uniform.camera_params.w > 0.5) {
            linearDepth = pcPosition.z;
        } else {
            let viewDist = 1.0 / pcPosition.w;
            linearDepth = (viewDist - uniform.camera_params.z) / (uniform.camera_params.y - uniform.camera_params.z);
        }
        return float2uint(linearDepth);
    }
#endif
`;const pickPassChunkInjected=["#ifdef PICK_PASS","    #define GSPLAT_PICK_DEPTH",'    #include "pickPS"',"#endif"].join("\n");const safeChunkReplace=(s,find,repl)=>{const out=s.replace(find,repl);if(out===s){throw new Error("picker: engine gsplat/pick chunk patch failed (engine version mismatch?)")}return out};const patchGsplatPickGlsl=chunk=>{return safeChunkReplace(safeChunkReplace(chunk,/#ifdef PICK_PASS\s*#include "pickPS"\s*#endif/,pickPassChunkInjected),"pcFragColor0 = encodePickOutput(vPickId);","pcFragColor0 = getPickOutput();")};const patchGsplatPickWgsl=chunk=>{return safeChunkReplace(safeChunkReplace(chunk,/#ifdef PICK_PASS\s*#include "pickPS"\s*#endif/,pickPassChunkInjected),"output.color = encodePickOutput(vPickId);","output.color = getPickOutput();")};const pickerShaderPatchState=new WeakMap;const vec4=new Vec4;const viewProjMat=new Mat4;const clearColor=new Color(0,0,0,1);const NORMAL_EPSILON=1e-12;const NORMAL_DEGENERATE_EPSILON=1e-20;const NORMAL_SAMPLE_WORLD_RADIUS=.2;const NORMAL_SAMPLE_MIN_PX=6;const NORMAL_SAMPLE_MAX_PX=48;const NORMAL_RING_FRACTIONS=[.3,.55,.8,1];const NORMAL_OUTLIER_THRESHOLD=2.5;const NORMAL_SAMPLE_DIRECTIONS=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];const float32=new Float32Array(1);const uint32=new Uint32Array(float32.buffer);const half2Float=h=>{const sign=(h&32768)<<16;const exponent=(h&31744)>>10;const mantissa=h&1023;if(exponent===0){if(mantissa===0){uint32[0]=sign;}else {let e=-1;let m=mantissa;do{e++;m<<=1;}while((m&1024)===0)uint32[0]=sign|127-15-e<<23|(m&1023)<<13;}}else if(exponent===31){uint32[0]=sign|0x7f800000|mantissa<<13;}else {uint32[0]=sign|exponent+127-15<<23|mantissa<<13;}return float32[0]};const registerPickerShaderPatches=app=>{const device=app.graphicsDevice;const existing=pickerShaderPatchState.get(device);if(existing){existing.refCount++;return}const glslChunks=ShaderChunks.get(device,"glsl");const wgslChunks=ShaderChunks.get(device,"wgsl");const glslPickPS=glslChunks.get("pickPS");const glslGsplatPS=glslChunks.get("gsplatPS");const wgslPickPS=wgslChunks.get("pickPS");const wgslGsplatPS=wgslChunks.get("gsplatPS");const patchedGlslGsplatPS=patchGsplatPickGlsl(glslGsplatPS);const patchedWgslGsplatPS=patchGsplatPickWgsl(wgslGsplatPS);const state={glslPickPS,glslGsplatPS,wgslPickPS,wgslGsplatPS,refCount:1};pickerShaderPatchState.set(device,state);glslChunks.set("pickPS",pickDepthGlsl);wgslChunks.set("pickPS",pickDepthWgsl);glslChunks.set("gsplatPS",patchedGlslGsplatPS);wgslChunks.set("gsplatPS",patchedWgslGsplatPS);};const unregisterPickerShaderPatches=app=>{const device=app.graphicsDevice;const state=pickerShaderPatchState.get(device);if(!state){return}state.refCount--;if(state.refCount>0){return}const glslChunks=ShaderChunks.get(device,"glsl");const wgslChunks=ShaderChunks.get(device,"wgsl");glslChunks.set("pickPS",state.glslPickPS);glslChunks.set("gsplatPS",state.glslGsplatPS);wgslChunks.set("pickPS",state.wgslPickPS);wgslChunks.set("gsplatPS",state.wgslGsplatPS);pickerShaderPatchState.delete(device);};const createPickCameraSnapshot=()=>({position:new Vec3,viewMatrix:new Mat4,projectionMatrix:new Mat4,nearClip:0,farClip:0,projection:0});const captureCameraSnapshot=(camera,out)=>{const cam=camera.camera;out.position.copy(camera.getPosition());out.viewMatrix.copy(cam.viewMatrix);out.projectionMatrix.copy(cam.projectionMatrix);out.nearClip=cam.nearClip;out.farClip=cam.farClip;out.projection=cam.projection;};const getWorldPoint=(camera,x,y,width,height,normalizedDepth,out)=>{if(!Number.isFinite(normalizedDepth)||normalizedDepth<0||normalizedDepth>1){return null}const{farClip:far,nearClip:near}=camera;const ndcDepth=camera.projection===PROJECTION_ORTHOGRAPHIC?normalizedDepth:far*normalizedDepth/(normalizedDepth*(far-near)+near);viewProjMat.mul2(camera.projectionMatrix,camera.viewMatrix).invert();vec4.set(x/width*2-1,(1-y/height)*2-1,ndcDepth*2-1,1);viewProjMat.transformVec4(vec4,vec4);if(!Number.isFinite(vec4.w)||Math.abs(vec4.w)<1e-8){return null}vec4.mulScalar(1/vec4.w);if(!Number.isFinite(vec4.x)||!Number.isFinite(vec4.y)||!Number.isFinite(vec4.z)){return null}return (out??new Vec3).set(vec4.x,vec4.y,vec4.z)};const setCameraFacingNormal=(cameraPosition,position,normal)=>{normal.sub2(cameraPosition,position);const len=normal.length();if(len>1e-6){normal.mulScalar(1/len);}else {normal.set(0,1,0);}return normal};const worldRadiusToPixelRadius=(cam,pos,canvasHeight,worldRadius)=>{const projY=cam.projectionMatrix.data[5];if(cam.projection===PROJECTION_ORTHOGRAPHIC){return worldRadius*projY*canvasHeight/2}const dx=pos.x-cam.position.x;const dy=pos.y-cam.position.y;const dz=pos.z-cam.position.z;const distance=Math.sqrt(dx*dx+dy*dy+dz*dz);if(distance<1e-6)return Infinity;return worldRadius*projY*canvasHeight/(2*distance)};const fitPlaneOnce=points=>{const n=points.length;if(n<3)return null;let cx=0,cy=0,cz=0;for(let i=0;i<n;i++){cx+=points[i].x;cy+=points[i].y;cz+=points[i].z;}cx/=n;cy/=n;cz/=n;let cxx=0,cxy=0,cxz=0,cyy=0,cyz=0,czz=0;for(let i=0;i<n;i++){const dx=points[i].x-cx;const dy=points[i].y-cy;const dz=points[i].z-cz;cxx+=dx*dx;cxy+=dx*dy;cxz+=dx*dz;cyy+=dy*dy;cyz+=dy*dz;czz+=dz*dz;}const q=(cxx+cyy+czz)/3;const a=cxx-q,b=cyy-q,c=czz-q;const p2=a*a+b*b+c*c+2*(cxy*cxy+cxz*cxz+cyz*cyz);if(p2<NORMAL_DEGENERATE_EPSILON)return null;const p=Math.sqrt(p2/6);const inv=1/p;const Bxx=a*inv,Bxy=cxy*inv,Bxz=cxz*inv;const Byy=b*inv,Byz=cyz*inv,Bzz=c*inv;const detB=Bxx*(Byy*Bzz-Byz*Byz)-Bxy*(Bxy*Bzz-Byz*Bxz)+Bxz*(Bxy*Byz-Byy*Bxz);const r=Math.max(-1,Math.min(1,detB/2));const phi=Math.acos(r)/3;const lambdaMin=q+2*p*Math.cos(phi+2*Math.PI/3);const Mxx=cxx-lambdaMin,Myy=cyy-lambdaMin,Mzz=czz-lambdaMin;const v1x=cxy*cyz-cxz*Myy;const v1y=cxz*cxy-Mxx*cyz;const v1z=Mxx*Myy-cxy*cxy;const v2x=cxy*Mzz-cxz*cyz;const v2y=cxz*cxz-Mxx*Mzz;const v2z=Mxx*cyz-cxy*cxz;const v3x=Myy*Mzz-cyz*cyz;const v3y=cyz*cxz-cxy*Mzz;const v3z=cxy*cyz-Myy*cxz;const l1=v1x*v1x+v1y*v1y+v1z*v1z;const l2=v2x*v2x+v2y*v2y+v2z*v2z;const l3=v3x*v3x+v3y*v3y+v3z*v3z;let vx,vy,vz,lSq;if(l1>=l2&&l1>=l3){vx=v1x;vy=v1y;vz=v1z;lSq=l1;}else if(l2>=l3){vx=v2x;vy=v2y;vz=v2z;lSq=l2;}else {vx=v3x;vy=v3y;vz=v3z;lSq=l3;}if(lSq<NORMAL_EPSILON)return null;const invLen=1/Math.sqrt(lSq);return {cx,cy,cz,vx:vx*invLen,vy:vy*invLen,vz:vz*invLen}};const fitPlaneNormal=(points,toCamera,outNormal)=>{const first=fitPlaneOnce(points);if(!first)return false;let residualSum=0;for(let i=0;i<points.length;i++){const dx=points[i].x-first.cx;const dy=points[i].y-first.cy;const dz=points[i].z-first.cz;residualSum+=Math.abs(dx*first.vx+dy*first.vy+dz*first.vz);}const threshold=residualSum/points.length*NORMAL_OUTLIER_THRESHOLD;const inliers=[];for(let i=0;i<points.length;i++){const dx=points[i].x-first.cx;const dy=points[i].y-first.cy;const dz=points[i].z-first.cz;if(Math.abs(dx*first.vx+dy*first.vy+dz*first.vz)<=threshold){inliers.push(points[i]);}}let result=first;if(inliers.length>=3&&inliers.length<points.length){const refined=fitPlaneOnce(inliers);if(refined)result=refined;}let{vx,vy,vz}=result;if(vx*toCamera.x+vy*toCamera.y+vz*toCamera.z<0){vx=-vx;vy=-vy;vz=-vz;}outNormal.set(vx,vy,vz);return true};class Picker{constructor(app,camera){_define_property$b(this,"pick",void 0);_define_property$b(this,"pickSurface",void 0);_define_property$b(this,"release",void 0);const{graphicsDevice}=app;let accumBuffer;let accumTarget;let accumPass;let chunksPatched=false;let pickQueue=Promise.resolve();let cacheValid=false;let cacheWidth=0;let cacheHeight=0;const cacheCamera=createPickCameraSnapshot();const initRasterAccum=(width,height)=>{accumBuffer=new Texture(graphicsDevice,{format:PIXELFORMAT_RGBA16F,width,height,mipmaps:false,minFilter:FILTER_NEAREST,magFilter:FILTER_NEAREST,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE,name:"picker-accum"});accumTarget=new RenderTarget({colorBuffer:accumBuffer,depth:false});accumPass=new RenderPassPicker(graphicsDevice,app.renderer);accumPass.blendState=new BlendState(true,BLENDEQUATION_ADD,BLENDMODE_ONE,BLENDMODE_ONE_MINUS_SRC_ALPHA,BLENDEQUATION_ADD,BLENDMODE_ZERO,BLENDMODE_ONE_MINUS_SRC_ALPHA);};const readTexture=(texture,x,y,target)=>{const texY=graphicsDevice.isWebGL2?target.height-y-1:y;return texture.read(x,texY,1,1,{renderTarget:target,immediate:true})};const updateCache=(width,height)=>{captureCameraSnapshot(camera,cacheCamera);cacheWidth=width;cacheHeight=height;};const cameraMatches=(width,height)=>{const cam=camera.camera;return cacheValid&&cacheWidth===width&&cacheHeight===height&&cacheCamera.viewMatrix.equals(cam.viewMatrix)&&cacheCamera.projectionMatrix.equals(cam.projectionMatrix)&&cacheCamera.nearClip===cam.nearClip&&cacheCamera.farClip===cam.farClip&&cacheCamera.projection===cam.projection};const getCacheCameraSnapshot=()=>{const snapshot=createPickCameraSnapshot();snapshot.position.copy(cacheCamera.position);snapshot.viewMatrix.copy(cacheCamera.viewMatrix);snapshot.projectionMatrix.copy(cacheCamera.projectionMatrix);snapshot.nearClip=cacheCamera.nearClip;snapshot.farClip=cacheCamera.farClip;snapshot.projection=cacheCamera.projection;return snapshot};const readRasterBlock=async(blockX,blockY,blockWidth,blockHeight,viewportWidth,viewportHeight,pickCamera)=>{const texY=graphicsDevice.isWebGL2?accumTarget.height-blockY-blockHeight:blockY;const pixels=await accumBuffer.read(blockX,texY,blockWidth,blockHeight,{renderTarget:accumTarget,immediate:true});return (x,y)=>{const localX=x-blockX;const localY=y-blockY;if(localX<0||localX>=blockWidth||localY<0||localY>=blockHeight){return null}const row=graphicsDevice.isWebGL2?blockHeight-localY-1:localY;const index=(row*blockWidth+localX)*4;const r=half2Float(pixels[index]);const transmittance=half2Float(pixels[index+3]);const alpha=1-transmittance;if(!Number.isFinite(r)||!Number.isFinite(alpha)||alpha<1e-6){return null}const normalizedDepth=r/alpha;return getWorldPoint(pickCamera,x,y,viewportWidth,viewportHeight,normalizedDepth)}};const ensureRendered=(width,height,worldLayer)=>{if(cameraMatches(width,height)){return}const prevEnableIds=app.scene.gsplat.enableIds;app.scene.gsplat.enableIds=true;try{if(!chunksPatched){registerPickerShaderPatches(app);chunksPatched=true;}if(!accumPass){initRasterAccum(width,height);}else if(cacheWidth!==width||cacheHeight!==height){cacheValid=false;accumTarget.resize(width,height);}accumPass.init(accumTarget);accumPass.setClearColor(clearColor);accumPass.update(camera.camera,app.scene,[worldLayer],new Map,false);accumPass.render();updateCache(width,height);cacheValid=true;}finally{app.scene.gsplat.enableIds=prevEnableIds;}};const prepareSample=(x,y)=>{const width=Math.floor(graphicsDevice.width);const height=Math.floor(graphicsDevice.height);if(width<=0||height<=0){return null}const worldLayer=app.scene.layers.getLayerByName("World");if(!worldLayer){return null}const screenX=Math.min(width-1,Math.max(0,Math.floor(x*width)));const screenY=Math.min(height-1,Math.max(0,Math.floor(y*height)));ensureRendered(width,height,worldLayer);const pickCamera=getCacheCameraSnapshot();return {width,height,screenX,screenY,pickCamera}};const pickPosition=async(x,y)=>{const sample=prepareSample(x,y);if(!sample){return null}const{width,height,screenX,screenY,pickCamera}=sample;const pixels=await readTexture(accumBuffer,screenX,screenY,accumTarget);const r=half2Float(pixels[0]);const transmittance=half2Float(pixels[3]);const alpha=1-transmittance;if(!Number.isFinite(r)||!Number.isFinite(alpha)||alpha<1e-6){return null}const normalizedDepth=r/alpha;const position=getWorldPoint(pickCamera,screenX,screenY,width,height,normalizedDepth);return position?{position,camera:pickCamera,screenX,screenY,width,height}:null};const serializePick=operation=>{const result=pickQueue.then(operation,operation);pickQueue=result.then(()=>undefined,()=>undefined);return result};const pick=async(x,y)=>{const result=await pickPosition(x,y);return result?.position??null};const pickSurface=async(x,y)=>{const sample=prepareSample(x,y);if(!sample){return null}const{width,height,screenX,screenY,pickCamera}=sample;const blockX=Math.max(0,screenX-NORMAL_SAMPLE_MAX_PX);const blockY=Math.max(0,screenY-NORMAL_SAMPLE_MAX_PX);const blockWidth=Math.min(width-1,screenX+NORMAL_SAMPLE_MAX_PX)-blockX+1;const blockHeight=Math.min(height-1,screenY+NORMAL_SAMPLE_MAX_PX)-blockY+1;const rasterBlock=await readRasterBlock(blockX,blockY,blockWidth,blockHeight,width,height,pickCamera);const position=rasterBlock(screenX,screenY);if(!position){return null}const samplePixel=(px,py)=>{if(px<0||px>=width||py<0||py>=height){return null}return rasterBlock(px,py)};const pixelRadius=Math.max(NORMAL_SAMPLE_MIN_PX,Math.min(NORMAL_SAMPLE_MAX_PX,worldRadiusToPixelRadius(pickCamera,position,height,NORMAL_SAMPLE_WORLD_RADIUS)));const ringPixelRadii=NORMAL_RING_FRACTIONS.map(f=>Math.max(1,Math.round(f*pixelRadius)));const sampleRings=ringPixelRadii.map(radius=>{return NORMAL_SAMPLE_DIRECTIONS.map(([dx,dy])=>{return samplePixel(screenX+dx*radius,screenY+dy*radius)})});const toCamera=setCameraFacingNormal(pickCamera.position,position,new Vec3);const fitPoints=[position];for(let i=0;i<sampleRings.length;i++){const ring=sampleRings[i];for(let j=0;j<ring.length;j++){const pt=ring[j];if(pt)fitPoints.push(pt);}}const normal=new Vec3;if(!fitPlaneNormal(fitPoints,toCamera,normal)){normal.copy(toCamera);}return {position,normal}};this.pick=(x,y)=>serializePick(()=>pick(x,y));this.pickSurface=(x,y)=>serializePick(()=>pickSurface(x,y));this.release=()=>{if(chunksPatched){unregisterPickerShaderPatches(app);chunksPatched=false;}accumPass?.destroy();accumTarget?.destroy();accumBuffer?.destroy();cacheValid=false;};}}

var picker = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Picker: Picker,
    captureCameraSnapshot: captureCameraSnapshot,
    getWorldPoint: getWorldPoint
});

const fmt=v=>`(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;class WaypointGraph{setCollision(collision){this.collision=collision;}setClearance(fn,autoConnect=false){this.clearance=fn;if(fn&&autoConnect){const clear=[];const blocked=[];for(let a=0;a<this.nodes.length;a++){for(let b=a+1;b<this.nodes.length;b++){const pair=`${this.nodes[a].name}-${this.nodes[b].name}`;if(this._clear(this.nodes[a].pos,this.nodes[b].pos)){this._addEdge(a,b);clear.push(pair);}else {blocked.push(pair);}}}if(this.debug){console.log(`[WaypointGraph] nodes: ${this.nodes.map(n=>`${n.name}${fmt(n.pos)}`).join("  ")}`);console.log(`[WaypointGraph] auto-connect CLEAR: ${clear.join(", ")||"(none)"}`);console.log(`[WaypointGraph] auto-connect BLOCKED by obstacle: ${blocked.join(", ")||"(none)"}`);const adjacency=this.nodes.map(n=>`${n.name}: ${this.adj[n.i].map(e=>`${this.nodes[e.j].name}(${e.cost.toFixed(0)})`).join(" ")||"(isolated)"}`);console.log(`[WaypointGraph] final adjacency (cost):
  ${adjacency.join("\n  ")}`);}}}_canTest(){return !!this.clearance}_clear(p,q){if(this.clearance){return this.clearance(p,q)}return this._lineOfSight(p,q)}_addEdge(a,b){const cost=this.nodes[a].pos.distance(this.nodes[b].pos);if(!this.adj[a].some(e=>e.j===b)){this.adj[a].push({j:b,cost});}if(!this.adj[b].some(e=>e.j===a)){this.adj[b].push({j:a,cost});}}_lineOfSight(p,q){if(!this.collision){return true}const dx=q.x-p.x;const dy=q.y-p.y;const dz=q.z-p.z;const len=Math.sqrt(dx*dx+dy*dy+dz*dz);if(len<1e-4){return true}const inv=1/len;const maxDist=Math.max(0,len-this.losEpsilon);return !this.collision.queryRay(p.x,p.y,p.z,dx*inv,dy*inv,dz*inv,maxDist)}_nearest(p,requireClear){let best=-1;let bestD=Infinity;for(const n of this.nodes){const d=p.distance(n.pos);if(d>=bestD||d>this.maxConnectDist){continue}if(requireClear&&!this._clear(p,n.pos)){continue}bestD=d;best=n.i;}if(best===-1&&requireClear){return this._nearest(p,false)}return best}_shortestPath(s,t){const N=this.nodes.length;const dist=new Array(N).fill(Infinity);const prev=new Array(N).fill(-1);const seen=new Array(N).fill(false);dist[s]=0;for(let it=0;it<N;it++){let u=-1;let ud=Infinity;for(let k=0;k<N;k++){if(!seen[k]&&dist[k]<ud){ud=dist[k];u=k;}}if(u===-1||u===t){break}seen[u]=true;for(const{j,cost}of this.adj[u]){if(dist[u]+cost<dist[j]){dist[j]=dist[u]+cost;prev[j]=u;}}}if(dist[t]===Infinity){return null}const path=[];for(let v=t;v!==-1;v=prev[v]){path.push(v);}return path.reverse()}_routeMultiAttach(startPos,endPos){const N=this.nodes.length;const dist=new Array(N).fill(Infinity);const prev=new Array(N).fill(-1);const seen=new Array(N).fill(false);let any=false;for(const n of this.nodes){const d=startPos.distance(n.pos);if(d>this.maxConnectDist||!this._clear(startPos,n.pos)){continue}dist[n.i]=d;any=true;}if(this.debug){const rows=this.nodes.map(n=>`${n.name} ${startPos.distance(n.pos).toFixed(0)}${dist[n.i]===Infinity?"✗":""}`);console.log(`[WaypointGraph] start attach candidates (dist, ✗ = blocked/too far): ${rows.join("  ")}`);}if(!any){return null}for(let it=0;it<N;it++){let u=-1;let ud=Infinity;for(let k=0;k<N;k++){if(!seen[k]&&dist[k]<ud){ud=dist[k];u=k;}}if(u===-1){break}seen[u]=true;for(const{j,cost}of this.adj[u]){if(dist[u]+cost<dist[j]){dist[j]=dist[u]+cost;prev[j]=u;}}}let t=-1;let best=Infinity;for(const n of this.nodes){if(dist[n.i]===Infinity){continue}const d=endPos.distance(n.pos);if(d>this.maxConnectDist||!this._clear(endPos,n.pos)){continue}const total=dist[n.i]+d;if(total<best){best=total;t=n.i;}}if(this.debug){const rows=this.nodes.map(n=>{if(dist[n.i]===Infinity){return `${n.name} unreachable`}const d=endPos.distance(n.pos);const ok=d<=this.maxConnectDist&&this._clear(endPos,n.pos);return `${n.name} ${dist[n.i].toFixed(0)}+${d.toFixed(0)}${ok?`=${(dist[n.i]+d).toFixed(0)}`:"✗"}`});console.log(`[WaypointGraph] exit candidates (graph+attach=total, ✗ = attach blocked/too far): ${rows.join("  ")}`);}if(t===-1){return null}const idxPath=[];for(let v=t;v!==-1;v=prev[v]){idxPath.push(v);}idxPath.reverse();if(this.debug){console.log(`[WaypointGraph] chose ${this.nodes[idxPath[0]].name} -> ${this.nodes[t].name} (total ${best.toFixed(0)}): ${idxPath.map(i=>this.nodes[i].name).join(" -> ")}`);}return idxPath.map(i=>this.nodes[i].pos.clone())}route(startPos,endPos){if(this.nodes.length===0){return []}const canTest=this._canTest();if(canTest&&this._clear(startPos,endPos)){if(this.debug){console.log(`[WaypointGraph] route ${fmt(startPos)} -> ${fmt(endPos)}: direct chord CLEAR, flying direct`);}return []}if(this.debug&&canTest){console.log(`[WaypointGraph] route ${fmt(startPos)} -> ${fmt(endPos)}: direct chord blocked by obstacle, routing`);}let path=canTest?this._routeMultiAttach(startPos,endPos):null;if(!path){if(this.nodes.length<2){return []}const s=this._nearest(startPos,true);const t=this._nearest(endPos,true);if(s===-1||t===-1){return []}if(s===t){path=[this.nodes[s].pos.clone()];}else {const idxPath=this._shortestPath(s,t);if(!idxPath){console.warn("[WaypointGraph] no path between nearest nodes; flying direct");return []}path=idxPath.map(i=>this.nodes[i].pos.clone());}}const beforePrune=path.length;while(path.length){const prev=path.length>1?path[path.length-2]:startPos;if(prev.distance(endPos)<=prev.distance(path[path.length-1])){path.pop();}else {break}}while(path.length){const next=path.length>1?path[1]:endPos;if(startPos.distance(next)<=path[0].distance(next)){path.shift();}else {break}}if(this.debug&&path.length!==beforePrune){console.log(`[WaypointGraph] pruned ${beforePrune-path.length} non-progressing attach node(s)`);}if(!canTest&&path.length){const straight=startPos.distance(endPos);let routed=0;let last=startPos;for(const p of path){routed+=last.distance(p);last=p;}routed+=last.distance(endPos);if(routed>straight*4+4){if(this.debug){console.log(`[WaypointGraph] ${routed.toFixed(0)}m route for a ${straight.toFixed(0)}m hop — pathological attach, flying direct`);}return []}}return path}constructor(nodeEntities,edges=[],opts={}){this.collision=opts.collision??null;this.clearance=null;this.maxConnectDist=opts.maxConnectDist??Infinity;this.losEpsilon=opts.losEpsilon??.25;this.debug=opts.debug??false;this.nodes=nodeEntities.map((e,i)=>({i,entity:e,name:e.name||String(i),pos:e.getPosition().clone()}));this.adj=this.nodes.map(()=>[]);const index=new Map;nodeEntities.forEach((e,i)=>index.set(e,i));for(const edge of edges){const a=index.get(edge?.a);const b=index.get(edge?.b);if(a===undefined||b===undefined||a===b){continue}this._addEdge(a,b);}}}

var waypointGraph = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WaypointGraph: WaypointGraph
});

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NavCursor: NavCursor,
    NavInteraction: NavInteraction,
    Picker: Picker,
    WaypointGraph: WaypointGraph,
    probeCollision: probeCollision,
    probeSurface: probeSurface
});

function _define_property$a(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class CameraBridge extends Script{initialize(){const cameraComponent=this.entity.camera;if(!cameraComponent){console.error("CameraBridge must be attached to an entity with a Camera component.");this.enabled=false;return}this.mode=null;this.active=null;this.collision=null;this.sources={};const self=this;this.input=new InputController({canvas:this.app.graphicsDevice.canvas,get cameraMode(){return self.mode??"orbit"},get gamingControls(){return self.gamingControls},cameraComponent});const angles=this.entity.getEulerAngles();this.cam=new Camera;this.cam.position.copy(this.entity.getPosition());this.cam.angles.set(angles.x,angles.y,0);this.cam.fov=cameraComponent.fov;this.controllers={annotationOrbit:new AnnotationOrbitController,churchOrbit:new ChurchOrbitController,fly:new FlyController,walk:new WalkController};this._target=new Camera(this.cam);this._from=new Camera(this.cam);this._transition=1;this._anim=null;this._animInterruptTo="orbit";this._animIdleDelay=0;this._idleTime=0;this._flight=null;this._onFlightDone=null;this._flightInterruptTo=null;this._onFlightInterrupt=null;const prevWorld=new Mat4;const prevProj=new Mat4;this.app.on("framerender",()=>{const world=this.entity.getWorldTransform();const proj=cameraComponent.projectionMatrix;if(!this.app.renderNextFrame){if(!nearlyEquals(world.data,prevWorld.data)||!nearlyEquals(proj.data,prevProj.data)){this.app.renderNextFrame=true;}}if(this.app.renderNextFrame){prevWorld.copy(world);prevProj.copy(proj);}});this.input.events.on("inputEvent",(kind,event)=>{if(kind==="interact"||kind==="interrupt"){this._idleTime=0;}if(this._anim&&this.mode==="anim"&&kind==="interrupt"&&!(event instanceof KeyboardEvent)){this.activate(this._animInterruptTo,{transition:true});}if(this._flight&&this.mode==="flight"&&this._flightInterruptTo&&kind==="interrupt"&&!(event instanceof KeyboardEvent)){const onInterrupt=this._onFlightInterrupt;this._onFlightDone=null;this._onFlightInterrupt=null;this.activate(this._flightInterruptTo,{transition:true});onInterrupt?.();}});}update(dt){if(!this.active){return}this._transition=Math.min(1,this._transition+dt*this.transitionSpeed);this.input.update(dt,this.cam.distance);this.sources[this.mode]?.update(dt,this.cam,this.input.frame);this.active.update(dt,this.input.frame,this._target);if(this._flight&&this.mode==="flight"&&this._onFlightDone&&this._flight.done){const done=this._onFlightDone;this._onFlightDone=null;this._flightInterruptTo=null;this._onFlightInterrupt=null;done();}if(this._transition<1){this.cam.lerp(this._from,this._target,easeOut(this._transition));}else {this.cam.copy(this._target);}if(this._anim&&this._animIdleDelay>0&&this.mode===this._animInterruptTo){this._idleTime+=dt;if(this._idleTime>=this._animIdleDelay){this._anim.seekClosest(this.cam.position);this.activate("anim",{transition:true});}}this.entity.setPosition(this.cam.position);this.entity.setEulerAngles(this.cam.angles);this.entity.camera.fov=this.cam.fov;this.entity.camera.horizontalFov=this.app.graphicsDevice.width>this.app.graphicsDevice.height;}getController(name){return this.controllers?.[name]}frame(position,target,fov){this._target.look(position,target);if(fov){this._target.fov=fov;}}activate(name,{transition=false,seed=true}={}){const next=this.controllers?.[name];if(!next){console.error(`CameraBridge: unknown controller '${name}'`);return}if(this.active&&this.active!==next){this.active.onExit(this.cam);}if(transition&&this.active){this._from.copy(this.cam);this._transition=0;}else {this._transition=1;}const prev=this.mode;this.mode=name;if(seed){next.onEnter(this._target);}this.active=next;this.input.events.fire("cameraMode:changed",name,prev);}setCollision(collision){this.collision=collision;if(this.controllers){this.controllers.walk.collision=collision;this.controllers.fly.collision=collision;}this.input?.events.fire("collision:changed",collision);}setSource(mode,source){this.sources[mode]=source;}setAnim(track,{interruptTo="orbit",idleDelay=0}={}){this._anim=new AnimController(track);this.controllers.anim=this._anim;this._animInterruptTo=interruptTo;this._animIdleDelay=idleDelay;this._idleTime=0;}playAnim(){if(!this._anim){return}this._anim.seek(0);this.activate("anim");}stopAnim(){this._anim=null;delete this.controllers.anim;this._animIdleDelay=0;}getPose(){const target=new Vec3;this.cam.calcFocusPoint(target);return {position:this.cam.position.clone(),target,fov:this.cam.fov}}flyAlong(track,{onComplete,interruptTo,onInterrupt}={}){this._flight=new FlightController(track);this.controllers.flight=this._flight;this._onFlightDone=onComplete??null;this._flightInterruptTo=interruptTo??null;this._onFlightInterrupt=onInterrupt??null;this.activate("flight");}constructor(...args){super(...args),_define_property$a(this,"gamingControls",false),_define_property$a(this,"transitionSpeed",1);}}_define_property$a(CameraBridge,"scriptName","cameraBridge");

var cameraBridge = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CameraBridge: CameraBridge
});

function _define_property$9(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class NavBridge extends Script{postInitialize(){const bridge=this.cameraEntity?.script?.cameraBridge;if(!bridge||!bridge.input){console.error("NavBridge: cameraBridge (with input) not found on cameraEntity");return}this._bridge=bridge;this._built=false;if(bridge.collision){this._build(bridge.collision);}else {this._onCollision=collision=>this._build(collision);bridge.input.events.on("collision:changed",this._onCollision);}this.on("destroy",()=>{if(this._onCollision){bridge.input.events.off("collision:changed",this._onCollision);}this._navCursor?.destroy();this._picker?.release();});}_build(collision){if(this._built){return}this._built=true;const bridge=this._bridge;const app=this.app;const events=bridge.input.events;const domSource=bridge.input.domSource;const navHost={camera:this.cameraEntity,canvas:app.graphicsDevice.canvas,get cameraMode(){return bridge.mode},inputMode:platform.touch?"touch":"desktop",get gamingControls(){return bridge.gamingControls},walkAllowed:true};this._picker=new Picker(app,this.cameraEntity);this._navInteraction=new NavInteraction(this._picker);this._navInteraction.collision=collision;this._navInteraction.attach(navHost,events,domSource);this._navCursor=new NavCursor(app,navHost,collision,events,domSource);const walkSource=new WalkSource;walkSource.onComplete=()=>events.fire("navigateComplete");bridge.setSource("walk",walkSource);events.on("navigateTo",(pos,normal,speedMul)=>{walkSource.navigateTo(pos,speedMul);events.fire("navTarget:set",pos,normal);});events.on("navigateCancel",()=>walkSource.cancel());}constructor(...args){super(...args),_define_property$9(this,"cameraEntity",void 0);}}_define_property$9(NavBridge,"scriptName","navBridge");

var navBridge = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NavBridge: NavBridge
});

const COVER_TIME$1=.35;const REVEAL_TIME$1=.5;const vertexGLSL=`
    attribute vec2 vertex_position;
    varying vec2 uv0;
    void main() {
        gl_Position = vec4(vertex_position, 0.0, 1.0);
        uv0 = vertex_position * 0.5 + 0.5;
    }
`;const fragmentGLSL=`
    varying vec2 uv0;
    uniform sampler2D srcTexture;
    uniform float darken;
    uniform float coverAlpha;
    void main() {
        vec3 frozen = texture2D(srcTexture, uv0).rgb;
        gl_FragColor = vec4(frozen * (1.0 - darken), coverAlpha);
    }
`;const vertexWGSL=`
    attribute vertex_position: vec2f;
    varying uv0: vec2f;
    @vertex fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        output.position = vec4f(input.vertex_position, 0.0, 1.0);
        // WebGPU samples render-target textures Y-flipped vs WebGL (cf. engine getImageEffectUV)
        var uv = input.vertex_position * 0.5 + vec2f(0.5);
        uv.y = 1.0 - uv.y;
        output.uv0 = uv;
        return output;
    }
`;const fragmentWGSL=`
    varying uv0: vec2f;
    var srcTexture: texture_2d<f32>;
    var srcTextureSampler: sampler;
    uniform darken: f32;
    uniform coverAlpha: f32;
    @fragment fn fragmentMain(input: FragmentInput) -> FragmentOutput {
        var output: FragmentOutput;
        let frozen = textureSample(srcTexture, srcTextureSampler, input.uv0).rgb;
        output.color = vec4f(frozen * (1.0 - uniform.darken), uniform.coverAlpha);
        return output;
    }
`;class FreezeBlitPass extends RenderPassShaderQuad{execute(){const{device,fade}=this;device.scope.resolve("srcTexture").setValue(fade.freezeTexture);device.scope.resolve("darken").setValue(fade.darken);device.scope.resolve("coverAlpha").setValue(fade.coverAlpha);super.execute();}constructor(device,fade){super(device);this.fade=fade;this.shader=ShaderUtils.createShader(device,{uniqueName:"gsplatFreezeFade",attributes:{vertex_position:SEMANTIC_POSITION},vertexGLSL,fragmentGLSL,vertexWGSL,fragmentWGSL});this.blendState=new BlendState(true,BLENDEQUATION_ADD,BLENDMODE_SRC_ALPHA,BLENDMODE_ONE_MINUS_SRC_ALPHA);}}class FreezeFade{get sceneTarget(){return this.cameraFrame.renderPassCamera?.rt??null}ensureFreeze(sceneRt){const cb=sceneRt.colorBuffer;if(this.freezeTexture&&this.freezeTexture.width===cb.width&&this.freezeTexture.height===cb.height&&this.freezeTexture.format===cb.format){return}this.freezeTarget?.destroy();this.freezeTexture?.destroy();this.freezeTexture=new Texture(this.device,{name:"gsplatFreezeFrame",width:cb.width,height:cb.height,format:cb.format,mipmaps:false,minFilter:FILTER_NEAREST,magFilter:FILTER_NEAREST,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});this.freezeTarget=new RenderTarget({name:"gsplatFreezeRT",colorBuffer:this.freezeTexture,depth:false,flipY:sceneRt.flipY});}cover(){const sceneRt=this.sceneTarget;if(!this.revealed||!sceneRt){return}this.ensureFreeze(sceneRt);this.device.copyRenderTarget(sceneRt,this.freezeTarget,true,false);this.phase="cover";this.darken=0;this.coverAlpha=1;this.elapsed=0;}onReady(){this.revealed=true;if(this.phase==="cover"){this.phase="reveal";this.elapsed=0;}}sync(dt){if(this.phase==="cover"){this.elapsed+=dt;this.darken=easeOut(Math.min(1,this.elapsed/COVER_TIME$1));}else if(this.phase==="reveal"){this.elapsed+=dt;const t=Math.min(1,this.elapsed/REVEAL_TIME$1);this.coverAlpha=1-easeOut(t);if(t>=1){this.phase="idle";}}if(this.phase!=="idle"){this.app.renderNextFrame=true;}const rp=this.cameraFrame.renderPassCamera;const sceneRt=rp?.rt;const host=rp?.scenePassHalf??rp?.composePass;if(!host||!sceneRt){return}if(this.passTarget!==sceneRt){this.pass.init(sceneRt);this.pass.colorOps.clear=false;this.passTarget=sceneRt;}if(this.passHost&&this.passHost!==host){this.detach(this.passHost);}this.passHost=host;if(!host.beforePasses.includes(this.pass)){host.beforePasses.push(this.pass);}this.pass.enabled=this.phase!=="idle"&&!!this.freezeTexture;}detach(host){const before=host?.beforePasses;const i=before?.indexOf(this.pass)??-1;if(i>=0){before.splice(i,1);}}destroy(){this.app.off("mode:change",this._onModeChange);this.app.off("gsplat:ready",this._onReady);this.detach(this.passHost);this.freezeTarget?.destroy();this.freezeTexture?.destroy();this.pass.shader?.destroy();}constructor(app,cameraFrame){this.app=app;this.device=app.graphicsDevice;this.cameraFrame=cameraFrame;this.pass=new FreezeBlitPass(this.device,this);this.pass.enabled=false;this.passTarget=null;this.passHost=null;this.freezeTexture=null;this.freezeTarget=null;this.phase="idle";this.revealed=false;this.darken=0;this.coverAlpha=1;this.elapsed=0;this._onModeChange=()=>this.cover();this._onReady=()=>this.onReady();app.on("mode:change",this._onModeChange);app.on("gsplat:ready",this._onReady);}}

var freezeFade = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FreezeFade: FreezeFade
});

function _define_property$8(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const patchChunk$1=(source,search,replacement,name)=>{if(!source.includes(search)){console.warn(`patchChunk: substring not found in '${name}', shader chunk patch may be out of sync with the engine.`);}return source.replace(search,replacement)};const gammaChunkGlsl=`
vec3 prepareOutputFromGamma(vec3 gammaColor, float depth) {
    return gammaColor;
}
`;const gammaChunkWgsl=`
fn prepareOutputFromGamma(gammaColor: vec3f, depth: f32) -> vec3f {
    return gammaColor;
}
`;const origIsColorBufferSrgb=RenderTarget.prototype.isColorBufferSrgb;const ToneMapping={LINEAR:0};const SsaoType={NONE:"none"};const RenderFormat={RG11B10:18,RGBA16:12,RGBA32:14};const DebugType={NONE:"none"};class Rendering{constructor(){_define_property$8(this,"renderFormat",RenderFormat.RG11B10);_define_property$8(this,"renderFormatFallback0",RenderFormat.RGBA16);_define_property$8(this,"renderFormatFallback1",RenderFormat.RGBA32);_define_property$8(this,"stencil",false);_define_property$8(this,"renderTargetScale",1);_define_property$8(this,"samples",1);_define_property$8(this,"sceneColorMap",false);_define_property$8(this,"sceneDepthMap",false);_define_property$8(this,"toneMapping",ToneMapping.LINEAR);_define_property$8(this,"sharpness",0);_define_property$8(this,"debug",DebugType.NONE);}}class Ssao{constructor(){_define_property$8(this,"type",SsaoType.NONE);_define_property$8(this,"blurEnabled",true);_define_property$8(this,"intensity",.5);_define_property$8(this,"radius",30);_define_property$8(this,"samples",12);_define_property$8(this,"power",6);_define_property$8(this,"minAngle",10);_define_property$8(this,"scale",1);}}class Bloom{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"intensity",.01);_define_property$8(this,"blurLevel",16);}}class Grading{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"brightness",1);_define_property$8(this,"contrast",1);_define_property$8(this,"saturation",1);_define_property$8(this,"tint",new Color(1,1,1,1));}}class ColorLUT{constructor(){_define_property$8(this,"texture",null);_define_property$8(this,"intensity",1);_define_property$8(this,"texture2",null);_define_property$8(this,"intensity2",1);_define_property$8(this,"blend",0);}}class Vignette{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"intensity",.5);_define_property$8(this,"inner",.5);_define_property$8(this,"outer",1);_define_property$8(this,"curvature",.5);_define_property$8(this,"color",new Color(0,0,0,1));}}class Fringing{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"intensity",50);}}class ColorEnhance{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"shadows",0);_define_property$8(this,"highlights",0);_define_property$8(this,"midtones",0);_define_property$8(this,"vibrance",0);_define_property$8(this,"dehaze",0);}}class Taa{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"jitter",1);}}class Dof{constructor(){_define_property$8(this,"enabled",false);_define_property$8(this,"highQuality",true);_define_property$8(this,"nearBlur",false);_define_property$8(this,"focusDistance",100);_define_property$8(this,"focusRange",10);_define_property$8(this,"blurRadius",3);_define_property$8(this,"blurRings",4);_define_property$8(this,"blurRingPoints",5);}}class CameraFrame extends Script{initialize(){this.engineCameraFrame=new CameraFrame$1(this.app,this.entity.camera);this.freezeFade=new FreezeFade(this.app,this.engineCameraFrame);const glsl=ShaderChunks.get(this.app.graphicsDevice,"glsl");const wgsl=ShaderChunks.get(this.app.graphicsDevice,"wgsl");this.origChunks={glsl:{gsplatOutputVS:glsl.get("gsplatOutputVS"),skyboxPS:glsl.get("skyboxPS")},wgsl:{gsplatOutputVS:wgsl.get("gsplatOutputVS"),skyboxPS:wgsl.get("skyboxPS")}};this.applyGammaOverrides();this.on("enable",()=>{this.engineCameraFrame.enabled=true;this.applyGammaOverrides();});this.on("disable",()=>{this.engineCameraFrame.enabled=false;this.restoreGammaOverrides();});this.on("destroy",()=>{this.restoreGammaOverrides();this.engineCameraFrame.destroy();this.freezeFade.destroy();});this.on("state",enabled=>{this.engineCameraFrame.enabled=enabled;});}applyGammaOverrides(){const{app}=this;const glsl=ShaderChunks.get(app.graphicsDevice,"glsl");const wgsl=ShaderChunks.get(app.graphicsDevice,"wgsl");glsl.set("gsplatOutputVS",gammaChunkGlsl);wgsl.set("gsplatOutputVS",gammaChunkWgsl);glsl.set("skyboxPS",patchChunk$1(this.origChunks.glsl.skyboxPS,"gammaCorrectOutput(toneMap(processEnvironment(linear)))","pow(toneMap(processEnvironment(linear)) + 0.0000001, vec3(1.0 / 2.2))","glsl skyboxPS gamma override"));wgsl.set("skyboxPS",patchChunk$1(this.origChunks.wgsl.skyboxPS,"gammaCorrectOutput(toneMap(processEnvironment(linear)))","pow(toneMap(processEnvironment(linear)) + 0.0000001, vec3f(1.0 / 2.2))","wgsl skyboxPS gamma override"));RenderTarget.prototype.isColorBufferSrgb=function(index){return this===app.graphicsDevice.backBuffer?true:origIsColorBufferSrgb.call(this,index)};}restoreGammaOverrides(){const glsl=ShaderChunks.get(this.app.graphicsDevice,"glsl");const wgsl=ShaderChunks.get(this.app.graphicsDevice,"wgsl");glsl.set("gsplatOutputVS",this.origChunks.glsl.gsplatOutputVS);wgsl.set("gsplatOutputVS",this.origChunks.wgsl.gsplatOutputVS);glsl.set("skyboxPS",this.origChunks.glsl.skyboxPS);wgsl.set("skyboxPS",this.origChunks.wgsl.skyboxPS);RenderTarget.prototype.isColorBufferSrgb=origIsColorBufferSrgb;}postUpdate(dt){const cf=this.engineCameraFrame;const{rendering,bloom,grading,colorEnhance,vignette,fringing,taa,ssao,dof,colorLUT}=this;const dstRendering=cf.rendering;dstRendering.renderFormats.length=0;dstRendering.renderFormats.push(rendering.renderFormat);dstRendering.renderFormats.push(rendering.renderFormatFallback0);dstRendering.renderFormats.push(rendering.renderFormatFallback1);dstRendering.stencil=rendering.stencil;dstRendering.renderTargetScale=rendering.renderTargetScale;dstRendering.samples=rendering.samples;dstRendering.sceneColorMap=rendering.sceneColorMap;dstRendering.sceneDepthMap=rendering.sceneDepthMap;dstRendering.toneMapping=rendering.toneMapping;dstRendering.sharpness=rendering.sharpness;const dstSsao=cf.ssao;dstSsao.type=ssao.type;if(ssao.type!==SsaoType.NONE){dstSsao.intensity=ssao.intensity;dstSsao.radius=ssao.radius;dstSsao.samples=ssao.samples;dstSsao.power=ssao.power;dstSsao.minAngle=ssao.minAngle;dstSsao.scale=ssao.scale;}const dstBloom=cf.bloom;dstBloom.intensity=bloom.enabled?bloom.intensity:0;if(bloom.enabled){dstBloom.blurLevel=bloom.blurLevel;}const dstGrading=cf.grading;dstGrading.enabled=grading.enabled;if(grading.enabled){dstGrading.brightness=grading.brightness;dstGrading.contrast=grading.contrast;dstGrading.saturation=grading.saturation;dstGrading.tint.copy(grading.tint);}const dstColorLUT=cf.colorLUT;if(colorLUT.texture?.resource){dstColorLUT.texture=colorLUT.texture.resource;dstColorLUT.intensity=colorLUT.intensity;}else {dstColorLUT.texture=null;}if(colorLUT.texture2?.resource){dstColorLUT.texture2=colorLUT.texture2.resource;dstColorLUT.intensity2=colorLUT.intensity2;dstColorLUT.blend=colorLUT.blend;}else {dstColorLUT.texture2=null;}const dstVignette=cf.vignette;dstVignette.intensity=vignette.enabled?vignette.intensity:0;if(vignette.enabled){dstVignette.inner=vignette.inner;dstVignette.outer=vignette.outer;dstVignette.curvature=vignette.curvature;dstVignette.color.copy(vignette.color);}const dstTaa=cf.taa;dstTaa.enabled=taa.enabled;if(taa.enabled){dstTaa.jitter=taa.jitter;}const dstFringing=cf.fringing;dstFringing.intensity=fringing.enabled?fringing.intensity:0;const dstColorEnhance=cf.colorEnhance;dstColorEnhance.enabled=colorEnhance.enabled;if(colorEnhance.enabled){dstColorEnhance.shadows=colorEnhance.shadows;dstColorEnhance.highlights=colorEnhance.highlights;dstColorEnhance.midtones=colorEnhance.midtones;dstColorEnhance.vibrance=colorEnhance.vibrance;dstColorEnhance.dehaze=colorEnhance.dehaze;}const dstDof=cf.dof;dstDof.enabled=dof.enabled;if(dof.enabled){dstDof.highQuality=dof.highQuality;dstDof.nearBlur=dof.nearBlur;dstDof.focusDistance=dof.focusDistance;dstDof.focusRange=dof.focusRange;dstDof.blurRadius=dof.blurRadius;dstDof.blurRings=dof.blurRings;dstDof.blurRingPoints=dof.blurRingPoints;}cf.debug=rendering.debug;cf.update();this.freezeFade.sync(dt);}constructor(...args){super(...args),_define_property$8(this,"rendering",new Rendering),_define_property$8(this,"ssao",new Ssao),_define_property$8(this,"bloom",new Bloom),_define_property$8(this,"grading",new Grading),_define_property$8(this,"colorLUT",new ColorLUT),_define_property$8(this,"vignette",new Vignette),_define_property$8(this,"taa",new Taa),_define_property$8(this,"fringing",new Fringing),_define_property$8(this,"colorEnhance",new ColorEnhance),_define_property$8(this,"dof",new Dof),_define_property$8(this,"engineCameraFrame",void 0),_define_property$8(this,"freezeFade",void 0),_define_property$8(this,"origChunks",void 0);}}_define_property$8(CameraFrame,"scriptName","cameraFrame");

var cameraFrame = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CameraFrame: CameraFrame
});

function _define_property$7(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const _vec=new Vec3;const _screen=new Vec3;const COVER_TIME=.35;const REVEAL_TIME=.5;const OBSTACLE_MARGIN=1;const _boxInv=new Mat4;const _boxScale=new Vec3;const _segA=new Vec3;const _segB=new Vec3;const segmentClearsBox=(entity,margin,p,q)=>{const wt=entity.getWorldTransform();wt.getScale(_boxScale);_boxInv.copy(wt).invert();_boxInv.transformPoint(p,_segA);_boxInv.transformPoint(q,_segB);const a=[_segA.x,_segA.y,_segA.z];const b=[_segB.x,_segB.y,_segB.z];const scale=[_boxScale.x,_boxScale.y,_boxScale.z];let t0=0;let t1=1;for(let i=0;i<3;i++){const h=.5+(scale[i]>1e-6?margin/scale[i]:0);const d=b[i]-a[i];if(Math.abs(d)<1e-9){if(a[i]<-h||a[i]>h){return true}continue}let ta=(-h-a[i])/d;let tb=(h-a[i])/d;if(ta>tb){const tmp=ta;ta=tb;tb=tmp;}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){return true}}return false};class AnnotationManager extends Script{initialize(){this._camera=this.cameraEntity??this.app.root.findComponent("camera")?.entity??null;this._bridge=null;this._sets={walk:[],dollhouse:[]};this._graphs={walk:null,dollhouse:null};this._set=[];this._hotspots=[];this._currentMode=null;this._annotationOn=true;this._activeIndex=-1;this._settled=false;this._homePose=null;this._homeOrbit=null;this._transitioning=false;this._pendingRebuild=false;const overlay=document.createElement("div");overlay.className="gc-annotation-overlay";document.body.appendChild(overlay);this._overlay=overlay;this._createPanel();const asset=this.annotationsAsset;if(asset){asset.ready(a=>{const data=a.resource??{};this._sets.walk=data.walk?.annotations??[];this._sets.dollhouse=data.dollhouse?.annotations??[];if(this._currentMode){const annotated=this._currentMode==="walk"||this._currentMode==="dollhouse";this._set=annotated?this._sets[this._currentMode]??[]:[];this._rebuildHotspots();this._pendingRebuild=false;this._transitioning=false;this._fadeOverlay(1,0);}});this.app.assets.load(asset);}this._onScreenCancel=e=>{if(this._activeIndex<0||this._settled){return}const t=e.target;if(this._panel?.contains(t)||t?.closest?.(".gc-annotation-hotspot")){return}this._exit();};document.addEventListener("pointerdown",this._onScreenCancel);this._onKeyDown=e=>{if(e.key==="Escape"){this._exit();}};document.addEventListener("keydown",this._onKeyDown);this.app.on("mode:change",this._onModeChange,this);this.app.on("gsplat:ready",this._onSceneReady,this);this.app.on("ui:annotationtoggle",this._onToggle,this);this.app.on("prerender",this._update,this);this.on("destroy",()=>{this.app.off("mode:change",this._onModeChange,this);this.app.off("gsplat:ready",this._onSceneReady,this);this.app.off("ui:annotationtoggle",this._onToggle,this);this.app.off("prerender",this._update,this);document.removeEventListener("pointerdown",this._onScreenCancel);document.removeEventListener("keydown",this._onKeyDown);this._teardownHotspots();this._overlay?.remove();this._overlay=null;this._panel=null;});}postInitialize(){this._bridge=this._camera?.script?.cameraBridge??null;this._graphs.walk=this._buildGraph(this.insideWaypoints);this._graphs.dollhouse=this._buildGraph(this.outsideWaypoints);if(this.outsideObstacle&&this._graphs.dollhouse){this._graphs.dollhouse.debug=true;this._graphs.dollhouse.setClearance((p,q)=>segmentClearsBox(this.outsideObstacle,OBSTACLE_MARGIN,p,q),true);}}_buildGraph(host){if(!host){return null}const nodes=host.children?.slice()??[];if(nodes.length<2){return null}const edges=host.script?.waypoints?.edges??[];return new WaypointGraph(nodes,edges)}_resetSession(){this._activeIndex=-1;this._settled=false;this._homePose=null;this._homeOrbit=null;this._hidePanel();this._overlay?.classList.remove("gc-annotation-viewing");}_fadeOverlay(opacity,seconds){if(!this._overlay){return}this._overlay.style.transition=`opacity ${seconds}s ease-out`;this._overlay.style.opacity=String(opacity);}_setViewing(on){this._overlay?.classList.toggle("gc-annotation-viewing",on);if(on){this._fadeOverlay(1,COVER_TIME);}}_rebuildHotspots(){this._teardownHotspots();this._set.forEach((data,i)=>{const dom=document.createElement("button");dom.className="gc-annotation-hotspot";dom.textContent=String(i+1);dom.style.display="none";dom.addEventListener("click",e=>{e.stopPropagation();this._onHotspotClick(i);});this._overlay.appendChild(dom);const p=data.position??[0,0,0];this._hotspots.push({data,worldPos:new Vec3(p[0],p[1],p[2]),dom});});}_teardownHotspots(){for(const h of this._hotspots){h.dom.remove();}this._hotspots=[];}_hideAllHotspots(){for(const h of this._hotspots){h.dom.style.display="none";}}_update(){if(!this._annotationOn||this._transitioning||!this._camera?.camera){return}const cam=this._camera.camera;const viewMatrix=cam.viewMatrix;for(const h of this._hotspots){viewMatrix.transformPoint(h.worldPos,_vec);if(_vec.z>=0){h.dom.style.display="none";continue}cam.worldToScreen(h.worldPos,_screen);h.dom.style.display="";h.dom.style.left=`${_screen.x}px`;h.dom.style.top=`${_screen.y}px`;}}_onToggle(){if(this._currentMode!=="walk"&&this._currentMode!=="dollhouse"){return}this._annotationOn=!this._annotationOn;if(!this._annotationOn){if(this._activeIndex>=0){this._exit();}this._hideAllHotspots();}this.app.fire("annotation:change",{on:this._annotationOn,active:this._activeIndex>=0,count:this._set.length});}_onModeChange(name){this._currentMode=name;this._resetSession();const annotated=name==="walk"||name==="dollhouse";if(!annotated){this._annotationOn=false;}this._set=annotated?this._sets[name]??[]:[];this._pendingRebuild=true;this._transitioning=true;this._fadeOverlay(0,COVER_TIME);this.app.fire("annotation:change",{on:this._annotationOn,active:false,count:this._set.length});}_onSceneReady(){if(this._pendingRebuild){this._rebuildHotspots();this._pendingRebuild=false;}this._transitioning=false;this._fadeOverlay(1,REVEAL_TIME);}_onHotspotClick(index){if(!this._annotationOn||!this._bridge){return}if(index===this._activeIndex){return}if(this._homePose===null){this._homePose=this._bridge.getPose();const orbit=this._bridge.getController?.("churchOrbit");if(this._currentMode==="dollhouse"&&orbit?.hasState?.()){this._homeOrbit=orbit.captureState();this._homePose=orbit.getCameraPose();}else {this._homeOrbit=null;}}this._flyToIndex(index);}_flyToIndex(index){const ann=this._set[index];if(!ann||!this._bridge){return}const from=this._bridge.getPose();const to=this._poseFromInitial(ann.camera?.initial);if(!to){return}const graph=this._graphs[this._currentMode];let waypoints=[];if(graph){graph.setCollision(this._bridge.collision??null);waypoints=graph.route(from.position,to.position);}const track=createFlightTrack(from,to,waypoints);this._logFlight(`fly to #${index}`,from,to,waypoints,track);this._activeIndex=index;this._settled=false;this._setViewing(true);this._showPanel(ann,index);this.app.fire("annotation:change",{on:this._annotationOn,active:true,index,count:this._set.length});this._bridge.flyAlong(track,{onComplete:()=>{this._settled=true;this._bridge.activate("annotationOrbit");}});}_onNext(){this._step(1);}_onPrev(){this._step(-1);}_step(dir){if(this._activeIndex<0||this._set.length===0){return}const n=this._set.length;const next=(this._activeIndex+dir+n)%n;this._flyToIndex(next);}_exit(){if(this._activeIndex<0||!this._bridge){return}this._activeIndex=-1;this._settled=false;this._setViewing(false);this._hidePanel();this.app.fire("annotation:change",{on:this._annotationOn,active:false,count:this._set.length});const home=this._homePose;if(!home){return}const from=this._bridge.getPose();const graph=this._graphs[this._currentMode];let waypoints=[];if(graph){graph.setCollision(this._bridge.collision??null);waypoints=graph.route(home.position,from.position);}const track=reverseFlightTrack(createFlightTrack(home,from,waypoints),2);this._logFlight("rewind home",from,home,waypoints,track);const interruptTo=this._currentMode==="dollhouse"?this._bridge.getController("churchOrbit")?"churchOrbit":"orbit":null;this._bridge.flyAlong(track,{onComplete:()=>this._reseatMode(),interruptTo,onInterrupt:()=>this._clearHome()});}_logFlight(label,from,to,waypoints,track){const f=v=>`(${v.toFixed(2)})`;const v3=v=>`(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;const p=track.keyframes.values.position;const keys=track.keyframes.times.map((t,i)=>`t=${t.toFixed(2)} (${p[i*3].toFixed(2)}, ${p[i*3+1].toFixed(2)}, ${p[i*3+2].toFixed(2)})`);console.log(`[annotation] ${label}: ${v3(from.position)} -> ${v3(to.position)} via ${waypoints.length} waypoint(s) `+`${waypoints.map(v3).join(" -> ")||"(direct)"} | duration ${f(track.duration)}s | keys: ${keys.join("  ")}`);}_reseatMode(){if(this._bridge){if(this._homeOrbit){const orbit=this._bridge.getController("churchOrbit");orbit.applyState(this._homeOrbit);this._bridge.activate("churchOrbit",{seed:false});}else if(this._homePose){const home=this._homePose;this._bridge.frame(home.position,home.target,home.fov);this._bridge.activate(this._fallbackController());}}this._clearHome();}_clearHome(){this._homePose=null;this._homeOrbit=null;}_fallbackController(){if(this._currentMode==="walk"){return "walk"}return this._bridge?.getController("churchOrbit")?"churchOrbit":"orbit"}_poseFromInitial(initial){if(!initial?.position||!initial?.target){return null}return {position:new Vec3(initial.position[0],initial.position[1],initial.position[2]),target:new Vec3(initial.target[0],initial.target[1],initial.target[2]),fov:initial.fov??60}}_createPanel(){const panel=document.createElement("div");panel.className="gc-annotation-panel";panel.innerHTML='<button class="gc-annotation-close" aria-label="Close">&times;</button>'+'<button class="gc-annotation-expand" aria-label="Expand">'+'<span class="material-symbols-outlined">keyboard_arrow_up</span></button>'+'<div class="gc-annotation-title"></div>'+'<div class="gc-annotation-body"></div>'+'<div class="gc-annotation-footer">'+'<button class="gc-annotation-prev" aria-label="Previous">'+'<span class="material-symbols-outlined">chevron_left</span></button>'+'<div class="gc-annotation-count"></div>'+'<button class="gc-annotation-next" aria-label="Next">'+'<span class="material-symbols-outlined">chevron_right</span></button>'+"</div>";panel.querySelector(".gc-annotation-close").addEventListener("click",()=>this._exit());panel.querySelector(".gc-annotation-prev").addEventListener("click",()=>this._onPrev());panel.querySelector(".gc-annotation-next").addEventListener("click",()=>this._onNext());document.body.appendChild(panel);this._panel=panel;this._panelTitle=panel.querySelector(".gc-annotation-title");this._panelBody=panel.querySelector(".gc-annotation-body");this._panelFooter=panel.querySelector(".gc-annotation-footer");this._panelCount=panel.querySelector(".gc-annotation-count");this._panelExpand=panel.querySelector(".gc-annotation-expand");this._panelExpandIcon=this._panelExpand.querySelector("span");this._panelExpand.addEventListener("click",()=>{this._setExpanded(!panel.classList.contains("expanded"));});}_setExpanded(on){this._panel.classList.toggle("expanded",on);this._panelExpandIcon.textContent=on?"keyboard_arrow_down":"keyboard_arrow_up";this._panelExpand.setAttribute("aria-label",on?"Contract":"Expand");this._updateExpandVisibility();}_updateExpandVisibility(){const expanded=this._panel.classList.contains("expanded");const clipped=this._panelBody.scrollHeight>this._panelBody.clientHeight+1;this._panelExpand.style.display=expanded||clipped?"":"none";}_showPanel(ann,index){if(!ann){return}this._panelTitle.textContent=ann.title??"";this._panelBody.innerHTML=ann.text??"";this._panelFooter.style.display=this._set.length>1?"":"none";this._panelCount.textContent=`${index+1} / ${this._set.length}`;this._panel.classList.add("visible");this._updateExpandVisibility();this._panelBody.querySelectorAll("img").forEach(img=>{img.addEventListener("load",()=>this._updateExpandVisibility(),{once:true});});}_hidePanel(){if(!this._panel){return}this._panel.classList.remove("visible");this._setExpanded(false);}constructor(...args){super(...args),_define_property$7(this,"annotationsAsset",null),_define_property$7(this,"cameraEntity",null),_define_property$7(this,"insideWaypoints",null),_define_property$7(this,"outsideWaypoints",null),_define_property$7(this,"outsideObstacle",null);}}_define_property$7(AnnotationManager,"scriptName","annotationManager");

var annotationManager = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnnotationManager: AnnotationManager
});

function _define_property$6(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const _pos=new Vec3;class SoundManager extends Script{initialize(){this._bridge=null;this._currentMode=null;this._inside=0;this._walkVol=0;this._speed=0;this._prevPos=null;this._soundOn=true;this._master=0;this._sceneReady=false;this._started=false;this.app.once("gsplat:ready",()=>{this._sceneReady=true;});const unlockEvents=["pointerup","touchend","click","keydown"];const unlock=()=>{const ctx=this.app.systems.sound.context;if(ctx&&ctx.state!=="running"){ctx.resume();}else {unlockEvents.forEach(name=>window.removeEventListener(name,unlock,true));}};unlockEvents.forEach(name=>window.addEventListener(name,unlock,true));this.on("destroy",()=>{unlockEvents.forEach(name=>window.removeEventListener(name,unlock,true));});this.app.on("mode:change",this._onModeChange,this);this.app.on("ui:soundtoggle",this._onSoundToggle,this);this.on("destroy",()=>{this.app.off("mode:change",this._onModeChange,this);this.app.off("ui:soundtoggle",this._onSoundToggle,this);});}postInitialize(){this._bridge=this.cameraEntity?.script?.cameraBridge??null;}_onModeChange(name){this._currentMode=name;this._prevPos=null;this._speed=0;}_onSoundToggle(){this._soundOn=!this._soundOn;this.app.fire("sound:change",this._soundOn);}update(dt){if(dt<=0){return}if(!this._sceneReady||this.app.systems.sound.context?.state!=="running"){return}if(!this._started){this._started=true;[this.cityLow,this.cityHigh,this.ambience,this.walk].forEach(e=>{const sound=e?.sound;if(!sound)return;Object.keys(sound.slots).forEach(name=>sound.play(name));});}const masterTarget=this._soundOn?1:0;this._master+=(masterTarget-this._master)*(1-Math.exp(-dt/.3));if(Math.abs(masterTarget-this._master)<.005){this._master=masterTarget;}this.app.systems.sound.volume=this._master;const cam=this.cameraEntity;if(!cam){return}_pos.copy(cam.getPosition());if(this._prevPos){const dx=_pos.x-this._prevPos.x;const dz=_pos.z-this._prevPos.z;const speed=Math.hypot(dx,dz)/dt;this._speed+=(speed-this._speed)*(1-Math.exp(-dt/.1));}else {this._prevPos=_pos.clone();}this._prevPos.copy(_pos);const insideTarget=this._currentMode==="walk"?1:0;this._inside+=(insideTarget-this._inside)*(1-Math.exp(-dt/Math.max(this.fadeTime,.01)));const inside=this._inside;const outside=1-inside;const span=Math.max(this.heightHigh-this.heightLow,.001);const blend=Math.min(Math.max((_pos.y-this.heightLow)/span,0),.9);this._setVolume(this.cityLow,outside*Math.sqrt(1-blend));this._setVolume(this.cityHigh,outside*Math.sqrt(blend));this._setVolume(this.ambience,inside);const walking=this._bridge?.mode==="walk"&&this._speed>this.walkSpeedThreshold;const walkTarget=walking?inside:0;this._walkVol+=(walkTarget-this._walkVol)*(1-Math.exp(-dt/Math.max(this.walkFadeTime,.01)));this._setVolume(this.walk,this._walkVol);}_setVolume(entity,volume){const sound=entity?.sound;if(sound){sound.volume=volume;}}constructor(...args){super(...args),_define_property$6(this,"cameraEntity",null),_define_property$6(this,"cityLow",null),_define_property$6(this,"cityHigh",null),_define_property$6(this,"ambience",null),_define_property$6(this,"walk",null),_define_property$6(this,"heightLow",5),_define_property$6(this,"heightHigh",35),_define_property$6(this,"fadeTime",1),_define_property$6(this,"walkFadeTime",.25),_define_property$6(this,"walkSpeedThreshold",.5);}}_define_property$6(SoundManager,"scriptName","soundManager");

var soundManager = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SoundManager: SoundManager
});

function _define_property$5(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class ResolutionCap extends Script{initialize(){const apply=()=>{const maxPixelDim=platform.mobile?1080:2160;const scale=platform.mobile?.6:1;this.app.graphicsDevice.maxPixelRatio=scale*Math.min(maxPixelDim/Math.min(screen.width,screen.height),window.devicePixelRatio);this.app.resizeCanvas();};window.addEventListener("resize",apply);this.on("destroy",()=>window.removeEventListener("resize",apply));apply();}}_define_property$5(ResolutionCap,"scriptName","resolutionCap");

var resolutionCap = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ResolutionCap: ResolutionCap
});

function _define_property$4(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const GOLD="#cfa452";const GLASS=["#5b79b8","#a34d5c","#cfa452","#5e7d66"];const PETALS=12;const SHOW_DELAY=.4;class LoadingIndicator extends Script{initialize(){this._state="idle";this._revealed=false;this._delay=0;this._shown=0;this._target=0;this._watermark=1;this._buildDom();this._onLoad=()=>this._begin();this._onReady=()=>this._end();this._onFrameReady=(camera,layer,ready,loading)=>{if(this._state==="idle"){return}this._watermark=Math.max(this._watermark,loading);this._target=Math.max(this._target,(this._watermark-loading)/this._watermark*100);};this.app.on("gsplat:load",this._onLoad);this.app.on("gsplat:ready",this._onReady);this.app.systems.gsplat?.on("frame:ready",this._onFrameReady);this.on("destroy",()=>{this.app.off("gsplat:load",this._onLoad);this.app.off("gsplat:ready",this._onReady);this.app.systems.gsplat?.off("frame:ready",this._onFrameReady);this._root.remove();});}_buildDom(){const root=document.createElement("div");root.style.cssText="position: fixed; inset: 0; z-index: 6; display: flex; flex-direction: column;"+"align-items: center; justify-content: center; gap: 8px; pointer-events: none;"+"opacity: 0; transition: opacity 0.3s ease-out;";const petalPath="M0 -28 C 13 -42, 13 -64, 0 -80 C -13 -64, -13 -42, 0 -28 Z";let petals="";for(let i=0;i<PETALS;i++){petals+=`<path d="${petalPath}" transform="rotate(${i*30})" `+`fill="${GLASS[i%GLASS.length]}" fill-opacity="0.09" `+`stroke="${GOLD}" stroke-opacity="0.3"/>`;}root.innerHTML=`<svg viewBox="0 0 200 200" style="width: min(28vmin, 190px); height: auto;">`+`<circle cx="100" cy="100" r="86" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>`+`<circle cx="100" cy="100" r="24" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="1.5"/>`+`<g transform="translate(100 100)">${petals}</g>`+`</svg>`+`<div style="font-family: &quot;Cormorant Garamond&quot;, &quot;Times New Roman&quot;, serif;`+`font-weight: 500; font-size: 1.1rem; letter-spacing: 0.08em; color: ${GOLD};">0%</div>`;document.body.appendChild(root);this._root=root;this._petals=root.querySelectorAll("g path");this._pct=root.lastElementChild;}_render(p){const lit=p/100*PETALS;for(let i=0;i<this._petals.length;i++){const f=Math.max(0,Math.min(1,lit-i));this._petals[i].setAttribute("fill-opacity",String(.09+.76*f));}this._pct.textContent=`${Math.round(p)}%`;}_begin(){if(!this._revealed){return}this._state="pending";this._delay=SHOW_DELAY;this._shown=0;this._target=0;this._watermark=1;this._render(0);}_end(){this._revealed=true;if(this._state==="shown"){this._render(100);}this._state="idle";this._root.style.opacity="0";}update(dt){if(this._state==="pending"){this._delay-=dt;if(this._delay<=0){this._state="shown";this._root.style.opacity="1";}}if(this._state!=="shown"){return}this._shown=Math.min(this._target,this._shown+Math.max((this._target-this._shown)*3,12)*dt);this._render(this._shown);}}_define_property$4(LoadingIndicator,"scriptName","loadingIndicator");

var loadingIndicator = /*#__PURE__*/Object.freeze({
    __proto__: null,
    LoadingIndicator: LoadingIndicator
});

function _define_property$3(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const tmpVec=new Vec3;class CarAnimator extends Script{initialize(){this.time=0;this.pointA=this.carA?.getPosition().clone();this.pointB=this.carB?.getPosition().clone();this.pointC=this.carC?.getPosition().clone();this._indoors=false;this._onModeChange=name=>{this._indoors=name==="walk";if(this._indoors&&this.carStates){for(const state of this.carStates){state.entity.enabled=false;}}};this.app.on("mode:change",this._onModeChange);this.on("destroy",()=>this.app.off("mode:change",this._onModeChange));}lerp3(out,a,b,c,t){const ab=a.distance(b);const bc=b.distance(c);const split=ab/Math.max(ab+bc,Number.EPSILON);return t<split?out.lerp(a,b,t/split):out.lerp(b,c,(t-split)/(1-split))}update(dt){if(this._indoors){return}if(!this.pointA||!this.pointB||!this.pointC){return}const rand=(min,max)=>min+Math.random()*(max-min);const cars=[this.carA,this.carB,this.carC];const duration=Math.max(.1,this.duration);this.time+=dt;if(!this.carStates){this.carStates=cars.map(entity=>({entity,progress:0,speed:1}));for(const car of cars){car.enabled=false;}this.nextSpawnAt=this.time;}if(this.time>=this.nextSpawnAt){const state=this.carStates.find(s=>!s.entity.enabled);if(state){state.progress=0;state.speed=rand(.75,1.25);state.entity.setPosition(this.pointA);state.entity.enabled=true;this.nextSpawnAt=this.time+this.spawnInterval*rand(.5,1.5);}}for(const state of this.carStates){if(!state.entity.enabled){continue}state.progress+=dt/duration*state.speed;if(state.progress>=1){state.entity.setPosition(this.pointC);state.entity.enabled=false;continue}state.entity.setPosition(this.lerp3(tmpVec,this.pointA,this.pointB,this.pointC,state.progress));}this.app.renderNextFrame=true;}constructor(...args){super(...args),_define_property$3(this,"carA",void 0),_define_property$3(this,"carB",void 0),_define_property$3(this,"carC",void 0),_define_property$3(this,"duration",10),_define_property$3(this,"spawnInterval",4);}}_define_property$3(CarAnimator,"scriptName","carAnimator");

var carAnimator = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CarAnimator: CarAnimator
});

function _define_property$2(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}const patchChunk=(source,search,replacement,name)=>{if(!source.includes(search)){console.warn(`patchChunk: substring not found in '${name}', shader chunk patch may be out of sync with the engine.`);}return source.replace(search,replacement)};class Skybox extends Script{postInitialize(){const{app}=this;const glsl=ShaderChunks.get(app.graphicsDevice,"glsl");const wgsl=ShaderChunks.get(app.graphicsDevice,"wgsl");glsl.set("skyboxPS",patchChunk(glsl.get("skyboxPS"),"mapRoughnessUv(uv, mipLevel)","uv","glsl skyboxPS"));wgsl.set("skyboxPS",patchChunk(wgsl.get("skyboxPS"),"mapRoughnessUv(uv, uniform.mipLevel)","uv","wgsl skyboxPS"));const asset=this.texture;if(!asset){return}const apply=()=>{const tex=asset.resource;if(!tex){return}tex.type=TEXTURETYPE_RGBP;tex.addressU=ADDRESS_REPEAT;tex.addressV=ADDRESS_CLAMP_TO_EDGE;app.scene.envAtlas=tex;};if(asset.resource){apply();}else {asset.once("load",apply);app.assets.load(asset);}}constructor(...args){super(...args),_define_property$2(this,"texture",null);}}_define_property$2(Skybox,"scriptName","skybox");

var skybox = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Skybox: Skybox
});

function _define_property$1(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class Ministats extends Script{initialize(){const options=MiniStats.getDefaultOptions();options.cpu.enabled=false;options.stats=options.stats.filter(s=>s.name!=="DrawCalls");options.stats.push({name:"VRAM",stats:["vram.tex"],decimalPlaces:1,multiplier:1/(1024*1024),unitsName:"MB",watermark:1024},{name:"Splats",stats:["frame.gsplats"],decimalPlaces:3,multiplier:1/1e6,unitsName:"M",watermark:5});this._miniStats=new MiniStats(this.app,options);}}_define_property$1(Ministats,"scriptName","ministats");

var ministats = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Ministats: Ministats
});

function _define_property(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}class DepthOnlyMaterial extends Script{initialize(){const apply=()=>{const m=this.material?.resource;if(!m){return}m.redWrite=false;m.greenWrite=false;m.blueWrite=false;m.alphaWrite=false;m.update();};if(this.material?.resource){apply();}else if(this.material){this.material.ready(apply);this.app.assets.load(this.material);}}constructor(...args){super(...args),_define_property(this,"material",null);}}_define_property(DepthOnlyMaterial,"scriptName","depthOnlyMaterial");

var depthOnlyMaterial = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DepthOnlyMaterial: DepthOnlyMaterial
});

export { picker as $, churchOrbitController as A, walkController as B, animController as C, flightController as D, walkSource as E, index$2 as F, voxelDebugOverlay as G, meshDebugOverlay as H, inputFrame as I, domEventSource as J, gamepad as K, movementState$1 as L, keyboardMouse as M, shared as N, touch as O, trackpad as P, controlScheme as Q, tuning as R, fly as S, orbit as T, walk as U, inputController as V, index$1 as W, cursorRing as X, sceneProbe as Y, navCursor as Z, navInteraction as _, meshCollision as a, waypointGraph as a0, index as a1, cameraBridge as a2, navBridge as a3, freezeFade as a4, cameraFrame as a5, annotationManager as a6, soundManager as a7, resolutionCap as a8, loadingIndicator as a9, carAnimator as aa, skybox as ab, ministats as ac, depthOnlyMaterial as ad, index$4 as b, collision as c, math as d, dollhouseMode as e, animCursor as f, gsplatManager as g, animState as h, inputHander as i, createRotateTrack$1 as j, createFigure8Track$1 as k, createFlightTrack$1 as l, modeManager as m, index$3 as n, cameraUtils as o, spawnState as p, sphereMover as q, findSpawn as r, spline as s, targetNavigation as t, flyController as u, voxelCollision as v, walkMode as w, flySource as x, camera as y, annotationOrbitController as z };
