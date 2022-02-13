// @flow
/**
 * @typedef SmartSwitchConfig
 * @property {string} accountCode - Your YOUBORA account code.
 * @property {string} application - The application code configured in the UI.
 * @property {number} responseTimeoutSec - response timeout in seconds.
 * @property {QueryParams} optionalParams - optional query params.
 * @property {string} domainUrl - optional alternative domain, default = https://api.gbnpaw.com.
 */
type SmartSwitchConfig = {
  accountCode: string,
  application?: string,
  responseTimeoutSec?: number,
  optionalParams?: QueryParams,
  domainUrl?: string
};

/**
 * @typedef QueryParams
 * @description {@link https://documentation.npaw.com/npaw-integration/reference/get_-accountcode-application-decision}
 * @property {string} originCode - CDN group configured to select a subset of configured CDNs. If not set, the API will use the first configuration as the default.
 * @property {string} ip - End user's IP address.
 * @property {string} userAgent - Client user agent string. URL encoded.
 * @property {boolean} live - Indicates whether the content is Live or VoD.
 * @property {number} protocol - Resource URL streaming protocol.
 * @property {boolean} extended - Indicates whether the CDN scores and the request UUID should be included in the response.
 * @property {number} nva - Not Valid After. It's only mandatory when using a token to secure the CDN Balancer request.
   It's the time from when the the API request will not be valid. After that time, the URL won't be valid.
   Needs to be sent in milliseconds and converted into UTC.
 * @property {number} nvb - Not Valid Before. It's only mandatory when using a token to secure the CDN Balancer request.
   It's the starting time from when the the API request will be valid. Before that time, the URL won't be valid
   Needs to be sent in milliseconds and converted into UTC.
 * @property {number} token - Additional security that can be added in the request if an API key is enabled in the UI.
   This token is generated by creating an MD5 hash using the following parameters concatenating them in the following order:
      accountCode
      originCode (if used in the URL, leave it blank if not reported)
      resource (if used in the URL, leave it blank if not reported)
      nva
      nvb
      secretKey: API secret that can be configured from the UI
   The concatenation result will be:
   token = MD5(accountCode + originCode + resource + nva + nvb + secretKey).
 */
type QueryParams = {
  originCode?: string,
  ip?: string,
  userAgent?: string,
  live?: boolean,
  protocol?: string,
  extended?: boolean,
  nva?: number,
  nvb?: number,
  token?: number
};
