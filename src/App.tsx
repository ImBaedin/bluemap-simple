import React, { useEffect } from "react";
import BlueMap from 'BlueMap';

import BlueControl from './BlueControl';
import {Location, coords} from 'types';
import { useState } from "react";

interface Props{
	
}

function App(props: Props) {
	let [locName, setLocName] = useState<string>('');
	let [coords, setCoords] = useState<string>('');


	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const uiDisabled = urlParams.get('uiDisabled')?.includes('true');

	useEffect(()=>{

		async function setUpBlueMap(){
			const res = await fetch('https://api.jsonbin.io/b/60f88a1ca263d14a297973e5/latest');
			if(res.ok){
				const json = await res.json();
				
				const map = document.getElementById('map')
				if(map) window.bluemap = new BlueMap(map, json.bluemapURL, json.serverName);
				window.bluemap.load().finally(()=>{
					if(uiDisabled){
						console.log('Automating travel')
						BlueControl(window.bluemap, json.locations, (loc: Location)=>{
							let {name, coords} = loc;
							setLocName(name);
							setCoords(`${coords.x}, ${coords.y}, ${coords.z}`);
						});
					}
				});
			}
		}

		setUpBlueMap();
	}, []);

	if(uiDisabled) return(
		<div id="nametag">
			You're viewing&nbsp;
			<span className="location">
				{locName}
			</span>
			&nbsp;-&nbsp;
			Located at&nbsp;
			<span className="coords">
				{coords}
			</span>
		</div>
	);

	return (
		<div>
			<span>Hi</span>
		</div>
	);
}

export default App;
