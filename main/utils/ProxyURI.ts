import { Base64 } from 'js-base64';

enum ProxyScheme {
  SS = "ss://",
  SSR = "ssr://",
  HTTP = "http://",
  HTTPS = "https://",
}

class Proxy {
  scheme: ProxyScheme;
  host: string;
  port: number;
  authscheme: string;
  user?: string;
  password?: string;
  protocol?: string = "origin";
  protocolParam?: string;
  obfs?: string = "plain";
  obfsParam?: string;
  remark?: string;
  type?: string

  constructor(scheme=ProxyScheme.SS, host='', port=0, authscheme='') {
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.authscheme = authscheme;
  }

  toURI(isSIP002: boolean = false): string {
    return ProxyURI.generate(this.scheme, this.host, this.port, this.authscheme, this.user, this.password, this.remark, this.protocol, this.protocolParam, this.obfs, this.obfsParam, isSIP002)
  }
}

class ProxyURI {

  static base64Pattern = "[A-Za-z0-9/=_-]+";
  static base64URLSafePattern = "[A-Za-z0-9_-]+";

  static generate(scheme: ProxyScheme, host: string, port: number, method: string, user?: string, password?: string, protocol: string = "origin", protocolParam?: string, obfs: string = "plain", obfsParam?: string, remark?: string, isSIP002: boolean = true): string {
    switch (scheme) {
      case ProxyScheme.SS:
        return ProxyURI.generateSS(host, port, method, password || "", remark, isSIP002)
      case ProxyScheme.SSR:
        return ProxyURI.generateSSR(host, port, method, password || "", remark, protocol, protocolParam, obfs, obfsParam)
      case ProxyScheme.HTTP:
        return ProxyURI.generateHTTP(ProxyScheme.HTTP, host, port, user, password, remark)
      case ProxyScheme.HTTPS:
        return ProxyURI.generateHTTP(ProxyScheme.HTTPS, host, port, user, password, remark)
    }
  }

  static generateSS(host: string, port: number, method: string, password: string, remark?: string, isSIP002: boolean = true): string {
    if (isSIP002) {
      let rawUserInfo = method.toLowerCase() + ":" + password;
      let encodedUserInfo = Base64.encode(rawUserInfo);
      let uri = ProxyScheme.SS + encodedUserInfo + "@" + host + ":" + port;
      if (remark) {
        uri += "#" + encodeURI(remark);
      }
      return uri;
    } else {
      let rawURI = method.toLowerCase() + ":" + password + "@" + host + ":" + port;
      let uri = ProxyScheme.SS + Base64.encode(rawURI);
      if (remark) {
        uri += "#" + remark;
      }
      return uri;
    }
  }

  static generateSSR(host: string, port: number, method: string, password: string, remark?: string, protocol?: string, protocolParam?: string, obfs?: string, obfsParam?: string): string {
    let mainComponents = [host, port, (protocol || "origin").toLowerCase(), method.toLowerCase(), (obfs || "plain").toLowerCase(), Base64.encodeURI(password)];
    let paramComponents = new Map<string, string>()
    if (protocolParam) {
      paramComponents.set("protoparam", Base64.encodeURI(protocolParam));
    }
    if (obfsParam) {
      paramComponents.set("obfsparam", Base64.encodeURI(obfsParam));
    }
    if (remark) {
      paramComponents.set("remarks", Base64.encodeURI(remark));
    }
    let path = mainComponents.join(":");
    let params = Array.from(paramComponents).map(([key, value]) => (key + "=" + value)).join("&");
    let uri = path;
    if (params.length > 0) {
      uri += "/?" + params;
    }
    uri = Base64.encodeURI(uri);
    return ProxyScheme.SSR + uri;
  }

  static generateHTTP(scheme: ProxyScheme, host: string, port: number, user?: string, password?: string, remark?: string): string {
    let uri: string
    if (user || password) {
      uri = scheme + encodeURIComponent(user || "") + ":" + encodeURIComponent(password || "") + "@" + host + ":" + port;
    } else {
      uri = scheme + host + ":" + port;
    }
    if (remark) {
      uri += "?remarks=" + encodeURIComponent(remark);
    }
    return uri;
  }

