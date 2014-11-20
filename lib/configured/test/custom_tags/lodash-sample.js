/**
 * @module {{}} _
 * Foo
 */
// 
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * Shape.prototype.z = 0;
 *
 * _.keys(new Shape);
 * // => ['x', 'y'] (iteration order is not guaranteed)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (object) {
    var Ctor = object.constructor,
        length = object.length;
  }
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof length == 'number' && length > 0) ||
      (lodash.support.enumPrototypes && typeof object == 'function')) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};