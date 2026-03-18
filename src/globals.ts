export const log = console.log;

export type SelectedStack = string;

export interface CreateFile {
  name: string;
  path: string;
  stack: string;
}

export interface PackageConfig {
  deps: string[];
  devDeps: string[];
}

export type StackPackage = Record<string, PackageConfig>;