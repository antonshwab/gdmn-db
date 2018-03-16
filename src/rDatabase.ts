/**
 * Объект RDatabase хранит информацию о структуре реляционной базы данных,
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
  Integer = 8,
  Date = 12
}
export type NullFlag = null | 0 | 1;
export type ConstraintType = 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE';
export type UpdateRule = 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'NO ACTION' | 'SET DEFAULT';
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

interface IFields { [name: string]: Field; }
interface IRelations { [name: string]: Relation; }
interface IRelationFields { [name: string]: RelationField; }
interface IRefConstraints { [name: string]: FKConstraint; }
interface IUqConstraints { [name: string]: UqConstraint; }

export class RDatabase {
  private fields: IFields = {};
  private relations: IRelations = {};

  public load(fields: IRDB$FIELD[], relations: IRDB$RELATIONFIELD[]) {
    this.loadFields(fields);
    this.loadRelations(relations);
  }

  private loadFields(data: IRDB$FIELD[]) {
    this.fields = {};
    data.forEach( f => this.fields[f.RDB$FIELD_NAME] = new Field(f.RDB$FIELD_TYPE, !!f.RDB$NULL_FLAG) );
  }

  private loadRelations(data: IRDB$RELATIONFIELD[]) {
    this.relations = {};
    data.reduce( (r, f) => {
      if (r !== f.RDB$RELATION_NAME) {
        r = f.RDB$RELATION_NAME;
        this.relations[r] = new Relation();
      }
      this.relations[r].loadField(f);
      return r;
    }, '');
  }

  private loadRelationConstraints(data: IRDB$RELATIONCONSTRAINT[]) {
    data.forEach( c => { this.relations[c.RDB$RELATION_NAME].loadConstraintField(c); } );
  }
}

export class Field {
  constructor(public readonly fieldType: FieldType, public readonly notNull: boolean) { }
}

export class Relation {
  private relationFields: IRelationFields = {};
  private pkName: string = '';
  private pk?: PKConstraint;
  private fk: IRefConstraints = {};
  private uq: IUqConstraints = {};

  public loadField(data: IRDB$RELATIONFIELD) {
    this.relationFields[data.RDB$FIELD_NAME] = new RelationField(data.RDB$FIELD_SOURCE, !!data.RDB$NULL_FLAG);
  }

  public loadConstraintField(data: IRDB$RELATIONCONSTRAINT) {
    switch (data.RDB$CONSTRAINT_TYPE) {
      case 'PRIMARY KEY':
      if (!this.pk) {
        this.pkName = data.RDB$CONSTRAINT_NAME;
        this.pk = new PKConstraint(data.RDB$INDEX_NAME, [data.RDB$FIELD_NAME]);
      } else {
        this.pk.loadField(data);
      }
      break;

      case 'FOREIGN KEY':
      if (!this.fk[data.RDB$CONSTRAINT_NAME]) {
        this.fk[data.RDB$CONSTRAINT_NAME] = new FKConstraint(data.RDB$INDEX_NAME, [data.RDB$FIELD_NAME],
          data.RDB$CONST_NAME_UQ, data.RDB$UPDATE_RULE, data.RDB$DELETE_RULE);
      } else {
        this.fk[data.RDB$CONSTRAINT_NAME].loadField(data);
      }

      case 'UNIQUE':
      if (!this.uq[data.RDB$CONSTRAINT_NAME]) {
        this.uq[data.RDB$CONSTRAINT_NAME] = new UqConstraint(data.RDB$INDEX_NAME, [data.RDB$FIELD_NAME]);
      } else {
        this.fk[data.RDB$CONSTRAINT_NAME].loadField(data);
      }
    }
  }
}

export class RelationField {
  constructor(public readonly fieldSource: string, public readonly notNull: boolean) { }
}

export class RelationConstraint {
  constructor(public readonly indexName: string, private fields: string[]) {}

  public loadField(data: IRDB$RELATIONCONSTRAINT) {
    this.fields.push(data.RDB$FIELD_NAME);
  }
}

export class PKConstraint extends RelationConstraint {}

export class FKConstraint extends RelationConstraint {
  public readonly constNameUq: string;
  public readonly updateRule: UpdateRule;
  public readonly deleteRule: DeleteRule;

  constructor(
    indexName: string,
    fields: string[],
    constNameUq: string,
    updateRule: UpdateRule,
    deleteRule: DeleteRule)
  {
    super(indexName, fields);
    this.constNameUq = constNameUq;
    this.updateRule = updateRule;
    this.deleteRule = deleteRule;
  }
}

export class UqConstraint extends RelationConstraint {}
