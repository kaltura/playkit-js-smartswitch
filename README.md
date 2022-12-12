# playkit-js-smartSwitch

Kaltura Player *CDN Balancer* JS plugin for NPAW Smart Switch

The `playkit-smartswitch` plugin is built upon Kaltura Player and Youbora CDN Balancer soluiton. 

#### NPAN Referance:
[cdn-balancer](https://documentation.npaw.com/product-guides/docs/cdn-balancer)

[js-cdn-balancer-integration](https://documentation.npaw.com/integration-docs/docs/js-cdn-balancer-integration)


### Plugin Flow 

The `Kaltura Player` triggers an API call towards the Youbora `smart-switch` service with the given playback URL,
the API will return an ordered list of CDNs. Then the Kaltura Player `smart-switch` plugin will pick the first CDN and will use that CDN new playback url for the playback.

### Error Handling

SmartSwitch errors are handled internally be the plugin and playback will start with the original playback url 


### Registering to Events

TBD


### Plugin Config

* Make sure your player id is configured to bundle the playkit-smartswitch: "playkit-smartswitch":"{latest}"

#### default config

```
smartswitch: {
    accountCode: '',
    application: 'default',
    responseTimeoutSec: 10,
    optionalParams: {},
    domainUrl: 'https://api.gbnpaw.com',
    followRedirects: false
  }
```


Example:
"playkit-smartswitch":"0.2.0"

```
plugins: { 
     smartswitch: {
        domainUrl: 'https://api.gbnpaw.com'
        accountCode: 'YOUR_ACCOUNT', // Replace with your YOUBORA account.
        application: 'KLTR test',
        responseTimeoutSec: 15,
        followRedirects: true,
        optionalParams: {
          protocol: 'hls',
          extended: true,
          originCode: 'default',
          live: false,
          //nva: '',
          //nvb: '',
          //token: '',
          //dynamicRules: ''
        }
    }
}
```    



