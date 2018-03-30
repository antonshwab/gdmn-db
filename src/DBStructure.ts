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

interface IRelationFields {
    [name: string]: RelationField;
}

interface IRefConstraints {
    [name: string]: FKConstraint;
}

interface IUqConstraints {
    [name: string]: UqConstraint;
}

export class DBStructure {

    private _fields: IFields = {};

    get fields(): IFields {
        return this._fields;
    }

    private _relations: IRelations = {};

    get relations(): IRelations {
        return this._relations;
    }

    public load(fields: IRDB$FIELD[], relations: IRDB$RELATIONFIELD[], constraints: IRDB$RELATIONCONSTRAINT[]) {
        this.loadFields(fields);
        this.loadRelations(relations);
        this.loadRelationConstraints(constraints);
    }

    private loadFields(fields: IRDB$FIELD[]) {
        this._fields = fields.reduce((fields, item) => {
            (<any>fields)[item.RDB$FIELD_NAME] = new Field(item.RDB$FIELD_TYPE, !!item.RDB$NULL_FLAG);
            return fields;
        }, {});
    }

    private loadRelations(relationFields: IRDB$RELATIONFIELD[]) {
        this._relations = relationFields.reduce((prev, item) => {
            if (prev.name !== item.RDB$RELATION_NAME) {
                prev.name = item.RDB$RELATION_NAME;
                (<any>prev.relations)[prev.name] = new Relation();
            }
            (<any>prev.relations)[prev.name].loadField(item);
            return prev;
        }, {relations: {}, name: ""}).relations;
    }

    private loadRelationConstraints(constraints: IRDB$RELATIONCONSTRAINT[]) {
        constraints.forEach(item => this._relations[item.RDB$RELATION_NAME].loadConstraintField(item));
    }
}

export class Field {

    readonly fieldType: FieldType;
    readonly notNull: boolean;

    constructor(fieldType: FieldType, notNull: boolean) {
        this.fieldType = fieldType;
        this.notNull = notNull;
    }
}

export class Relation {

    private relationFields: IRelationFields = {};
    private primaryKeyName: string = "";
    private primaryKey?: PKConstraint;
    private foreignKey: IRefConstraints = {};
    private unique: IUqConstraints = {};

    public loadField(field: IRDB$RELATIONFIELD) {
        this.relationFields[field.RDB$FIELD_NAME] = new RelationField(field.RDB$FIELD_SOURCE, !!field.RDB$NULL_FLAG);
    }

    public loadConstraintField(constraint: IRDB$RELATIONCONSTRAINT) {
        switch (constraint.RDB$CONSTRAINT_TYPE) {
            case "PRIMARY KEY":
                if (!this.primaryKey) {
                    this.primaryKeyName = constraint.RDB$CONSTRAINT_NAME;
                    this.primaryKey = new PKConstraint(constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME]);
                } else {
                    this.primaryKey.loadField(constraint);
                }
                break;

            case "FOREIGN KEY":
                if (!this.foreignKey[constraint.RDB$CONSTRAINT_NAME]) {
                    this.foreignKey[constraint.RDB$CONSTRAINT_NAME] = new FKConstraint(
                        constraint.RDB$INDEX_NAME,
                        [constraint.RDB$FIELD_NAME],
                        constraint.RDB$CONST_NAME_UQ,
                        constraint.RDB$UPDATE_RULE,
                        constraint.RDB$DELETE_RULE
                    );
                } else {
                    this.foreignKey[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
                break;

            case "UNIQUE":
                if (!this.unique[constraint.RDB$CONSTRAINT_NAME]) {
                    this.unique[constraint.RDB$CONSTRAINT_NAME] = new UqConstraint(
                        constraint.RDB$INDEX_NAME,
                        [constraint.RDB$FIELD_NAME]
                    );
                } else {
                    this.unique[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
        }
    }
}

export class RelationField {

    readonly fieldSource: string;
    readonly notNull: boolean;

    constructor(fieldSource: string, notNull: boolean) {
        this.fieldSource = fieldSource;
        this.notNull = notNull;
    }
}

export class RelationConstraint {

    readonly indexName: string;
    protected fields: string[];

    constructor(indexName: string, fields: string[]) {
        this.indexName = indexName;
        this.fields = fields;
    }

    loadField(data: IRDB$RELATIONCONSTRAINT) {
        this.fields.push(data.RDB$FIELD_NAME);
    }
}

export class PKConstraint extends RelationConstraint {
}

export class FKConstraint extends RelationConstraint {

    readonly constNameUq: string;
    readonly updateRule: UpdateRule;
    readonly deleteRule: DeleteRule;

    constructor(
        indexName: string,
        fields: string[],
        constNameUq: string,
        updateRule: UpdateRule,
        deleteRule: DeleteRule
    ) {
        super(indexName, fields);
        this.constNameUq = constNameUq;
        this.updateRule = updateRule;
        this.deleteRule = deleteRule;
    }
}

export class UqConstraint extends RelationConstraint {
}
