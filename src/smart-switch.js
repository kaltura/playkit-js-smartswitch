//@flow
import {KalturaPlayer, BasePlugin, core} from '@playkit-js/kaltura-player-js';
import {SmartSwitchEngineDecorator} from './smart-switch-engine-decorator';
import * as cdnBalancerApiUrl from './smart-switch.json';

const {Utils, FakeEvent} = core;

class SmartSwitch extends BasePlugin {
  static defaultConfig: SmartSwitchConfig = {
    accountCode: '',
    application: 'default',
    responseTimeoutSec: 10,
    optionalParams: {},
    domainUrl: 'https://api.gbnpaw.com',
    followRedirects: false
  };

  static isValid(): boolean {
    return true;
  }

  _cdnBalancerResponsePromise: Promise<string> | null = null;
  _responseTimeoutMs: number;

  constructor(name: string, player: KalturaPlayer, config: SmartSwitchConfig) {
    super(name, player, config);
    this._responseTimeoutMs = this.config.responseTimeoutSec * 1000;
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
    ).catch(err => this.logger.error(err));
  }

  _sourceSelectedHandler(event: FakeEvent, resolve: Function, reject: Function) {
    if (!this._isConfigValid()) {
      reject(new Error('Mandatory params are missing'));
    } else {
      const {url} = event.payload.selectedSource[0];
      this.logger.debug('Source selected callback handler', url);
      this._doRequest(url)
        .then(response => {
          const providers = response.providers;
          this.logger.debug('Response returned successfully', providers);
          if (Array.isArray(providers) && providers.length > 0) {
            const provider = providers[0];
            if (provider?.url) {
              this.logger.debug('CDN balancer url is ready', provider.url);
              resolve(provider.url);
            } else {
              reject(new Error('Unexpected response'));
            }
          } else {
            reject(new Error('Unexpected response'));
          }
        })
        .catch(reject);
    }
  }

  async _doRequest(resource: string): Promise<any> {
    const responseTimeoutHandler = () => {
      this.logger.warn(`Timeout reached ${this.config.responseTimeoutSec} seconds, loading original source`);
    };

    if (this.config.followRedirects) {
      resource = await this._extractResource(resource);
    }

    const queryParams = {resource, ...this.config.optionalParams};
    const concatenatedQueryParams = `${Object.keys(queryParams)
      .map(key => key + '=' + encodeURIComponent(queryParams[key]))
      .join('&')}`;

    const url = cdnBalancerApiUrl['CDN_BALANCER_API_ENDPOINT']
      .replace('{domainUrl}', this.config.domainUrl)
      .replace('{accountCode}', this.config.accountCode)
      .replace('{application}', this.config.application)
      .concat(`?${concatenatedQueryParams}`);

    this.logger.debug('Do request to CDN balancer API', url);
    return Utils.Http.execute(url, null, 'GET', null, this._responseTimeoutMs, responseTimeoutHandler);
  }

  async _extractResource(resourceUrl: string) {
    const data = await fetch(resourceUrl);
    return data.url;
  }

  _isConfigValid(): boolean {
    return this.config.accountCode;
  }
}

export {SmartSwitch};
