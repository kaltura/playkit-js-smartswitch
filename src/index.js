// @flow
import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {SmartSwitch} from './smart-switch';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {SmartSwitch as Plugin};
export {VERSION, NAME};

/**
 * The plugin name.
 * @type {string}
 * @const
 */
const pluginName = 'smartswitch';
/**
 * Register the plugin in player's registry.
 */
registerPlugin(pluginName, SmartSwitch);
