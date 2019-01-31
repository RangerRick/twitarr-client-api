declare const describe, beforeEach, it, expect;

import {Client} from '../../src/Client';
import {TwitarrAuthConfig} from '../../src/api/TwitarrAuthConfig';
import {TwitarrServer} from '../../src/api/TwitarrServer';

const SERVER_NAME='Demo';
const SERVER_URL='http://demo.twitarr.com/';
const SERVER_USER='demo';
const SERVER_PASSWORD='demo';

var server, auth;

describe('Given an instance of TwitarrServer...', () => {
  beforeEach(() => {
    auth = new TwitarrAuthConfig(SERVER_USER, SERVER_PASSWORD);
    server = new TwitarrServer(SERVER_NAME, SERVER_URL, auth);
  });

  describe('When I have a server with just an ID...', () => {
    it('it should have an ID', () => {
      expect(server.id).toBeDefined();
      expect(new TwitarrServer().id.length).toEqual(36);
    });
    it('it should have no URL', () => {
      expect(new TwitarrServer().url).toBeUndefined();
    });
    it('it should return undefined when asking for a relative URL without a URL set', () => {
      expect(new TwitarrServer().resolveURL()).toBeUndefined();
    });
    it('it should not have a "host" property', () => {
      expect(new TwitarrServer().host).toBeUndefined();
    });
  });

  describe('When I have a properly-configured server object...', () => {
    it('it should have an ID', () => {
      expect(server.id).toBeDefined();
      expect(server.id.length).toEqual(36);
    });
    it('it should have a URL', () => {
      expect(server.url).toBeDefined();
      expect(server.url).toEqual(SERVER_URL);
    });
    it('it should return the base URL when undefined is passed to resolveURL()', () => {
      expect(server.resolveURL()).toBeDefined();
      expect(server.resolveURL()).toEqual(SERVER_URL);
    });
    it('it should return a new URL when a value is passed to resolveURL()', () => {
      expect(server.resolveURL('foo')).toBeDefined();
      expect(server.resolveURL('foo')).toEqual(SERVER_URL + 'foo');
      expect(server.resolveURL('foo/')).toEqual(SERVER_URL + 'foo');
    });
    it('URL starting with "/" are returned as-is.', () => {
      expect(server.resolveURL('/rest/foo/')).toEqual('/rest/foo/');
    });
    it('Absolute with query appends query', () => {
      expect(server.resolveURL('/rest/foo', 'foo=bar')).toEqual('/rest/foo?foo%3Dbar');
    });
    it('multi segment urls are handled.', () => {
      expect(server.resolveURL('rest/foo/')).toEqual(SERVER_URL + 'rest/foo');
    });
    it('Colons are not escaped', () => {
      expect(server.resolveURL('rest/foo/A:B:0.0.0.0:C')).toEqual(SERVER_URL + 'rest/foo/A:B:0.0.0.0:C');
    });
    it('Escape forward slashes', () => {
      expect(server.resolveURL('rest/S%2FA%3AB%3A0.0.0.0%3AC')).toEqual(SERVER_URL + 'rest/S%2FA:B:0.0.0.0:C');
    });
    it('it should have a "host" property', () => {
      expect(server.host).toBeDefined();
      expect(server.host).toEqual('demo.twitarr.com');
    });
  });
});
