function rescaleData(data, meta, bits = 8) {
  const len = meta.shape[0]
  const dim = (meta.shape[1] || 1) * (meta.shape[2] || 1)
  let scales = new Float32Array(dim)
  const norm = (2 ** bits) - 1

  const ret = []
  for (let j = 0; j < dim; j++) {
    ret.push(new Float32Array(len))
    scales[j] = meta.maxs[j] - meta.mins[j]
  }

  for (let i = 0; i < len; i ++) {
    for (let j = 0; j < dim; j++) {
      ret[j][i] =
        (data[i * 4 + j] / norm) * scales[j] + meta.mins[j]
    }
  }

  return ret
}

function mergeMeans(lower, upper, meta) {
  const len = meta.shape[0]
  const dim = (meta.shape[1] || 1) * (meta.shape[2] || 1)
  let scales = new Float32Array(dim)
  const norm = (2 ** 16) - 1

  const ret = []
  for (let j = 0; j < dim; j++) {
    ret.push(new Float32Array(len))
    scales[j] = meta.maxs[j] - meta.mins[j]
  }

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < dim; j++) {
      let u = (upper[i * 4 + j] << 8) + lower[i * 4 + j]
      u = (u / norm) * scales[j] + meta.mins[j]
      u = Math.sign(u) * (Math.exp(Math.abs(u)) - 1)
      ret[j][i] = u
    }
  }

  return ret
}

function decompressKmeans(centroids, labels_l, labels_u, meta) {
  const scale = meta.maxs - meta.mins
  const norm = (2 ** meta.quantization) - 1
  const len = meta.shape[0]
  const dim = (meta.shape[1] || 1) * (meta.shape[2] || 1)
  const ret = []

  const labels = new Uint16Array(len)
  for (let i = 0; i < len; i++) {
    labels[i] = (labels_u[i * 4] << 8) + labels_l[i * 4]
  }
  for (let j = 0; j < dim; j++) ret.push(new Float32Array(labels.length))

  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < dim; j++) {
      let k = labels[i] * dim + (3 * (j % 15) + Math.floor(j / 15))
      k = Math.floor(k / 3) * 4 + k % 3
      const centroid = centroids[k]
      ret[j][i] = (centroid / norm) * scale + meta.mins
    }
  }
  return ret
}
export async function loadFromURL(path) {
  const meta = await fetch(path + '/meta.json').then(response => response.json())
  return load(path, meta)
}

async function load(path, meta) {
  const data = {}
  return Promise.all(Object.entries(meta).map(([param, _meta]) => {
      return Promise.all(
        _meta.files.map(file => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = new OffscreenCanvas(img.width, img.height)
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)
                resolve(ctx.getImageData(0, 0, img.width, img.height).data)
            }
            img.onerror = reject
            img.src = path + '/' + file
          })
        })
      ).then(files => {
        if (param == 'means') {
          data[param] = mergeMeans(files[0], files[1], _meta)
        } else if (param == 'shN') {
          data[param] = decompressKmeans(files[0], files[1], files[2], _meta)
        } else {
          data[param] = rescaleData(files[0], _meta)
        }
      })
    })
  ).then(() => data)
}

export async function loadGsplatDataFromURL(path) {
  const rawData = await loadFromURL(path)

  const members = ['x', 'y', 'z', 'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity', 'scale_0', 'scale_1', 'scale_2', 'rot_0', 'rot_1', 'rot_2', 'rot_3'];
  const shMembers = [];
  for (let i = 0; i < 45; ++i) {
    shMembers.push(`f_rest_${i}`);
  }
  members.splice(members.indexOf('f_dc_2') + 1, 0, ...shMembers);

  rawData.quats[3] = new Float32Array(rawData.quats[0].length)
  for (let i = 0; i < rawData.quats[0].length; i++) {
    const x = rawData.quats[0][i]
    const y = rawData.quats[1][i]
    const z = rawData.quats[2][i]
    let w2 = 1.0 - (x*x + y*y + z*z)
    if (w2 < 0) w2 = 0
    if (w2 > 1) w2 = 1
    rawData.quats[3][i] = Math.sqrt(w2);
  }

  const data = {};
  data.x = rawData.means[0]
  data.y = rawData.means[1]
  data.z = rawData.means[2]
  data.opacity = rawData.opacities[0]
  data.scale_0 = rawData.scales[0]
  data.scale_1 = rawData.scales[1]
  data.scale_2 = rawData.scales[2]
  data.rot_0 = rawData.quats[0]
  data.rot_1 = rawData.quats[1]
  data.rot_2 = rawData.quats[2]
  data.rot_3 = rawData.quats[3]
  data.f_dc_0 = rawData.sh0[0]
  data.f_dc_1 = rawData.sh0[1]
  data.f_dc_2 = rawData.sh0[2]
  for (let _c = 0; _c < 45; ++_c) {
    data[`f_rest_${_c}`] = rawData.shN[_c];
  }

  return [{
    name: 'vertex',
    count: data.x.length,
    properties: members.map(name => {
      return {
        name: name,
        type: 'float',
        byteSize: 4,
        storage: data[name]
      };
    })
  }];
}