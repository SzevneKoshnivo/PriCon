// parser.test.ts


import { assertEquals } from "https://deno.land/std@0.222.0/assert/mod.ts";
import { Program, VariableDeclaration } from './../frontend/ast.ts';
import Parser from "../frontend/parser.ts";

Deno.test("Parse simple variable declaration", () => {
    const sourceCode = "let a = 1;";
    const parser = new Parser();
    const expectedAST = {
        kind: "Program",
        body: [
            {
                kind: "VariableDeclaration",
                identifier: "a",
                value: { kind: "NumericLiteral", value: 1, line: 0, column: 0 },
                constant: false,
                line: 0,
                column: 0
            } as VariableDeclaration
        ],
        line: 0,
        column: 0
    } as Program;

    assertEquals(parser.produceAST(sourceCode), expectedAST);
});

/*
Deno.test("Parse conditional statement with else if", () => {
    const sourceCode = `
        if (a > b) {
            let result = "a is greater";
        } else if (b > a) {
            let result = "b is greater";
        } else {
            let result = "a and b are equal";
        }
    `;
    const parser = new Parser();
    // Add expected AST here
});
*/