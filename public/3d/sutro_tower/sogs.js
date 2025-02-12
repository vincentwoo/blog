import { Asset, BoundingBox, Entity, GSplatInstance, ShaderMaterial, Texture, Vec2, ADDRESS_CLAMP_TO_EDGE, BLEND_NORMAL, CULLFACE_NONE, FILTER_NEAREST, SEMANTIC_ATTR13, SEMANTIC_POSITION } from 'playcanvas';

const loadSogsMeta = async (path) => {
    const response = await fetch(path + '/meta.json');
    return await response.json();
};

const loadSogsTextures = async (meta, assets, path) => {
    const textures = {};

    await Promise.all(Object.entries(meta)
            .flatMap(([key, attr]) => attr.files)
            .map((filename) => {
        const name = filename.split('.')[0]
        const asset = new Asset(name, 'texture', {
            url: `${path}/${filename}`,
            filename
        }, {
            mipmaps: false
        });

        assets.add(asset);
        assets.load(asset);

        return new Promise((resolve, reject) => {
            asset.on('load', () => {
                textures[name] = asset.resource;
                resolve();
            });

            asset.on('error', (err) => {
                reject(err);
            });
        });
    }));

    return textures;
}

const vs = /* glsl */`
#include "gsplatVS"
`;

const fs = /* glsl */`
#include "gsplatPS"
`;

const gsplatDataVS = /* glsl */`
uniform highp sampler2D means_u;
uniform highp sampler2D means_l;
uniform highp sampler2D quats;
uniform highp sampler2D scales;

uniform vec3 means_mins;
uniform vec3 means_maxs;

uniform vec3 quats_mins;
uniform vec3 quats_maxs;

uniform vec3 scales_mins;
uniform vec3 scales_maxs;

// read the model-space center of the gaussian
vec3 readCenter(SplatSource source) {
    vec3 u = texelFetch(means_u, source.uv, 0).xyz;
    vec3 l = texelFetch(means_l, source.uv, 0).xyz;
    vec3 n = (l + u * 256.0) / 257.0;

    vec3 v = mix(means_mins, means_maxs, n);
    return sign(v) * (exp(abs(v)) - 1.0);
}

mat3 quatToMat3(vec3 R) {
    float x = R.x;
    float y = R.y;
    float z = R.z;
    float w2 = clamp(1.0 - (x*x + y*y + z*z), 0.0, 1.0);
    float w  = sqrt(w2);
    return mat3(
        1.0 - 2.0 * (z * z + w2),
              2.0 * (y * z + x * w),
              2.0 * (y * w - x * z),
              2.0 * (y * z - x * w),
        1.0 - 2.0 * (y * y + w2),
              2.0 * (z * w + x * y),
              2.0 * (y * w + x * z),
              2.0 * (z * w - x * y),
        1.0 - 2.0 * (y * y + z * z)
    );
}

// sample covariance vectors
void readCovariance(in SplatSource source, out vec3 covA, out vec3 covB) {
    vec3 quat = mix(quats_mins, quats_maxs, texelFetch(quats, source.uv, 0).xyz);
    mat3 rot = quatToMat3(quat);
    vec3 scale = exp(mix(scales_mins, scales_maxs, texelFetch(scales, source.uv, 0).xyz));

    // M = S * R
    mat3 M = transpose(mat3(
        scale.x * rot[0],
        scale.y * rot[1],
        scale.z * rot[2]
    ));

    covA = vec3(dot(M[0], M[0]), dot(M[0], M[1]), dot(M[0], M[2]));
    covB = vec3(dot(M[1], M[1]), dot(M[1], M[2]), dot(M[2], M[2]));
}
`;

const gsplatColorVS = /* glsl */`

uniform mediump sampler2D sh0;
uniform mediump sampler2D opacities;

uniform vec3 sh0_mins;
uniform vec3 sh0_maxs;

uniform float opacities_mins;
uniform float opacities_maxs;

float SH_C0 = 0.28209479177387814;

vec4 readColor(in SplatSource source) {
    vec3 clr = mix(sh0_mins, sh0_maxs, texelFetch(sh0, source.uv, 0).xyz);
    float opacity = mix(opacities_mins, opacities_maxs, texelFetch(opacities, source.uv, 0).x);

    return vec4(vec3(0.5) + clr * SH_C0, 1.0 / (1.0 + exp(opacity * -1.0)));
}
`;

