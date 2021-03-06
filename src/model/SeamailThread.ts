import { DateTime } from 'luxon';

import { SeamailMessage } from './SeamailMessage';
import { User } from './User';

import { Util } from '../internal/Util';

/**
 * Represents a Seamail thread.
 * @module SeamailThread
 */
export class SeamailThread {
  public static fromRest(data: any) {
    Util.assertHasProperties(data, 'id', 'subject', 'timestamp');

    const ret = new SeamailThread();

    Util.setProperties(ret, data, 'id', 'subject', 'message_count', 'count_is_unread', 'is_unread');
    Util.setDateProperties(ret, data, 'timestamp');
    if (!Util.isEmpty(data.users)) {
      ret.users = data.users.map((user: any) => User.fromRest(user));
    }
    if (!Util.isEmpty(data.messages)) {
      ret.messages = data.messages.map((message: any) => SeamailMessage.fromRest(message));
    }

    return ret;
  }

  /** The unique thread id. */
  public id: string;

  /** The users involved in the message. */
  public users: User[] = [];

  /** The subject of the thread. */
  public subject: string;

  /** The messages in the thread. */
  public messages: SeamailMessage[] = [];

  /** The number of messages (or unread messages) in the thread. */
  public message_count: number;

  /** The time the most recent message was created. */
  public timestamp: DateTime;

  /** Whether `message_count` is unread or total. */
  public count_is_unread: false;

  /** Whether there are unread messages in the thread. */
  public is_unread: false;

  public toJSON() {
    const ret = {} as any;
    Util.setProperties(ret, this, 'id', 'subject', 'message_count', 'count_is_unread', 'is_unread');
    Util.setEpochProperties(ret, this, 'timestamp');
    ret.users = this.users.map(user => user.toJSON());
    ret.messages = this.messages.map(message => message.toJSON());
    return ret;
  }
}
