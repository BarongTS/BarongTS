import { createPromptModule } from "inquirer";
import { execSync } from "child_process";
import path from "path";
import fs from "fs"; import { fileURLToPath } from "url";
import chalk from 'chalk';
import type { Menu } from "./globals.js";

async function main() {
  const asciiPath: string = path.join( path.dirname(fileURLToPath(import.meta.url)), "..", "ascii.txt" ); if (fs.existsSync(asciiPath)) { const art: string = fs.readFileSync(asciiPath, "utf-8"); console.log(chalk.blue(art)); }

  console.log(chalk.bgGreen(" Welcome to BarongTS  "))
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
                "Fullstack TS", 
                "Exit"],
            pageSize: 10,
          },
        ])
      );

    if (mainMenu.category === "Exit") {      console.clear();      console.log(chalk.red("\n❌ Thank you for using BarongTS CLI. Goodbye!\n"));
      break;
    }

    let selectedStack: string | string[] | null = null;

    switch (mainMenu.category) {
      case "Backend TS": {
        const backendMenu = await withCtrlX(() =>
          prompt([
            {
              type: "select",
              name: "backend",
              message: "Select backend stack:",
              choices: [
                "Node.js + TS (Recommended)",
                "Express + TS",
                "NestJS + TS",
                "⬅ Back",
              ],
              pageSize: 10,
              pointer: chalk.green(' ❯ '),
            },
          ])
        );
        if (backendMenu.backend !== "⬅ Back") selectedStack = backendMenu.backend;
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
                "React + TS (Recommended)",
                "Vue + TS",
                "Svelte + TS",
                "Next.js + TS",
                "⬅ Back",
              ],
              pageSize: 10,
              pointer: chalk.green(' ❯ '),
            },
          ])
        );
        if (frontendMenu.frontend !== "⬅ Back") selectedStack = frontendMenu.frontend;
        break;
      }

      case "Fullstack TS": {
        const fullstackMenu = await withCtrlX(() =>
          prompt([
            {
              type: "select",
              name: "fullstack",
              message: "Select fullstack stack:",
              choices: [
                "Fullstack Vite + React + Express + Jest + Docker",
                "Fullstack Node + Vue + Express + Docker",
                "Fullstack NestJS + Next.js",
                "⬅ Back",
              ],
              pageSize: 10,
              pointer: chalk.green(' ❯ '),
            },
          ])
        );
        if (fullstackMenu.fullstack !== "⬅ Back") selectedStack = fullstackMenu.fullstack;
        break;
      }
    }

    // Jika user pilih "Back", langsung kembali ke main menu
    if (selectedStack === null) {
      console.clear();
      console.log(chalk.blue("\n⬅️ Back to main menu...\n"));
      continue;
    }

    // Jika user pilih stack yang valid
    if (selectedStack) {
      console.clear();
      console.log(`\n✨ You selected: ${mainMenu.category} → ${selectedStack}\n`);

      // Multi-select fitur tambahan
      const featureMenu = await withCtrlX(() =>
        prompt([
          {
            type: "checkbox",
            name: "features",
            message: "Select additional features (optional):",
            choices: ["TypeScript", "ESLint", "Prettier", "Tailwind CSS"],
            pageSize: 10,
          },
        ])
      );

      if (featureMenu.features.length > 0) {
        console.log("Additional features:", featureMenu.features.join(", "));
      }

      console.clear();

      // Konfirmasi install dependencies
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
        console.clear();
        console.log(`\n📦 Installing ${selectedStack} dependencies...`);
        // Disini bisa diganti execSync sesuai stack
        console.log("🔍 Installation simulated (replace with npm install commands)");
      } else {
        console.clear();
        console.log("⏭️ Skipping installation.");
      }

      const nextAction = await withCtrlX(() =>
        prompt([
          {
            type: "confirm",
            name: "selectAgain",
            message: "Do you want to select another stack?",
            default: true,
          },
        ])
      );

      if (!nextAction.selectAgain) {
        console.clear();
        console.log(chalk.green("\nThank you for using BarongTS CLI. Goodbye!\n"));
        continueMenu = false;
      }
    }
  } catch (err: any) {
    if (err?.message === "User canceled") {
      console.clear();
      console.log(chalk.bgRed("\n❌ User canceled. Exiting...\n"));
      break;
    }
    throw err;
  }
  }
}

main();