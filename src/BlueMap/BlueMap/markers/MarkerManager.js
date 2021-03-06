/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {FileLoader, Scene} from "three";
import {MarkerSet} from "./MarkerSet";
import {alert, generateCacheHash} from "../util/Utils";

/**
 * A manager for loading and updating markers from a file
 */
export class MarkerManager {

    /**
     * @constructor
     * @param markerScene {Scene} - The scene to which all markers will be added
     * @param fileUrl {string} - The marker file from which this manager updates its markers
     * @param events {EventTarget}
     */
    constructor(markerScene, fileUrl, events = null, mapUrl) {
        Object.defineProperty(this, 'isMarkerManager', {value: true});

		this.mapUrl = mapUrl;
        this.markerScene = markerScene;
        this.fileUrl = fileUrl;
        this.events = events;

        /** @type {Map<string, MarkerSet>} */
        this.markerSets = new Map();
        /** @type {Map<string, Marker>} */
        this.markers = new Map();

        /** @type {NodeJS.Timeout} */
        this._updateInterval = null;
    }

    /**
     * Sets the automatic-update frequency, setting this to 0 or negative disables automatic updates (default).
     * This is better than using setInterval() on update() because this will wait for the update to finish before requesting the next update.
     * @param ms - interval in milliseconds
     */
    setAutoUpdateInterval(ms) {
        if (this._updateInterval) clearTimeout(this._updateInterval);
        if (ms > 0) {
            let autoUpdate = () => {
                this.update()
                    .then(success => {
                        if (success) {
                            this._updateInterval = setTimeout(autoUpdate, ms);
                        } else {
                            this._updateInterval = setTimeout(autoUpdate, Math.max(ms, 1000 * 15));
                        }
                    })
                    .catch(e => {
                        alert(this.events, e, "warning");
                        this._updateInterval = setTimeout(autoUpdate, Math.max(ms, 1000 * 15));
                    });
            };

            this._updateInterval = setTimeout(autoUpdate, ms);
        }
    }

    /**
     * Loads the marker-file and updates all managed markers.
     * @returns {Promise<object>} - A promise completing when the markers finished updating
     */
    update() {
        return this.loadMarkerFile()
            .then(markerFileData => this.updateFromData(markerFileData));
    }

    /**
     * Stops automatic-updates and disposes all markersets and markers managed by this manager
     */
    dispose() {
        this.setAutoUpdateInterval(0);
        this.markerSets.forEach(markerSet => markerSet.dispose());
    }

    /**
     * Removes all markers managed by this marker-manager
     */
    clear() {
        this.markerSets.forEach(markerSet => this.removeMarkerSet(markerSet.data.id));
    }

    /**
     * @protected
     * Adds a MarkerSet to this Manager, removing any existing markerSet with this id first.
     * @param markerSet {MarkerSet}
     */
    addMarkerSet(markerSet) {
        this.removeMarkerSet(markerSet.data.id);

        this.markerSets.set(markerSet.data.id, markerSet);
        this.markerScene.add(markerSet);
    }

    /**
     * @protected
     * Removes a MarkerSet from this Manager
     * @param setId {string} - The id of the MarkerSet
     */
    removeMarkerSet(setId) {
        let markerSet = this.markerSets.get(setId);

        if (markerSet) {
            this.markerScene.remove(markerSet);
            this.markerSets.delete(setId);
            markerSet.dispose();
        }
    }

    /**
     * @protected
     * Adds a marker to this manager
     * @param markerSet {MarkerSet}
     * @param marker {Marker}
     */
    addMarker(markerSet, marker) {
        this.removeMarker(marker.data.id);

        this.markers.set(marker.data.id, marker);
        markerSet.add(marker);
    }

    /**
     * @protected
     * Removes a marker from this manager
     * @param markerId {string}
     */
    removeMarker(markerId) {
        let marker = this.markers.get(markerId);

        if (marker) {
            if (marker.parent) marker.parent.remove(marker);
            this.markers.delete(markerId);
            marker.dispose();
        }
    }

    /**
     * Updates all managed markers using the provided data.
     * @param markerData {object} - The data object, usually parsed json from a markers.json
     * @returns {boolean} - If the update was successful
     */
    updateFromData(markerData) {
        return false;
    }

    /**
     * @private
     * Loads the marker file
     * @returns {Promise<Object>} - A promise completing with the parsed json object from the loaded file
     */
    loadMarkerFile() {
        return new Promise((resolve, reject) => {
			if(!this.mapUrl){
				return reject('Not ready yet');
			}

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(new URL(this.fileUrl + "?" + generateCacheHash(), this.mapUrl).toString(),
                markerFileData => {
                    if (!markerFileData) reject(`Failed to parse '${this.fileUrl}'!`);
                    else resolve(markerFileData);
                },
                () => {},
                () => reject(`Failed to load '${this.fileUrl}'!`)
            )
        });
    }

}