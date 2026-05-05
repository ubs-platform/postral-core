export class ArrayToObjectUtil {
  static reachPathGetValue(object: any, fields: string[]) {
    let value = object;
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      const field = fields[fieldIndex];

      if (value != null) {
        value = value[field];
      } else {
        return null;
      }
    }
    return value;
  }

  static insertToGroup(
    mappingObject: { [key: string]: Array<any> },
    key: string,
    object: any
  ) {
    const arr = mappingObject[key];
    if (arr != null) {
      mappingObject[key].push(object);
    } else {
      mappingObject[key] = [object];
    }
    return mappingObject;
  }

  static arrayFieldCirculation(
    objects: any[],
    fields: string[],
    callback: (
      object: any,
      groupedKey: string,
      mappingObject: { [key: string]: any }
    ) => any
  ) {
    return this.arrayConditionCirculation(
      objects,
      (object: any) => {
        let key = this.reachPathGetValue(object, fields);
        if (typeof key != 'string') key = key?.toString() || key;
        const groupedKey = key?.toString() || 'null';
        return groupedKey;
      },
      callback
    );
  }

  static arrayConditionCirculation(
    objects: any[],
    keyGenerator: (any: any) => string,
    callback: (
      object: any,
      groupedKey: string,
      mappingObject: { [key: string]: any }
    ) => any
  ) {
    const mappingObject = {};

    for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
      const object = objects[objectIndex];
      let key = keyGenerator(object);
      const groupedKey = key?.toString() || 'null';
      callback(object, groupedKey, mappingObject);
    }

    return mappingObject;
  }

  /**
   * Groups object by field values
   * @param objects object list mapped by field
   * @param fields field path compared by field. if more than one, works like `object.field1.field2`
   * @returns object contains arrays, keys are value from provided fields
   */
  static groupByField = <T = Object>(
    objects: T[],
    ...fields: string[]
  ): { [key: string]: T[] } => {
    return this.arrayFieldCirculation(objects, fields, (object, key, map) => {
      this.insertToGroup(map as { [key: string]: T[] }, key, object);
    });
  };

  /**
   * Groups object by field values
   * @param objects object list mapped by field
   * @param fields field path compared by field. if more than one, works like `object.field1.field2`
   * @returns object contains arrays, keys are value from provided fields
   */
  static groupBySpecialCondition<T = Object>(
    objects: T[],
    condition: (o: T) => string
  ): { [key: string]: T[] } {
    return this.arrayConditionCirculation(
      objects,
      condition,
      (object, key, map) => {
        this.insertToGroup(map as { [key: string]: T[] }, key, object);
      }
    );
  }

  /**
   * Maps any object as plural object
   * @param objects objects mapped by field
   * @param fields field path compared by field. if more than one, works like `object.field1.field2`
   * @returns object contains arrays, keys are value from provided fields
   */
  static placeBySingleField<T = Object>(
    objects: T[],
    ...fields: string[]
  ): { [key: string]: T } {
    return this.arrayFieldCirculation(objects, fields, (object, key, map) => {
      map[key] = object;
    });
  }

  static mergeArraysInObjects<T = any>(a: { [key: string]: T[] }): T[] {
    const ac: T[] = [];
    Object.values(a).forEach((groupedObjectLs) => ac.push(...groupedObjectLs));
    return ac;
  }
}
