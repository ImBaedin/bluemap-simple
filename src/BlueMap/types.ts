import {MainMenu} from "./MainMenu";

export type Coords = {
	x: number,
	y: number,
}

export type TileData = {
	tileSize: Coords,
	scale: Coords,
	translate: Coords
}

export type Settings = {
	useCookies: boolean, 
	freeFlightEnabled: boolean, 
	maps: {
		[key: string]: {
			enabled: boolean,
			hires: TileData,
			lowres: TileData,
			startPos: Coords,
			world: String,
			ordinal: number,
			skyColor: {
				r: number,
				g: number,
				b: number
			},
			ambientLight: number,
			name: string
		}
	}
}

export type AppState = {
	controls: {
		state: String,
		mouseSensitivity: number,
		invertMouse: boolean,
		freeFlightEnabled: boolean,
	},
	menu: MainMenu,
	maps: any,
	theme: String|null,
	debug: boolean
};

export type Animation = {
	animationStart: number,
	lastFrame: number,
	cancelled: boolean,
	frame: (time: number) => void,
	cancel: () => void
};