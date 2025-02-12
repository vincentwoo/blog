import { decode } from 'fast-png'

const dataPaths = [
	['means', ['means_u.png', 'means_l.png']],
	['opacities', ['opacities.png']],
	['quats', ['quats.png']],
	['scales', ['scales.png']],
	['sh0', ['sh0.png']],
	['shN', ['centroids.png', 'labels_u.png', 'labels_l.png']],
]

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
				(data[i * dim + j] / norm) * scales[j] + meta.mins[j]
		}
	}

	return ret
}

function mergeMeans(upper, lower, meta) {
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
			let u = (upper[i * dim + j] << 8) + lower[i * dim + j]
			u = (u / norm) * scales[j] + meta.mins[j]
			u = Math.sign(u) * (Math.exp(Math.abs(u)) - 1)
			ret[j][i] = u
		}
	}

	return ret
}

function decompressKmeans(centroids, labels_u, labels_l, meta) {
	const scale = meta.maxs - meta.mins
	const norm = (2 ** meta.quantization) - 1
	const dim = meta.shape[1] * meta.shape[2]
	const ret = []
	const labels = new Uint16Array(labels_u.length)
	for (let i = 0; i < labels_u.length; i++) {
		labels[i] = (labels_u[i] << 8) + labels_l[i]
	}
	for (let j = 0; j < dim; j++) ret.push(new Float32Array(labels.length))

	for (let i = 0; i < labels.length; i++) {
		for (let j = 0; j < dim; j++) {
			const centroid = centroids[labels[i] * dim + (3 * (j % 15) + Math.floor(j / 15))]
			ret[j][i] = (centroid / norm) * scale + meta.mins
		}
 	}
	return ret
}
export async function loadFromURL(path) {
	const meta = await fetch(path + '/meta.json').then(response => response.json())
	return load(path, meta, (fullPath) => fetch(fullPath).then(response => response.arrayBuffer()))
}

async function load(path, meta, getter) {
	const data = {}
	return Promise.all(
		dataPaths.map(([param, files], _, __) => {
			return Promise.all(
				files.map(file => getter(path + '/' + file))
			).then(files => {
				console.time(param)
				if (param == 'means') {
					data[param] = mergeMeans(decode(files[0]).data, decode(files[1]).data, meta.means)
				} else if (param == 'shN') {
					data[param] = decompressKmeans(decode(files[0]).data, decode(files[1]).data, decode(files[2]).data, meta.shN)
				} else {
					data[param] = rescaleData(decode(files[0]).data, meta[param])
				}
				console.timeEnd(param)
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