// @flow
import {core} from '@playkit-js/kaltura-player-js';
import {SmartSwitch} from './smart-switch';

const {getLogger, FakeEvent} = core;

class SmartSwitchEngineDecorator implements IEngineDecorator {
  _plugin: SmartSwitch;
  _logger: Object;
  _engine: IEngine;
  _active: boolean = true;

  constructor(engine: IEngine, plugin: SmartSwitch) {
    this._engine = engine;
    this._plugin = plugin;
    this._logger = getLogger('SmartSwitchEngineDecorator');
    this._plugin.player.addEventListener(this._plugin.player.Event.PLAYER_RESET, () => {
      this._active = true;
      this._logger.debug(`Set decorator as active: ${this._active.toString()}`);
    });
  }

  get active(): boolean {
    return this._active;
  }

  load(startTime: ?number): Promise<Object> {
    return new Promise((resolve, reject) => {
      this._logger.debug('load API');
      (this._plugin.getCdnBalancerUrl() || Promise.resolve())
        .then(cdnBalancerUrl => {
          if (cdnBalancerUrl) {
            this._logger.debug('Set new engine src', cdnBalancerUrl);
            this._engine.src = cdnBalancerUrl;
          }
        })
        .catch(err => this._logger.warn(err.message))
        .finally(() => {
          this._active = false;
          this._logger.debug(`Set decorator as active: ${this._active.toString()}`);
          this._logger.debug('Calling engine load');
          this._engine.load(startTime).then(resolve, reject);
        });
    });
  }

  dispatchEvent(event: FakeEvent): boolean {
    return event.defaultPrevented;
  }
}

export {SmartSwitchEngineDecorator};
