// runtime/interpreter.ts

import { NumberVal, StringVal, RuntimeVal } from './values.ts';
import { Statement, BinaryExpr, UnaryExpr, NumericLiteral, Program, Identifier, VariableDeclaration, AssignmentExpr, ControlFlowStatement} from '../frontend/ast.ts';
import Environment from './environment.ts';
import { eval_assignment, evaluate_binary_expression, evaluate_logical_expression, evaluate_identifier, evaluate_unary_expression } from './eval/expressions.ts';
import { evaluate_program, evaluate_varriable_declaration } from './eval/statements.ts';
import { StringLiteral } from '../frontend/ast.ts';
import { evaluate_control_flow_statement } from './eval/statements.ts';


export function evaluate(astNode: Statement, env: Environment): RuntimeVal{
    //console.log("Evaluating AST node:", astNode);
    switch (astNode.kind){
        case 'NumericLiteral':
            return { 
                value: ((astNode as NumericLiteral).value),
                type: "number"
            } as NumberVal;
        case 'StringLiteral':
            return {
                value: ((astNode as StringLiteral).value),
                type: "string"
            } as StringVal;
        case "Identifier":
            return evaluate_identifier(astNode as Identifier, env);
        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env);
        case "UnaryExpr":
            return evaluate_unary_expression(astNode as UnaryExpr, env);
        case "BinaryExpr":
            return evaluate_binary_expression(astNode as BinaryExpr, env);
        case "LogicalExpr":
            return evaluate_logical_expression(astNode as BinaryExpr, env);
        case "Program":
            return evaluate_program(astNode as Program, env);

        //Statements
        case "VariableDeclaration":
            return evaluate_varriable_declaration(astNode as VariableDeclaration, env);

        case "ControlFlow":
            return evaluate_control_flow_statement(astNode as ControlFlowStatement, env);

        default:
            console.error("This AST node is not implemented yet. Node:", astNode);
            Deno.exit(1);
    }
}