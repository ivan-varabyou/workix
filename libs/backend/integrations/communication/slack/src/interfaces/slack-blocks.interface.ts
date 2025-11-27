// Slack Block Kit interfaces

export interface SlackBlock {
  type: string;
  text?: SlackText;
  fields?: SlackText[];
  accessory?: SlackAccessory;
  elements?: SlackElement[];
  [key: string]:
    | string
    | number
    | boolean
    | SlackText
    | SlackText[]
    | SlackAccessory
    | SlackElement[]
    | undefined;
}

export interface SlackText {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export interface SlackAccessory {
  type: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SlackElement {
  type: string;
  [key: string]: string | number | boolean | undefined;
}
