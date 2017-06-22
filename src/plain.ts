import { Layers } from './type/type';
import Factory from './factory/index';
import LatLng from './factory/latlng';
import { mapOption, markerOption, polylineOption } from './options/mapOptions';
import B_Map from './constructors/bmap/index';

declare global {
    interface Window {
    }
}

export default class Plain {
    FACTORYS: {[key: string]: Factory};
    map: object;
    factory: Factory;          
    
    constructor (factory?: Factory | string) {
        this.FACTORYS = {
            'BMAP': new B_Map(),
        };
        factory && this.use(factory);      
    }

    // load the map factory plugin
    use (factory: Factory | string): Plain {
        let f;
        if (typeof factory === 'string') {
            f = this.FACTORYS[factory];
        } else {
            f = factory;
        }
        this.factory = f;
        return this;
    }

    // create Map
    @tagging()
    Map (opt: mapOption) {
        return this.factory.Map(opt);
    }

    // create Marker
    @tagging()
    Marker (latlng: LatLng, opt?: markerOption) {
        return this.factory.Marker(latlng, opt);
    }

    // create Polyline
    @tagging()
    Polyline (latlngs: LatLng[], opt?: polylineOption) {
        return this.factory.Polyline(latlngs, opt);
    }
}

/**
 * PropertyDescriptor
 */
function tagging (): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let oldFn = descriptor.value;
        descriptor.value= function (arg: any) {
            let value = oldFn.call(this, arg);
            value._id = Math.random().toString(16).substr(2);
            return value;  
        };
    }
}

