// runtime/environment.ts

import { RuntimeVal } from './values.ts';


export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor (parentENV?: Environment){
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVariable(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal{
        // Check if variable is already declared
        if (this.variables.has(varname)){
            throw `Variable '${varname}' is already declared!`;
        }

        this.variables.set(varname, value);

        if (constant){
            this.constants.add(varname);
        }

        return value;
    }

    public assignVariable(varname: string, value: RuntimeVal): RuntimeVal{
        // Check if variable is declared
        const env = this.resolveVariable(varname);

        // Cannot assign to constant
        if (env.constants.has(varname)){
            throw `Constant '${varname}' cannot be reassigned!`;
        }

        env.variables.set(varname, value);

        return value;
    }

    public lookupVariable(varname: string): RuntimeVal{
        const env = this.resolveVariable(varname);
        return env.variables.get(varname) as RuntimeVal;
    }

    public resolveVariable(varname: string): Environment{
        //find the scope
        if (this.variables.has(varname)){
            return this;
        }

        if (this.parent == undefined){
            throw `Symbol '${varname}' was not declared!`;
        }

        return this.parent.resolveVariable(varname);
    }
}