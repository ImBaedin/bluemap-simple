
# BlueMap - Simple
[BlueMap](https://github.com/BlueMap-Minecraft/BlueMap) is a (very cool) dynamic, live map for Minecraft servers running Spigot/Paper. I wanted an automatic way to show off builds, so that's what this is.

I ripped the bluemap files from [BlueMapVue](https://github.com/BlueMap-Minecraft/BlueMapVue) and [BlueMapWeb](https://github.com/BlueMap-Minecraft/BlueMapWeb). That's all the stuff in the `src/BlueMap` directory. I had to modify the files a bit to stop the bundler from compiling, as well as added types to some of the files for that sweet intellisense.

I guess I should mention that the animation only activates with the URL parameter `uiDisabled` set to `true`. EX: `https://blue.simple-sv.com/?uiDisabled=true`.

## How
All of the interesting camera control code is in `/src/BlueControl.ts`. I'm not *super* familiar with Three.JS, so some of this may not be best practice but it works. The first step is setting the map to free flight: 
```ts
	...
	// map: Bluemap
	map.setFreeFlight(0,  locations[ind].coords.y);
	...
```
Changing the camera location is easy. We have access to the Three.JS camera, but changing that won't affect the mesh being updated, so we use the abstracted controls provided by BlueMap:
```ts
	...
	const controls = map.mapViewer.controlsManager;
	
	const newCoords: THREE.Vector3 = ...;
	
	controls.position.lerp(newCoords, 0.02);
	...
```
The camera rotation was more of a challenge. I didn't feel like learning quaternions, so I piggy backed on the Three.JS function `lookat`. The angle is provided in the location data:
```ts
	// cam: THREE.Vector3 
	camera.lookAt(cam);
	camera.rotation.order = 'YXZ';
	const heading = camera.rotation.y;
	const radians = heading > 0 ? heading : (2 * Math.PI) + heading;
	
	controls.rotation = -radians;
	controls.angle = angle * (Math.PI/180);
```

## Locations
The locations are pulled from `https://api.jsonbin.io/b/60f88a1ca263d14a297973e5/latest`. This data also includes the URL of the bluemap we want to use, as well as the server name, which is used in the title.
This is the layout of that data.
```ts
	export type coords = {
		x: number,
		y: number,
		z: number
	}

	export interface Location{
		name: string,
		world: string,
		coords: coords,
		radius: number,
		angle: number
	}
```
(Worlds aren't supported I just figured I might eventually do that.)

## Proxy
Pointing this at an existing BlueMap server won't work due to the server having a limited CORs policy. I got around this in my case by making a simple proxy that also modifys the headers. This is just running on a free heroku server.
```js
const httpProxy = require('http-proxy');

const port = process.env.PORT || 3000;

let proxy = httpProxy.createProxyServer({target:'http://144.217.10.140:25566'}).listen(port);
proxy.on('proxyRes', function(proxyRes, req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
});

proxy.on('error', function (err, req, res) {
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});
	res.end('Something went wrong. Restarting...');
	console.log('Error with proxy: ', err);
});
```