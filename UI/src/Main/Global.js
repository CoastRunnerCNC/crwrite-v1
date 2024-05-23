'use strict';

import {LocalStorage} from "node-localstorage";
import crypto from "crypto";

//If we ever start using these again, transfer these to Github variables
const ALG = 'aes-256-cbc';
const KEY = 'NOT_IMPLEMENTED';
const IV = 'NOT_IMPLEMENTED_2';

const PROP_PATH = (() => {
    const crwrite = require("crwrite");
    const path = require("path");
    let logPath = crwrite.GetLogPath();
    logPath = logPath.substring(0, logPath.lastIndexOf(path.sep));
    const baseDirectory = logPath.substring(0, logPath.lastIndexOf(path.sep));

    return `${baseDirectory}${path.sep}props`;
})();
const GLS = new LocalStorage(PROP_PATH);

export class Global {

    static isNull(value) {
        return value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '');
    }

    static encrypt(value) {
        if (this.isNull(value)) {
            return null;
        }

        let cipher = crypto.createCipheriv(ALG, KEY, IV);
        let encrypted = cipher.update(value, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return encrypted;
    }

    static decrypt(value) {
        if (this.isNull(value)) {
            return null;
        }

        let decipher = crypto.createDecipheriv(ALG, KEY, IV);
        let decrypted = decipher.update(value, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    static getProperty(key) {
        if (this.isNull(key)) {
            throw new Error('property KEY cannot be null');
        }

        return this.decrypt(
            GLS.getItem(`${key}`)
        );
    }

    static setProperty(key, value) {
        if (this.isNull(key)) {
            throw new Error('property KEY cannot be null');
        }

        if (this.isNull(value)) {
            GLS.removeItem(key);
            return;
        }

        const encrypted = this.encrypt(`${value}`);

        if (this.isNull(encrypted)) {
            return;
        }

        GLS.setItem(key, encrypted);
    }
}
