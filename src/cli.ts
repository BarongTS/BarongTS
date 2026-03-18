import { createPromptModule } from "inquirer";
import path from "path";
import fs from "fs"; import { fileURLToPath } from "url";
import chalk from 'chalk';
import { log, type SelectedStack } from "./globals.js";

async function main() {
  const asciiPath: string = path.join( path.dirname(fileURLToPath(import.meta.url)), "..", "ascii.txt" ); if (fs.existsSync(asciiPath)) { const art: string = fs.readFileSync(asciiPath, "utf-8"); console.log(chalk.blue(art)); }

  log(chalk.bgGreen(" Welcome to BarongTS  "))

  const prompt = createPromptModule();


  function withCtrlX<T>(fn: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      const onData = (chunk: Buffer) => {
        if (chunk[0] === 0x18 || chunk[0] === 0x03) {
          cleanup();
          reject(new Error("User canceled"));
        }
      };

      const onSigint = () => {
        cleanup();
        reject(new Error("User canceled"));
      };

      const cleanup = () => {
        process.stdin.removeListener("data", onData);
        process.removeListener("SIGINT", onSigint);
      };

      process.stdin.on("data", onData);
      process.once("SIGINT", onSigint);

      fn()
        .then((result) => {
          cleanup();
          resolve(result);
        })
        .catch((err) => {
          cleanup();
          reject(err);
        });
    });
  }

  let continueMenu = true;

  while (continueMenu) {
    try {
      const mainMenu = await withCtrlX(() =>
        prompt([
          {
            type: "select",
            name: "category",
            message: "Select project type:",
            choices: [
                "Backend TS", 
                "Frontend TS", 
                "Exit"],
            pageSize: 10,
          },
        ])
      );

    //**IF USER EXIT RUN IT */
    if (mainMenu.category === "Exit") {log(chalk.red("\n❌ Succses with nothing changes!\n"));
      break;
    }
    
    let selectedStack: SelectedStack | null = null


    switch (mainMenu.category) {
      case "Backend TS": {
        const backendMenu = await withCtrlX(() =>
          prompt([
            {
              type: "select",
              name: "backend",
              message: "Select backend stack:",
                choices: [
                {
                    name: "Node.js + TS (Recommended)",
                    value: "node_recommended",
                    description: "Stack: Express, Prisma, PostgreSQL, Jest, k6",
                },
                {
                    name: "NestJS + TS",
                    value: "nestjs",
                    description: "Stack: NestJS, Prisma, PostgreSQL",
                },
                {
                    name: "Fastify + TS",
                    value: "fastify",
                    description: "Stack: Fastify, Prisma, PostgreSQL",
                },
                {
                    name: "Node.js + TS + MongoDB",
                    value: "node_mongo",
                    description: "Stack: Express, MongoDB, Mongoose",
                },
                {
                    name: "Minimal Backend",
                    value: "minimal",
                    description: "Stack: Node.js, TypeScript only",
                },
                {
                    name: "⬅ Back",
                    value: "back",
                    description: "Return to previous menu",
                },
                ],
              pageSize: 10,
              pointer: chalk.green(' ❯ '),
            },
          ])
        );
        log(backendMenu.backend)
        if (backendMenu.backend !== "Back") selectedStack = backendMenu.backend;
        break;
      }

      case "Frontend TS": {
        const frontendMenu = await withCtrlX(() =>
          prompt([
            {
              type: "select",
              name: "frontend",
              message: "Select frontend stack:",
              choices: [
                    {
                        name: "React + TS (Recommended)",
                        value: "react",
                        description: "React • Vite • TypeScript • ESLint",
                    },
                    {
                        name: "Next.js + TS",
                        value: "next",
                        description: "Next.js • TypeScript • App Router • ESLint",
                    },
                    {
                        name: "Vue + TS",
                        value: "vue",
                        description: "Vue • Vite • TypeScript • Pinia",
                    },
                    {
                        name: "Svelte + TS",
                        value: "svelte",
                        description: "Svelte • Vite • TypeScript",
                    },
                    {
                        name: "⬅ Back",
                        value: "back",
                        description: "Return to previous menu",
                    },
                    ],
              pageSize: 10,
            },
          ])
        );
        if (frontendMenu.frontend !== "Back") selectedStack = frontendMenu.frontend;
        break;
      }
    }

    if (selectedStack === null) {
      log(chalk.yellow("\n Back to main menu...\n"));
      continue;
    }

    if (selectedStack) {
      log(`\n✨ You selected: ${mainMenu.category} → ${selectedStack}\n`);

      const confirmInstall = await withCtrlX(() =>
        prompt([
          {
            type: "confirm",
            name: "installDeps",
            message: "Do you want to install dependencies now?",
            default: true,
          },
        ])
      );

      if (confirmInstall.installDeps) {
        log(`\n📦 Installing ${selectedStack} dependencies...`);
        log("🔍 Installation simulated (replace with npm install commands)");
      } else {
        log("🐞 Skipping installation.");
      }

      const nextAction = await withCtrlX(() =>
        prompt([
          {
            type: "confirm",
            name: "selectAgain",
            message: "are you sure use this stack",
            default: true,
          },
        ])
      );

      if (nextAction.selectAgain) {
        log(chalk.green("\n✅hank you for using BarongTS CLI. Goodbye!\n"));
        continueMenu = false;
      }
    }
  } catch (err: any) {
    if (err?.message === "User canceled") {
      log(chalk.bgRed("\n❌ User canceled. Exiting...\n"));
      break;
    }
    throw err;
  }
  }
}

main();