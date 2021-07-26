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