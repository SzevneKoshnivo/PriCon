// runtime/eval/statements.ts

import { ControlFlowStatement, Program, VariableDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberVal } from "../values.ts";
import { StringVal } from "../values.ts";
import { RuntimeVal, MAKE_NULL } from "../values.ts";


export function evaluate_program(program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MAKE_NULL();

    for (const statement of program.body){
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;
}

export function evaluate_varriable_declaration(declaration: VariableDeclaration, env: Environment): RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env) : MAKE_NULL();
    return env.declareVariable(declaration.identifier, value, declaration.constant);
}

export function evaluate_control_flow_statement(astNode: ControlFlowStatement, env: Environment): RuntimeVal {
    const conditionValue = evaluate(astNode.condition, env);
    
    if (isTruthy(conditionValue) && astNode.blockName === 'IF') {
        // Evaluate the block associated with the IF condition
        for (const statement of astNode.block) {
            evaluate(statement, env);
        }
    } else if (isTruthy(conditionValue) && astNode.blockName === 'ELSE_IF') {
        // Evaluate the block associated with the ELSE_IF condition
        for (const statement of astNode.block) {
            evaluate(statement, env);
        }
    } else if (!isTruthy(conditionValue) && astNode.blockName === 'ELSE') {
        // Evaluate the block associated with the ELSE condition
        for (const statement of astNode.block) {
            evaluate(statement, env);
        }
    }

    return MAKE_NULL();
}

function isTruthy(value: RuntimeVal): boolean {
    // Implement your truthy check logic here
    // For example, consider numbers greater than zero and non-empty strings as truthy
    if (value.type === "number") {
        return (value as NumberVal).value > 0;
    } else if (value.type === "string") {
        return (value as StringVal).value.length > 0;
    } else {
        // Handle other types as needed
        return false;
    }
}