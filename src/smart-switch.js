//@flow
import {KalturaPlayer, BasePlugin, core} from 'kaltura-player-js';
import {SmartSwitchEngineDecorator} from './smart-switch-engine-decorator';
import * as SmartSwitchConfig from './smart-switch.json';

const {Utils, FakeEvent} = core;

class SmartSwitch extends BasePlugin {
  static defaultConfig: Object = {
    responseTimeoutSec: 10,
    optionalParams: {}
  };

  static isValid(): boolean {
    return true;
  }

  _cdnBalancerResponsePromise: Promise<string> | null = null;
  _responseTimeoutMs: number;

  constructor(name: string, player: KalturaPlayer, config: Object) {
    super(name, player, config);
    this._responseTimeoutMs = this.config.responseTimeoutSec * 1000;
    this._createCdnBalancerPromise();
  }

  getEngineDecorator(engine: IEngine): IEngineDecorator {
    return new SmartSwitchEngineDecorator(engine, this);
  }

  getCdnBalancerUrl(): Promise<string> | null {
    return this._cdnBalancerResponsePromise;
  }

  loadMedia(): void {
    this._createCdnBalancerPromise();
  }

  reset(): void {
    this._cdnBalancerResponsePromise = null;
    this.eventManager.removeAll();
  }

  destroy(): void {
    this._cdnBalancerResponsePromise = null;
    this.eventManager.destroy();
  }

  _createCdnBalancerPromise(): void {
    this.logger.debug('Init CDN balancer promise');
    this._cdnBalancerResponsePromise = new Promise((resolve, reject) =>
      this.eventManager.listen(this.player, this.player.Event.Core.SOURCE_SELECTED, (event: FakeEvent) =>
        this._sourceSelectedHandler(event, resolve, reject)
      )
    );
  }

  async _sourceSelectedHandler(event: FakeEvent, resolve: Function, reject: Function) {
    if (!this._isConfigValid()) {
      reject(new Error('Mandatory params are missing'));
    } else {
      try {
        const {url} = event.payload.selectedSource[0];
        this.logger.debug('Source selected callback handler', url);
        const response = await this._doRequest(url);
        const cdnList = Utils.Object.getPropertyPath(response, 'smartSwitch.CDNList');
        this.logger.debug('Response returned successfully', cdnList);
        if (Array.isArray(cdnList) && cdnList.length > 0) {
          const cdnObj = cdnList[0]['1'];
          this.logger.debug('CDN balancer url is ready', cdnObj.URL);
          resolve(cdnObj.URL);
        } else {
          reject(new Error('Unexpected response'));
        }
      } catch (err) {
        reject(err);
      }
    }
  }

  _doRequest(resource: string): Promise<any> {
    const responseTimeoutHandler = () => {
      this.logger.warn(`Timeout reached ${this.config.responseTimeoutSec} seconds, loading original source`);
    };
    const params = {
      accountCode: this.config.accountCode,
      originCode: this.config.originCode,
      resource,
      ...this.config.optionalParams
    };
    const url = `${SmartSwitchConfig.CDN_BALANCER_API_ENDPOINT}?${Object.keys(params)
      .map(key => key + '=' + encodeURIComponent(params[key]))
      .join('&')}`;
    this.logger.debug('Do request to CDN balancer API', url);
    return Utils.Http.execute(url, null, 'GET', null, this._responseTimeoutMs, responseTimeoutHandler);
  }

  _isConfigValid(): boolean {
    return this.config.accountCode && this.config.originCode;
  }
}

export {SmartSwitch};
