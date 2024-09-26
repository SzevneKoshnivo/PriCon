// runtime/values.ts

export type ValueType = "null" | "number" | "string" | "bool";

export interface RuntimeVal {
    type: ValueType;
}


export interface NullVal extends RuntimeVal {
    type: "null";
    value: null;
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export interface StringVal extends RuntimeVal {
    type: "string";
    value: string;
}

export interface BooleanVal extends RuntimeVal {
    type: "bool";
    value: boolean;
}

export function MAKE_NUMBER(num = 0){
    return { type: "number", value: num } as NumberVal;
}

export function MAKE_STRING(str = ""){
    return { type: "string", value: str } as StringVal;
}

export function MAKE_NULL(){
    return { type: "null", value: null } as NullVal;
}

export function MAKE_BOOLEAN(value: boolean = false){
    return { type: "bool", value } as BooleanVal;
}