  static parse(uri: string): Proxy[] {
    let uriRegex = /ss:\/\/([^\|\s]+)|ssr:\/\/([^\|\s]+)|http:\/\/([^\|\s]+)|https:\/\/([^\|\s]+)/gi;
    let match = uriRegex.exec(uri);
    let proxies: Proxy[] = []
    while (match) {
      let fullUri = match[0]
      let uriContent = match[1] || match[2] || match[3] || match[4]
      if (fullUri && uriContent) {
        let scheme = fullUri.toLowerCase();
        if (scheme.startsWith(ProxyScheme.SS)) {
          let proxy = ProxyURI.parseSSContent(uriContent)
          if (proxy) {
            proxies.push(proxy)
          }
        } else if (scheme.startsWith(ProxyScheme.SSR)) {
          let proxy = ProxyURI.parseSSRContent(uriContent)
          if (proxy) {
            proxies.push(proxy)
          }
        } else if (scheme.startsWith(ProxyScheme.HTTP)) {
          let proxy = ProxyURI.parseHTTPContent(ProxyScheme.HTTP, uriContent)
          if (proxy) {
            proxies.push(proxy)
          }
        } else if (scheme.startsWith(ProxyScheme.HTTPS)) {
          let proxy = ProxyURI.parseHTTPContent(ProxyScheme.HTTPS, uriContent)
          if (proxy) {
            proxies.push(proxy)
          }
        }
      }
      match = uriRegex.exec(uri);
    }
    return proxies;
  }

  static parseSSContent(uri: string): Proxy | null {
    // Try SIP 002 first
    let sip002Regex = new RegExp(`^(${ProxyURI.base64Pattern})@(.+?):(\\d+)(/\?[^#\\s]+?)?(#(.+))?$`, "gi")
    let match = sip002Regex.exec(uri)
    if (match && match[2] && match[3]) {
      let proxy = new Proxy(ProxyScheme.SS, match[2], Number(match[3]));
      proxy.type = 'ss';
      if (match[6]) {
        proxy.remark = decodeURI(match[6]);
      }
      let userInfo = Base64.decode(match[1]);
      let userInfoRegex = /^(.+?):(.+)/gi
      let userInfoMatch = userInfoRegex.exec(userInfo);
      if (userInfoMatch && userInfoMatch[1] && userInfoMatch[2]) {
        proxy.authscheme = userInfoMatch[1].toLowerCase();
        proxy.password = userInfoMatch[2];
        return proxy;
      }
      return null;
    }

    // Try legacy
    let legacyRegex = new RegExp(`^(${ProxyURI.base64Pattern})(#(.+))?$`, "gi");
    match = legacyRegex.exec(uri)
    if (match && match.length >= 2) {
      let proxy = new Proxy(ProxyScheme.SS);
      proxy.type = 'ss';
      proxy.remark = match[3];
      let core = Base64.decode(match[1]);
      // No "$" at the end is due to ShadowsocksX-NG compatibility issue
      // ShadowsocksX-NG will append a remark like "?remark=xxxxx"
      let mainRegex = /^(.+?):(.+)@(.+?):(\d+)/gi
      let coreComps = mainRegex.exec(core);
      if (coreComps && coreComps[1] && coreComps[2] && coreComps[3] && coreComps[4]) {
        proxy.host = coreComps[3];
        proxy.port = Number(coreComps[4]);
        proxy.authscheme = coreComps[1].toLowerCase();
        proxy.password = coreComps[2];
        return proxy;
      }
      return null;
    }

    return null;
  }

