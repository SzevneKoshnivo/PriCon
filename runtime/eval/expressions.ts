// runtime/eval/expressions.ts

import { BinaryExpr, UnaryExpr, type Identifier, AssignmentExpr } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeVal, NumberVal, MAKE_NULL, StringVal, MAKE_BOOLEAN, BooleanVal } from "../values.ts";


export function evaluate_identifier(identifier: Identifier, env: Environment): RuntimeVal {
    const value = env.lookupVariable(identifier.symbol);
    return value;
}

export function evaluate_unary_expression(unary: UnaryExpr, env: Environment): RuntimeVal {

    const expr = evaluate(unary.identifier, env);

    /*
    if (expr.type != "number"){
        throw `Invalid unary operation on ${expr.type}`;
    }
    */

    if (unary.operator == "-"){
        return {
            type: "number",
            value: -1 * (expr as NumberVal).value
        } as NumberVal;
    } else if (unary.operator == "!"){
        return {
            type: "bool",
            value: (expr as BooleanVal).value ? false : true
        } as BooleanVal;
    }

    return MAKE_NULL();
}

export function evaluate_binary_expression(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type == "number" && rhs.type == "number"){
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
    } else if (lhs.type == "string" || rhs.type == "string"){
        return eval_binary_string_concat(lhs as StringVal, rhs as StringVal, binop.operator);
    } else if (lhs.type == "bool" || rhs.type == "bool"){
        return eval_numeric_binary_expr(((lhs as BooleanVal).value ? { type: "number", value: 1} : { type: "number", value: 0} as NumberVal), ((rhs as BooleanVal).value ? { type: "number", value: 1} : { type: "number", value: 0} as NumberVal), binop.operator);
    }
    //One or both null
    return MAKE_NULL();
}

export function evaluate_logical_expression(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if ((lhs.type == "bool" || lhs.type == "number") && (rhs.type == "bool" || rhs.type == "number")){
        return eval_numeric_logical_expr(lhs as BooleanVal, rhs as BooleanVal, binop.operator);
    } else if (lhs.type == "string" || rhs.type == "string"){
        return eval_logical_string_concat(lhs as StringVal, rhs as StringVal, binop.operator);
    }

    return MAKE_BOOLEAN(false);
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
    if (node.assigne.kind != "Identifier"){
        throw "Invalid Left Hand Side of assignment expression" + JSON.stringify(node.assigne);
    }

    if (["false", "true", "null"].includes((node.assigne as Identifier).symbol)){
        throw `Cannot assign to built in type ${(node.assigne as Identifier).symbol}`;
    }

    return env.assignVariable((node.assigne as Identifier).symbol, evaluate(node.value, env));
}

function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {

    let result = 0;

    switch (operator){

        // Additive
        case '+':
            result = lhs.value + rhs.value;
            break;
        case '-':
            result = lhs.value - rhs.value;
            break;

        // Multiplicative
        case '*':
            result = lhs.value * rhs.value;
            break;
        case '/':
            if (rhs.value == 0){
                throw "Division by zero is forbidden!";
            }
            result = lhs.value / rhs.value;
            break;
        case '%':
            result = lhs.value % rhs.value;
            break;

        default:
            throw "Invalid operator " + operator;
    }

    return {
        type: "number",
        value: result
    } as NumberVal;
}

function eval_numeric_logical_expr(lhs: BooleanVal, rhs: BooleanVal, operator: string): BooleanVal {

    let result: boolean = false;

    switch (operator){

        // Logical
        case '&&':
            result = lhs.value && rhs.value? true : false;
            break;
        case '||':
            result = lhs.value || rhs.value? true : false;
            break;

        //Comparison
        case '<':
            result = lhs.value < rhs.value? true : false;
            break;
        case '>':
            result = lhs.value > rhs.value? true : false;
            break;
        case '<=':
            result = lhs.value <= rhs.value? true : false;
            break;
        case '>=':
            result = lhs.value >= rhs.value? true : false;
            break;

        //Equlity
        case '==':
            result = lhs.value == rhs.value? true : false;
            break;
        case '!=':
            result = lhs.value!= rhs.value? true : false;
            break;

        default:
            throw "Invalid logical operator " + operator;
    }

    return {
        type: "bool",
        value: result
    } as BooleanVal;
}


function eval_binary_string_concat(lhs: StringVal, rhs: StringVal, operator: string): StringVal {
    

    //lhs can be number or string
    if (lhs.type != "string" && lhs.type != "number"){
        throw `Invalid operation between string and ${lhs.type}`;
    }

    if (rhs.type == "string" || rhs.type == "number"){
        
        if (operator != "+"){
            throw `Invalid operation between string and ${rhs.type}`;
        }
        
        return {
            type: "string",
            value: lhs.value + rhs.value
        } as StringVal;
    } else {
        throw `Invalid operation between string and ${rhs.type}`;
    }
}


function eval_logical_string_concat(lhs: StringVal, rhs: StringVal, operator: string): BooleanVal {

    if (operator != "==" && operator != "!="){
        throw `Invalid operation between string and ${rhs.type}`;
    }

    return {
        type: "bool",
        value: lhs.value == rhs.value? true : false
    } as BooleanVal;

}