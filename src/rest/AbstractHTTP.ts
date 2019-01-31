// tslint:disable-next-line
/// <reference path="../../typings/index.d.ts" />

import {ITwitarrHTTP} from '../api/ITwitarrHTTP';
import {TwitarrError} from '../api/TwitarrError';
import {TwitarrHTTPOptions} from '../api/TwitarrHTTPOptions';
import {TwitarrResult} from '../api/TwitarrResult';
import {TwitarrServer} from '../api/TwitarrServer';
import {JsonTransformer} from './JsonTransformer';

/** @hidden */
const jsonTransformer = new JsonTransformer();

const OPTIONS_PROP = Symbol.for('options');

/**
 * Abstract implementation of the TwitarrHTTP interface meant to be extended by a concrete class.
 * @module AbstractHTTP
 * @implements ITwitarrHTTP
 */
export abstract class AbstractHTTP implements ITwitarrHTTP {
  private [OPTIONS_PROP] = new TwitarrHTTPOptions();

  /** The default set of HTTP options associated with this ReST client. */
  public get options(): TwitarrHTTPOptions {
    if (this[OPTIONS_PROP]) {
      return this[OPTIONS_PROP];
    }
    return {} as TwitarrHTTPOptions;
  }

  public set options(o: TwitarrHTTPOptions) {
    this[OPTIONS_PROP] = o;
  }

  /**
   * The server metadata we'll use for constructing ReST calls.
   * @hidden
   */
  private serverObj: TwitarrServer;

  /** The server associated with this HTTP implementation. */
  public get server() {
    return this.serverObj;
  }

  public set server(server: TwitarrServer) {
    this.serverObj = server;
    this.onSetServer();
  }

  /**
   * Create a new HTTP instance.
   * @constructor
   * @param server - A server object for immediate configuration.
   * @param timeout - How long to wait until timing out requests.
   */
  constructor(server?: TwitarrServer, timeout?: number) {
    if (server) {
      this.serverObj = server;
    }
    if (timeout) {
      this.options.timeout = timeout;
    }
  }

  /** Make an HTTP GET call. This must be implemented by the concrete implementation. */
  public abstract get(url: string, options?: TwitarrHTTPOptions): Promise<TwitarrResult<any>>;

  /** Make an HTTP PUT call. This must be overridden by the concrete implementation. */
  public abstract put(url: string, options?: TwitarrHTTPOptions): Promise<TwitarrResult<any>>;

  /** Make an HTTP POST call. This must be overridden by the concrete implementation. */
  public abstract post(url: string, options?: TwitarrHTTPOptions): Promise<TwitarrResult<any>>;

  /** Make an HTTP DELETE call. This must be overridden by the concrete implementation. */
  public abstract httpDelete(url: string, options?: TwitarrHTTPOptions): Promise<TwitarrResult<any>>;

  /**
   * A convenience method for implementers to use to turn JSON into a javascript object.
   * Use this to process a JSON response before returning it in an [[TwitarrResult]] object.
   */
  protected transformJSON(data: any) {
    return jsonTransformer.transform(data);
  }

  /** Attempt to extract the data from a response. */
  protected getData(response: any) {
    const type = this.getType(response);
    if (type === 'json') {
      return this.transformJSON(response.data);
    } else {
      return response.data;
    }
  }

  /**
   * Attempt to determine the type of response.
   * @hidden
   */
  protected getType(response: any) {
    if (response.headers['content-type'] === 'application/json') {
      return 'json';
    } else if (response.config.responseType === 'json') {
      return 'json';
    } else if (response.config.headers.accept === 'application/json') {
      return 'json';
    } else if (response.responseType === 'json') {
      return 'json';
    }
    return 'text';
  }

  /**
   * Get the [[TwitarrServer]] object that should be used for making requests.  Favors the one
   * passed in the [[TwitarrHTTPOptions]], otherwise it falls back to the default server associated
   * with the HTTP implementation.
   */
  protected getServer(options?: TwitarrHTTPOptions) {
    if (options && options.server) {
      return options.server;
    }
    return this.serverObj;
  }

  /**
   * Get the union of [[TwitarrHTTPOptions]] based on the passed options, defaults,
   * and options in the [[TwitarrServer]] associated with this request.  Order of
   * precedence is passed options -> server options -> default options.
   */
  protected getOptions(options?: TwitarrHTTPOptions): TwitarrHTTPOptions {
    const ret = new TwitarrHTTPOptions();
    Object.assign(ret, this.options);

    const server = this.getServer(options);
    ret.server = server;
    if (server && server.auth) {
      ret.auth = Object.assign(ret.auth, server.auth);
    }
    Object.assign(ret, options);
    if (!ret.headers.hasOwnProperty('X-Requested-With')) {
      ret.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    return ret;
  }

  /**
   * Implementers should override this method if they have actions that need to be performed
   * (like clearing a cache) when server settings change.
   */
  protected onSetServer() {
    // do nothing by default
  }

  /**
   * Create an [[TwitarrError]] from an error response.
   * @hidden
   */
  protected handleError(err: any, options?: any): TwitarrError {
    const message = AbstractHTTP.extractMessage(err);
    const status = AbstractHTTP.extractStatus(err);
    const data = AbstractHTTP.extractData(err);
    return new TwitarrError(message, status, options, data);
  }

  /* tslint:disable:member-ordering */

  /**
   * Attempt to determine an error message from an error response.
   * @hidden
   */
  protected static extractMessage(err: any): string {
    if (err) {
      if (err.message) {
        return err.message;
      } else if (err.response) {
        return this.extractMessage(err.response);
      } else if (err.data && Object.prototype.toString.call(err) === '[object String]') {
        return err.data;
      } else if (err.statusText) {
        return err.statusText;
      }
      return JSON.stringify(err);
    }
    return 'no error message';
  }

  /**
   * Attempt to determine an error status code from an error response.
   * @hidden
   */
  protected static extractStatus(err: any): number {
    let status = -1;
    if (err.code) {
      status = err.code;
    } else if (err.status) {
      status = err.status;
    } else if (err.response && err.response.status) {
      status = err.response.status;
    }
    return status;
  }

  /**
   * Attempt to determine the data in an error response.
   * @hidden
   */
  protected static extractData(err: any): any {
    if (err && err.response && err.response.data) {
      return err.response.data;
    }
    return undefined;
  }

}