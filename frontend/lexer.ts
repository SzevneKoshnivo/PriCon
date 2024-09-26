// frontend/lexer.ts

// Represents the different types of tokens that the lexer can produce
export enum TokenType {
    //Literals
    Number,
    Identifier,
    String,

    //Grouping operators
    BinaryOperator,
    Equals,
    NotEqualsTo,
    Semicolon,
    OpenParen,
    CloseParen,
    
    //Unary operators
    UnaryOperator,

    //Keywords
    Let,
    Const,
    IF,
    ELSE_IF,
    ELSE,

    //End of file
    EOF,
}

// A map of reserved keywords in the language
const KEYWORDS: Record<string, TokenType> = {
    'let': TokenType.Let,
    'const': TokenType.Const,
    'if': TokenType.IF,
    'else if': TokenType.ELSE_IF,
};

// Represents a single token in the source code
export interface Token {
    value: string;
    type: TokenType;
    line: number;
    column: number;
}

// Creates a new token with the given value and type
export function token(value: string = '', type: TokenType, line: number, column: number): Token {
    return { value, type, line, column };
}

// Determines if a character is a letter
function isAlpha(str: string): boolean {
    //return str.toLowerCase() != str.toUpperCase();
    return !!str.match(/[a-zA-Z_]/i)
}

// Determines if a character is a number
function isNumeric(str: string): boolean {
    return !!str.match(/[0-9]/) || str === '.';
}

// Determines if a character is a whitespace character
function isSkipable(str: string): boolean {
    return str === ' ' || str === '\n' || str === '\t';
}

// Tokenizes the source code into an array of tokens
export function tokenize(sourceCode: string): Token[] {
    
    let line = 1;
    let column = 0;
    
    const tokens = new Array<Token>();

    // Split the source code into an array of characters
    const src = sourceCode.split('');



    // Iterate through the source code in a loop by each character
    while (src.length > 0) {

        if (src[0] === '('){
            tokens.push(token(src.shift(), TokenType.OpenParen, line, ++column));
        } else if (src[0] === ')'){
            tokens.push(token(src.shift(), TokenType.CloseParen, line, ++column));
        } else if (src[0] === '+' || src[0] === '*' || src[0] === '/' || src[0] === '%'){
            tokens.push(token(src.shift(), TokenType.BinaryOperator, line, ++column));
        }else if (src[0] === '-') {
            // Check if the '-' character represents a unary minus or a binary subtraction
            if (
                // Check if the previous token is undefined (start of the line) or a binary operator
                !tokens.length ||
                tokens[tokens.length - 1].type === TokenType.BinaryOperator ||
                tokens[tokens.length - 1].type === TokenType.OpenParen
            ) {
                // This '-' character represents a unary minus
                src.shift(); // Skip the '-' character
                ++column;
                
                // Skip whitespace characters
                while (isSkipable(src[0])) {
                    src.shift();
                    ++column;
                }
        
                // Tokenize the number
                const num = tokenizeNumber(src);
        
                // If num is not a number
                if (!isNumeric(num)) {
                    throw "Invalid number literal. Expected a number after a unary minus.";
                }
        
                tokens.push(token(`-${num}`, TokenType.Number, line, column));
            } else {
                // This '-' character represents a binary subtraction
                tokens.push(token(src.shift(), TokenType.BinaryOperator, line, ++column));
            }
        } else if (src[0] === '='){

            if (src[1] === '='){
                src.shift(); // Skip the '=' character
                src.shift(); // Skip the second '=' character
                column+=2;
                tokens.push(token('==', TokenType.Equals, line, column));
            } else {
                src.shift(); // Skip the '=' character
                tokens.push(token('=', TokenType.Equals, line, ++column));
            }
        } else if (src[0] === ';'){
            tokens.push(token(src.shift(), TokenType.Semicolon, line, ++column));
        } else if (src[0] === '&' && src[1] === '&') {
            src.shift(); // Skip the first '&' character
            src.shift(); // Skip the second '&' character
            column+=2;
            tokens.push(token('&&', TokenType.BinaryOperator, line, column));
        }  else if (src[0] === '|' && src[1] === '|') {
            src.shift(); // Skip the first '|' character
            src.shift(); // Skip the second '|' character
            column+=2;
            tokens.push(token('||', TokenType.BinaryOperator, line, column));
        } else if (src[0] === '!') {

            if (src[1] === '='){
                src.shift(); // Skip the first '!' character
                src.shift(); // Skip the second '=' character
                column+=2;
                tokens.push(token('!=', TokenType.BinaryOperator, line, column));
            } else {
                src.shift(); // Skip the first '!' character
                tokens.push(token('!', TokenType.UnaryOperator, line, ++column));
            }

        } else if (src[0] === '>') {
            
            if (src[1] === '='){
                src.shift(); // Skip the first '>' character
                src.shift(); // Skip the second '=' character
                column+=2;
                tokens.push(token('>=', TokenType.BinaryOperator, line, column));
            } else {
                src.shift(); // Skip the first '>' character
                tokens.push(token('>', TokenType.BinaryOperator, line, ++column));
            }

        } else if (src[0] === '<') {
            
            if (src[1] === '='){
                src.shift(); // Skip the first '<' character
                src.shift(); // Skip the second '=' character
                column+=2;
                tokens.push(token('<=', TokenType.BinaryOperator, line, column));
            } else {
                src.shift(); // Skip the first '<' character
                tokens.push(token('<', TokenType.BinaryOperator, line, ++column));
            }

        } else if (src[0] === '"') {
            // Handle string literals
            src.shift(); // Skip the opening quote
            column++;
            let str = "";
            while (src.length > 0 && src[0] !== '"'){
                str += src.shift();
                column++;
            }

            src.shift(); // Skip the closing quote

            tokens.push(token(str, TokenType.String, line, ++column));
            
        } else {
            // Handle multi-character tokens

            if (isNumeric(src[0])){

                tokens.push(token(tokenizeNumber(src), TokenType.Number, line, column));

            } else if (isAlpha(src[0])){

                let identifier = "";

                while (src.length > 0 && isAlpha(src[0])){
                    identifier += src.shift();
                    column++;
                }

                const reserved = KEYWORDS[identifier];

                if (typeof reserved == "number"){
                    tokens.push(token(identifier, reserved, line, column));
                } else {
                    tokens.push(token(identifier, TokenType.Identifier, line, column));
                }
            } else if (isSkipable(src[0])){
                if (src[0] == '\n'){
                    line++;
                    column = 0;
                }
                src.shift(); // Skip the whitespace character
            } else {
                throw `Unexpected character found while reading: ${src[0]}`;
            }
        }
    } 

    // Push the EOF token
    tokens.push(token('End of file', TokenType.EOF, line, column));

    return tokens;
}

// Function to validate if a character is numeric
function _isValidNumberChar(char: string, decimalPointCount: number): boolean {
    return isNumeric(char) || (char === '.' && decimalPointCount === 0);
}

// Function to tokenize numeric values
function tokenizeNumber(src: string[]): string {
    let num = "";
    let decimalPointCount = 0; // Track the number of decimal points encountered
    while (src.length > 0 && _isValidNumberChar(src[0], decimalPointCount)) {
        if (src[0] === '.') {
            decimalPointCount++;
            if (decimalPointCount > 1) {
                throw "Invalid number literal. Too many decimal points.";
            }
        }
        num += src.shift();
    }
    return num;
}