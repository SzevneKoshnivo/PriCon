// main.ts

import Parser from './frontend/parser.ts';
import Environment from './runtime/environment.ts';
import { evaluate } from './runtime/interpreter.ts';
import { MAKE_NULL, MAKE_BOOLEAN, MAKE_NUMBER, MAKE_STRING } from './runtime/values.ts';


repl();

function repl() {
    const parser = new Parser();
    const env = new Environment();

    env.declareVariable("pi", MAKE_NUMBER(Math.PI), true);
    env.declareVariable("e", MAKE_NUMBER(Math.E), true);
    env.declareVariable("version", MAKE_STRING("0.0.1"), true);
    env.declareVariable("true", MAKE_BOOLEAN(true), true);
    env.declareVariable("false", MAKE_BOOLEAN(false), true);
    env.declareVariable("null", MAKE_NULL(), true);

    console.log("\nWelcome to FunLang REPL");
    console.log("Type 'exit' to exit the REPL\n");

    while (true){
        const input = prompt("> ") as string;
        if (input === "exit") break;

        const program = parser.produceAST(input);

        console.log(program);

        const result = evaluate(program, env);

        console.log(result);
    }

    console.log("Goodbye!");
    Deno.exit(0);
}