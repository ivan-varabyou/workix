export interface PrismaService {
  [key: string]: unknown;
}

export type ModelInput =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, string | number | boolean | string[] | number[] | null | undefined>
  | null
  | undefined;

export type ModelPrediction =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, string | number | boolean | string[] | number[] | null | undefined>
  | {
      result: string | number | boolean;
      input: ModelInput;
      [key: string]: string | number | boolean | ModelInput | string[] | number[] | undefined;
    };

export type Dataset =
  | string
  | number[]
  | string[]
  | Array<Record<string, string | number | boolean | null | undefined>>
  | Record<string, string | number | boolean | string[] | number[] | null | undefined>
  | {
      data: Array<Record<string, string | number | boolean | null | undefined>>;
      labels?: string[] | number[];
      [key: string]:
        | string
        | number
        | boolean
        | string[]
        | number[]
        | Array<Record<string, string | number | boolean | null | undefined>>
        | undefined;
    };

export interface TrainingResult {
  modelId: string;
  status: 'training' | 'completed' | 'failed';
  progress: number;
  accuracy?: number;
  loss?: number;
  epochs?: number;
  error?: string;
}
