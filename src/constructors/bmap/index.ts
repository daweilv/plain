/// <reference path="./bmap.d.ts" />

import V from '../../var';
import F from '../../factory/index';
import F_MapsEventListener from '../../factory/mapsEventListener';
import * as O from '../../options/mapOptions';
import D from '../../options/default';
import util from '../../utils';

// BMap in not defined in this file
// But you will get this variable on window Object
// while loaded baidu map script

@eventBinder
class Map implements F.Map {
    _original: BMap.Map;
    _id: string;
    MAP_TYPE: F.MapType;
    
    constructor(opt: O.MapOption) {
        let center = opt.center ? fixCoord(opt.center) : [0, 0];
        let centerPoint = new BMap.Point(opt.center[1], opt.center[0]);
        this._original = new BMap.Map(opt.container);
        this._original.centerAndZoom(centerPoint, opt.zoom || 15);
        this._original.enableScrollWheelZoom();
        this.MAP_TYPE = {
            HYBRID: 'HYBRID',
            NORMAL: 'NORMAL',
            SATELLITE: 'SATELLITE',
            // TERRAIN: 'TERRAIN',
        };
    }

    addLayer(layer: F.Layer | Array<F.Layer>) {
        if (layer instanceof Array) {
            for (let i = 0; i < layer.length; i++) {
                this._original.addOverlay(layer[i]._original);
            }
        } else {
            this._original.addOverlay(layer._original);
        }
    }

    removeLayer(layer: F.Layer | Array<F.Layer>) {
        if (layer instanceof Array) {
            for (let i = 0; i < layer.length; i++) {
                this._original.removeOverlay(layer[i]._original);
            }
        } else {
            this._original.removeOverlay(layer._original);
        }
    }

    clearLayers() {
        this._original.clearOverlays();
    }

    setZoom(zoom: number) {
        this._original.setZoom(zoom);
    }

    getZoom() {
        return this._original.getZoom();
    }
    
    zoomIn() {
        this._original.zoomIn();
    }
    
    zoomOut() {
        this._original.zoomOut();
    }

    fitView(latlngs: F.LatLng[], opt?: O.ViewportOption) {
        let points= latlngs.map(p => {
            return {
                lat: p[0],
                lng: p[1]
            }
        });
        this._original.setViewport(points);
    }

    setCenter(latlng: F.LatLng) {
        this._original.setCenter({
            lat: latlng[0],
            lng: latlng[1]
        });
    }

    getCenter(): F.LatLng {
        let center = this._original.getCenter();
        return [center.lat, center.lng];
    }
    
    panTo(latlng: F.LatLng) {
        this._original.panTo(new BMap.Point(latlng[1], latlng[0]));
    }
    
    setMapType(type: string) {
        let { MAP_TYPE } = this;
        switch (type) {
            case MAP_TYPE.HYBRID: {
                this._original.setMapType(BMAP_HYBRID_MAP);
                break;
            }
            case MAP_TYPE.NORMAL: {
                this._original.setMapType(BMAP_NORMAL_MAP);
                break;
            }
            case MAP_TYPE.SATELLITE: {
                this._original.setMapType(BMAP_SATELLITE_MAP);
                break;
            }
            case MAP_TYPE.TERRAIN: {
                // TODO
                break;
            }
        }
    }
}

@eventBinder
class Marker implements F.Marker {
    _id: string;
    _original: BMap.Marker;

    constructor(latlng: F.LatLng, opt?: O.MarkerOption) {
        latlng = fixCoord(latlng);
        console.log(latlng);
        
        let point = new BMap.Point(latlng[1], latlng[0]);
        let opts = this.formatOpt(opt);
        this._original = new BMap.Marker(point, opts);
    }

    formatOpt (opt: O.MarkerOption = {}) {
        return {
            icon: opt.icon ? opt.icon._original : null,
            // offset: opt.offset ? new BMap.Size(opt.offset[0], opt.offset[1]) : null,
            raiseOnDrag: opt.raiseOnDrag ? opt.raiseOnDrag : true,
            crossOnDrag: opt.crossOnDrag ? opt.crossOnDrag : true,
            enableDragging: opt.draggable
        }
    }
    
    setLatLng(latlng: F.LatLng) {
        let point = new BMap.Point(latlng[1], latlng[0]);
        this._original.setPosition(point);
        return this;
    }

    getLatLng(): F.LatLng {
        let p =  this._original.getPosition();
        return [p.lat, p.lng];
    }
}

