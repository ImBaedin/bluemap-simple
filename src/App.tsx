import React, { useEffect } from "react";
import BlueMap from 'BlueMap';

import BlueControl from './BlueControl';

interface Props{
	
}

function App(props: Props) {


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
						BlueControl(window.bluemap, json.locations);
					}
				});
			}
		}

		setUpBlueMap();
	});

	if(uiDisabled) return(<></>);

	return (
		<div>
			<span>Hi</span>
		</div>
	);
}

export default App;
