import { EMAILUtility } from './utility.js';
import { CONFIG_JSON_PATH } from './constant.js';

var Configuration = {};

var EMAILConfiguration = {
    /* 
    * This method is used to read configuration value by section or key.
    * @param:section: config section.
    * @param: key: key of the config section.
    */
    getStripoConfigurationBySectionOrKey: function (section, key) {
        if (section === undefined && key === undefined) {
            throw new Error("getStripoConfigurationBySectionAndKey - Section or Key is required.");
        }

        if (section !== undefined) {
            var value = Configuration[section][key];
            return value;
        }

        return Configuration[key];
    },

    /* 
    * This method is used to load configuration value once the stripo app initialization starts.
    * @return: resolved promise.
    */
    loadStripoConfiguration: async function () {
        var fetchPromise = await EMAILUtility.getConfiguration(CONFIG_JSON_PATH);
        Configuration = fetchPromise;
        return "ok";
    },

}

export { EMAILConfiguration, Configuration }




