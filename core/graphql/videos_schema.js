let fs = require("fs");
let cp = require("child_process");
let { GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLString } = require("graphql");

let { rejectedPromise } = require("./tools");
let { directoryType, fileType } = require("./videos_types");
let RegVideoFiles = /\.(?:mkv|mp4|avi|flv|mpg|mpeg)$/i;

module.exports = {
	query: {
		ls: {
			type: new GraphQLList(fileType),
			description: "Directory content",
			args: {
				directory: {
					type: new GraphQLNonNull(directoryType)
				},
				path: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve(source, {directory, path}, context, info) {
				path = cleanPath(path);
				return fs.readdirSync(directory + path, {withFileTypes: true})
					.filter(d => !d.isFile() || RegVideoFiles.test(d.name))
					.sort((a, b) => a.isFile() === b.isFile() ? a.name.localeCompare(b.name) : a.isFile() ? 1 : -1);
			}
		},
	},

	mutation: {
		videoStart: {
			type: GraphQLBoolean,
			description: "Start video playback",
			args: {
				directory: {
					type: new GraphQLNonNull(directoryType)
				},
				path: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve(source, {directory, path}, context, info) {
				path = cleanPath(path);
				try {
					if (!( fs.statSync(directory + path).isFile() && RegVideoFiles.test(path) )) return rejectedPromise("Path does not point to a video");
					cp.exec(`start "" "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe" "${directory + path}" -f`);
					return true;
				} catch (error) {
					return rejectedPromise(error.message);
				}
			}
		},
		videoStop: {
			type: GraphQLBoolean,
			description: "Stop video playback",
			resolve(source, arguments, context, info) {
				try {
					cp.exec(`taskkill /IM vlc.exe*`);
					return true;
				} catch (error) {
					return rejectedPromise(error.message);
				}
			}
		},
		volumeChange: {
			type: GraphQLBoolean,
			description: "Cange system volume",
			args: {
				multiplier: {
					type: new GraphQLNonNull(GraphQLInt)
				},
			},
			resolve(source, arguments, context, info) {
				let volume = 3276 * arguments.multiplier;
				try {
					cp.exec(`"d:\\Porto Files\\NirSoft\\NirSoft\\nircmd.exe" changesysvolume  ${volume}`);
					return true;
				} catch (error) {
					return rejectedPromise(error.message);
				}
			}
		},
	}
}

function cleanPath (path) {
	return path.replace(/\.\.([\/\\]+|$)/g, '').replace(/^[\/\\]+/, '');
}
