class FirmwareUpdate {
    constructor(version, description, file328p, file32m1) {
        this.version = version;
        this.description = description;
        this.file_328p = file328p;
        this.file_32m1 = file32m1;
    }

    getVersion() {
        return this.version;
    }
    
    getDescription() {
        return this.description;
    }

    getFile328p() {
        return this.file_328p;
    }

    getFile32m1() {
        return this.file_32m1;
    }
}

export default FirmwareUpdate;
