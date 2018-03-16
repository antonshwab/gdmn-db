"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var FieldType;
(function (FieldType) {
    FieldType[FieldType["SMALL_INTEGER"] = 7] = "SMALL_INTEGER";
    FieldType[FieldType["INTEGER"] = 8] = "INTEGER";
    FieldType[FieldType["FLOAT"] = 10] = "FLOAT";
    FieldType[FieldType["DATE"] = 12] = "DATE";
    FieldType[FieldType["TIME"] = 13] = "TIME";
    FieldType[FieldType["CHAR"] = 14] = "CHAR";
    FieldType[FieldType["BIG_INTEGER"] = 16] = "BIG_INTEGER";
    FieldType[FieldType["DOUBLE"] = 27] = "DOUBLE";
    FieldType[FieldType["TIMESTAMP"] = 35] = "TIMESTAMP";
    FieldType[FieldType["VARCHAR"] = 37] = "VARCHAR";
    FieldType[FieldType["BLOB"] = 261] = "BLOB";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
class DBStructure {
    constructor() {
        this._fields = {};
        this._relations = {};
    }
    get fields() {
        return this._fields;
    }
    get relations() {
        return this._relations;
    }
    load(fields, relations, constraints) {
        this.loadFields(fields);
        this.loadRelations(relations);
        this.loadRelationConstraints(constraints);
    }
    loadFields(fields) {
        this._fields = fields.reduce((fields, item) => {
            fields[item.RDB$FIELD_NAME] = new Field(item.RDB$FIELD_TYPE, !!item.RDB$NULL_FLAG);
            return fields;
        }, {});
    }
    loadRelations(relationFields) {
        this._relations = relationFields.reduce((prev, item) => {
            if (prev.name !== item.RDB$RELATION_NAME) {
                prev.name = item.RDB$RELATION_NAME;
                prev.relations[prev.name] = new Relation();
            }
            prev.relations[prev.name].loadField(item);
            return prev;
        }, { relations: {}, name: "" }).relations;
    }
    loadRelationConstraints(constraints) {
        constraints.forEach(item => this._relations[item.RDB$RELATION_NAME].loadConstraintField(item));
    }
}
exports.DBStructure = DBStructure;
class Field {
    constructor(fieldType, notNull) {
        this.fieldType = fieldType;
        this.notNull = notNull;
    }
}
exports.Field = Field;
class Relation {
    constructor() {
        this.relationFields = {};
        this.primaryKeyName = "";
        this.foreignKey = {};
        this.unique = {};
    }
    loadField(field) {
        this.relationFields[field.RDB$FIELD_NAME] = new RelationField(field.RDB$FIELD_SOURCE, !!field.RDB$NULL_FLAG);
    }
    loadConstraintField(constraint) {
        switch (constraint.RDB$CONSTRAINT_TYPE) {
            case "PRIMARY KEY":
                if (!this.primaryKey) {
                    this.primaryKeyName = constraint.RDB$CONSTRAINT_NAME;
                    this.primaryKey = new PKConstraint(constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME]);
                }
                else {
                    this.primaryKey.loadField(constraint);
                }
                break;
            case "FOREIGN KEY":
                if (!this.foreignKey[constraint.RDB$CONSTRAINT_NAME]) {
                    this.foreignKey[constraint.RDB$CONSTRAINT_NAME] = new FKConstraint(constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME], constraint.RDB$CONST_NAME_UQ, constraint.RDB$UPDATE_RULE, constraint.RDB$DELETE_RULE);
                }
                else {
                    this.foreignKey[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
                break;
            case "UNIQUE":
                if (!this.unique[constraint.RDB$CONSTRAINT_NAME]) {
                    this.unique[constraint.RDB$CONSTRAINT_NAME] = new UqConstraint(constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME]);
                }
                else {
                    this.unique[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
        }
    }
}
exports.Relation = Relation;
class RelationField {
    constructor(fieldSource, notNull) {
        this.fieldSource = fieldSource;
        this.notNull = notNull;
    }
}
exports.RelationField = RelationField;
class RelationConstraint {
    constructor(indexName, fields) {
        this.indexName = indexName;
        this.fields = fields;
    }
    loadField(data) {
        this.fields.push(data.RDB$FIELD_NAME);
    }
}
exports.RelationConstraint = RelationConstraint;
class PKConstraint extends RelationConstraint {
}
exports.PKConstraint = PKConstraint;
class FKConstraint extends RelationConstraint {
    constructor(indexName, fields, constNameUq, updateRule, deleteRule) {
        super(indexName, fields);
        this.constNameUq = constNameUq;
        this.updateRule = updateRule;
        this.deleteRule = deleteRule;
    }
}
exports.FKConstraint = FKConstraint;
class UqConstraint extends RelationConstraint {
}
exports.UqConstraint = UqConstraint;
//# sourceMappingURL=DBStructure.js.map