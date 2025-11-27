// Slack interaction interfaces

export interface SlackAction {
  action_id: string;
  block_id: string;
  value?: string;
  type: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SlackView {
  id: string;
  type: string;
  state?: {
    values?: Record<
      string,
      Record<
        string,
        { type?: string; value?: string; [key: string]: string | number | boolean | undefined }
      >
    >;
    [key: string]:
      | string
      | number
      | boolean
      | Record<
          string,
          Record<
            string,
            { type?: string; value?: string; [key: string]: string | number | boolean | undefined }
          >
        >
      | undefined;
  };
  [key: string]:
    | string
    | number
    | boolean
    | {
        values?: Record<
          string,
          Record<
            string,
            { type?: string; value?: string; [key: string]: string | number | boolean | undefined }
          >
        >;
        [key: string]:
          | string
          | number
          | boolean
          | Record<
              string,
              Record<
                string,
                {
                  type?: string;
                  value?: string;
                  [key: string]: string | number | boolean | undefined;
                }
              >
            >
          | undefined;
      }
    | undefined;
}
