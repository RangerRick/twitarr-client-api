import { DateTime } from 'luxon';

import { Util } from '../internal/Util';

/**
 * Represents a photo.
 * @module PhotoDetails
 */
export class PhotoDetails {
  public static fromRest(data: any) {
    Util.assertHasProperties(data, 'id');

    const ret = new PhotoDetails();
    Util.setProperties(ret, data, 'id', 'animated', 'store_filename', 'md5_hash', 'original_filename', 'uploader');
    Util.setDateProperties(ret, data, 'upload_time');
    if (data.sizes) {
      Object.assign(ret.sizes, data.sizes);
    }
    return ret;
  }

  /** The photo's ID. */
  public id: string;

  /** Whether the photo is animated. */
  public animated: boolean;

  /** The filename stored on the server. */
  public store_filename: string;

  /** The photo's MD5 hash. */
  public md5_hash: string;

  /** The original filename. */
  public original_filename: string;

  /** The user that uploaded the photo. */
  public uploader: string;

  /** When the photo was uploaded. */
  public upload_time: DateTime;

  /** The sizes available. */
  public sizes: { [key: string]: string } = {};

  public toJSON() {
    const ret = {} as any;
    Util.setProperties(ret, this, 'id', 'animated', 'store_filename', 'md5_hash', 'original_filename', 'uploader', 'sizes');
    Util.setEpochProperties(ret, this, 'upload_time');
    return ret;
  }
}