  static parseSSRContent(uri: string): Proxy | null {
    let decoded = Base64.decode(uri);
    let coreRegex = new RegExp(`^(.+):(\\d+):(.*):(.+):(.*):(${ProxyURI.base64URLSafePattern})`, "gi");
    let coreMatch = coreRegex.exec(decoded);
    if (coreMatch && coreMatch[1] && coreMatch[2] && coreMatch[3] && coreMatch[4] && coreMatch[5] && coreMatch[6]) {
      let base64Password = coreMatch[6];
      let password = Base64.decode(base64Password);
      if (!password) {
        return null;
      }
      let proxy = new Proxy(ProxyScheme.SSR, coreMatch[1], Number(coreMatch[2]), coreMatch[4].toLowerCase());
      proxy.type = 'ssr';
      proxy.protocol = coreMatch[3].toLowerCase();
      proxy.obfs = coreMatch[5].toLowerCase();
      proxy.password = password;
      let obfsParamRegex = new RegExp(`obfsparam=(${ProxyURI.base64URLSafePattern})`, "gi");
      let obfsParamMatch = obfsParamRegex.exec(decoded);
      if (obfsParamMatch && obfsParamMatch[1]) {
        proxy.obfsParam = Base64.decode(obfsParamMatch[1]);
      }
      let protocolParamRegex = new RegExp(`protoparam=(${ProxyURI.base64URLSafePattern})`, "gi");
      let protocolParamMatch = protocolParamRegex.exec(decoded);
      if (protocolParamMatch && protocolParamMatch[1]) {
        proxy.protocolParam = Base64.decode(protocolParamMatch[1]);
      }
      let remarkRegex = new RegExp(`remarks=(${ProxyURI.base64URLSafePattern})`, "gi");
      let remarkMatch = remarkRegex.exec(decoded);
      if (remarkMatch && remarkMatch[1]) {
        proxy.remark = Base64.decode(remarkMatch[1]);
      }
      return proxy;
    }
    return null;
  }

  static parseHTTPContent(scheme: ProxyScheme, uri: string, isBase64: boolean = false): Proxy | null {
    let parseRemarks = function(uri: string) {
      let remarkRegex = new RegExp(`remarks=([^=/:?&]+)`, "gi");
      let remarkMatch = remarkRegex.exec(uri);
      if (remarkMatch && remarkMatch[1]) {
        return decodeURIComponent(remarkMatch[1]);
      }
      return undefined;
    }
    // Plain Style: http://1.2.3.4:8383
    let plainRegex = new RegExp(`^([^:@]+):(\\d+)`, "gi");
    let plainMatch = plainRegex.exec(uri);
    if (plainMatch && plainMatch[1] && plainMatch[2]) {
      let proxy = new Proxy(scheme, plainMatch[1], Number(plainMatch[2]));
      proxy.remark = parseRemarks(uri);
      return proxy;
    }
    // Auth Style: http://username(url encode):pass(url encode)@1.2.3.4:8383
    let authRegex = new RegExp(`^([^:@]*):([^:@]*)@([^:@]+):(\\d+)`, "gi");
    let authMatch = authRegex.exec(uri);
    if (authMatch && authMatch[1] && authMatch[2] && authMatch[3] && authMatch[4]) {
      let proxy = new Proxy(scheme, authMatch[3], Number(authMatch[4]));
      proxy.type = 'http';
      proxy.user = decodeURIComponent(authMatch[1]);
      proxy.password = decodeURIComponent(authMatch[2]);
      proxy.remark = parseRemarks(uri);
      return proxy;
    }
    // Base64 Style: http://MS4yLjMuNDo4Mzgz
    if (!isBase64) {
      let base64Regex = new RegExp(`^(${ProxyURI.base64URLSafePattern})`, "gi");
      let base64Match = base64Regex.exec(uri);
      if (base64Match) {
        let decoded = Base64.decode(uri);
        let proxy = this.parseHTTPContent(scheme, decoded, true);
        if (proxy) {
          proxy.type = 'http';
          proxy.remark = parseRemarks(uri);
        }
        return proxy;
      }
    }
    return null;
  }
}

export {
  ProxyScheme,
  Proxy,
  ProxyURI
}
