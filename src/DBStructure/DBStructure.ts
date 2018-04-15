import {Field} from "./Field";
import {Relation} from "./Relation";

export enum FieldType {
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
    BLOB = 261
}

export type NullFlag = null | 0 | 1;
export type ConstraintType = "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE";
export type UpdateRule = "CASCADE" | "RESTRICT" | "SET NULL" | "NO ACTION" | "SET DEFAULT";
export type DeleteRule = UpdateRule;

export interface IRDB$FIELD {
    RDB$FIELD_NAME: string;
    RDB$FIELD_TYPE: FieldType;
    RDB$NULL_FLAG: NullFlag;
    RDB$DEFAULT_VALUE: string | null;
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
export class DBStructure {

    private _fields: IFields = {};
    private _relations: IRelations = {};

    get fields(): IFields {
        return this._fields;
    }

    get relations(): IRelations {
        return this._relations;
    }

    public load(fields: IRDB$FIELD[], relations: IRDB$RELATIONFIELD[], constraints: IRDB$RELATIONCONSTRAINT[]): void {
        this.loadFields(fields);
        this.loadRelations(relations);
        this.loadRelationConstraints(constraints);
    }

    public forEachRelation(f: (r: Relation) => void): void {
        Object.entries(this._relations).forEach(([key, value]) => f(value));
    }

    public findRelation(f: (r: Relation) => boolean): Relation | null {
        const entry = Object.entries(this._relations).find(([key, value]) => f(value));
        if (entry) {
            return entry[1];
        }
        return null;
    }

    public relationByUqConstraint(constraintName: string): Relation {
        const entry = Object.entries(this._relations).find(([key, value]) => {
            const pk = value.primaryKey;
            return (pk && pk.name === constraintName) || !!value.unique[constraintName];
        });
        if (entry) {
            return entry[1];
        }
        throw new Error(`Invalid constraint name ${constraintName}`);
    }

    private loadFields(fields: IRDB$FIELD[]): void {
        this._fields = fields.reduce((loadedFields, item) => {
            loadedFields[item.RDB$FIELD_NAME] = new Field(
              item.RDB$FIELD_TYPE, !!item.RDB$NULL_FLAG, item.RDB$DEFAULT_VALUE
            );
            return loadedFields;
        }, {} as IFields);
    }

    private loadRelations(relationFields: IRDB$RELATIONFIELD[]): void {
        this._relations = relationFields.reduce((prev, item) => {
            if (prev.name !== item.RDB$RELATION_NAME) {
                prev.name = item.RDB$RELATION_NAME;
                prev.relations[prev.name] = new Relation(prev.name);
            }
            prev.relations[prev.name].loadField(item);
            return prev;
        }, {relations: {}, name: ""} as { relations: IRelations, name: string }).relations;
    }

    private loadRelationConstraints(constraints: IRDB$RELATIONCONSTRAINT[]): void {
        constraints.forEach((item) => this._relations[item.RDB$RELATION_NAME].loadConstraintField(item));
    }
}
