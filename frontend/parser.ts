// frontend/parser.ts

import {
    Statement,
    Program,
    Expression,
    BinaryExpr,
    UnaryExpr,
    AssignmentExpr,
    NumericLiteral,
    StringLiteral,
    Identifier,
    VariableDeclaration
} from './ast.ts';

import { tokenize, Token, TokenType } from './lexer.ts';




/**
 * The `Parser` class is responsible for parsing a string of source code and producing an Abstract Syntax Tree (AST) representation of the program.
 *
 * The parser uses a recursive descent approach to parse the input source code, recognizing the various language constructs such as variable declarations, expressions, and statements.
 *
 * The `produceAST` method takes the source code as a string and returns the root node of the AST, which represents the entire program.
 */
export default class Parser {
  private _tokens: Token[] = [];

  private at() {
    return this._tokens[0] as Token;
  }

  private eat() {
    const prev = this._tokens.shift() as Token;
    return prev;
  }

  private expect(expectedTypes: TokenType[], message: string) {
    const prev = this.eat();
    if (!prev ||!expectedTypes.includes(prev.type)) {
      throw message;
    }
    return prev;
  }

  private not_eof(): boolean {
    return this._tokens[0].type != TokenType.EOF;
  }

  private parse_statement(): Statement {

    // skip to parse_expression
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_variable_declaration();

      default:
        return this.parse_expression();
    }
  }

  // let a = 1;
  // const b = 2;
  // (LET | CONST) IDENTIFIER = EXPRESSION
  private parse_variable_declaration(): Statement {
    
    const isConstantDeclaration = this.eat().type == TokenType.Const;

    const identifier =
      this.expect(
        [TokenType.Identifier],
        `Expected identifier after ${isConstantDeclaration ? "const" : "let"} keyword`,
      ).value;

    if (this.at().type == TokenType.Semicolon) {
        this.eat(); // expect semicolon
        if (isConstantDeclaration) {
          throw "Constant declaration must have a value.";
        }
        return {
          kind: "VariableDeclaration",
          identifier,
          value: this.parse_expression(),
          constant: isConstantDeclaration,
        } as VariableDeclaration;
    }

    this.expect(
      [TokenType.Equals, TokenType.Semicolon],
      `Expected value or ; after identifier in variable declaration`,
    );

    const declaration = {
      kind: "VariableDeclaration",
      identifier,
      value: this.parse_expression(),
      constant: isConstantDeclaration,
    } as VariableDeclaration;

    this.expect(
      [TokenType.Semicolon],
      "Expected semicolon after variable declaration",
    );

    return declaration;
  }

  private parse_expression(): Expression {
    return this.parse_assignment_expression();
  }

  private parse_assignment_expression(): Expression {

    //const left = this.parse_additive_expression(); // switch this to ObjectExpression later
    let left = this.parse_equality_expression();

    if (this.at().type == TokenType.Equals) {
      this.eat(); // skip the equals sign
      const value = this.parse_assignment_expression();

      left = {
        value,
        assigne: left,
        kind: "AssignmentExpr",
      } as AssignmentExpr;
    }

    return left;
  }

  private parse_equality_expression(): Expression {

      let left = this.parse_comparative_expression();

      while (this.at().value == "==" || this.at().value == "!=") {
        const operator = this.eat().value;
        const right = this.parse_assignment_expression();
        left = {
          kind: "LogicalExpr",
          left,
          right,
          operator,
          line: left.line,
          column: left.column,
        } as BinaryExpr;
      }


      return left;
  }

  private parse_comparative_expression(): Expression {

    let left = this.parse_additive_expression();
    
    while (this.at().value == ">" || this.at().value == "<" || this.at().value == ">=" || this.at().value == "<=") {
      const operator = this.eat().value;
      const right = this.parse_assignment_expression();
      left = {
        kind: "LogicalExpr",
        left,
        right,
        operator,
        line: left.line,
        column: left.column,
      } as BinaryExpr;
    }

    return left;

  }

  // (a + b) - c
  private parse_additive_expression(): Expression {

    let left = this.parse_multiplicative_expression();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_assignment_expression();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
        line: left.line,
        column: left.column,
      } as BinaryExpr;
    }

    return left;
  }

  // Multiplicative: *, /
  private parse_multiplicative_expression(): Expression {

    let left = this.parse_primary_expression();

    while (
      this.at().value == "*" || this.at().value == "/" || this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_assignment_expression();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
        line: left.line,
        column: left.column,
      } as BinaryExpr;
    }

    return left;
  }

  // Order or precedence
  // Assignment: =
  // Member access: . (dot)
  // Function call: ()
  // Logical: &&, ||
  // Comparison: <, >, <=, >=
  // Additive: +, -
  // Multiplicative: *, /
  // Unary: - (negation)
  // PrimaryExpression

  private parse_primary_expression(): Expression {

    const tokenType = this.at().type;

    switch (tokenType) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:{
        const literal = this.eat();
        return {
          kind: "NumericLiteral",
          value: parseFloat(literal.value),
          line: literal.line,
          column: literal.column,
        } as NumericLiteral;
      }
      case TokenType.String:{
        const literal = this.eat();
        return {
          kind: "StringLiteral",
          value: literal.value,
          line: literal.line,
          column: literal.column,
        } as StringLiteral;
      }
      case TokenType.UnaryOperator:{
        const operator = this.eat();
        return {
          kind: "UnaryExpr",
          operator: operator.value,
          identifier: this.parse_expression(),
        } as UnaryExpr;
      }
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expression();
        this.expect(
          [TokenType.CloseParen],
          "Unexpected token found inside parameterised expression. Expected closing parenthesis",
        ); // CloseParen
        return value;
      }
        

      default:
        throw `Unrecognised token found: ${this.at().value}`;
    }
  }

  public produceAST(sourceCode: string): Program {

    this._tokens = tokenize(sourceCode);

    //console.log(this._tokens);

    const program: Program = {
      kind: "Program",
      body: [],
      line: 0,
      column: 0,
    };

    while (this.not_eof()) {
      program.body.push(this.parse_statement());
    }

    //console.log(program);

    return program;
  }
}
