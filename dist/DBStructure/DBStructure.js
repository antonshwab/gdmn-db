"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_1 = require("./Field");
const Relation_1 = require("./Relation");
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
class DBStructure {
    constructor() {
        this._fields = {};
        this._relations = {};
        this._relationsByUqConstraint = {};
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
    forEachRelation(f, hasPK) {
        Object.entries(this._relations).forEach(([key, value]) => {
            if (!hasPK || value.primaryKey) {
                f(value);
            }
        });
    }
    findRelation(f) {
        const entry = Object.entries(this._relations).find(([key, value]) => f(value));
        if (entry) {
            return entry[1];
        }
        return null;
    }
    relationByUqConstraint(constraintName) {
        const rel = this._relationsByUqConstraint[constraintName];
        if (!rel) {
            throw new Error(`Invalid constraint name ${constraintName}`);
        }
        return rel;
    }
    loadFields(fields) {
        this._fields = fields.reduce((loadedFields, item) => {
            loadedFields[item.RDB$FIELD_NAME] = new Field_1.Field(item.RDB$FIELD_TYPE, !!item.RDB$NULL_FLAG, item.RDB$DEFAULT_VALUE, item.RDB$FIELD_LENGTH, item.RDB$FIELD_SCALE, item.RDB$VALIDATION_SOURCE, item.RDB$FIELD_SUB_TYPE, item.RDB$FIELD_PRECISION);
            return loadedFields;
        }, {});
    }
    loadRelations(relationFields) {
        this._relations = relationFields.reduce((prev, item) => {
            if (prev.name !== item.RDB$RELATION_NAME) {
                prev.name = item.RDB$RELATION_NAME;
                prev.relations[prev.name] = new Relation_1.Relation(prev.name);
            }
            prev.relations[prev.name].loadField(item);
            return prev;
        }, { relations: {}, name: "" }).relations;
    }
    loadRelationConstraints(constraints) {
        constraints.forEach((item) => {
            const rel = this._relations[item.RDB$RELATION_NAME];
            rel.loadConstraintField(item);
            if (item.RDB$CONSTRAINT_TYPE === 'PRIMARY KEY' || item.RDB$CONSTRAINT_TYPE === 'UNIQUE') {
                this._relationsByUqConstraint[item.RDB$CONSTRAINT_NAME] = rel;
            }
        });
    }
}
exports.DBStructure = DBStructure;
//# sourceMappingURL=DBStructure.js.map