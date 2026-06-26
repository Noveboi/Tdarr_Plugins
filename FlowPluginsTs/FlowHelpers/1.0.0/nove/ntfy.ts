/*
ntfy.sh utility module
*/

import { err, ok, Result } from './types';

interface NtfyMessage {
  body: string
  title?: string
  priority?: 'max' | 'high' | 'default' | 'low' | 'min'
  tags?: string[]
}

class NtfyClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  private getUrl(topic: string): string {
    return `${this.url}/${topic}`;
  }

  private getHeaders(message: NtfyMessage): HeadersInit {
    const headers: Record<string, string> = {};

    if (message.title !== undefined) {
      headers.Title = message.title;
    }

    if (message.priority !== undefined) {
      headers.Priority = message.priority;
    }

    if (message.tags !== undefined) {
      headers.Tags = message.tags.join(',');
    }

    return headers;
  }

  public async publish(topic: string, message: NtfyMessage): Promise<void> {
    const response = await fetch(this.getUrl(topic), {
      method: 'POST',
      body: message.body,
      headers: this.getHeaders(message),
    });

    if (response.status !== 200) {
      throw new Error(`ntfy.sh API returned failure: ${response.status} ${response.statusText}`);
    }
  }
}
