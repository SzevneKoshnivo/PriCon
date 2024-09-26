// interpreter.test.ts


import { assertEquals } from "https://deno.land/std@0.222.0/assert/mod.ts";
import { evaluate } from "../runtime/interpreter.ts";
import { BinaryExpr } from "../frontend/ast.ts";
import Environment from "../runtime/environment.ts";
import { RuntimeVal } from "../runtime/values.ts";
import Parser from "../frontend/parser.ts";

Deno.test("Evaluate simple numeric expression from AST", () => {
    const astNode = { kind: "BinaryExpr", left: { kind: "NumericLiteral", value: 1, line: 0, column: 0 }, operator: "+", right: { kind: "NumericLiteral", value: 2, line: 0, column: 0 }, line: 0, column: 0 } as BinaryExpr;
    const expectedValue = { type: "number", value: 3 } as RuntimeVal;
    const yourEnvironment = new Environment();
    assertEquals(evaluate(astNode, yourEnvironment), expectedValue);
});

Deno.test("Evaluate simple string expression from Raw text", () => {
    const parser = new Parser();
    const environment = new Environment();

    const sourceCode = "let a = \"hello world\";";
    const program = parser.produceAST(sourceCode);
    const expectedValue = { type: "string", value: "hello world" } as RuntimeVal;

    assertEquals(evaluate(program, environment), expectedValue);
});


/*
Deno.test("Evaluate conditional statement", () => {
    const astNode = {
        kind: "ControlFlow",
        condition: { kind: "BinaryExpr", left: { kind: "Identifier", symbol: "a" }, operator: ">", right: { kind: "Identifier", symbol: "b" } },
        blockName: "IF",
        block: [{ kind: "VariableDeclaration", identifier: "result", value: { kind: "StringLiteral", value: "a is greater" }, constant: false }]
    } as ControlFlowStatement;
    // Add expected value here
});
*/