/**
 * Объект DBStructure хранит информацию о структуре реляционной базы данных,
 * а также позволяет выполнять операции над ее метаданными.
 *
 * Объект не обращается к базе напрямую.
 *
 * Загрузка структуры происходит из объектов заданного типа, сформированных
 * внешним кодом.
 *
 * Для изменения метаданных формируются DDL запросы, которые должны быть
 * выполнены на базе данных внешним кодом. После выполнения такого запроса
 * должна быть выполнена синхронизация.
 *
 * Считывание структуры БД:
 *
 * -- домены считываем одним запросом и все данные (массив объектов)
 *    преобразуем в объект Fields.
 * -- поля и таблицы считываем за один раз
 *    запросом RDB$RELATION_FIELDS JOIN RDB$RELATIONS ORDER BY RDB$RELATION_NAME
 *    результирующую выборку обрабатываем последовательно, создавая
 *    объекты для таблиц и объекты для полей.
 * -- загрузка первичных ключей, внешних ключей и UNIQUE ограничений
 *    выполняется одним запросом RDB$RELATION_CONSTRAINTS JOIN RDB$INDEX_SEGMENTS
 *    LEFT JOIN RDB$REF_CONSTRAINTS
 *    ORDER BY RDB$RELATION_NAME, RDB$CONSTRAINT_NAME, RDB$FIELD_POSITION
 *    (Внимание! нельзя использовать агрегатную функцию LIST, так как она не
 *    сохраняет правильный порядок полей)
 */
export declare enum FieldType {
    SMALL_INTEGER = 7,
    INTEGER = 8,
    FLOAT = 10,
    DATE = 12,
    TIME = 13,
    CHAR = 14,
    BIG_INTEGER = 16,
    DOUBLE = 27,
    TIMESTAMP = 35,
    VARCHAR = 37,
    BLOB = 261,
}
export declare type NullFlag = null | 0 | 1;
export declare type ConstraintType = "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE";
export declare type UpdateRule = "CASCADE" | "RESTRICT" | "SET NULL" | "NO ACTION" | "SET DEFAULT";
export declare type DeleteRule = UpdateRule;
export interface IRDB$FIELD {
    RDB$FIELD_NAME: string;
    RDB$FIELD_TYPE: FieldType;
    RDB$NULL_FLAG: NullFlag;
}
export interface IRDB$RELATIONFIELD {
    RDB$RELATION_NAME: string;
    RDB$FIELD_NAME: string;
    RDB$FIELD_SOURCE: string;
    RDB$NULL_FLAG: NullFlag;
}
export interface IRDB$RELATIONCONSTRAINT {
    RDB$RELATION_NAME: string;
    RDB$CONSTRAINT_NAME: string;
    RDB$CONSTRAINT_TYPE: ConstraintType;
    RDB$CONST_NAME_UQ: string;
    RDB$UPDATE_RULE: UpdateRule;
    RDB$DELETE_RULE: DeleteRule;
    RDB$INDEX_NAME: string;
    RDB$FIELD_NAME: string;
}
export interface IFields {
    [name: string]: Field;
}
export interface IRelations {
    [name: string]: Relation;
}
export interface IRefConstraints {
    [name: string]: FKConstraint;
}
export interface IUqConstraints {
    [name: string]: UqConstraint;
}
export declare class DBStructure {
    private _fields;
    readonly fields: IFields;
    private _relations;
    readonly relations: IRelations;
    load(fields: IRDB$FIELD[], relations: IRDB$RELATIONFIELD[], constraints: IRDB$RELATIONCONSTRAINT[]): void;
    relationByUqConstraint(constraintName: string): Relation | undefined;
    private loadFields(fields);
    private loadRelations(relationFields);
    private loadRelationConstraints(constraints);
}
export declare class Field {
    readonly fieldType: FieldType;
    readonly notNull: boolean;
    constructor(fieldType: FieldType, notNull: boolean);
}
export declare class Relation {
    readonly name: string;
    private relationFields;
    private _primaryKey?;
    private _foreignKeys;
    private _unique;
    constructor(name: string);
    readonly primaryKey: PKConstraint | undefined;
    readonly foreignKeys: IRefConstraints;
    readonly unique: IUqConstraints;
    loadField(field: IRDB$RELATIONFIELD): void;
    loadConstraintField(constraint: IRDB$RELATIONCONSTRAINT): void;
}
export declare class RelationField {
    readonly name: string;
    readonly fieldSource: string;
    readonly notNull: boolean;
    constructor(name: string, fieldSource: string, notNull: boolean);
}
export declare class RelationConstraint {
    readonly name: string;
    readonly indexName: string;
    readonly fields: string[];
    constructor(name: string, indexName: string, fields: string[]);
    loadField(data: IRDB$RELATIONCONSTRAINT): void;
}
export declare class PKConstraint extends RelationConstraint {
}
export declare class FKConstraint extends RelationConstraint {
    readonly constNameUq: string;
    readonly updateRule: UpdateRule;
    readonly deleteRule: DeleteRule;
    constructor(name: string, indexName: string, fields: string[], constNameUq: string, updateRule: UpdateRule, deleteRule: DeleteRule);
}
export declare class UqConstraint extends RelationConstraint {
}
