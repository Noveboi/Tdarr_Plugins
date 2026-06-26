/*
ntfy.sh utility module
*/

export const NtfyPriority = {
  MAX: 'max',
  HIGH: 'high',
  DEFAULT: 'default',
  LOW: 'low',
  MIN: 'min',
} as const;

export type NtfyPriority = typeof NtfyPriority[keyof typeof NtfyPriority];

export interface NtfyMessage {
  body: string
  title?: string
  priority?: NtfyPriority
  tags?: string[]
}

export class NtfyClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  private getUrl(topic: string): string {
    return `${this.url}/${topic}`;
  }

  private getHeaders(message: NtfyMessage): HeadersInit {
    const headers: Record<string, string> = {};

    if (message.title) {
      headers.Title = message.title;
    }

    if (message.priority) {
      headers.Priority = message.priority;
    }

    if (message.tags) {
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
