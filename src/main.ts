import type { StackPackage } from "./globals.ts";

export const BackendPackages: StackPackage = {
  node_recommended: {
    deps: [
      "express",
      "prisma",
      "@prisma/client",
      "dotenv",
      "cors",
      "helmet"
    ],
    devDeps: [
      "typescript",
      "tsx",
      "@types/node",
      "@types/express",
      "jest",
      "ts-jest",
      "@types/jest",
      "eslint",
      "prettier"
    ]
  },

  nestjs: {
    deps: [
      "@nestjs/core",
      "@nestjs/common",
      "@nestjs/platform-express",
      "reflect-metadata",
      "rxjs",
      "prisma",
      "@prisma/client"
    ],
    devDeps: [
      "typescript",
      "ts-node",
      "@types/node"
    ]
  },

  fastify: {
    deps: [
      "fastify",
      "prisma",
      "@prisma/client",
      "dotenv"
    ],
    devDeps: [
      "typescript",
      "tsx",
      "@types/node"
    ]
  },

  node_mongo: {
    deps: [
      "express",
      "mongoose",
      "dotenv",
      "cors"
    ],
    devDeps: [
      "typescript",
      "tsx",
      "@types/node",
      "@types/express"
    ]
  },

  minimal: {
    deps: ["dotenv"],
    devDeps: [
      "typescript",
      "tsx",
      "@types/node"
    ]
  }
};

export const FrontendCommands = {
  react: "react-ts",
  vue: "vue-ts",
  svelte: "svelte-ts"
};

export const NextCommand = "create-next-app";