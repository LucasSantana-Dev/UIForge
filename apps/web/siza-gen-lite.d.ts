declare module '@forgespace/siza-gen/lite' {
  export interface IContextAssemblerParams {
    framework: string;
    componentType?: string;
    componentLibrary?: string;
    mood?: string;
    industry?: string;
    visualStyle?: string;
    tokenBudget?: number;
    maxExamples?: number;
  }

  export interface IAssembledContext {
    systemPrompt: string;
    tokenEstimate: number;
    examplesIncluded: number;
    sectionsIncluded: string[];
  }

  export function assembleContext(params: IContextAssemblerParams): IAssembledContext;
}
