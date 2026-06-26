/* eslint-disable no-param-reassign */
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { NtfyClient, NtfyPriority } from '../../../../FlowHelpers/1.0.0/nove/ntfy';
import { enumParser } from '../../../../FlowHelpers/1.0.0/nove/utils';

const OUT_SUCCESS = 1;
const OUT_FAIL = 2;

const details = (): IpluginDetails => ({
  name: 'Publish ntfy.sh Notification',
  description:
    'Publish a notification through the ntfy.sh API.',
  style: {
    borderColor: 'blue',
  },
  tags: 'notifications',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  icon: 'faBell',
  inputs: [
    {
      label: 'ntfy.sh URL',
      name: 'url',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the ntfy.sh base URL. This must point to your ntfy.sh instance.
      Examples:

      - https://ntfy.sh --- default public server
      - http://localhost:9876 --- self-hosted ntfy.sh instance running on the same machine`,
    },
    {
      label: 'Topic',
      name: 'topic',
      type: 'string',
      defaultValue: 'tdarr',
      inputUI: {
        type: 'text',
      },
      tooltip: 'The ntfy.sh topic',
    },
    {
      label: 'Message',
      name: 'message',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'The notification body',
    },
    {
      label: 'Title',
      name: 'title',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'The notification header',
    },
    {
      label: 'Priority',
      name: 'priority',
      type: 'string',
      defaultValue: 'default',
      inputUI: {
        type: 'dropdown',
        options: Object.values(NtfyPriority),
      },
      tooltip: 'The notification priority',
    },
    {
      label: 'Tags',
      name: 'tags',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'A list of comma-separated tags (example: video,h265)',
    },
  ],
  sidebarPosition: -1,
  outputs: [
    {
      number: OUT_SUCCESS,
      tooltip: 'The original language was detected.',
    },
    {
      number: OUT_FAIL,
      tooltip: 'The original was not detected',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const url = String(args.inputs.url).trim();
  const topic = String(args.inputs.topic).trim();
  const message = String(args.inputs.message).trim();
  const title = String(args.inputs.title).trim();
  const priority = String(args.inputs.priority).trim();
  const tags = String(args.inputs.tags).trim();

  const client = new NtfyClient(url);

  const priorityResult = enumParser(NtfyPriority)(priority);

  if (!priorityResult.ok) {
    throw new Error(`Invalid priority value: ${priority}`);
  }

  if (!message) {
    throw new Error('An empty message is not allowed');
  }

  await client.publish(topic, {
    body: message,
    tags: tags ? tags.split(',') : undefined,
    priority: priorityResult.value,
    title,
  });

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: OUT_SUCCESS,
    variables: args.variables,
  };
};

export { plugin, details };