@eventBinder
class Polyline implements F.Polyline {
    _id: string;
    _original: BMap.Polyline;
 
    constructor(latlngs: F.LatLng[], opt?: O.PolylineOption) {
        let points = latlngs.map(latlng => {
            return new BMap.Point(latlng[1], latlng[0]);
        });
        this._original = new BMap.Polyline(points, this.formatOpt(opt));
    }   

    formatOpt (opt: O.PolylineOption = {}) {
        util.objectAssign(D.polyline, opt);
        return {
            strokeColor: D.polyline.color,
            strokeWeight: D.polyline.weight,
            strokeOpacity: D.polyline.opacity
        }
    }

    setPath(latlngs: F.LatLng[]) {
        let points = latlngs.map(latlng => {
            return new BMap.Point(latlng[1], latlng[0]);
        });
        this._original.setPath(points);
    }

    getPath(): F.LatLng[] {
        let points = this._original.getPath() || [];
        return points.map(item => {
            return [item.lat, item.lng]
        });
    }
}

class Icon implements F.Icon {
    _id: string;
    _original: BMap.Icon;

    constructor(opt: O.IconOption) {
        let iconOption = this.formatOpt(opt);
        this._original = new BMap.Icon(iconOption.url, iconOption.size, iconOption);
    }

    formatOpt(opt: O.IconOption = {}) {
        return {
            anchor: opt.anchor ? new BMap.Size(opt.anchor[0], opt.anchor[1]) : null,
            url: opt.url,
            size: opt.size ? new BMap.Size(opt.size[0], opt.size[1]) : null,
        }
    }

    setImageUrl(url: string) {

    }

    setSize(size: F.Size) {

    }

    setAnchor(size: F.Size) {

    }
    
    getImageUrl(): string {
        return '';
    }
    
    getAnchor(): F.Size {
        return [];        
    }
    
    getSize(): F.Size {
        return [];
    }
}

export default class B_Map implements F.Factory {
    Util: F.Util;

    constructor () {
        this.Util = {
            formatEvent(e: any = {}): F.Event {
                let point;
                if (e.point) {
                    point = [e.point.lat, e.point.lng];
                }
                return {
                    type: e.type.replace(/^on/g, ''),
                    target: this,
                    e: e,
                    p: point,
                }
            }
        }
    }

    Map(opt: O.MapOption): Map {
        return new Map(opt);
    }

    Marker(latlng: F.LatLng, opt?: O.MarkerOption): Marker {
        return new Marker(latlng, opt);
    }

    Polyline(latlngs: F.LatLng[], opt: O.PolylineOption): Polyline {
        return new Polyline(latlngs, opt);
    }

    Icon(opt: O.IconOption): Icon {
        return new Icon(opt);
    }
    
    // Load map script
    load(key: string, resolve: Function, reject: Function): void {
        if ((<any>window).BMap) {
            resolve && resolve();
            return;
        }
        let callbackName = 'map_init_' + Math.random().toString(16).substr(2);
        let body = document.body;
        let script = document.createElement("SCRIPT");
        let url = "https://api.map.baidu.com/api?v=2.0&ak=" + key + "&callback=" + callbackName;
        script.setAttribute("src", url);
        script.setAttribute("defer", "");
        script.setAttribute("async", "");
        body.appendChild(script);
        (<any>window)[callbackName] = function () {
            resolve && resolve();
            delete (<any>window)[callbackName];
        }
    }
};

/**
 * @function Set overlay eventListener
 * @param {Function} constructor 
 */
function eventBinder(constructor: Function) {
    constructor.prototype.on = function(eventName: string, handler: Function):  F.MapsEventListener {
        let fn: Function = handler.bind(this);
        let listener = this._original.addEventListener(eventName, fn);
        return new F_MapsEventListener({
            eventName: eventName,
            host: this,
            listener: listener,
            handler: fn 
        });
    }
    // require MapEventListener
    constructor.prototype.off = function(listener: F.MapsEventListener) {
        this._original.removeEventListener(listener.eventName, listener.handler);
    }
}

function fixCoord (latlngs: F.LatLng[] | F.LatLng): F.LatLng[] | F.LatLng {
    if (V.coordType === 'DEFAULT') {
        return latlngs;
    }

    switch (V.coordType) {
        case ('DEFAULT'): {
            return latlngs;
        }
        case ('GCJ02'): {
            return util.g2b(latlngs);
        }
        case ('BD09'): {
            return latlngs;
        }
        case ('WGS84'): {
            return util.w2b(latlngs);
        }
    }
}