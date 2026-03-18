import { createPromptModule } from "inquirer";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";

import { log, type CreateFile, type SelectedStack } from "./globals.js";
import {
  BackendPackages,
  FrontendCommands,
  NextCommand,
} from "./main.js";

function runCommand(command: string, cwd: string) {
  try {
    execSync(command, {
      stdio: "inherit",
      cwd,
    });
  } catch {
    log(chalk.red(`❌ Failed: ${command}`));
  }
}

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

async function main() {
  const asciiPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "ascii.txt"
  );

  if (fs.existsSync(asciiPath)) {
    const art = fs.readFileSync(asciiPath, "utf-8");
    console.log(chalk.blue(art));
  }

  log(chalk.bgGreen(" Welcome to BarongTS "));

  const prompt = createPromptModule();
  const currentPath = process.cwd();

  const projectInfo = await withCtrlX(() =>
    prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: "my-barong-app",
        validate: (input) =>
          input.trim() ? true : "Project name cannot be empty",
      },
    ])
  );

  const projectName = projectInfo.projectName;
  const projectPath = path.join(currentPath, projectName);

  log(chalk.cyan(`\n📁 Project: ${projectName}\n`));

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
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
            choices: ["Backend TS", "Frontend TS", "Exit"],
          },
        ])
      );

      if (mainMenu.category === "Exit") {
        log(chalk.red("\n❌ Success with no changes!\n"));
        break;
      }

      let selectedStack: SelectedStack | null = null;

      if (mainMenu.category === "Backend TS") {
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
                  description: "express prisma typescript jest"
                },
                {
                  name: "NestJS + TS",
                  value: "nestjs",
                  description: "nestjs prisma typescript"
                },
                {
                  name: "Fastify + TS",
                  value: "fastify",
                  description: "fastify prisma typescript"
                },
                {
                  name: "Node.js + TS + MongoDB",
                  value: "node_mongo",
                  description: "express mongoose typescript"
                },
                {
                  name: "Minimal Backend",
                  value: "minimal",
                  description: "typescript"
                },
                {
                  name: "⬅ Back",
                  value: "back",
                },
              ],
            },
          ])
        );

        if (backendMenu.backend !== "back") {
          selectedStack = backendMenu.backend;
        }
      }

      if (mainMenu.category === "Frontend TS") {
        const frontendMenu = await withCtrlX(() =>
          prompt([
            {
              type: "select",
              name: "frontend",
              message: "Select frontend stack:",
              choices: [
                {
                  name: "React + TS",
                  value: "react",
                },
                {
                  name: "Next.js + TS",
                  value: "next",
                },
                {
                  name: "Vue + TS",
                  value: "vue",
                },
                {
                  name: "Svelte + TS",
                  value: "svelte",
                },
                {
                  name: "⬅ Back",
                  value: "back",
                },
              ],
            },
          ])
        );

        if (frontendMenu.frontend !== "back") {
          selectedStack = frontendMenu.frontend;
        }
      }

      if (!selectedStack) {
        log(chalk.yellow("\n⬅ Back to main menu...\n"));
        continue;
      }

      log(`\n✨ You selected: ${selectedStack}\n`);

      const confirmInstall = await withCtrlX(() =>
        prompt([
          {
            type: "confirm",
            name: "installDeps",
            message: "Install dependencies now?",
            default: true,
          },
        ])
      );

      if (confirmInstall.installDeps) {
        log(`\n📦 Installing ${selectedStack}...\n`);

        if (selectedStack in BackendPackages) {
          runCommand("npm init -y", projectPath);

          const stack = BackendPackages[
  selectedStack as keyof typeof BackendPackages
]!; 

          runCommand(`npm install ${stack.deps.join(" ")}`, projectPath);

          runCommand(`npm install -D ${stack.devDeps.join(" ")}`, projectPath);

          runCommand("npx tsc --init", projectPath);

          runCommand("npm audit fix", projectPath);
        }

        if (selectedStack in FrontendCommands) {
          const template =
            FrontendCommands[selectedStack as keyof typeof FrontendCommands];

          runCommand(
            `npm create vite@latest . -- --template ${template}`,
            projectPath
          );
        }

        if (selectedStack === "next") {
          runCommand(`npx ${NextCommand}@latest . --ts`, projectPath);
        }

        const createFile: CreateFile = {
          name: projectName,
          path: projectPath,
          stack: selectedStack,
        };

        fs.writeFileSync(
          path.join(projectPath, "barong.config.json"),
          JSON.stringify(createFile, null, 2)
        );

        log(chalk.green("\n✅ Setup complete!\n"));

        log(
          chalk.yellow("⚠️ Report bug:"),
          chalk.gray("https://github.com/BarongTS/BarongTS/issues")
        );
      }

      const finish = await withCtrlX(() =>
        prompt([
          {
            type: "confirm",
            name: "done",
            message: "Finish?",
            default: true,
          },
        ])
      );

      if (finish.done) {
        log(chalk.green("\n✅ Thank you for using BarongTS CLI!\n"));
        continueMenu = false;
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