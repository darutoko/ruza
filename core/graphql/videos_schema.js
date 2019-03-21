let fs = require("fs");
let cp = require("child_process");
let https = require("https");
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
				if (/twitch/i.test(directory)) return new Promise((resolve, reject) => {
					let url = new URL(directory);
					https.get({
						agent: false,
						hostname: url.hostname,
						path: url.pathname,
						headers: {
							accept: "application/vnd.twitchtv.v5+json",
							"Client-ID": process.env.TWITCH_CLIENT_ID,
							"Authorization": "OAuth " + process.env.TWITCH_OAUTH_TOKEN,
						}
					}, response => {
						let error;

						if (response.statusCode !== 200) {
							error = new Error("Request Failed.\n" + `Status Code: ${response.statusCode}`);
						} else if (!/^application\/json/.test(response.headers["content-type"])) {
							error = new Error("Invalid content-type.\n" + `Expected application/json but received ${response.headers["content-type"]}`);
						}

						if (error) {
							response.resume();
							reject(error.message);
							return;
						}
					
						response.setEncoding('utf8');
						let rawData = '';
						response.on('data', chunk => { rawData += chunk; });
						response.on('end', () => {
							try {
								const parsedData = JSON.parse(rawData);
								resolve(parsedData.streams.map(stream => ({name: stream.channel.display_name, isFile: true, description: stream.channel.status})));
							} catch (error) {
								reject(error.message);
							}
						});
					});
				});
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
