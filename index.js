import is from 'arc-is';
import isEmail from 'email-validator';

export default (_unknown, _types, _customError=null) => {
    if(_types.includes(null) && _unknown === null){
        return;
    }

    if(_types.includes('parseInt')){
        if(isNaN(parseInt(_unknown))) {
            if(_customError){
                throw _customError;
            }

            const TE = new TypeError(`Expected parseInt. Received: ${is(_unknown)}`);
            TE.value = _unknown;
            throw TE;
        }
        return;
    }

    if(_types.includes('parseFloat')) {
        if(isNaN(parseFloat(_unknown))) {
            if(_customError){
                throw _customError;
            }
            throw new TypeError(`Expected parseFloat. Received: ${is(_unknown)}`);
        }
        return;
    }

    if(_types.includes('email')) {
        if(!isEmail.validate(_unknown)) {
            if(_customError){
                throw _customError;
            }
            throw new TypeError(`Expected email. Received: ${String(_unknown)}`);
        }
        return;
    }

    if(_types.includes('explicit')){
        _types = _types.filter(_val => _val !== 'explicit');
        if(!_types.includes(_unknown)) {
            if(_customError){
                throw _customError;
            }
            throw new TypeError(`Expected explicitly ${_types.join("|")}. Received: ${String(_unknown)}`);
        }
        return;
    }

    if (_types.includes('uuid')) {
        const str = String(_unknown);
        // RFC 4122 (v1–v5): 8-4-4-4-12 hex, version [1-5], variant [89ab]
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!UUID_RE.test(str)) {
            if (_customError) {
                throw _customError;
            }
            throw new TypeError(`Expected uuid. Received: ${str}`);
        }
        return;
    }

    if(!_types.includes(is(_unknown))){
        if(_customError){
            throw _customError;
        }
        throw new TypeError(`Expected ${_types.join("|")}. Received: ${is(_unknown)}`);
    }
}
