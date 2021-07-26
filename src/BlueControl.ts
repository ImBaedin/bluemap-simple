import Bluemap from 'BlueMap';
import * as THREE from 'three';

type coords = {
	x: number,
	y: number,
	z: number
}

interface Location{
	name: string,
	world: string,
	coords: coords,
	radius: number,
	angle: number
}

function coordsToVec(c: coords){
	return new THREE.Vector3(c.x, c.y, c.z);
}

const changeLocInterval = 10000;

let locations: Location[];
let cameraTargetLoc = new THREE.Vector3(0,0,0); 
let orbitTargetLoc = new THREE.Vector3(0,0,0);
let radius = 0;
let angle = 0;

let prevIndex = 0;
let curIndex = 0;
async function changeLocation(index: number){
	prevIndex = curIndex;
	curIndex = index;


	let start = performance.now();

	let loc = locations[index];
	let {coords, angle:ang, radius:rad, name} = loc;

	let newCoords = coordsToVec(coords);

	cameraTargetLoc = coordsToVec(locations[prevIndex].coords);
	orbitTargetLoc = coordsToVec(locations[prevIndex].coords);

	let animate = () => {
		let perc = (performance.now() - start) / changeLocInterval;

		angle = THREE.MathUtils.lerp(ang, angle, .02);
		radius = THREE.MathUtils.lerp(rad, radius, .02);

		cameraTargetLoc.lerp(newCoords, 0.02);
		orbitTargetLoc.lerp(newCoords, 0.02);


		if(perc >= 1){
			return;
		}
		requestAnimationFrame(animate);
	}
	animate();
}

export default function(map: Bluemap, locs: Location[]){
	const controls = map.mapViewer.controlsManager;
	const camera = controls.camera as THREE.Camera;

	locations = locs;

	let ind = 0;
	changeLocation(ind);

	map.setFreeFlight(0, locations[ind].coords.y);

	setInterval(()=>{
		ind++;
		if(ind === locations.length){
			ind = 0;
		}
		changeLocation(ind);
	}, changeLocInterval);

	const animate = () =>{
		const orbit = orbitTargetLoc;
		const cam = cameraTargetLoc;

		const newCoords = new THREE.Vector3((Math.sin(performance.now()/1000/3) * radius) + orbit.x, orbit.y, (Math.cos(performance.now()/1000/3) * radius) + orbit.z);

		// Orbit the location
		controls.position.lerp(newCoords, 0.02);
		
		camera.lookAt(cam);
		camera.rotation.order = 'YXZ';
		const heading = camera.rotation.y;
		const radians = heading > 0 ? heading : (2 * Math.PI) + heading;

		controls.rotation = -radians;
		controls.angle = angle * (Math.PI/180);

		requestAnimationFrame(animate);
	}

	animate();
}