const gsplatSHVS = /* glsl */`

uniform highp sampler2D shN_labels_u;
uniform highp sampler2D shN_labels_l;
uniform highp sampler2D shN_centroids;

uniform float shN_mins;
uniform float shN_maxs;

void readSHData(in SplatSource source, out vec3 sh[15], out float scale) {
    int hi = int(floor(texelFetch(shN_labels_u, source.uv, 0).x * 255.0 + 0.5));
    int lo = int(floor(texelFetch(shN_labels_l, source.uv, 0).x * 255.0 + 0.5));
    int label = (hi << 8) + lo;
    ivec2 uv = ivec2(15 * (label % 64), label / 64);

    vec3 mins = vec3(shN_mins);
    vec3 maxs = vec3(shN_maxs);
    for (int i = 0; i < 15; i++) {
        sh[i] = mix(mins, maxs, texelFetch(shN_centroids, uv + ivec2(i, 0), 0).xyz);
    }
    scale = 1.0;
}

void readSHData(in SplatSource source, out vec3 sh[8], out float scale) {
    int hi = int(floor(texelFetch(shN_labels_u, source.uv, 0).x * 255.0 + 0.5));
    int lo = int(floor(texelFetch(shN_labels_l, source.uv, 0).x * 255.0 + 0.5));
    int label = (hi << 8) + lo;
    ivec2 uv = ivec2(8 * (label % 64), label / 64);

    vec3 mins = vec3(shN_mins);
    vec3 maxs = vec3(shN_maxs);
    for (int i = 0; i < 8; i++) {
        sh[i] = mix(mins, maxs, texelFetch(shN_centroids, uv + ivec2(i, 0), 0).xyz);
    }
    scale = 1.0;
}

void readSHData(in SplatSource source, out vec3 sh[3], out float scale) {
    int hi = int(floor(texelFetch(shN_labels_u, source.uv, 0).x * 255.0 + 0.5));
    int lo = int(floor(texelFetch(shN_labels_l, source.uv, 0).x * 255.0 + 0.5));
    int label = (hi << 8) + lo;
    ivec2 uv = ivec2(3 * (label % 64), label / 64);

    vec3 mins = vec3(shN_mins);
    vec3 maxs = vec3(shN_maxs);
    for (int i = 0; i < 3; i++) {
        sh[i] = mix(mins, maxs, texelFetch(shN_centroids, uv + ivec2(i, 0), 0).xyz);
    }
    scale = 1.0;
}
`;

const readImageData = (imageBitmap) => {
    const offscreen = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = offscreen.getContext('2d');
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(imageBitmap, 0, 0);
    return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height).data;
};

class SogsData {
    device;

    constructor(meta, textures) {
        const { device } = textures['means_l'];

        this.device = device;
        this.meta = meta;
        this.textures = textures;
        this.numSplats = meta.means.shape[0];
        this.numSplatsVisible = this.numSplats;

        this.centers = new Float32Array(this.numSplats * 3);
        this.aabb = new BoundingBox();

        const lerp = (a, b, t) => a * (1 - t) + b * t;

        // extract means for centers
        const means = this.meta.means;
        const meansU = readImageData(textures['means_u']._levels[0]);
        const meansL = readImageData(textures['means_l']._levels[0]);

        // combine high and low
        for (let i = 0; i < this.numSplats; i++) {
            const nx = lerp(means.mins[0], means.maxs[0], ((meansU[i * 4 + 0] << 8) + meansL[i * 4 + 0]) / 65535);
            const ny = lerp(means.mins[1], means.maxs[1], ((meansU[i * 4 + 1] << 8) + meansL[i * 4 + 1]) / 65535);
            const nz = lerp(means.mins[2], means.maxs[2], ((meansU[i * 4 + 2] << 8) + meansL[i * 4 + 2]) / 65535);

            this.centers[i * 3 + 0] = Math.sign(nx) * (Math.exp(Math.abs(nx)) - 1);
            this.centers[i * 3 + 1] = Math.sign(ny) * (Math.exp(Math.abs(ny)) - 1);
            this.centers[i * 3 + 2] = Math.sign(nz) * (Math.exp(Math.abs(nz)) - 1);
        }

        this.aabb.compute(this.centers);
    }

    destroy() {
        this.textures.forEach((texture) => texture.destroy());
    }

    createMaterial(options) {
        const result = new ShaderMaterial({
            uniqueName: 'sogsMaterial',
            attributes: {
                vertex_position: SEMANTIC_POSITION,
                vertex_id_attrib: SEMANTIC_ATTR13
            },
            vertexCode: vs,
            fragmentCode: fs
        });

        result.cull = CULLFACE_NONE;
        result.blendType = BLEND_NORMAL;
        result.depthWrite = false;
        result.chunks = {
            gsplatDataVS,
            gsplatColorVS,
            gsplatSHVS
        };

        const sh_coeffs = this.meta.shN ? this.meta.shN.shape[1] / 3 : 0;
        let sh_bands = [0, 3, 8, 15].indexOf(sh_coeffs);
        sh_bands = sh_bands == -1 ? 0 : sh_bands;
        result.setDefine('SH_BANDS', sh_bands);
        result.setDefine('DITHER_NONE', 1);

        Object.entries(this.textures).forEach(([name, texture]) => {
            result.setParameter(name, texture);
        });

        Object.entries(this.meta).forEach(([name, meta]) => {
            if (meta.mins && meta.maxs) {
                result.setParameter(`${name}_mins`, meta.mins);
                result.setParameter(`${name}_maxs`, meta.maxs);
            }
        });
        
        return result;
    }

    evalTextureSize(count) {
        const t = this.textures['means_u'];
        return new Vec2(t.width, t.height);
    }

    createTexture(name, format, size, data) {
        return new Texture(this.device, {
            name: name,
            width: size.x,
            height: size.y,
            format: format,
            cubemap: false,
            mipmaps: false,
            minFilter: FILTER_NEAREST,
            magFilter: FILTER_NEAREST,
            addressU: ADDRESS_CLAMP_TO_EDGE,
            addressV: ADDRESS_CLAMP_TO_EDGE,
            ...(data ? { levels: [data] } : { })
        });
    }
};

export async function createSogs(app, path) {
    // load data
    const meta = await loadSogsMeta(path);
    const textures = await loadSogsTextures(meta, app.assets, path);

    // create sogs data
    const sogsData = new SogsData(meta, textures);

    // create sogs instance
    const instance = new GSplatInstance(sogsData);

    // constuct the entity
    const entity = new Entity();
    const component = entity.addComponent('gsplat', { instance });
    component.customAabb = instance.splat.aabb.clone();

    return entity;
};
