class Settings {

    constructor(_pauseAfterGCode, _enable_slider, _maxFeedRate, _disableLimitCatch, _showEditButtonSetting, _enableEditButton) {
        this.enable_slider = _enable_slider;
        this.pauseAfterGCode = _pauseAfterGCode;
        this.maxFeedRate = _maxFeedRate;
        this.disableLimitCatch = _disableLimitCatch;
        this.showEditButtonSetting = _showEditButtonSetting;
        this.enableEditButton = _enableEditButton;
    }

    getPauseAfterGCode() {
        return this.pauseAfterGCode;
    }

    getEnableSlider() {
        return this.enable_slider;
    }

    getMaxFeedRate() {
        return this.maxFeedRate;
    }

    getDisableLimitCatch() {
        return this.disableLimitCatch;
    }

    getShowEditButtonSetting() {
        return this.showEditButtonSetting;
    }

    getEnableEditButton() {
        return this.enableEditButton;
    }
}

export default Settings;
