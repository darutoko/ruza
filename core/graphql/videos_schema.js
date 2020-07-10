let fs = require("fs")
let cp = require("child_process")
let https = require("https")
let { GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLString } = require("graphql")

let { directoryType, fileType, serviceType, streamType } = require("./videos_types")
let RegVideoFiles = /\.(?:mkv|mp4|avi|flv|mpg|mpeg)$/i

module.exports = {
	query: {
		videoDisk: {
			type: new GraphQLList(fileType),
			description: "Directory content",
			args: {
				directory: {
					type: new GraphQLNonNull(directoryType),
				},
				path: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			async resolve(source, arguments, context, info) {
				let path = cleanPath(arguments.path)
				return fs
					.readdirSync(arguments.directory + path, { withFileTypes: true })
					.filter(d => !d.isFile() || RegVideoFiles.test(d.name))
					.sort((a, b) => (a.isFile() === b.isFile() ? a.name.localeCompare(b.name) : a.isFile() ? 1 : -1))
			},
		},

		videoInternet: {
			type: new GraphQLList(streamType),
			description: "Directory content",
			args: {
				service: {
					type: new GraphQLNonNull(serviceType),
				},
			},
			resolve(source, arguments, context, info) {
				if (arguments.service === "twitch")
					return new Promise((resolve, reject) => {
						let url = new URL("https://api.twitch.tv/kraken/streams/followed")
						https.get(
							{
								agent: false,
								hostname: url.hostname,
								path: url.pathname,
								headers: {
									accept: "application/vnd.twitchtv.v5+json",
									"Client-ID": process.env.TWITCH_CLIENT_ID,
									Authorization: "OAuth " + process.env.TWITCH_OAUTH_TOKEN,
								},
							},
							response => {
								let error

								if (response.statusCode !== 200) error = new Error("Request Failed.\n" + `Status Code: ${response.statusCode}`)
								else if (!/^application\/json/.test(response.headers["content-type"]))
									error = new Error(
										"Invalid content-type.\n" + `Expected application/json but received ${response.headers["content-type"]}`
									)

								if (error) {
									response.resume()
									reject(error.message)
									return
								}

								let rawData = ""
								response.setEncoding("utf8")
								response.on("data", chunk => {
									rawData += chunk
								})
								response.on("end", () => {
									try {
										const parsedData = JSON.parse(rawData)
										resolve(
											parsedData.streams.map(stream => ({
												name: stream.channel.display_name,
												game: stream.channel.game,
												status: stream.channel.status,
											}))
										)
									} catch (error) {
										reject(error.message)
									}
								})
							}
						)
					})
			},
		},
	},

	mutation: {
		videoStart: {
			type: GraphQLBoolean,
			description: "Start video playback",
			args: {
				directory: {
					type: new GraphQLNonNull(directoryType),
				},
				path: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			async resolve(source, { directory, path }, context, info) {
				path = cleanPath(path)
				if (!(fs.statSync(directory + path).isFile() && RegVideoFiles.test(path))) throw new Error("Path does not point to a video")
				cp.exec(`vlc "${directory + path}" -f &`)
			},
		},
		videoStop: {
			type: GraphQLBoolean,
			description: "Stop video playback",
			resolve(source, arguments, context, info) {
				return false
				try {
					cp.exec(`taskkill /IM vlc.exe*`)
					return true
				} catch (error) {
					return // rejectedPromise(error.message)
				}
			},
		},
		volumeChange: {
			type: GraphQLBoolean,
			description: "Cange system volume",
			args: {
				multiplier: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return false
				let volume = 3276 * arguments.multiplier
				try {
					cp.exec(`"d:\\Porto Files\\NirSoft\\NirSoft\\nircmd.exe" changesysvolume  ${volume}`)
					return true
				} catch (error) {
					return // rejectedPromise(error.message)
				}
			},
		},
		twitchStart: {
			type: GraphQLBoolean,
			description: "Start twitch stream playback",
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				return false
				try {
					cp.exec(`start "" "livestreamer" twitch.tv/${arguments.name} 360p`)
					return true
				} catch (error) {
					return // rejectedPromise(error.message)
				}
			},
		},
	},
}

function cleanPath(path) {
	return path.replace(/\.\.([\/\\]+|$)/g, "").replace(/^[\/\\]+/, "")
}
/*
> longhelp
+----[ CLI commands ]
| add XYZ  . . . . . . . . . . . . . . . . . . . . add XYZ to playlist
| enqueue XYZ  . . . . . . . . . . . . . . . . . queue XYZ to playlist
| playlist . . . . . . . . . . . . .  show items currently in playlist
| search [string]  . .  search for items in playlist (or reset search)
| delete [X] . . . . . . . . . . . . . . . . delete item X in playlist
| move [X][Y]  . . . . . . . . . . . . move item X in playlist after Y
| sort key . . . . . . . . . . . . . . . . . . . . . sort the playlist
| sd [sd]  . . . . . . . . . . . . . show services discovery or toggle
| play . . . . . . . . . . . . . . . . . . . . . . . . . . play stream
| stop . . . . . . . . . . . . . . . . . . . . . . . . . . stop stream
| next . . . . . . . . . . . . . . . . . . . . . .  next playlist item
| prev . . . . . . . . . . . . . . . . . . . .  previous playlist item
| goto, gotoitem . . . . . . . . . . . . . . . . .  goto item at index
| repeat [on|off]  . . . . . . . . . . . . . .  toggle playlist repeat
| loop [on|off]  . . . . . . . . . . . . . . . .  toggle playlist loop
| random [on|off]  . . . . . . . . . . . . . .  toggle playlist random
| clear  . . . . . . . . . . . . . . . . . . . . .  clear the playlist
| status . . . . . . . . . . . . . . . . . . . current playlist status
| title [X]  . . . . . . . . . . . . . . set/get title in current item
| title_n  . . . . . . . . . . . . . . . .  next title in current item
| title_p  . . . . . . . . . . . . . .  previous title in current item
| chapter [X]  . . . . . . . . . . . . set/get chapter in current item
| chapter_n  . . . . . . . . . . . . . .  next chapter in current item
| chapter_p  . . . . . . . . . . . .  previous chapter in current item
| 
| seek X . . . . . . . . . . . seek in seconds, for instance `seek 12'
| pause  . . . . . . . . . . . . . . . . . . . . . . . .  toggle pause
| fastforward  . . . . . . . . . . . . . . . . . . set to maximum rate
| rewind . . . . . . . . . . . . . . . . . . . . . set to minimum rate
| faster . . . . . . . . . . . . . . . . . .  faster playing of stream
| slower . . . . . . . . . . . . . . . . . .  slower playing of stream
| normal . . . . . . . . . . . . . . . . . .  normal playing of stream
| rate [playback rate] . . . . . . . . . .  set playback rate to value
| frame  . . . . . . . . . . . . . . . . . . . . . play frame by frame
| fullscreen, f, F [on|off]  . . . . . . . . . . . . toggle fullscreen
| info [X] . .  information about the current stream (or specified id)
| stats  . . . . . . . . . . . . . . . .  show statistical information
| get_time . . . . . . . . .  seconds elapsed since stream's beginning
| is_playing . . . . . . . . . . . .  1 if a stream plays, 0 otherwise
| get_title  . . . . . . . . . . . . . the title of the current stream
| get_length . . . . . . . . . . . .  the length of the current stream
| 
| volume [X] . . . . . . . . . . . . . . . . . .  set/get audio volume
| volup [X]  . . . . . . . . . . . . . . .  raise audio volume X steps
| voldown [X]  . . . . . . . . . . . . . .  lower audio volume X steps
| achan [X]  . . . . . . . . . . . .  set/get stereo audio output mode
| atrack [X] . . . . . . . . . . . . . . . . . . . set/get audio track
| vtrack [X] . . . . . . . . . . . . . . . . . . . set/get video track
| vratio [X] . . . . . . . . . . . . . . .  set/get video aspect ratio
| vcrop, crop [X]  . . . . . . . . . . . . . . . .  set/get video crop
| vzoom, zoom [X]  . . . . . . . . . . . . . . . .  set/get video zoom
| vdeinterlace [X] . . . . . . . . . . . . . set/get video deinterlace
| vdeinterlace_mode [X]  . . . . . . .  set/get video deinterlace mode
| snapshot . . . . . . . . . . . . . . . . . . . . take video snapshot
| strack [X] . . . . . . . . . . . . . . . . .  set/get subtitle track
| hotkey, key [hotkey name]  . . . . . . . . . . simulate hotkey press
| 
| vlm  . . . . . . . . . . . . . . . . . . . . . . . . .  load the VLM
| set [var [value]]  . . . . . . . . . . . . . . . . . set/get env var
| save_env . . . . . . . . . . . .  save env vars (for future clients)
| alias [cmd]  . . . . . . . . . . . . . . . . set/get command aliases
| description  . . . . . . . . . . . . . . . . .  describe this module
| license  . . . . . . . . . . . . . . . . print VLC's license message
| help, ? [pattern]  . . . . . . . . . . . . . . . . .  a help message
| longhelp [pattern] . . . . . . . . . . . . . . a longer help message
| lock . . . . . . . . . . . . . . . . . . . .  lock the telnet prompt
| logout . . . . . . . . . . . . . .  exit (if in a socket connection)
| quit . . . . . . . .  quit VLC (or logout if in a socket connection)
| shutdown . . . . . . . . . . . . . . . . . . . . . . .  shutdown VLC
+----[ end of help ]
*/
