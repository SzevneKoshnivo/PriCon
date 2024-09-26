// frontend/ast.ts

// Abstract Syntax Tree (AST) nodes that represent the structure of the source code.
export type NodeType = 
    // STATEMENTS
    | 'Program'
    | 'VariableDeclaration'
    | 'ControlFlow'
    | 'WhileStatement'
    | 'ForStatement'
    // LITERALS
    | 'NumericLiteral'
    | 'StringLiteral'
    // EXPRESSIONS
    | 'AssignmentExpr'
    | 'Identifier' 
    | 'BinaryExpr'
    | 'LogicalExpr'
    // UNARY OPERATORS
    | 'UnaryExpr'



// Represents a statement in the source code
export interface Statement {
    kind: NodeType;
    line: number;
    column: number;
}

// Represents a program in the source code
export interface Program extends Statement {
    kind: 'Program';
    body: Statement[];
}

// Represents a variable declaration in the source code
export interface VariableDeclaration extends Statement {
    kind: 'VariableDeclaration';
    constant: boolean;
    identifier: string;
    value?: Expression;
}


// Represents an expression in the source code
export interface Expression extends Statement {
    kind: NodeType;
}

// Represents a binary expression in the source code (e.g. 1 + 2)
export interface BinaryExpr extends Expression {
    kind: 'BinaryExpr' | 'LogicalExpr';
    left: Expression;
    right: Expression;
    operator: string;
}

export interface UnaryExpr extends Expression {
    kind: 'UnaryExpr';
    operator: string;
    identifier: Expression;
}

// Represents an identifier in the source code (e.g. a, b, c)
export interface Identifier extends Expression {
    kind: 'Identifier';
    symbol: string;
}

// Represents a numeric literal in the source code (e.g. 1, 2, 3)
export interface NumericLiteral extends Expression {
    kind: 'NumericLiteral';
    value: number;
}

// Represents a string literal in the source code (e.g. "hello world")
export interface StringLiteral extends Expression {
    kind: 'StringLiteral';
    value: string;
}

// Represents an assignment expression in the source code (e.g. a = 1)
export interface AssignmentExpr extends Expression {
    kind: 'AssignmentExpr';
    assigne: Expression;
    value: Expression;
}

// Represents a conditional statement in the source code (e.g. if (a > b) { ... } else { ... })
export interface ControlFlowStatement extends Statement {
    kind: 'ControlFlow';
    condition: Expression;
    blockName: 'IF' | 'ELSE_IF' | 'ELSE';
    block: Statement[];
}