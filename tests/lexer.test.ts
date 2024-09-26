// lexer.test.ts
import { assertEquals } from "https://deno.land/std@0.222.0/assert/mod.ts";
import { TokenType, tokenize } from './../frontend/lexer.ts';

Deno.test("Tokenize simple arithmetic expression", () => {
    const sourceCode = "let a = 1 + 2;";
    const expectedTokens = [
        { value: 'let', type: TokenType.Let },
        { value: 'a', type: TokenType.Identifier },
        { value: '=', type: TokenType.Equals },
        { value: '1', type: TokenType.Number },
        { value: '+', type: TokenType.BinaryOperator },
        { value: '2', type: TokenType.Number },
        { value: ';', type: TokenType.Semicolon },
        { value: 'End of file', type: TokenType.EOF }
    ];

    assertEquals(tokenize(sourceCode), expectedTokens);

});

Deno.test("Tokenize string literal with whitespace", () => {
    const sourceCode = 'const message = "hello world";';
    const expectedTokens = [
        { value: 'const', type: TokenType.Const },
        { value: 'message', type: TokenType.Identifier },
        { value: '=', type: TokenType.Equals },
        { value: 'hello world', type: TokenType.String },
        { value: ';', type: TokenType.Semicolon },
        { value: 'End of file', type: TokenType.EOF }
    ];

    assertEquals(tokenize(sourceCode), expectedTokens);
});
