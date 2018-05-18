import { Field } from "./Field";
import { Relation } from "./Relation";
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
export declare type NullFlag = 0 | 1;
export declare type ConstraintType = "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE";
export declare type UpdateRule = "CASCADE" | "RESTRICT" | "SET NULL" | "NO ACTION" | "SET DEFAULT";
export declare type DeleteRule = UpdateRule;
export interface IRDB$FIELD {
    RDB$FIELD_NAME: string;
    RDB$FIELD_TYPE: FieldType;
    RDB$NULL_FLAG: NullFlag;
    RDB$DEFAULT_VALUE: string | null;
    RDB$FIELD_LENGTH: number;
    RDB$FIELD_SCALE: number;
    RDB$VALIDATION_SOURCE: string | null;
    RDB$FIELD_SUB_TYPE: number | null;
    RDB$FIELD_PRECISION: number;
}
export interface IRDB$RELATIONFIELD {
    RDB$RELATION_NAME: string;
    RDB$FIELD_NAME: string;
    RDB$FIELD_SOURCE: string;
    RDB$NULL_FLAG: NullFlag;
    RDB$DEFAULT_VALUE: string | null;
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
export declare class DBStructure {
    private _fields;
    private _relations;
    private _relationsByUqConstraint;
    readonly fields: IFields;
    readonly relations: IRelations;
    load(fields: IRDB$FIELD[], relations: IRDB$RELATIONFIELD[], constraints: IRDB$RELATIONCONSTRAINT[]): void;
    forEachRelation(f: (r: Relation) => void, hasPK?: boolean): void;
    findRelation(f: (r: Relation) => boolean): Relation | null;
    relationByUqConstraint(constraintName: string): Relation;
    private loadFields(fields);
    private loadRelations(relationFields);
    private loadRelationConstraints(constraints);
}
