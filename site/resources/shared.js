/*! web-shared - v0.1.0 - 2013-05-27
* https://github.com/bitovi/web-shared
* Copyright (c) 2013 Bitovi; Licensed MIT */
/*!
 * CanJS - 1.1.5
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Mon, 22 Apr 2013 16:22:13 GMT
 * Licensed MIT
 * Download from: http://bitbuilder.herokuapp.com/can.custom.js?configuration=jquery&plugins=can%2Fconstruct%2Fconstruct.js&plugins=can%2Fobserve%2Fobserve.js&plugins=can%2Fmodel%2Fmodel.js&plugins=can%2Fview%2Fview.js&plugins=can%2Fcontrol%2Fcontrol.js&plugins=can%2Froute%2Froute.js&plugins=can%2Fcontrol%2Froute%2Froute.js&plugins=can%2Fview%2Fmustache%2Fmustache.js&plugins=can%2Fconstruct%2Fsuper%2Fsuper.js
 */
(function(undefined) {

    // ## can/util/can.js
    var __m5 = (function() {

        var can = window.can || {};
        if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
            window.can = can;
        }

        can.isDeferred = function(obj) {
            var isFunction = this.isFunction;
            // Returns `true` if something looks like a deferred.
            return obj && isFunction(obj.then) && isFunction(obj.pipe);
        };

        var cid = 0;
        can.cid = function(object, name) {
            if (object._cid) {
                return object._cid
            } else {
                return object._cid = (name || "") + (++cid)
            }
        }
        return can;
    })();

    // ## can/util/array/each.js
    var __m6 = (function(can) {
        can.each = function(elements, callback, context) {
            var i = 0,
                key;
            if (elements) {
                if (typeof elements.length === 'number' && elements.pop) {
                    if (elements.attr) {
                        elements.attr('length');
                    }
                    for (key = elements.length; i < key; i++) {
                        if (callback.call(context || elements[i], elements[i], i, elements) === false) {
                            break;
                        }
                    }
                } else if (elements.hasOwnProperty) {
                    for (key in elements) {
                        if (elements.hasOwnProperty(key)) {
                            if (callback.call(context || elements[key], elements[key], key, elements) === false) {
                                break;
                            }
                        }
                    }
                }
            }
            return elements;
        };

        return can;
    })(__m5);

    // ## can/util/jquery/jquery.js
    var __m3 = (function($, can) {
        // _jQuery node list._
        $.extend(can, $, {
            trigger: function(obj, event, args) {
                if (obj.trigger) {
                    obj.trigger(event, args);
                } else {
                    $.event.trigger(event, args, obj, true);
                }
            },
            addEvent: function(ev, cb) {
                $([this]).bind(ev, cb);
                return this;
            },
            removeEvent: function(ev, cb) {
                $([this]).unbind(ev, cb);
                return this;
            },
            // jquery caches fragments, we always needs a new one
            buildFragment: function(elems, context) {
                var oldFragment = $.buildFragment,
                    ret;

                elems = [elems];
                // Set context per 1.8 logic
                context = context || document;
                context = !context.nodeType && context[0] || context;
                context = context.ownerDocument || context;

                ret = oldFragment.call(jQuery, elems, context);

                return ret.cacheable ? $.clone(ret.fragment) : ret.fragment || ret;
            },
            $: $,
            each: can.each
        });

        // Wrap binding functions.
        $.each(['bind', 'unbind', 'undelegate', 'delegate'], function(i, func) {
            can[func] = function() {
                var t = this[func] ? this : $([this]);
                t[func].apply(t, arguments);
                return this;
            };
        });

        // Wrap modifier functions.
        $.each(["append", "filter", "addClass", "remove", "data", "get"], function(i, name) {
            can[name] = function(wrapped) {
                return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
            };
        });

        // Memory safe destruction.
        var oldClean = $.cleanData;

        $.cleanData = function(elems) {
            $.each(elems, function(i, elem) {
                if (elem) {
                    can.trigger(elem, "destroyed", [], false);
                }
            });
            oldClean(elems);
        };

        return can;
    })(jQuery, __m5, __m6);

    // ## can/util/string/string.js
    var __m2 = (function(can) {
        // ##string.js
        // _Miscellaneous string utility functions._  

        // Several of the methods in this plugin use code adapated from Prototype
        // Prototype JavaScript framework, version 1.6.0.1.
        // © 2005-2007 Sam Stephenson
        var strUndHash = /_|-/,
            strColons = /\=\=/,
            strWords = /([A-Z]+)([A-Z][a-z])/g,
            strLowUp = /([a-z\d])([A-Z])/g,
            strDash = /([a-z\d])([A-Z])/g,
            strReplacer = /\{([^\}]+)\}/g,
            strQuote = /"/g,
            strSingleQuote = /'/g,

            // Returns the `prop` property from `obj`.
            // If `add` is true and `prop` doesn't exist in `obj`, create it as an 
            // empty object.
            getNext = function(obj, prop, add) {
                return prop in obj ?
                    obj[prop] :
                    (add && (obj[prop] = {}));
            },

            // Returns `true` if the object can have properties (no `null`s).
            isContainer = function(current) {
                return (/^f|^o/).test(typeof current);
            };

        can.extend(can, {
            // Escapes strings for HTML.

            esc: function(content) {
                // Convert bad values into empty strings
                var isInvalid = content === null || content === undefined || (isNaN(content) && ("" + content === 'NaN'));
                return ("" + (isInvalid ? '' : content))
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(strQuote, '&#34;')
                    .replace(strSingleQuote, "&#39;");
            },


            getObject: function(name, roots, add) {

                // The parts of the name we are looking up  
                // `['App','Models','Recipe']`
                var parts = name ? name.split('.') : [],
                    length = parts.length,
                    current,
                    r = 0,
                    ret, i;

                // Make sure roots is an `array`.
                roots = can.isArray(roots) ? roots : [roots || window];

                if (!length) {
                    return roots[0];
                }

                // For each root, mark it as current.
                while (roots[r]) {
                    current = roots[r];

                    // Walk current to the 2nd to last object or until there 
                    // is not a container.
                    for (i = 0; i < length - 1 && isContainer(current); i++) {
                        current = getNext(current, parts[i], add);
                    }

                    // If we can get a property from the 2nd to last object...
                    if (isContainer(current)) {

                        // Get (and possibly set) the property.
                        ret = getNext(current, parts[i], add);

                        // If there is a value, we exit.
                        if (ret !== undefined) {
                            // If `add` is `false`, delete the property
                            if (add === false) {
                                delete current[parts[i]];
                            }
                            return ret;

                        }
                    }
                    r++;
                }
            },
            // Capitalizes a string.

            capitalize: function(s, cache) {
                // Used to make newId.
                return s.charAt(0).toUpperCase() + s.slice(1);
            },

            // Underscores a string.

            underscore: function(s) {
                return s
                    .replace(strColons, '/')
                    .replace(strWords, '$1_$2')
                    .replace(strLowUp, '$1_$2')
                    .replace(strDash, '_')
                    .toLowerCase();
            },
            // Micro-templating.

            sub: function(str, data, remove) {
                var obs = [];

                obs.push(str.replace(strReplacer, function(whole, inside) {

                    // Convert inside to type.
                    var ob = can.getObject(inside, data, remove === undefined ? remove : !remove);

                    if (ob === undefined) {
                        obs = null;
                        return "";
                    }

                    // If a container, push into objs (which will return objects found).
                    if (isContainer(ob) && obs) {
                        obs.push(ob);
                        return "";
                    }

                    return "" + ob;
                }));

                return obs === null ? obs : (obs.length <= 1 ? obs[0] : obs);
            },

            // These regex's are used throughout the rest of can, so let's make
            // them available.
            replacer: strReplacer,
            undHash: strUndHash
        });
        return can;
    })(__m3);

    // ## can/construct/construct.js
    var __m1 = (function(can) {

        // ## construct.js
        // `can.Construct`  
        // _This is a modified version of
        // [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
        // It provides class level inheritance and callbacks._

        // A private flag used to initialize a new class instance without
        // initializing it's bindings.
        var initializing = 0;


        can.Construct = function() {
            if (arguments.length) {
                return can.Construct.extend.apply(can.Construct, arguments);
            }
        };


        can.extend(can.Construct, {

            newInstance: function() {
                // Get a raw instance object (`init` is not called).
                var inst = this.instance(),
                    arg = arguments,
                    args;

                // Call `setup` if there is a `setup`
                if (inst.setup) {
                    args = inst.setup.apply(inst, arguments);
                }

                // Call `init` if there is an `init`  
                // If `setup` returned `args`, use those as the arguments
                if (inst.init) {
                    inst.init.apply(inst, args || arguments);
                }

                return inst;
            },
            // Overwrites an object with methods. Used in the `super` plugin.
            // `newProps` - New properties to add.  
            // `oldProps` - Where the old properties might be (used with `super`).  
            // `addTo` - What we are adding to.
            _inherit: function(newProps, oldProps, addTo) {
                can.extend(addTo || newProps, newProps || {})
            },
            // used for overwriting a single property.
            // this should be used for patching other objects
            // the super plugin overwrites this
            _overwrite: function(what, oldProps, propName, val) {
                what[propName] = val;
            },
            // Set `defaults` as the merger of the parent `defaults` and this 
            // object's `defaults`. If you overwrite this method, make sure to
            // include option merging logic.

            setup: function(base, fullName) {
                this.defaults = can.extend(true, {}, base.defaults, this.defaults);
            },
            // Create's a new `class` instance without initializing by setting the
            // `initializing` flag.
            instance: function() {

                // Prevents running `init`.
                initializing = 1;

                var inst = new this();

                // Allow running `init`.
                initializing = 0;

                return inst;
            },
            // Extends classes.

            extend: function(fullName, klass, proto) {
                // Figure out what was passed and normalize it.
                if (typeof fullName != 'string') {
                    proto = klass;
                    klass = fullName;
                    fullName = null;
                }

                if (!proto) {
                    proto = klass;
                    klass = null;
                }
                proto = proto || {};

                var _super_class = this,
                    _super = this.prototype,
                    name, shortName, namespace, prototype;

                // Instantiate a base class (but only create the instance,
                // don't run the init constructor).
                prototype = this.instance();

                // Copy the properties over onto the new prototype.
                can.Construct._inherit(proto, _super, prototype);

                // The dummy class constructor.

                function Constructor() {
                    // All construction is actually done in the init method.
                    if (!initializing) {
                        return this.constructor !== Constructor && arguments.length ?
                        // We are being called without `new` or we are extending.
                        arguments.callee.extend.apply(arguments.callee, arguments) :
                        // We are being called with `new`.
                        this.constructor.newInstance.apply(this.constructor, arguments);
                    }
                }

                // Copy old stuff onto class (can probably be merged w/ inherit)
                for (name in _super_class) {
                    if (_super_class.hasOwnProperty(name)) {
                        Constructor[name] = _super_class[name];
                    }
                }

                // Copy new static properties on class.
                can.Construct._inherit(klass, _super_class, Constructor);

                // Setup namespaces.
                if (fullName) {

                    var parts = fullName.split('.'),
                        shortName = parts.pop(),
                        current = can.getObject(parts.join('.'), window, true),
                        namespace = current,
                        _fullName = can.underscore(fullName.replace(/\./g, "_")),
                        _shortName = can.underscore(shortName);



                    current[shortName] = Constructor;
                }

                // Set things that shouldn't be overwritten.
                can.extend(Constructor, {
                    constructor: Constructor,
                    prototype: prototype,

                    namespace: namespace,

                    _shortName: _shortName,

                    fullName: fullName,
                    _fullName: _fullName
                });

                // Dojo and YUI extend undefined
                if (shortName !== undefined) {
                    Constructor.shortName = shortName;
                }

                // Make sure our prototype looks nice.
                Constructor.prototype.constructor = Constructor;


                // Call the class `setup` and `init`
                var t = [_super_class].concat(can.makeArray(arguments)),
                    args = Constructor.setup.apply(Constructor, t);

                if (Constructor.init) {
                    Constructor.init.apply(Constructor, args || t);
                }


                return Constructor;

            }

        });
        return can.Construct;
    })(__m2);

    // ## can/observe/observe.js
    var __m7 = (function(can) {
        // ## observe.js  
        // `can.Observe`  
        // _Provides the observable pattern for JavaScript Objects._  
        // Returns `true` if something is an object with properties of its own.
        var canMakeObserve = function(obj) {
            return obj && (can.isArray(obj) || can.isPlainObject(obj) || (obj instanceof can.Observe));
        },

            // Removes all listeners.
            unhookup = function(items, namespace) {
                return can.each(items, function(item) {
                    if (item && item.unbind) {
                        item.unbind("change" + namespace);
                    }
                });
            },
            // Listens to changes on `val` and "bubbles" the event up.  
            // `val` - The object to listen for changes on.  
            // `prop` - The property name is at on.  
            // `parent` - The parent object of prop.
            // `ob` - (optional) The Observe object constructor
            // `list` - (optional) The observable list constructor
            hookupBubble = function(val, prop, parent, Ob, List) {
                Ob = Ob || Observe;
                List = List || Observe.List;

                // If it's an `array` make a list, otherwise a val.
                if (val instanceof Observe) {
                    // We have an `observe` already...
                    // Make sure it is not listening to this already
                    unhookup([val], parent._cid);
                } else if (can.isArray(val)) {
                    val = new List(val);
                } else {
                    val = new Ob(val);
                }

                // Listen to all changes and `batchTrigger` upwards.
                val.bind("change" + parent._cid, function() {
                    // `batchTrigger` the type on this...
                    var args = can.makeArray(arguments),
                        ev = args.shift();
                    args[0] = (prop === "*" ? [parent.indexOf(val), args[0]] : [prop, args[0]]).join(".");

                    // track objects dispatched on this observe		
                    ev.triggeredNS = ev.triggeredNS || {};

                    // if it has already been dispatched exit
                    if (ev.triggeredNS[parent._cid]) {
                        return;
                    }

                    ev.triggeredNS[parent._cid] = true;
                    // send change event with modified attr to parent	
                    can.trigger(parent, ev, args);
                    // send modified attr event to parent
                    //can.trigger(parent, args[0], args);
                });

                return val;
            },

            // An `id` to track events for a given observe.
            observeId = 0,
            // A helper used to serialize an `Observe` or `Observe.List`.  
            // `observe` - The observable.  
            // `how` - To serialize with `attr` or `serialize`.  
            // `where` - To put properties, in an `{}` or `[]`.
            serialize = function(observe, how, where) {
                // Go through each property.
                observe.each(function(val, name) {
                    // If the value is an `object`, and has an `attrs` or `serialize` function.
                    where[name] = canMakeObserve(val) && can.isFunction(val[how]) ?
                    // Call `attrs` or `serialize` to get the original data back.
                    val[how]() :
                    // Otherwise return the value.
                    val;
                });
                return where;
            },
            $method = function(name) {
                return function() {
                    return can[name].apply(this, arguments);
                };
            },
            bind = $method('addEvent'),
            unbind = $method('removeEvent'),
            attrParts = function(attr, keepKey) {
                if (keepKey) {
                    return [attr];
                }
                return can.isArray(attr) ? attr : ("" + attr).split(".");
            },
            // Which batch of events this is for -- might not want to send multiple
            // messages on the same batch.  This is mostly for event delegation.
            batchNum = 1,
            // how many times has start been called without a stop
            transactions = 0,
            // an array of events within a transaction
            batchEvents = [],
            stopCallbacks = [];




        var Observe = can.Observe = can.Construct({

            // keep so it can be overwritten
            bind: bind,
            unbind: unbind,
            id: "id",
            canMakeObserve: canMakeObserve,
            // starts collecting events
            // takes a callback for after they are updated
            // how could you hook into after ejs

            startBatch: function(batchStopHandler) {
                transactions++;
                batchStopHandler && stopCallbacks.push(batchStopHandler);
            },

            stopBatch: function(force, callStart) {
                if (force) {
                    transactions = 0;
                } else {
                    transactions--;
                }

                if (transactions == 0) {
                    var items = batchEvents.slice(0),
                        callbacks = stopCallbacks.slice(0);
                    batchEvents = [];
                    stopCallbacks = [];
                    batchNum++;
                    callStart && this.startBatch();
                    can.each(items, function(args) {
                        can.trigger.apply(can, args);
                    });
                    can.each(callbacks, function(cb) {
                        cb();
                    });
                }
            },

            triggerBatch: function(item, event, args) {
                // Don't send events if initalizing.
                if (!item._init) {
                    if (transactions == 0) {
                        return can.trigger(item, event, args);
                    } else {
                        event = typeof event === "string" ? {
                            type: event
                        } :
                            event;
                        event.batchNum = batchNum;
                        batchEvents.push([
                                item,
                                event,
                                args
                        ]);
                    }
                }
            },

            keys: function(observe) {
                var keys = [];
                Observe.__reading && Observe.__reading(observe, '__keys');
                for (var keyName in observe._data) {
                    keys.push(keyName);
                }
                return keys;
            }
        },

        {
            setup: function(obj) {
                // `_data` is where we keep the properties.
                this._data = {};

                // The namespace this `object` uses to listen to events.
                can.cid(this, ".observe");
                // Sets all `attrs`.
                this._init = 1;
                this.attr(obj);
                this.bind('change' + this._cid, can.proxy(this._changes, this));
                delete this._init;
            },
            _changes: function(ev, attr, how, newVal, oldVal) {
                Observe.triggerBatch(this, {
                    type: attr,
                    batchNum: ev.batchNum
                }, [newVal, oldVal]);
            },
            _triggerChange: function(attr, how, newVal, oldVal) {
                Observe.triggerBatch(this, "change", can.makeArray(arguments))
            },

            attr: function(attr, val) {
                // This is super obfuscated for space -- basically, we're checking
                // if the type of the attribute is not a `number` or a `string`.
                var type = typeof attr;
                if (type !== "string" && type !== "number") {
                    return this._attrs(attr, val)
                } else if (val === undefined) { // If we are getting a value.
                    // Let people know we are reading.
                    Observe.__reading && Observe.__reading(this, attr)
                    return this._get(attr)
                } else {
                    // Otherwise we are setting.
                    this._set(attr, val);
                    return this;
                }
            },

            each: function() {
                Observe.__reading && Observe.__reading(this, '__keys');
                return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
            },

            removeAttr: function(attr) {
                // Info if this is List or not
                var isList = this instanceof can.Observe.List,
                    // Convert the `attr` into parts (if nested).
                    parts = attrParts(attr),
                    // The actual property to remove.
                    prop = parts.shift(),
                    // The current value.
                    current = isList ? this[prop] : this._data[prop];

                // If we have more parts, call `removeAttr` on that part.
                if (parts.length) {
                    return current.removeAttr(parts)
                } else {
                    if (isList) {
                        this.splice(prop, 1)
                    } else if (prop in this._data) {
                        // Otherwise, `delete`.
                        delete this._data[prop];
                        // Create the event.
                        if (!(prop in this.constructor.prototype)) {
                            delete this[prop]
                        }
                        // Let others know the number of keys have changed
                        Observe.triggerBatch(this, "__keys");
                        this._triggerChange(prop, "remove", undefined, current);

                    }
                    return current;
                }
            },
            // Reads a property from the `object`.
            _get: function(attr) {
                var value = typeof attr === 'string' && !! ~attr.indexOf('.') && this.__get(attr);
                if (value) {
                    return value;
                }

                // break up the attr (`"foo.bar"`) into `["foo","bar"]`
                var parts = attrParts(attr),
                    // get the value of the first attr name (`"foo"`)
                    current = this.__get(parts.shift());
                // if there are other attributes to read
                return parts.length ?
                // and current has a value
                current ?
                // lookup the remaining attrs on current
                current._get(parts) :
                // or if there's no current, return undefined
                undefined :
                // if there are no more parts, return current
                current;
            },
            // Reads a property directly if an `attr` is provided, otherwise
            // returns the "real" data object itself.
            __get: function(attr) {
                return attr ? this._data[attr] : this._data;
            },
            // Sets `attr` prop as value on this object where.
            // `attr` - Is a string of properties or an array  of property values.
            // `value` - The raw value to set.
            _set: function(attr, value, keepKey) {
                // Convert `attr` to attr parts (if it isn't already).
                var parts = attrParts(attr, keepKey),
                    // The immediate prop we are setting.
                    prop = parts.shift(),
                    // The current value.
                    current = this.__get(prop);

                // If we have an `object` and remaining parts.
                if (canMakeObserve(current) && parts.length) {
                    // That `object` should set it (this might need to call attr).
                    current._set(parts, value)
                } else if (!parts.length) {
                    // We're in "real" set territory.
                    if (this.__convert) {
                        value = this.__convert(prop, value)
                    }
                    this.__set(prop, value, current)
                } else {
                    throw "can.Observe: Object does not exist"
                }
            },
            __set: function(prop, value, current) {

                // Otherwise, we are setting it on this `object`.
                // TODO: Check if value is object and transform
                // are we changing the value.
                if (value !== current) {
                    // Check if we are adding this for the first time --
                    // if we are, we need to create an `add` event.
                    var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

                    // Set the value on data.
                    this.___set(prop,

                    // If we are getting an object.
                    canMakeObserve(value) ?

                    // Hook it up to send event.
                    hookupBubble(value, prop, this) :
                    // Value is normal.
                    value);

                    if (changeType == "add") {
                        // If there is no current value, let others know that
                        // the the number of keys have changed

                        Observe.triggerBatch(this, "__keys", undefined);

                    }
                    // `batchTrigger` the change event.
                    this._triggerChange(prop, changeType, value, current);

                    //Observe.triggerBatch(this, prop, [value, current]);
                    // If we can stop listening to our old value, do it.
                    current && unhookup([current], this._cid);
                }

            },
            // Directly sets a property on this `object`.
            ___set: function(prop, val) {
                this._data[prop] = val;
                // Add property directly for easy writing.
                // Check if its on the `prototype` so we don't overwrite methods like `attrs`.
                if (!(prop in this.constructor.prototype)) {
                    this[prop] = val
                }
            },


            bind: bind,

            unbind: unbind,

            serialize: function() {
                return serialize(this, 'serialize', {});
            },

            _attrs: function(props, remove) {

                if (props === undefined) {
                    return serialize(this, 'attr', {})
                }

                props = can.extend({}, props);
                var prop,
                    self = this,
                    newVal;
                Observe.startBatch();
                this.each(function(curVal, prop) {
                    newVal = props[prop];

                    // If we are merging...
                    if (newVal === undefined) {
                        remove && self.removeAttr(prop);
                        return;
                    }

                    if (self.__convert) {
                        newVal = self.__convert(prop, newVal)
                    }

                    // if we're dealing with models, want to call _set to let converter run
                    if (newVal instanceof can.Observe) {
                        self.__set(prop, newVal, curVal)
                        // if its an object, let attr merge
                    } else if (canMakeObserve(curVal) && canMakeObserve(newVal) && curVal.attr) {
                        curVal.attr(newVal, remove)
                        // otherwise just set
                    } else if (curVal != newVal) {
                        self.__set(prop, newVal, curVal)
                    }

                    delete props[prop];
                })
                // Add remaining props.
                for (var prop in props) {
                    newVal = props[prop];
                    this._set(prop, newVal, true)
                }
                Observe.stopBatch()
                return this;
            },


            compute: function(prop) {
                var self = this,
                    computer = function(val) {
                        return self.attr(prop, val);
                    };

                return can.compute ? can.compute(computer) : computer;
            }
        });
        // Helpers for `observable` lists.

        var splice = [].splice,
            list = Observe(

            {
                setup: function(instances, options) {
                    this.length = 0;
                    can.cid(this, ".observe")
                    this._init = 1;
                    if (can.isDeferred(instances)) {
                        this.replace(instances)
                    } else {
                        this.push.apply(this, can.makeArray(instances || []));
                    }
                    this.bind('change' + this._cid, can.proxy(this._changes, this));
                    can.extend(this, options);
                    delete this._init;
                },
                _triggerChange: function(attr, how, newVal, oldVal) {

                    Observe.prototype._triggerChange.apply(this, arguments)
                    // `batchTrigger` direct add and remove events...
                    if (!~attr.indexOf('.')) {

                        if (how === 'add') {
                            Observe.triggerBatch(this, how, [newVal, +attr]);
                            Observe.triggerBatch(this, 'length', [this.length]);
                        } else if (how === 'remove') {
                            Observe.triggerBatch(this, how, [oldVal, +attr]);
                            Observe.triggerBatch(this, 'length', [this.length]);
                        } else {
                            Observe.triggerBatch(this, how, [newVal, +attr])
                        }

                    }

                },
                __get: function(attr) {
                    return attr ? this[attr] : this;
                },
                ___set: function(attr, val) {
                    this[attr] = val;
                    if (+attr >= this.length) {
                        this.length = (+attr + 1)
                    }
                },
                // Returns the serialized form of this list.

                serialize: function() {
                    return serialize(this, 'serialize', []);
                },

                splice: function(index, howMany) {
                    var args = can.makeArray(arguments),
                        i;

                    for (i = 2; i < args.length; i++) {
                        var val = args[i];
                        if (canMakeObserve(val)) {
                            args[i] = hookupBubble(val, "*", this, this.constructor.Observe, this.constructor)
                        }
                    }
                    if (howMany === undefined) {
                        howMany = args[1] = this.length - index;
                    }
                    var removed = splice.apply(this, args);
                    can.Observe.startBatch();
                    if (howMany > 0) {
                        this._triggerChange("" + index, "remove", undefined, removed);
                        unhookup(removed, this._cid);
                    }
                    if (args.length > 2) {
                        this._triggerChange("" + index, "add", args.slice(2), removed);
                    }
                    can.Observe.stopBatch();
                    return removed;
                },

                _attrs: function(items, remove) {
                    if (items === undefined) {
                        return serialize(this, 'attr', []);
                    }

                    // Create a copy.
                    items = can.makeArray(items);

                    Observe.startBatch();
                    this._updateAttrs(items, remove);
                    Observe.stopBatch()
                },

                _updateAttrs: function(items, remove) {
                    var len = Math.min(items.length, this.length);

                    for (var prop = 0; prop < len; prop++) {
                        var curVal = this[prop],
                            newVal = items[prop];

                        if (canMakeObserve(curVal) && canMakeObserve(newVal)) {
                            curVal.attr(newVal, remove)
                        } else if (curVal != newVal) {
                            this._set(prop, newVal)
                        } else {

                        }
                    }
                    if (items.length > this.length) {
                        // Add in the remaining props.
                        this.push.apply(this, items.slice(this.length));
                    } else if (items.length < this.length && remove) {
                        this.splice(items.length)
                    }
                }
            }),

            // Converts to an `array` of arguments.
            getArgs = function(args) {
                return args[0] && can.isArray(args[0]) ?
                    args[0] :
                    can.makeArray(args);
            };
        // Create `push`, `pop`, `shift`, and `unshift`
        can.each({

            push: "length",

            unshift: 0
        },
        // Adds a method
        // `name` - The method name.
        // `where` - Where items in the `array` should be added.

        function(where, name) {
            var orig = [][name]
            list.prototype[name] = function() {
                // Get the items being added.
                var args = [],
                    // Where we are going to add items.
                    len = where ? this.length : 0,
                    i = arguments.length,
                    res,
                    val,
                    constructor = this.constructor;

                // Go through and convert anything to an `observe` that needs to be converted.
                while (i--) {
                    val = arguments[i];
                    args[i] = canMakeObserve(val) ?
                        hookupBubble(val, "*", this, this.constructor.Observe, this.constructor) :
                        val;
                }

                // Call the original method.
                res = orig.apply(this, args);

                if (!this.comparator || args.length) {

                    this._triggerChange("" + len, "add", args, undefined);
                }

                return res;
            }
        });

        can.each({

            pop: "length",

            shift: 0
        },
        // Creates a `remove` type method

        function(where, name) {
            list.prototype[name] = function() {

                var args = getArgs(arguments),
                    len = where && this.length ? this.length - 1 : 0;

                var res = [][name].apply(this, args)

                // Create a change where the args are
                // `*` - Change on potentially multiple properties.
                // `remove` - Items removed.
                // `undefined` - The new values (there are none).
                // `res` - The old, removed values (should these be unbound).
                // `len` - Where these items were removed.
                this._triggerChange("" + len, "remove", undefined, [res])

                if (res && res.unbind) {
                    res.unbind("change" + this._cid)
                }
                return res;
            }
        });

        can.extend(list.prototype, {

            indexOf: function(item) {
                this.attr('length')
                return can.inArray(item, this)
            },


            join: [].join,


            reverse: [].reverse,


            slice: function() {
                var temp = Array.prototype.slice.apply(this, arguments);
                return new this.constructor(temp);
            },


            concat: function() {
                var args = [];
                can.each(can.makeArray(arguments), function(arg, i) {
                    args[i] = arg instanceof can.Observe.List ? arg.serialize() : arg;
                });
                return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
            },


            forEach: function(cb, thisarg) {
                can.each(this, cb, thisarg || this);
            },


            replace: function(newList) {
                if (can.isDeferred(newList)) {
                    newList.then(can.proxy(this.replace, this));
                } else {
                    this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
                }

                return this;
            }
        });

        Observe.List = list;
        Observe.setup = function() {
            can.Construct.setup.apply(this, arguments);
            // I would prefer not to do it this way. It should
            // be using the attributes plugin to do this type of conversion.
            this.List = Observe.List({
                Observe: this
            }, {});
        }
        return Observe;
    })(__m3, __m1);

    // ## can/model/model.js
    var __m8 = (function(can) {

        // ## model.js  
        // `can.Model`  
        // _A `can.Observe` that connects to a RESTful interface._
        // Generic deferred piping function

        var pipe = function(def, model, func) {
            var d = new can.Deferred();
            def.then(function() {
                var args = can.makeArray(arguments);
                args[0] = model[func](args[0]);
                d.resolveWith(d, args);
            }, function() {
                d.rejectWith(this, arguments);
            });

            if (typeof def.abort === 'function') {
                d.abort = function() {
                    return def.abort();
                }
            }

            return d;
        },
            modelNum = 0,
            ignoreHookup = /change.observe\d+/,
            getId = function(inst) {
                // Instead of using attr, use __get for performance.
                // Need to set reading
                can.Observe.__reading && can.Observe.__reading(inst, inst.constructor.id)
                return inst.__get(inst.constructor.id);
            },
            // Ajax `options` generator function
            ajax = function(ajaxOb, data, type, dataType, success, error) {

                var params = {};

                // If we get a string, handle it.
                if (typeof ajaxOb == "string") {
                    // If there's a space, it's probably the type.
                    var parts = ajaxOb.split(/\s+/);
                    params.url = parts.pop();
                    if (parts.length) {
                        params.type = parts.pop();
                    }
                } else {
                    can.extend(params, ajaxOb);
                }

                // If we are a non-array object, copy to a new attrs.
                params.data = typeof data == "object" && !can.isArray(data) ?
                    can.extend(params.data || {}, data) : data;

                // Get the url with any templated values filled out.
                params.url = can.sub(params.url, params.data, true);

                return can.ajax(can.extend({
                    type: type || "post",
                    dataType: dataType || "json",
                    success: success,
                    error: error
                }, params));
            },
            makeRequest = function(self, type, success, error, method) {
                var args;
                // if we pass an array as `self` it it means we are coming from
                // the queued request, and we're passing already serialized data
                // self's signature will be: [self, serializedData]
                if (can.isArray(self)) {
                    args = self[1];
                    self = self[0];
                } else {
                    args = self.serialize();
                }
                args = [args];
                var deferred,
                    // The model.
                    model = self.constructor,
                    jqXHR;

                // `destroy` does not need data.
                if (type == 'destroy') {
                    args.shift();
                }
                // `update` and `destroy` need the `id`.
                if (type !== 'create') {
                    args.unshift(getId(self));
                }


                jqXHR = model[type].apply(model, args);

                deferred = jqXHR.pipe(function(data) {
                    self[method || type + "d"](data, jqXHR);
                    return self;
                });

                // Hook up `abort`
                if (jqXHR.abort) {
                    deferred.abort = function() {
                        jqXHR.abort();
                    };
                }

                deferred.then(success, error);
                return deferred;
            },

            // This object describes how to make an ajax request for each ajax method.  
            // The available properties are:
            //		`url` - The default url to use as indicated as a property on the model.
            //		`type` - The default http request type
            //		`data` - A method that takes the `arguments` and returns `data` used for ajax.

            ajaxMethods = {

                create: {
                    url: "_shortName",
                    type: "post"
                },

                update: {
                    data: function(id, attrs) {
                        attrs = attrs || {};
                        var identity = this.id;
                        if (attrs[identity] && attrs[identity] !== id) {
                            attrs["new" + can.capitalize(id)] = attrs[identity];
                            delete attrs[identity];
                        }
                        attrs[identity] = id;
                        return attrs;
                    },
                    type: "put"
                },

                destroy: {
                    type: "delete",
                    data: function(id) {
                        var args = {};
                        args.id = args[this.id] = id;
                        return args;
                    }
                },

                findAll: {
                    url: "_shortName"
                },

                findOne: {}
            },
            // Makes an ajax request `function` from a string.
            //		`ajaxMethod` - The `ajaxMethod` object defined above.
            //		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
            ajaxMaker = function(ajaxMethod, str) {
                // Return a `function` that serves as the ajax method.
                return function(data) {
                    // If the ajax method has it's own way of getting `data`, use that.
                    data = ajaxMethod.data ?
                        ajaxMethod.data.apply(this, arguments) :
                    // Otherwise use the data passed in.
                    data;
                    // Return the ajax method with `data` and the `type` provided.
                    return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
                }
            }



        can.Model = can.Observe({
            fullName: "can.Model",
            setup: function(base) {
                // create store here if someone wants to use model without inheriting from it
                this.store = {};
                can.Observe.setup.apply(this, arguments);
                // Set default list as model list
                if (!can.Model) {
                    return;
                }
                this.List = ML({
                    Observe: this
                }, {});
                var self = this,
                    clean = can.proxy(this._clean, self);


                // go through ajax methods and set them up
                can.each(ajaxMethods, function(method, name) {
                    // if an ajax method is not a function, it's either
                    // a string url like findAll: "/recipes" or an
                    // ajax options object like {url: "/recipes"}
                    if (!can.isFunction(self[name])) {
                        // use ajaxMaker to convert that into a function
                        // that returns a deferred with the data
                        self[name] = ajaxMaker(method, self[name]);
                    }
                    // check if there's a make function like makeFindAll
                    // these take deferred function and can do special
                    // behavior with it (like look up data in a store)
                    if (self["make" + can.capitalize(name)]) {
                        // pass the deferred method to the make method to get back
                        // the "findAll" method.
                        var newMethod = self["make" + can.capitalize(name)](self[name]);
                        can.Construct._overwrite(self, base, name, function() {
                            // increment the numer of requests
                            this._reqs++;
                            var def = newMethod.apply(this, arguments);
                            var then = def.then(clean, clean);
                            then.abort = def.abort;

                            // attach abort to our then and return it
                            return then;
                        })
                    }
                });

                if (self.fullName == "can.Model" || !self.fullName) {
                    self.fullName = "Model" + (++modelNum);
                }
                // Add ajax converters.
                this._reqs = 0;
                this._url = this._shortName + "/{" + this.id + "}"
            },
            _ajax: ajaxMaker,
            _makeRequest: makeRequest,
            _clean: function() {
                this._reqs--;
                if (!this._reqs) {
                    for (var id in this.store) {
                        if (!this.store[id]._bindings) {
                            delete this.store[id];
                        }
                    }
                }
                return arguments[0];
            },

            models: function(instancesRawData, oldList) {

                if (!instancesRawData) {
                    return;
                }

                if (instancesRawData instanceof this.List) {
                    return instancesRawData;
                }

                // Get the list type.
                var self = this,
                    tmp = [],
                    res = oldList instanceof can.Observe.List ? oldList : new(self.List || ML),
                    // Did we get an `array`?
                    arr = can.isArray(instancesRawData),

                    // Did we get a model list?
                    ml = (instancesRawData instanceof ML),

                    // Get the raw `array` of objects.
                    raw = arr ?

                    // If an `array`, return the `array`.
                    instancesRawData :

                    // Otherwise if a model list.
                    (ml ?

                    // Get the raw objects from the list.
                    instancesRawData.serialize() :

                    // Get the object's data.
                    instancesRawData.data),
                    i = 0;



                if (res.length) {
                    res.splice(0);
                }

                can.each(raw, function(rawPart) {
                    tmp.push(self.model(rawPart));
                });

                // We only want one change event so push everything at once
                res.push.apply(res, tmp);

                if (!arr) { // Push other stuff onto `array`.
                    can.each(instancesRawData, function(val, prop) {
                        if (prop !== 'data') {
                            res.attr(prop, val);
                        }
                    })
                }
                return res;
            },

            model: function(attributes) {
                if (!attributes) {
                    return;
                }
                if (attributes instanceof this) {
                    attributes = attributes.serialize();
                }
                var id = attributes[this.id],
                    model = (id || id === 0) && this.store[id] ?
                        this.store[id].attr(attributes, this.removeAttr || false) : new this(attributes);
                if (this._reqs) {
                    this.store[attributes[this.id]] = model;
                }
                return model;
            }
        },

        {

            isNew: function() {
                var id = getId(this);
                return !(id || id === 0); // If `null` or `undefined`
            },

            save: function(success, error) {
                return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
            },

            destroy: function(success, error) {
                if (this.isNew()) {
                    var self = this;
                    return can.Deferred().done(function(data) {
                        self.destroyed(data)
                    }).resolve(self);
                }
                return makeRequest(this, 'destroy', success, error, 'destroyed');
            },

            bind: function(eventName) {
                if (!ignoreHookup.test(eventName)) {
                    if (!this._bindings) {
                        this.constructor.store[this.__get(this.constructor.id)] = this;
                        this._bindings = 0;
                    }
                    this._bindings++;
                }

                return can.Observe.prototype.bind.apply(this, arguments);
            },

            unbind: function(eventName) {
                if (!ignoreHookup.test(eventName)) {
                    this._bindings--;
                    if (!this._bindings) {
                        delete this.constructor.store[getId(this)];
                    }
                }
                return can.Observe.prototype.unbind.apply(this, arguments);
            },
            // Change `id`.
            ___set: function(prop, val) {
                can.Observe.prototype.___set.call(this, prop, val)
                // If we add an `id`, move it to the store.
                if (prop === this.constructor.id && this._bindings) {
                    this.constructor.store[getId(this)] = this;
                }
            }
        });

        can.each({
            makeFindAll: "models",
            makeFindOne: "model"
        }, function(method, name) {
            can.Model[name] = function(oldFind) {
                return function(params, success, error) {
                    var def = pipe(oldFind.call(this, params), this, method);
                    def.then(success, error);
                    // return the original promise
                    return def;
                };
            };
        });

        can.each([

            "created",

            "updated",

            "destroyed"
        ], function(funcName) {
            can.Model.prototype[funcName] = function(attrs) {
                var stub,
                    constructor = this.constructor;

                // Update attributes if attributes have been passed
                stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

                // Call event on the instance
                can.trigger(this, funcName);

                // triggers change event that bubble's like
                // handler( 'change','1.destroyed' ). This is used
                // to remove items on destroyed from Model Lists.
                // but there should be a better way.
                can.trigger(this, "change", funcName)


                // Call event on the instance's Class
                can.trigger(constructor, funcName, this);
            };
        });

        // Model lists are just like `Observe.List` except that when their items are 
        // destroyed, it automatically gets removed from the list.

        var ML = can.Model.List = can.Observe.List({
            setup: function() {
                can.Observe.List.prototype.setup.apply(this, arguments);
                // Send destroy events.
                var self = this;
                this.bind('change', function(ev, how) {
                    if (/\w+\.destroyed/.test(how)) {
                        var index = self.indexOf(ev.target);
                        if (index != -1) {
                            self.splice(index, 1);
                        }
                    }
                })
            }
        })

        return can.Model;
    })(__m3, __m7);

    // ## can/view/view.js
    var __m9 = (function(can) {
        // ## view.js
        // `can.view`  
        // _Templating abstraction._

        var isFunction = can.isFunction,
            makeArray = can.makeArray,
            // Used for hookup `id`s.
            hookupId = 1,

            $view = can.view = function(view, data, helpers, callback) {
                // If helpers is a `function`, it is actually a callback.
                if (isFunction(helpers)) {
                    callback = helpers;
                    helpers = undefined;
                }

                var pipe = function(result) {
                    return $view.frag(result);
                },
                    // In case we got a callback, we need to convert the can.view.render
                    // result to a document fragment
                    wrapCallback = isFunction(callback) ? function(frag) {
                        callback(pipe(frag));
                    } : null,
                    // Get the result.
                    result = $view.render(view, data, helpers, wrapCallback),
                    deferred = can.Deferred();

                if (isFunction(result)) {
                    return result;
                }

                if (can.isDeferred(result)) {
                    result.then(function(result, data) {
                        deferred.resolve.call(deferred, pipe(result), data);
                    }, function() {
                        deferred.fail.apply(deferred, arguments);
                    });
                    return deferred;
                }

                // Convert it into a dom frag.
                return pipe(result);
            };

        can.extend($view, {
            // creates a frag and hooks it up all at once
            frag: function(result, parentNode) {
                return $view.hookup($view.fragment(result), parentNode);
            },

            // simply creates a frag
            // this is used internally to create a frag
            // insert it
            // then hook it up
            fragment: function(result) {
                var frag = can.buildFragment(result, document.body);
                // If we have an empty frag...
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(''));
                }
                return frag;
            },

            // Convert a path like string into something that's ok for an `element` ID.
            toId: function(src) {
                return can.map(src.toString().split(/\/|\./g), function(part) {
                    // Dont include empty strings in toId functions
                    if (part) {
                        return part;
                    }
                }).join("_");
            },

            hookup: function(fragment, parentNode) {
                var hookupEls = [],
                    id,
                    func;

                // Get all `childNodes`.
                can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(node) {
                    if (node.nodeType === 1) {
                        hookupEls.push(node);
                        hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
                    }
                });

                // Filter by `data-view-id` attribute.
                can.each(hookupEls, function(el) {
                    if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
                        func(el, parentNode, id);
                        delete $view.hookups[id];
                        el.removeAttribute('data-view-id');
                    }
                });

                return fragment;
            },


            hookups: {},


            hook: function(cb) {
                $view.hookups[++hookupId] = cb;
                return " data-view-id='" + hookupId + "'";
            },


            cached: {},

            cachedRenderers: {},


            cache: true,


            register: function(info) {
                this.types["." + info.suffix] = info;
            },

            types: {},


            ext: ".ejs",


            registerScript: function() {},


            preload: function() {},


            render: function(view, data, helpers, callback) {
                // If helpers is a `function`, it is actually a callback.
                if (isFunction(helpers)) {
                    callback = helpers;
                    helpers = undefined;
                }

                // See if we got passed any deferreds.
                var deferreds = getDeferreds(data);

                if (deferreds.length) { // Does data contain any deferreds?
                    // The deferred that resolves into the rendered content...
                    var deferred = new can.Deferred(),
                        dataCopy = can.extend({}, data);

                    // Add the view request to the list of deferreds.
                    deferreds.push(get(view, true))

                    // Wait for the view and all deferreds to finish...
                    can.when.apply(can, deferreds).then(function(resolved) {
                        // Get all the resolved deferreds.
                        var objs = makeArray(arguments),
                            // Renderer is the last index of the data.
                            renderer = objs.pop(),
                            // The result of the template rendering with data.
                            result;

                        // Make data look like the resolved deferreds.
                        if (can.isDeferred(data)) {
                            dataCopy = usefulPart(resolved);
                        } else {
                            // Go through each prop in data again and
                            // replace the defferreds with what they resolved to.
                            for (var prop in data) {
                                if (can.isDeferred(data[prop])) {
                                    dataCopy[prop] = usefulPart(objs.shift());
                                }
                            }
                        }

                        // Get the rendered result.
                        result = renderer(dataCopy, helpers);

                        // Resolve with the rendered view.
                        deferred.resolve(result, dataCopy);

                        // If there's a `callback`, call it back with the result.
                        callback && callback(result, dataCopy);
                    }, function() {
                        deferred.reject.apply(deferred, arguments)
                    });
                    // Return the deferred...
                    return deferred;
                } else {
                    // No deferreds! Render this bad boy.
                    var response,
                        // If there's a `callback` function
                        async = isFunction(callback),
                        // Get the `view` type
                        deferred = get(view, async);

                    // If we are `async`...
                    if (async) {
                        // Return the deferred
                        response = deferred;
                        // And fire callback with the rendered result.
                        deferred.then(function(renderer) {
                            callback(data ? renderer(data, helpers) : renderer);
                        })
                    } else {
                        // if the deferred is resolved, call the cached renderer instead
                        // this is because it's possible, with recursive deferreds to
                        // need to render a view while its deferred is _resolving_.  A _resolving_ deferred
                        // is a deferred that was just resolved and is calling back it's success callbacks.
                        // If a new success handler is called while resoliving, it does not get fired by
                        // jQuery's deferred system.  So instead of adding a new callback
                        // we use the cached renderer.
                        // We also add __view_id on the deferred so we can look up it's cached renderer.
                        // In the future, we might simply store either a deferred or the cached result.
                        if (deferred.state() === "resolved" && deferred.__view_id) {
                            var currentRenderer = $view.cachedRenderers[deferred.__view_id];
                            return data ? currentRenderer(data, helpers) : currentRenderer;
                        } else {
                            // Otherwise, the deferred is complete, so
                            // set response to the result of the rendering.
                            deferred.then(function(renderer) {
                                response = data ? renderer(data, helpers) : renderer;
                            });
                        }
                    }

                    return response;
                }
            },


            registerView: function(id, text, type, def) {
                // Get the renderer function.
                var func = (type || $view.types[$view.ext]).renderer(id, text);
                def = def || new can.Deferred();

                // Cache if we are caching.
                if ($view.cache) {
                    $view.cached[id] = def;
                    def.__view_id = id;
                    $view.cachedRenderers[id] = func;
                }

                // Return the objects for the response's `dataTypes`
                // (in this case view).
                return def.resolve(func);
            }
        });

        // Makes sure there's a template, if not, have `steal` provide a warning.
        var checkText = function(text, url) {
            if (!text.length) {

                throw "can.view: No template or empty template:" + url;
            }
        },
            // `Returns a `view` renderer deferred.  
            // `url` - The url to the template.  
            // `async` - If the ajax request should be asynchronous.  
            // Returns a deferred.
            get = function(url, async) {
                var suffix = url.match(/\.[\w\d]+$/),
                    type,
                    // If we are reading a script element for the content of the template,
                    // `el` will be set to that script element.
                    el,
                    // A unique identifier for the view (used for caching).
                    // This is typically derived from the element id or
                    // the url for the template.
                    id,
                    // The ajax request used to retrieve the template content.
                    jqXHR;

                //If the url has a #, we assume we want to use an inline template
                //from a script element and not current page's HTML
                if (url.match(/^#/)) {
                    url = url.substr(1);
                }
                // If we have an inline template, derive the suffix from the `text/???` part.
                // This only supports `<script>` tags.
                if (el = document.getElementById(url)) {
                    suffix = "." + el.type.match(/\/(x\-)?(.+)/)[2];
                }

                // If there is no suffix, add one.
                if (!suffix && !$view.cached[url]) {
                    url += (suffix = $view.ext);
                }

                if (can.isArray(suffix)) {
                    suffix = suffix[0]
                }

                // Convert to a unique and valid id.
                id = $view.toId(url);

                // If an absolute path, use `steal` to get it.
                // You should only be using `//` if you are using `steal`.
                if (url.match(/^\/\//)) {
                    var sub = url.substr(2);
                    url = !window.steal ?
                        sub :
                        steal.config().root.mapJoin(sub);
                }

                // Set the template engine type.
                type = $view.types[suffix];

                // If it is cached, 
                if ($view.cached[id]) {
                    // Return the cached deferred renderer.
                    return $view.cached[id];

                    // Otherwise if we are getting this from a `<script>` element.
                } else if (el) {
                    // Resolve immediately with the element's `innerHTML`.
                    return $view.registerView(id, el.innerHTML, type);
                } else {
                    // Make an ajax request for text.
                    var d = new can.Deferred();
                    can.ajax({
                        async: async,
                        url: url,
                        dataType: "text",
                        error: function(jqXHR) {
                            checkText("", url);
                            d.reject(jqXHR);
                        },
                        success: function(text) {
                            // Make sure we got some text back.
                            checkText(text, url);
                            $view.registerView(id, text, type, d)
                        }
                    });
                    return d;
                }
            },
            // Gets an `array` of deferreds from an `object`.
            // This only goes one level deep.
            getDeferreds = function(data) {
                var deferreds = [];

                // pull out deferreds
                if (can.isDeferred(data)) {
                    return [data]
                } else {
                    for (var prop in data) {
                        if (can.isDeferred(data[prop])) {
                            deferreds.push(data[prop]);
                        }
                    }
                }
                return deferreds;
            },
            // Gets the useful part of a resolved deferred.
            // This is for `model`s and `can.ajax` that resolve to an `array`.
            usefulPart = function(resolved) {
                return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
            };

        //!steal-pluginify-remove-start
        if (window.steal) {
            steal.type("view js", function(options, success, error) {
                var type = $view.types["." + options.type],
                    id = $view.toId(options.id);

                options.text = "steal('" + (type.plugin || "can/view/" + options.type) + "',function(can){return " + "can.view.preload('" + id + "'," + options.text + ");\n})";
                success();
            })
        }
        //!steal-pluginify-remove-end

        can.extend($view, {
            register: function(info) {
                this.types["." + info.suffix] = info;

                //!steal-pluginify-remove-start
                if (window.steal) {
                    steal.type(info.suffix + " view js", function(options, success, error) {
                        var type = $view.types["." + options.type],
                            id = $view.toId(options.id + '');

                        options.text = type.script(id, options.text)
                        success();
                    })
                };
                //!steal-pluginify-remove-end

                $view[info.suffix] = function(id, text) {
                    if (!text) {
                        // Return a nameless renderer
                        var renderer = function() {
                            return $view.frag(renderer.render.apply(this, arguments));
                        }
                        renderer.render = function() {
                            var renderer = info.renderer(null, id);
                            return renderer.apply(renderer, arguments);
                        }
                        return renderer;
                    }

                    $view.preload(id, info.renderer(id, text));
                    return can.view(id);
                }
            },
            registerScript: function(type, id, src) {
                return "can.view.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
            },
            preload: function(id, renderer) {
                $view.cached[id] = new can.Deferred().resolve(function(data, helpers) {
                    return renderer.call(data, data, helpers);
                });

                function frag() {
                    return $view.frag(renderer.apply(this, arguments));
                }
                // expose the renderer for mustache
                frag.render = renderer;
                return frag;
            }

        });

        return can;
    })(__m3);

    // ## can/control/control.js
    var __m10 = (function(can) {
        // ## control.js
        // `can.Control`  
        // _Controller_

        // Binds an element, returns a function that unbinds.
        var bind = function(el, ev, callback) {

            can.bind.call(el, ev, callback);

            return function() {
                can.unbind.call(el, ev, callback);
            };
        },
            isFunction = can.isFunction,
            extend = can.extend,
            each = can.each,
            slice = [].slice,
            paramReplacer = /\{([^\}]+)\}/g,
            special = can.getObject("$.event.special", [can]) || {},

            // Binds an element, returns a function that unbinds.
            delegate = function(el, selector, ev, callback) {
                can.delegate.call(el, selector, ev, callback);
                return function() {
                    can.undelegate.call(el, selector, ev, callback);
                };
            },

            // Calls bind or unbind depending if there is a selector.
            binder = function(el, ev, callback, selector) {
                return selector ?
                    delegate(el, can.trim(selector), ev, callback) :
                    bind(el, ev, callback);
            },

            basicProcessor;


        var Control = can.Control = can.Construct(

        {
            // Setup pre-processes which methods are event listeners.

            setup: function() {

                // Allow contollers to inherit "defaults" from super-classes as it 
                // done in `can.Construct`
                can.Construct.setup.apply(this, arguments);

                // If you didn't provide a name, or are `control`, don't do anything.
                if (can.Control) {

                    // Cache the underscored names.
                    var control = this,
                        funcName;

                    // Calculate and cache actions.
                    control.actions = {};
                    for (funcName in control.prototype) {
                        if (control._isAction(funcName)) {
                            control.actions[funcName] = control._action(funcName);
                        }
                    }
                }
            },

            // Moves `this` to the first argument, wraps it with `jQuery` if it's an element
            _shifter: function(context, name) {

                var method = typeof name == "string" ? context[name] : name;

                if (!isFunction(method)) {
                    method = context[method];
                }

                return function() {
                    context.called = name;
                    return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
                };
            },

            // Return `true` if is an action.

            _isAction: function(methodName) {

                var val = this.prototype[methodName],
                    type = typeof val;
                // if not the constructor
                return (methodName !== 'constructor') &&
                // and is a function or links to a function
                (type == "function" || (type == "string" && isFunction(this.prototype[val]))) &&
                // and is in special, a processor, or has a funny character
                !! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
            },
            // Takes a method name and the options passed to a control
            // and tries to return the data necessary to pass to a processor
            // (something that binds things).

            _action: function(methodName, options) {

                // If we don't have options (a `control` instance), we'll run this 
                // later.  
                paramReplacer.lastIndex = 0;
                if (options || !paramReplacer.test(methodName)) {
                    // If we have options, run sub to replace templates `{}` with a
                    // value from the options or the window
                    var convertedName = options ? can.sub(methodName, [options, window]) : methodName;
                    if (!convertedName) {
                        return null;
                    }
                    // If a `{}` template resolves to an object, `convertedName` will be
                    // an array
                    var arr = can.isArray(convertedName),

                        // Get the name
                        name = arr ? convertedName[1] : convertedName,

                        // Grab the event off the end
                        parts = name.split(/\s+/g),
                        event = parts.pop();

                    return {
                        processor: processors[event] || basicProcessor,
                        parts: [name, parts.join(" "), event],
                        delegate: arr ? convertedName[0] : undefined
                    };
                }
            },
            // An object of `{eventName : function}` pairs that Control uses to 
            // hook up events auto-magically.

            processors: {},
            // A object of name-value pairs that act as default values for a 
            // control instance

            defaults: {}
        },

        {
            // Sets `this.element`, saves the control in `data, binds event
            // handlers.

            setup: function(element, options) {

                var cls = this.constructor,
                    pluginname = cls.pluginName || cls._fullName,
                    arr;

                // Want the raw element here.
                this.element = can.$(element)

                if (pluginname && pluginname !== 'can_control') {
                    // Set element and `className` on element.
                    this.element.addClass(pluginname);
                }

                (arr = can.data(this.element, "controls")) || can.data(this.element, "controls", arr = []);
                arr.push(this);

                // Option merging.

                this.options = extend({}, cls.defaults, options);

                // Bind all event handlers.
                this.on();

                // Get's passed into `init`.

                return [this.element, this.options];
            },

            on: function(el, selector, eventName, func) {
                if (!el) {

                    // Adds bindings.
                    this.off();

                    // Go through the cached list of actions and use the processor 
                    // to bind
                    var cls = this.constructor,
                        bindings = this._bindings,
                        actions = cls.actions,
                        element = this.element,
                        destroyCB = can.Control._shifter(this, "destroy"),
                        funcName, ready;

                    for (funcName in actions) {
                        // Only push if we have the action and no option is `undefined`
                        if (actions.hasOwnProperty(funcName) &&
                            (ready = actions[funcName] || cls._action(funcName, this.options))) {
                            bindings.push(ready.processor(ready.delegate || element,
                                ready.parts[2], ready.parts[1], funcName, this));
                        }
                    }


                    // Setup to be destroyed...  
                    // don't bind because we don't want to remove it.
                    can.bind.call(element, "destroyed", destroyCB);
                    bindings.push(function(el) {
                        can.unbind.call(el, "destroyed", destroyCB);
                    });
                    return bindings.length;
                }

                if (typeof el == 'string') {
                    func = eventName;
                    eventName = selector;
                    selector = el;
                    el = this.element;
                }

                if (func === undefined) {
                    func = eventName;
                    eventName = selector;
                    selector = null;
                }

                if (typeof func == 'string') {
                    func = can.Control._shifter(this, func);
                }

                this._bindings.push(binder(el, eventName, func, selector));

                return this._bindings.length;
            },
            // Unbinds all event handlers on the controller.

            off: function() {
                var el = this.element[0]
                each(this._bindings || [], function(value) {
                    value(el);
                });
                // Adds bindings.
                this._bindings = [];
            },
            // Prepares a `control` for garbage collection

            destroy: function() {
                var Class = this.constructor,
                    pluginName = Class.pluginName || Class._fullName,
                    controls;

                // Unbind bindings.
                this.off();

                if (pluginName && pluginName !== 'can_control') {
                    // Remove the `className`.
                    this.element.removeClass(pluginName);
                }

                // Remove from `data`.
                controls = can.data(this.element, "controls");
                controls.splice(can.inArray(this, controls), 1);

                can.trigger(this, "destroyed"); // In case we want to know if the `control` is removed.

                this.element = null;
            }
        });

        var processors = can.Control.processors,
            // Processors do the binding.
            // They return a function that unbinds when called.  
            // The basic processor that binds events.
            basicProcessor = function(el, event, selector, methodName, control) {
                return binder(el, event, can.Control._shifter(control, methodName), selector);
            };

        // Set common events to be processed as a `basicProcessor`
        each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup",
                "keypress", "mousedown", "mousemove", "mouseout", "mouseover",
                "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
                "focusout", "mouseenter", "mouseleave",
            // #104 - Add touch events as default processors
            // TOOD feature detect?
            "touchstart", "touchmove", "touchcancel", "touchend", "touchleave"
        ], function(v) {
            processors[v] = basicProcessor;
        });

        return Control;
    })(__m3, __m1);

    // ## can/util/string/deparam/deparam.js
    var __m12 = (function(can) {

        // ## deparam.js  
        // `can.deparam`  
        // _Takes a string of name value pairs and returns a Object literal that represents those params._
        var digitTest = /^\d+$/,
            keyBreaker = /([^\[\]]+)|(\[\])/g,
            paramTest = /([^?#]*)(#.*)?$/,
            prep = function(str) {
                return decodeURIComponent(str.replace(/\+/g, " "));
            };


        can.extend(can, {

            deparam: function(params) {

                var data = {},
                    pairs, lastPart;

                if (params && paramTest.test(params)) {

                    pairs = params.split('&'),

                    can.each(pairs, function(pair) {

                        var parts = pair.split('='),
                            key = prep(parts.shift()),
                            value = prep(parts.join("=")),
                            current = data;

                        if (key) {
                            parts = key.match(keyBreaker);

                            for (var j = 0, l = parts.length - 1; j < l; j++) {
                                if (!current[parts[j]]) {
                                    // If what we are pointing to looks like an `array`
                                    current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] == "[]" ? [] : {};
                                }
                                current = current[parts[j]];
                            }
                            lastPart = parts.pop();
                            if (lastPart == "[]") {
                                current.push(value);
                            } else {
                                current[lastPart] = value;
                            }
                        }
                    });
                }
                return data;
            }
        });
        return can;
    })(__m3, __m2);

    // ## can/route/route.js
    var __m11 = (function(can) {

        // ## route.js  
        // `can.route`  
        // _Helps manage browser history (and client state) by synchronizing the 
        // `window.location.hash` with a `can.Observe`._  
        // Helper methods used for matching routes.
        var
        // `RegExp` used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
            // Regular expression for identifying &amp;key=value lists.
            paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
            // Converts a JS Object into a list of parameters that can be 
            // inserted into an html element tag.
            makeProps = function(props) {
                var tags = [];
                can.each(props, function(val, name) {
                    tags.push((name === 'className' ? 'class' : name) + '="' +
                        (name === "href" ? val : can.esc(val)) + '"');
                });
                return tags.join(" ");
            },
            // Checks if a route matches the data provided. If any route variable
            // is not present in the data, the route does not match. If all route
            // variables are present in the data, the number of matches is returned 
            // to allow discerning between general and more specific routes. 
            matchesData = function(route, data) {
                var count = 0,
                    i = 0,
                    defaults = {};
                // look at default values, if they match ...
                for (var name in route.defaults) {
                    if (route.defaults[name] === data[name]) {
                        // mark as matched
                        defaults[name] = 1;
                        count++;
                    }
                }
                for (; i < route.names.length; i++) {
                    if (!data.hasOwnProperty(route.names[i])) {
                        return -1;
                    }
                    if (!defaults[route.names[i]]) {
                        count++;
                    }

                }

                return count;
            },
            onready = !0,
            location = window.location,
            wrapQuote = function(str) {
                return (str + '').replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
            },
            each = can.each,
            extend = can.extend;

        can.route = function(url, defaults) {
            defaults = defaults || {};
            // Extract the variable names and replace with `RegExp` that will match
            // an atual URL with values.
            var names = [],
                test = url.replace(matcher, function(whole, name, i) {
                    names.push(name);
                    var next = "\\" + (url.substr(i + whole.length, 1) || can.route._querySeparator);
                    // a name without a default value HAS to have a value
                    // a name that has a default value can be empty
                    // The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
                    return "([^" + next + "]" + (defaults[name] ? "*" : "+") + ")";
                });

            // Add route in a form that can be easily figured out.
            can.route.routes[url] = {
                // A regular expression that will match the route when variable values 
                // are present; i.e. for `:page/:type` the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
                // will match for any value of `:page` and `:type` (word chars or period).
                test: new RegExp("^" + test + "($|" + wrapQuote(can.route._querySeparator) + ")"),
                // The original URL, same as the index for this entry in routes.
                route: url,
                // An `array` of all the variable names in this route.
                names: names,
                // Default values provided for the variables.
                defaults: defaults,
                // The number of parts in the URL separated by `/`.
                length: url.split('/').length
            };
            return can.route;
        };

        extend(can.route, {

            _querySeparator: '&',
            _paramsMatcher: paramsMatcher,


            param: function(data, _setRoute) {
                // Check if the provided data keys match the names in any routes;
                // Get the one with the most matches.
                var route,
                    // Need to have at least 1 match.
                    matches = 0,
                    matchCount,
                    routeName = data.route,
                    propCount = 0;

                delete data.route;

                each(data, function() {
                    propCount++;
                });
                // Otherwise find route.
                each(can.route.routes, function(temp, name) {
                    // best route is the first with all defaults matching


                    matchCount = matchesData(temp, data);
                    if (matchCount > matches) {
                        route = temp;
                        matches = matchCount;
                    }
                    if (matchCount >= propCount) {
                        return false;
                    }
                });
                // If we have a route name in our `can.route` data, and it's
                // just as good as what currently matches, use that
                if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
                    route = can.route.routes[routeName];
                }
                // If this is match...
                if (route) {
                    var cpy = extend({}, data),
                        // Create the url by replacing the var names with the provided data.
                        // If the default value is found an empty string is inserted.
                        res = route.route.replace(matcher, function(whole, name) {
                            delete cpy[name];
                            return data[name] === route.defaults[name] ? "" : encodeURIComponent(data[name]);
                        }),
                        after;
                    // Remove matching default values
                    each(route.defaults, function(val, name) {
                        if (cpy[name] === val) {
                            delete cpy[name];
                        }
                    });

                    // The remaining elements of data are added as 
                    // `&amp;` separated parameters to the url.
                    after = can.param(cpy);
                    // if we are paraming for setting the hash
                    // we also want to make sure the route value is updated
                    if (_setRoute) {
                        can.route.attr('route', route.route);
                    }
                    return res + (after ? can.route._querySeparator + after : "");
                }
                // If no route was found, there is no hash URL, only paramters.
                return can.isEmptyObject(data) ? "" : can.route._querySeparator + can.param(data);
            },

            deparam: function(url) {
                // See if the url matches any routes by testing it against the `route.test` `RegExp`.
                // By comparing the URL length the most specialized route that matches is used.
                var route = {
                    length: -1
                };
                each(can.route.routes, function(temp, name) {
                    if (temp.test.test(url) && temp.length > route.length) {
                        route = temp;
                    }
                });
                // If a route was matched.
                if (route.length > -1) {

                    var // Since `RegExp` backreferences are used in `route.test` (parens)
                    // the parts will contain the full matched string and each variable (back-referenced) value.
                    parts = url.match(route.test),
                        // Start will contain the full matched string; parts contain the variable values.
                        start = parts.shift(),
                        // The remainder will be the `&amp;key=value` list at the end of the URL.
                        remainder = url.substr(start.length - (parts[parts.length - 1] === can.route._querySeparator ? 1 : 0)),
                        // If there is a remainder and it contains a `&amp;key=value` list deparam it.
                        obj = (remainder && can.route._paramsMatcher.test(remainder)) ? can.deparam(remainder.slice(1)) : {};

                    // Add the default values for this route.
                    obj = extend(true, {}, route.defaults, obj);
                    // Overwrite each of the default values in `obj` with those in 
                    // parts if that part is not empty.
                    each(parts, function(part, i) {
                        if (part && part !== can.route._querySeparator) {
                            obj[route.names[i]] = decodeURIComponent(part);
                        }
                    });
                    obj.route = route.route;
                    return obj;
                }
                // If no route was matched, it is parsed as a `&amp;key=value` list.
                if (url.charAt(0) !== can.route._querySeparator) {
                    url = can.route._querySeparator + url;
                }
                return can.route._paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
            },

            data: new can.Observe({}),

            routes: {},

            ready: function(val) {
                if (val === false) {
                    onready = val;
                }
                if (val === true || onready === true) {
                    can.route._setup();
                    setState();
                }
                return can.route;
            },

            url: function(options, merge) {
                if (merge) {
                    options = extend({}, curParams, options)
                }
                return "#!" + can.route.param(options);
            },

            link: function(name, options, props, merge) {
                return "<a " + makeProps(
                    extend({
                    href: can.route.url(options, merge)
                }, props)) + ">" + name + "</a>";
            },

            current: function(options) {
                return location.hash == "#!" + can.route.param(options)
            },
            _setup: function() {
                // If the hash changes, update the `can.route.data`.
                can.bind.call(window, 'hashchange', setState);
            },
            _getHash: function() {
                return location.href.split(/#!?/)[1] || "";
            },
            _setHash: function(serialized) {
                var path = (can.route.param(serialized, true));
                location.hash = "#!" + path;
                return path;
            }
        });


        // The functions in the following list applied to `can.route` (e.g. `can.route.attr('...')`) will
        // instead act on the `can.route.data` observe.
        each(['bind', 'unbind', 'delegate', 'undelegate', 'attr', 'removeAttr'], function(name) {
            can.route[name] = function() {
                return can.route.data[name].apply(can.route.data, arguments)
            }
        })

        var // A ~~throttled~~ debounced function called multiple times will only fire once the
        // timer runs down. Each call resets the timer.
        timer,
            // Intermediate storage for `can.route.data`.
            curParams,
            // Deparameterizes the portion of the hash of interest and assign the
            // values to the `can.route.data` removing existing values no longer in the hash.
            // setState is called typically by hashchange which fires asynchronously
            // So it's possible that someone started changing the data before the 
            // hashchange event fired.  For this reason, it will not set the route data
            // if the data is changing or the hash already matches the hash that was set.
            setState = can.route.setState = function() {
                var hash = can.route._getHash();
                curParams = can.route.deparam(hash);

                // if the hash data is currently changing, or
                // the hash is what we set it to anyway, do NOT change the hash
                if (!changingData || hash !== lastHash) {
                    can.route.attr(curParams, true);
                }
            },
            // The last hash caused by a data change
            lastHash,
            // Are data changes pending that haven't yet updated the hash
            changingData;

        // If the `can.route.data` changes, update the hash.
        // Using `.serialize()` retrieves the raw data contained in the `observable`.
        // This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
        // This might be able to use batchNum and avoid this.
        can.route.bind("change", function(ev, attr) {
            // indicate that data is changing
            changingData = 1;
            clearTimeout(timer);
            timer = setTimeout(function() {
                // indicate that the hash is set to look like the data
                changingData = 0;
                var serialized = can.route.data.serialize();

                lastHash = can.route._setHash(serialized);
            }, 1);
        });
        // `onready` event...
        can.bind.call(document, "ready", can.route.ready);

        // Libraries other than jQuery don't execute the document `ready` listener
        // if we are already DOM ready
        if ((document.readyState === 'complete' || document.readyState === "interactive") && onready) {
            can.route.ready();
        }

        // extend route to have a similar property 
        // that is often checked in mustache to determine
        // an object's observability
        can.route.constructor.canMakeObserve = can.Observe.canMakeObserve;

        return can.route;
    })(__m3, __m7, __m12);

    // ## can/control/route/route.js
    var __m13 = (function(can) {

        // ## control/route.js  
        // _Controller route integration._

        can.Control.processors.route = function(el, event, selector, funcName, controller) {
            selector = selector || "";
            can.route(selector);
            var batchNum,
                check = function(ev, attr, how) {
                    if (can.route.attr('route') === (selector) &&
                        (ev.batchNum === undefined || ev.batchNum !== batchNum)) {

                        batchNum = ev.batchNum;

                        var d = can.route.attr();
                        delete d.route;
                        if (can.isFunction(controller[funcName])) {
                            controller[funcName](d);
                        } else {
                            controller[controller[funcName]](d);
                        }

                    }
                };
            can.route.bind('change', check);
            return function() {
                can.route.unbind('change', check);
            };
        };

        return can;
    })(__m3, __m11, __m10);

    // ## can/view/scanner.js
    var __m15 = (function(can) {

        var newLine = /(\r|\n)+/g,
            tagToContentPropMap = {
                option: "textContent",
                textarea: "value"
            },
            // Escapes characters starting with `\`.
            clean = function(content) {
                return content
                    .split('\\').join("\\\\")
                    .split("\n").join("\\n")
                    .split('"').join('\\"')
                    .split("\t").join("\\t");
            },
            reverseTagMap = {
                tr: "tbody",
                option: "select",
                td: "tr",
                th: "tr",
                li: "ul"
            },
            // Returns a tagName to use as a temporary placeholder for live content
            // looks forward ... could be slow, but we only do it when necessary
            getTag = function(tagName, tokens, i) {
                // if a tagName is provided, use that
                if (tagName) {
                    return tagName;
                } else {
                    // otherwise go searching for the next two tokens like "<",TAG
                    while (i < tokens.length) {
                        if (tokens[i] == "<" && reverseTagMap[tokens[i + 1]]) {
                            return reverseTagMap[tokens[i + 1]];
                        }
                        i++;
                    }
                }
                return '';
            },
            bracketNum = function(content) {
                return (--content.split("{").length) - (--content.split("}").length);
            },
            myEval = function(script) {
                eval(script);
            },
            attrReg = /([^\s]+)[\s]*=[\s]*$/,
            // Commands for caching.
            startTxt = 'var ___v1ew = [];',
            finishTxt = "return ___v1ew.join('')",
            put_cmd = "___v1ew.push(",
            insert_cmd = put_cmd,
            // Global controls (used by other functions to know where we are).
            // Are we inside a tag?
            htmlTag = null,
            // Are we within a quote within a tag?
            quote = null,
            // What was the text before the current quote? (used to get the `attr` name)
            beforeQuote = null,
            // Whether a rescan is in progress
            rescan = null,
            // Used to mark where the element is.
            status = function() {
                // `t` - `1`.
                // `h` - `0`.
                // `q` - String `beforeQuote`.
                return quote ? "'" + beforeQuote.match(attrReg)[1] + "'" : (htmlTag ? 1 : 0);
            };

        can.view.Scanner = Scanner = function(options) {
            // Set options on self
            can.extend(this, {
                text: {},
                tokens: []
            }, options);

            // Cache a token lookup
            this.tokenReg = [];
            this.tokenSimple = {
                "<": "<",
                ">": ">",
                '"': '"',
                "'": "'"
            };
            this.tokenComplex = [];
            this.tokenMap = {};
            for (var i = 0, token; token = this.tokens[i]; i++) {


                // Save complex mappings (custom regexp)
                if (token[2]) {
                    this.tokenReg.push(token[2]);
                    this.tokenComplex.push({
                        abbr: token[1],
                        re: new RegExp(token[2]),
                        rescan: token[3]
                    });
                }
                // Save simple mappings (string only, no regexp)
                else {
                    this.tokenReg.push(token[1]);
                    this.tokenSimple[token[1]] = token[0];
                }
                this.tokenMap[token[0]] = token[1];
            }

            // Cache the token registry.
            this.tokenReg = new RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")", "g");
        };

        Scanner.prototype = {

            helpers: [

                {
                    name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                    fn: function(content) {
                        var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                            parts = content.match(quickFunc);

                        return "function(__){var " + parts[1] + "=can.$(__);" + parts[2] + "}";
                    }
                }
            ],

            scan: function(source, name) {
                var tokens = [],
                    last = 0,
                    simple = this.tokenSimple,
                    complex = this.tokenComplex;

                source = source.replace(newLine, "\n");
                source.replace(this.tokenReg, function(whole, part) {
                    // offset is the second to last argument
                    var offset = arguments[arguments.length - 2];

                    // if the next token starts after the last token ends
                    // push what's in between
                    if (offset > last) {
                        tokens.push(source.substring(last, offset));
                    }

                    // push the simple token (if there is one)
                    if (simple[whole]) {
                        tokens.push(whole);
                    }
                    // otherwise lookup complex tokens
                    else {
                        for (var i = 0, token; token = complex[i]; i++) {
                            if (token.re.test(whole)) {
                                tokens.push(token.abbr);
                                // Push a rescan function if one exists
                                if (token.rescan) {
                                    tokens.push(token.rescan(part));
                                }
                                break;
                            }
                        }
                    }

                    // update the position of the last part of the last token
                    last = offset + part.length;
                });

                // if there's something at the end, add it
                if (last < source.length) {
                    tokens.push(source.substr(last));
                }

                var content = '',
                    buff = [startTxt + (this.text.start || '')],
                    // Helper `function` for putting stuff in the view concat.
                    put = function(content, bonus) {
                        buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
                    },
                    // A stack used to keep track of how we should end a bracket
                    // `}`.  
                    // Once we have a `<%= %>` with a `leftBracket`,
                    // we store how the file should end here (either `))` or `;`).
                    endStack = [],
                    // The last token, used to remember which tag we are in.
                    lastToken,
                    // The corresponding magic tag.
                    startTag = null,
                    // Was there a magic tag inside an html tag?
                    magicInTag = false,
                    // The current tag name.
                    tagName = '',
                    // stack of tagNames
                    tagNames = [],
                    // Pop from tagNames?
                    popTagName = false,
                    // Declared here.
                    bracketCount,
                    i = 0,
                    token,
                    tmap = this.tokenMap;

                // Reinitialize the tag state goodness.
                htmlTag = quote = beforeQuote = null;

                for (;
                (token = tokens[i++]) !== undefined;) {
                    if (startTag === null) {
                        switch (token) {
                            case tmap.left:
                            case tmap.escapeLeft:
                            case tmap.returnLeft:
                                magicInTag = htmlTag && 1;
                            case tmap.commentLeft:
                                // A new line -- just add whatever content within a clean.  
                                // Reset everything.
                                startTag = token;
                                if (content.length) {
                                    put(content);
                                }
                                content = '';
                                break;
                            case tmap.escapeFull:
                                // This is a full line escape (a line that contains only whitespace and escaped logic)
                                // Break it up into escape left and right
                                magicInTag = htmlTag && 1;
                                rescan = 1;
                                startTag = tmap.escapeLeft;
                                if (content.length) {
                                    put(content);
                                }
                                rescan = tokens[i++];
                                content = rescan.content || rescan;
                                if (rescan.before) {
                                    put(rescan.before);
                                }
                                tokens.splice(i, 0, tmap.right);
                                break;
                            case tmap.commentFull:
                                // Ignore full line comments.
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            case '<':
                                // Make sure we are not in a comment.
                                if (tokens[i].indexOf("!--") !== 0) {
                                    htmlTag = 1;
                                    magicInTag = 0;
                                }
                                content += token;
                                break;
                            case '>':
                                htmlTag = 0;
                                // content.substr(-1) doesn't work in IE7/8
                                var emptyElement = content.substr(content.length - 1) == "/" || content.substr(content.length - 2) == "--";
                                // if there was a magic tag
                                // or it's an element that has text content between its tags, 
                                // but content is not other tags add a hookup
                                // TODO: we should only add `can.EJS.pending()` if there's a magic tag 
                                // within the html tags.
                                if (magicInTag || !popTagName && tagToContentPropMap[tagNames[tagNames.length - 1]]) {
                                    // make sure / of /> is on the left of pending
                                    if (emptyElement) {
                                        put(content.substr(0, content.length - 1), ",can.view.pending(),\"/>\"");
                                    } else {
                                        put(content, ",can.view.pending(),\">\"");
                                    }
                                    content = '';
                                    magicInTag = 0;
                                } else {
                                    content += token;
                                }
                                // if it's a tag like <input/>
                                if (emptyElement || popTagName) {
                                    // remove the current tag in the stack
                                    tagNames.pop();
                                    // set the current tag to the previous parent
                                    tagName = tagNames[tagNames.length - 1];
                                    // Don't pop next time
                                    popTagName = false;
                                }
                                break;
                            case "'":
                            case '"':
                                // If we are in an html tag, finding matching quotes.
                                if (htmlTag) {
                                    // We have a quote and it matches.
                                    if (quote && quote === token) {
                                        // We are exiting the quote.
                                        quote = null;
                                        // Otherwise we are creating a quote.
                                        // TODO: does this handle `\`?
                                    } else if (quote === null) {
                                        quote = token;
                                        beforeQuote = lastToken;
                                    }
                                }
                            default:
                                // Track the current tag
                                if (lastToken === '<') {
                                    tagName = token.split(/\s/)[0];
                                    if (tagName.indexOf("/") === 0 && tagNames[tagNames.length - 1] === tagName.substr(1)) {
                                        // set tagName to the last tagName
                                        // if there are no more tagNames, we'll rely on getTag.
                                        tagName = tagNames[tagNames.length - 1];
                                        popTagName = true;
                                    } else {
                                        tagNames.push(tagName);
                                    }
                                }
                                content += token;
                                break;
                        }
                    } else {
                        // We have a start tag.
                        switch (token) {
                            case tmap.right:
                            case tmap.returnRight:
                                switch (startTag) {
                                    case tmap.left:
                                        // Get the number of `{ minus }`
                                        bracketCount = bracketNum(content);

                                        // We are ending a block.
                                        if (bracketCount == 1) {

                                            // We are starting on.
                                            buff.push(insert_cmd, "can.view.txt(0,'" + getTag(tagName, tokens, i) + "'," + status() + ",this,function(){", startTxt, content);

                                            endStack.push({
                                                before: "",
                                                after: finishTxt + "}));\n"
                                            });
                                        } else {

                                            // How are we ending this statement?
                                            last = // If the stack has value and we are ending a block...
                                            endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
                                            endStack.pop() : // Or use the default ending.
                                            {
                                                after: ";"
                                            };

                                            // If we are ending a returning block, 
                                            // add the finish text which returns the result of the
                                            // block.
                                            if (last.before) {
                                                buff.push(last.before);
                                            }
                                            // Add the remaining content.
                                            buff.push(content, ";", last.after);
                                        }
                                        break;
                                    case tmap.escapeLeft:
                                    case tmap.returnLeft:
                                        // We have an extra `{` -> `block`.
                                        // Get the number of `{ minus }`.
                                        bracketCount = bracketNum(content);
                                        // If we have more `{`, it means there is a block.
                                        if (bracketCount) {
                                            // When we return to the same # of `{` vs `}` end with a `doubleParent`.
                                            endStack.push({
                                                before: finishTxt,
                                                after: "}));"
                                            });
                                        }

                                        var escaped = startTag === tmap.escapeLeft ? 1 : 0,
                                            commands = {
                                                insert: insert_cmd,
                                                tagName: getTag(tagName, tokens, i),
                                                status: status()
                                            };

                                        for (var ii = 0; ii < this.helpers.length; ii++) {
                                            // Match the helper based on helper
                                            // regex name value
                                            var helper = this.helpers[ii];
                                            if (helper.name.test(content)) {
                                                content = helper.fn(content, commands);

                                                // dont escape partials
                                                if (helper.name.source == /^>[\s]*\w*/.source) {
                                                    escaped = 0;
                                                }
                                                break;
                                            }
                                        }

                                        // Handle special cases
                                        if (typeof content == 'object') {
                                            if (content.raw) {
                                                buff.push(content.raw);
                                            }
                                        } else {
                                            // If we have `<%== a(function(){ %>` then we want
                                            // `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
                                            buff.push(insert_cmd, "can.view.txt(" + escaped + ",'" + tagName + "'," + status() + ",this,function(){ " + (this.text.escape || '') + "return ", content,
                                            // If we have a block.
                                            bracketCount ?
                                            // Start with startTxt `"var _v1ew = [];"`.
                                            startTxt :
                                            // If not, add `doubleParent` to close push and text.
                                            "}));");
                                        }

                                        if (rescan && rescan.after && rescan.after.length) {
                                            put(rescan.after.length);
                                            rescan = null;
                                        }
                                        break;
                                }
                                startTag = null;
                                content = '';
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            default:
                                content += token;
                                break;
                        }
                    }
                    lastToken = token;
                }

                // Put it together...
                if (content.length) {
                    // Should be `content.dump` in Ruby.
                    put(content);
                }
                buff.push(";");

                var template = buff.join(''),
                    out = {
                        out: 'with(_VIEW) { with (_CONTEXT) {' + template + " " + finishTxt + "}}"
                    };

                // Use `eval` instead of creating a function, because it is easier to debug.
                myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");

                return out;
            }
        };

        return Scanner;
    })(__m9);

    // ## can/observe/compute/compute.js
    var __m16 = (function(can) {

        // returns the
        // - observes and attr methods are called by func
        // - the value returned by func
        // ex: `{value: 100, observed: [{obs: o, attr: "completed"}]}`
        var getValueAndObserved = function(func, self) {

            var oldReading;
            if (can.Observe) {
                // Set a callback on can.Observe to know
                // when an attr is read.
                // Keep a reference to the old reader
                // if there is one.  This is used
                // for nested live binding.
                oldReading = can.Observe.__reading;
                can.Observe.__reading = function(obj, attr) {
                    // Add the observe and attr that was read
                    // to `observed`
                    observed.push({
                        obj: obj,
                        attr: attr
                    });
                };
            }

            var observed = [],
                // Call the "wrapping" function to get the value. `observed`
                // will have the observe/attribute pairs that were read.
                value = func.call(self);

            // Set back so we are no longer reading.
            if (can.Observe) {
                can.Observe.__reading = oldReading;
            }
            return {
                value: value,
                observed: observed
            };
        },
            // Calls `callback(newVal, oldVal)` everytime an observed property
            // called within `getterSetter` is changed and creates a new result of `getterSetter`.
            // Also returns an object that can teardown all event handlers.
            computeBinder = function(getterSetter, context, callback, computeState) {
                // track what we are observing
                var observing = {},
                    // a flag indicating if this observe/attr pair is already bound
                    matched = true,
                    // the data to return 
                    data = {
                        // we will maintain the value while live-binding is taking place
                        value: undefined,
                        // a teardown method that stops listening
                        teardown: function() {
                            for (var name in observing) {
                                var ob = observing[name];
                                ob.observe.obj.unbind(ob.observe.attr, onchanged);
                                delete observing[name];
                            }
                        }
                    },
                    batchNum;

                // when a property value is changed
                var onchanged = function(ev) {
                    // If the compute is no longer bound (because the same change event led to an unbind)
                    // then do not call getValueAndBind, or we will leak bindings.
                    if (computeState && !computeState.bound) {
                        return;
                    }
                    if (ev.batchNum === undefined || ev.batchNum !== batchNum) {
                        // store the old value
                        var oldValue = data.value,
                            // get the new value
                            newvalue = getValueAndBind();
                        // update the value reference (in case someone reads)
                        data.value = newvalue;
                        // if a change happened
                        if (newvalue !== oldValue) {
                            callback(newvalue, oldValue);
                        }
                        batchNum = batchNum = ev.batchNum;
                    }


                };

                // gets the value returned by `getterSetter` and also binds to any attributes
                // read by the call
                var getValueAndBind = function() {
                    var info = getValueAndObserved(getterSetter, context),
                        newObserveSet = info.observed;

                    var value = info.value;
                    matched = !matched;

                    // go through every attribute read by this observe
                    can.each(newObserveSet, function(ob) {
                        // if the observe/attribute pair is being observed
                        if (observing[ob.obj._cid + "|" + ob.attr]) {
                            // mark at as observed
                            observing[ob.obj._cid + "|" + ob.attr].matched = matched;
                        } else {
                            // otherwise, set the observe/attribute on oldObserved, marking it as being observed
                            observing[ob.obj._cid + "|" + ob.attr] = {
                                matched: matched,
                                observe: ob
                            };
                            ob.obj.bind(ob.attr, onchanged);
                        }
                    });

                    // Iterate through oldObserved, looking for observe/attributes
                    // that are no longer being bound and unbind them
                    for (var name in observing) {
                        var ob = observing[name];
                        if (ob.matched !== matched) {
                            ob.observe.obj.unbind(ob.observe.attr, onchanged);
                            delete observing[name];
                        }
                    }
                    return value;
                };
                // set the initial value
                data.value = getValueAndBind();
                data.isListening = !can.isEmptyObject(observing);
                return data;
            }

            // if no one is listening ... we can not calculate every time

        can.compute = function(getterSetter, context) {
            if (getterSetter && getterSetter.isComputed) {
                return getterSetter;
            }
            // get the value right away
            // TODO: eventually we can defer this until a bind or a read
            var computedData,
                bindings = 0,
                computed,
                canbind = true;
            if (typeof getterSetter === "function") {
                computed = function(value) {
                    if (value === undefined) {
                        // we are reading
                        if (computedData) {
                            // If another compute is calling this compute for the value,
                            // it needs to bind to this compute's change so it will re-compute
                            // and re-bind when this compute changes.
                            if (bindings && can.Observe.__reading) {
                                can.Observe.__reading(computed, 'change');
                            }
                            return computedData.value;
                        } else {
                            return getterSetter.call(context || this)
                        }
                    } else {
                        return getterSetter.apply(context || this, arguments)
                    }
                }

            } else {
                // we just gave it a value
                computed = function(val) {
                    if (val === undefined) {
                        // If observing, record that the value is being read.
                        if (can.Observe.__reading) {
                            can.Observe.__reading(computed, 'change');
                        }
                        return getterSetter;
                    } else {
                        var old = getterSetter;
                        getterSetter = val;
                        if (old !== val) {
                            can.Observe.triggerBatch(computed, "change", [val, old]);
                        }

                        return val;
                    }

                }
                canbind = false;
            }

            computed.isComputed = true;

            can.cid(computed, "compute")
            var computeState = {
                bound: false
            };

            computed.bind = function(ev, handler) {
                can.addEvent.apply(computed, arguments);
                if (bindings === 0 && canbind) {
                    computeState.bound = true;
                    // setup live-binding
                    computedData = computeBinder(getterSetter, context || this, function(newValue, oldValue) {
                        can.Observe.triggerBatch(computed, "change", [newValue, oldValue])
                    }, computeState);
                }
                bindings++;
            }

            computed.unbind = function(ev, handler) {
                can.removeEvent.apply(computed, arguments);
                bindings--;
                if (bindings === 0 && canbind) {
                    computedData.teardown();
                    computeState.bound = false;
                }

            };
            return computed;
        };
        can.compute.binder = computeBinder;
        return can.compute;
    })(__m3);

    // ## can/view/render.js
    var __m17 = (function(can) {
        // text node expando test
        var canExpando = true;
        try {
            document.createTextNode('')._ = 0;
        } catch (ex) {
            canExpando = false;
        }

        var attrMap = {
            "class": "className",
            "value": "value",
            "innerText": "innerText",
            "textContent": "textContent"
        },
            tagMap = {
                "": "span",
                table: "tbody",
                tr: "td",
                ol: "li",
                ul: "li",
                tbody: "tr",
                thead: "tr",
                tfoot: "tr",
                select: "option",
                optgroup: "option"
            },
            attributePlaceholder = '__!!__',
            attributeReplace = /__!!__/g,
            tagToContentPropMap = {
                option: "textContent" in document.createElement("option") ? "textContent" : "innerText",
                textarea: "value"
            },
            bool = can.each(["checked", "disabled", "readonly", "required"], function(n) {
                attrMap[n] = n;
            }),
            // a helper to get the parentNode for a given element el
            // if el is in a documentFragment, it will return defaultParentNode
            getParentNode = function(el, defaultParentNode) {
                return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
            },
            setAttr = function(el, attrName, val) {
                var tagName = el.nodeName.toString().toLowerCase(),
                    prop = attrMap[attrName];
                // if this is a special property
                if (prop) {
                    // set the value as true / false
                    el[prop] = can.inArray(attrName, bool) > -1 ? true : val;
                    if (prop === "value" && (tagName === "input" || tagName === "textarea")) {
                        el.defaultValue = val;
                    }
                } else {
                    el.setAttribute(attrName, val);
                }
            },
            getAttr = function(el, attrName) {
                // Default to a blank string for IE7/8
                return (attrMap[attrName] && el[attrMap[attrName]] ?
                    el[attrMap[attrName]] :
                    el.getAttribute(attrName)) || '';
            },
            removeAttr = function(el, attrName) {
                if (can.inArray(attrName, bool) > -1) {
                    el[attrName] = false;
                } else {
                    el.removeAttribute(attrName);
                }
            },
            pendingHookups = [],
            // Returns text content for anything other than a live-binding 
            contentText = function(input) {

                // If it's a string, return.
                if (typeof input == 'string') {
                    return input;
                }
                // If has no value, return an empty string.
                if (!input && input !== 0) {
                    return '';
                }

                // If it's an object, and it has a hookup method.
                var hook = (input.hookup &&

                // Make a function call the hookup method.

                function(el, id) {
                    input.hookup.call(input, el, id);
                }) ||

                // Or if it's a `function`, just use the input.
                (typeof input == 'function' && input);

                // Finally, if there is a `function` to hookup on some dom,
                // add it to pending hookups.
                if (hook) {
                    pendingHookups.push(hook);
                    return '';
                }

                // Finally, if all else is `false`, `toString()` it.
                return "" + input;
            },
            // Returns escaped/sanatized content for anything other than a live-binding
            contentEscape = function(txt) {
                return (typeof txt == 'string' || typeof txt == 'number') ?
                    can.esc(txt) :
                    contentText(txt);
            },
            // a mapping of element ids to nodeList ids
            nodeMap = {},
            // a mapping of ids to text nodes
            textNodeMap = {},
            // a mapping of nodeList ids to nodeList
            nodeListMap = {},
            expando = "ejs_" + Math.random(),
            _id = 0,
            id = function(node) {
                if (canExpando || node.nodeType !== 3) {
                    if (node[expando]) {
                        return node[expando];
                    } else {
                        return node[expando] = (node.nodeName ? "element_" : "obj_") + (++_id);
                    }
                } else {
                    for (var textNodeID in textNodeMap) {
                        if (textNodeMap[textNodeID] === node) {
                            return textNodeID;
                        }
                    }

                    textNodeMap["text_" + (++_id)] = node;
                    return "text_" + _id;
                }
            },
            // removes a nodeListId from a node's nodeListIds
            removeNodeListId = function(node, nodeListId) {
                var nodeListIds = nodeMap[id(node)];
                if (nodeListIds) {
                    var index = can.inArray(nodeListId, nodeListIds);

                    if (index >= 0) {
                        nodeListIds.splice(index, 1);
                    }
                    if (!nodeListIds.length) {
                        delete nodeMap[id(node)];
                    }
                }
            },
            addNodeListId = function(node, nodeListId) {
                var nodeListIds = nodeMap[id(node)];
                if (!nodeListIds) {
                    nodeListIds = nodeMap[id(node)] = [];
                }
                nodeListIds.push(nodeListId);
            },
            tagChildren = function(tagName) {
                var newTag = tagMap[tagName] || "span";
                if (newTag === "span") {
                    //innerHTML in IE doesn't honor leading whitespace after empty elements
                    return "@@!!@@";
                }
                return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
            };

        can.extend(can.view, {

            pending: function() {
                // TODO, make this only run for the right tagName
                var hooks = pendingHookups.slice(0);
                lastHookups = hooks;
                pendingHookups = [];
                return can.view.hook(function(el) {
                    can.each(hooks, function(fn) {
                        fn(el);
                    });
                });
            },

            registerNode: function(nodeList) {
                var nLId = id(nodeList);
                nodeListMap[nLId] = nodeList;

                can.each(nodeList, function(node) {
                    addNodeListId(node, nLId);
                });
            },

            unregisterNode: function(nodeList) {
                var nLId = id(nodeList);
                can.each(nodeList, function(node) {
                    removeNodeListId(node, nLId);
                });
                delete nodeListMap[nLId];
            },


            txt: function(escape, tagName, status, self, func) {
                // call the "wrapping" function and get the binding information
                var binding = can.compute.binder(func, self, function(newVal, oldVal) {
                    // call the update method we will define for each
                    // type of attribute
                    update(newVal, oldVal);
                });

                // If we had no observes just return the value returned by func.
                if (!binding.isListening) {
                    return (escape || status !== 0 ? contentEscape : contentText)(binding.value);
                }

                // The following are helper methods or varaibles that will
                // be defined by one of the various live-updating schemes.
                // The parent element we are listening to for teardown
                var parentElement,
                    nodeList,
                    teardown = function() {
                        binding.teardown();
                        if (nodeList) {
                            can.view.unregisterNode(nodeList);
                        }
                    },
                    // if the parent element is removed, teardown the binding
                    setupTeardownOnDestroy = function(el) {
                        can.bind.call(el, 'destroyed', teardown);
                        parentElement = el;
                    },
                    // if there is no parent, undo bindings
                    teardownCheck = function(parent) {
                        if (!parent) {
                            teardown();
                            can.unbind.call(parentElement, 'destroyed', teardown);
                        }
                    },
                    // the tag type to insert
                    tag = (tagMap[tagName] || "span"),
                    // this will be filled in if binding.isListening
                    update,
                    // the property (instead of innerHTML elements) to adjust. For
                    // example options should use textContent
                    contentProp = tagToContentPropMap[tagName];


                // The magic tag is outside or between tags.
                if (status === 0 && !contentProp) {
                    // Return an element tag with a hookup in place of the content
                    return "<" + tag + can.view.hook(
                        escape ?
                    // If we are escaping, replace the parentNode with 
                    // a text node who's value is `func`'s return value.

                    function(el, parentNode) {
                        // updates the text of the text node
                        update = function(newVal) {
                            node.nodeValue = "" + newVal;
                            teardownCheck(node.parentNode);
                        };

                        var parent = getParentNode(el, parentNode),
                            node = document.createTextNode(binding.value);

                        // When iterating through an Observe.List with no DOM
                        // elements containing the individual items, the parent 
                        // is sometimes incorrect not the true parent of the 
                        // source element. (#153)
                        if (el.parentNode !== parent) {
                            parent = el.parentNode;
                            parent.insertBefore(node, el);
                            parent.removeChild(el);
                        } else {
                            parent.insertBefore(node, el);
                            parent.removeChild(el);
                        }
                        setupTeardownOnDestroy(parent);
                    } :
                    // If we are not escaping, replace the parentNode with a
                    // documentFragment created as with `func`'s return value.

                    function(span, parentNode) {
                        // updates the elements with the new content
                        update = function(newVal) {
                            // is this still part of the DOM?
                            var attached = nodes[0].parentNode;
                            // update the nodes in the DOM with the new rendered value
                            if (attached) {
                                makeAndPut(newVal);
                            }
                            teardownCheck(nodes[0].parentNode);
                        };

                        // make sure we have a valid parentNode
                        parentNode = getParentNode(span, parentNode);
                        // A helper function to manage inserting the contents
                        // and removing the old contents
                        var nodes,
                            makeAndPut = function(val) {
                                // create the fragment, but don't hook it up
                                // we need to insert it into the document first
                                var frag = can.view.frag(val, parentNode),
                                    // keep a reference to each node
                                    newNodes = can.makeArray(frag.childNodes),
                                    last = nodes ? nodes[nodes.length - 1] : span;

                                // Insert it in the `document` or `documentFragment`
                                if (last.nextSibling) {
                                    last.parentNode.insertBefore(frag, last.nextSibling);
                                } else {
                                    last.parentNode.appendChild(frag);
                                }
                                // nodes hasn't been set yet
                                if (!nodes) {
                                    can.remove(can.$(span));
                                    nodes = newNodes;
                                    // set the teardown nodeList
                                    nodeList = nodes;
                                    can.view.registerNode(nodes);
                                } else {
                                    // Update node Array's to point to new nodes
                                    // and then remove the old nodes.
                                    // It has to be in this order for Mootools
                                    // and IE because somehow, after an element
                                    // is removed from the DOM, it loses its
                                    // expando values.
                                    var nodesToRemove = can.makeArray(nodes);
                                    can.view.replace(nodes, newNodes);
                                    can.remove(can.$(nodesToRemove));
                                }
                            };
                        // nodes are the nodes that any updates will replace
                        // at this point, these nodes could be part of a documentFragment
                        makeAndPut(binding.value, [span]);

                        setupTeardownOnDestroy(parentNode);
                        //children have to be properly nested HTML for buildFragment to work properly
                    }) + ">" + tagChildren(tag) + "</" + tag + ">";
                    // In a tag, but not in an attribute
                } else if (status === 1) {
                    // remember the old attr name
                    var attrName = binding.value.replace(/['"]/g, '').split('=')[0];
                    pendingHookups.push(function(el) {
                        update = function(newVal) {
                            var parts = (newVal || "").replace(/['"]/g, '').split('='),
                                newAttrName = parts.shift();

                            // Remove if we have a change and used to have an `attrName`.
                            if ((newAttrName != attrName) && attrName) {
                                removeAttr(el, attrName);
                            }
                            // Set if we have a new `attrName`.
                            if (newAttrName) {
                                setAttr(el, newAttrName, parts.join('='));
                                attrName = newAttrName;
                            }
                        };
                        setupTeardownOnDestroy(el);
                    });

                    return binding.value;
                } else { // In an attribute...
                    var attributeName = status === 0 ? contentProp : status;
                    // if the magic tag is inside the element, like `<option><% TAG %></option>`,
                    // we add this hookup to the last element (ex: `option`'s) hookups.
                    // Otherwise, the magic tag is in an attribute, just add to the current element's
                    // hookups.
                    (status === 0 ? lastHookups : pendingHookups).push(function(el) {
                        // update will call this attribute's render method
                        // and set the attribute accordingly
                        update = function() {
                            setAttr(el, attributeName, hook.render(), contentProp);
                        };

                        var wrapped = can.$(el),
                            hooks;

                        // Get the list of hookups or create one for this element.
                        // Hooks is a map of attribute names to hookup `data`s.
                        // Each hookup data has:
                        // `render` - A `function` to render the value of the attribute.
                        // `funcs` - A list of hookup `function`s on that attribute.
                        // `batchNum` - The last event `batchNum`, used for performance.
                        hooks = can.data(wrapped, 'hooks');
                        if (!hooks) {
                            can.data(wrapped, 'hooks', hooks = {});
                        }

                        // Get the attribute value.
                        var attr = getAttr(el, attributeName, contentProp),
                            // Split the attribute value by the template.
                            // Only split out the first __!!__ so if we have multiple hookups in the same attribute, 
                            // they will be put in the right spot on first render
                            parts = attr.split(attributePlaceholder),
                            goodParts = [],
                            hook;
                        goodParts.push(parts.shift(),
                            parts.join(attributePlaceholder));

                        // If we already had a hookup for this attribute...
                        if (hooks[attributeName]) {
                            // Just add to that attribute's list of `function`s.
                            hooks[attributeName].bindings.push(binding);
                        } else {
                            // Create the hookup data.
                            hooks[attributeName] = {
                                render: function() {
                                    var i = 0,
                                        newAttr = attr.replace(attributeReplace, function() {
                                            return contentText(hook.bindings[i++].value);
                                        });
                                    return newAttr;
                                },
                                bindings: [binding],
                                batchNum: undefined
                            };
                        }

                        // Save the hook for slightly faster performance.
                        hook = hooks[attributeName];

                        // Insert the value in parts.
                        goodParts.splice(1, 0, binding.value);

                        // Set the attribute.
                        setAttr(el, attributeName, goodParts.join(""), contentProp);

                        // Bind on change.
                        //liveBind(observed, el, binder,oldObserved);
                        setupTeardownOnDestroy(el);
                    });
                    return attributePlaceholder;
                }
            },

            replace: function(oldNodeList, newNodes) {
                // for each node in the node list
                oldNodeList = can.makeArray(oldNodeList);

                can.each(oldNodeList, function(node) {
                    // for each nodeList the node is in
                    can.each(can.makeArray(nodeMap[id(node)]), function(nodeListId) {
                        var nodeList = nodeListMap[nodeListId],
                            startIndex = can.inArray(node, nodeList),
                            endIndex = can.inArray(oldNodeList[oldNodeList.length - 1], nodeList);

                        // remove this nodeListId from each node
                        if (startIndex >= 0 && endIndex >= 0) {
                            for (var i = startIndex; i <= endIndex; i++) {
                                var n = nodeList[i];
                                removeNodeListId(n, nodeListId);
                            }

                            // swap in new nodes into the nodeLIst
                            nodeList.splice.apply(nodeList, [startIndex, endIndex - startIndex + 1].concat(newNodes));

                            // tell these new nodes they belong to the nodeList
                            can.each(newNodes, function(node) {
                                addNodeListId(node, nodeListId);
                            });
                        } else {
                            can.view.unregisterNode(nodeList);
                        }
                    });
                });
            },

            canExpando: canExpando,
            // Node mappings
            textNodeMap: textNodeMap,
            nodeMap: nodeMap,
            nodeListMap: nodeListMap
        });

        return can;
    })(__m9, __m2);

    // ## can/view/mustache/mustache.js
    var __m14 = (function(can) {

        // # mustache.js
        // `can.Mustache`: The Mustache templating engine.
        // See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
        // of the runtime render code design. The majority of the Mustache engine implementation 
        // occurs within the *Transformation* scanning helper.

        // ## Initialization
        // Define the view extension.
        can.view.ext = ".mustache";

        // ### Setup internal helper variables and functions.
        // An alias for the context variable used for tracking a stack of contexts.
        // This is also used for passing to helper functions to maintain proper context.
        var CONTEXT = '___c0nt3xt',
            // An alias for the variable used for the hash object that can be passed
            // to helpers via `options.hash`.
            HASH = '___h4sh',
            // An alias for the function that adds a new context to the context stack.
            STACK = '___st4ck',
            STACKED = '___st4ck3d',
            // An alias for the most used context stacking call.
            CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',
            CONTEXT_OBJ = '{context:' + CONTEXT_STACK + ',options:options}',


            isObserve = function(obj) {
                return obj !== null && can.isFunction(obj.attr) && obj.constructor && !! obj.constructor.canMakeObserve;
            },


            isArrayLike = function(obj) {
                return obj && obj.splice && typeof obj.length == 'number';
            },

            // ## Mustache

            Mustache = function(options, helpers) {
                // Support calling Mustache without the constructor.
                // This returns a function that renders the template.
                if (this.constructor != Mustache) {
                    var mustache = new Mustache(options);
                    return function(data, options) {
                        return mustache.render(data, options);
                    };
                }

                // If we get a `function` directly, it probably is coming from
                // a `steal`-packaged view.
                if (typeof options == "function") {
                    this.template = {
                        fn: options
                    };
                    return;
                }

                // Set options on self.
                can.extend(this, options);
                this.template = this.scanner.scan(this.text, this.name);
            };


        // Put Mustache on the `can` object.
        can.Mustache = window.Mustache = Mustache;


        Mustache.prototype.

        render = function(object, options) {
            object = object || {};
            options = options || {};
            if (!options.helpers && !options.partials) {
                options.helpers = options;
            }
            return this.template.fn.call(object, object, {
                _data: object,
                options: options
            });
        };

        can.extend(Mustache.prototype, {
            // Share a singleton scanner for parsing templates.
            scanner: new can.view.Scanner({
                // A hash of strings for the scanner to inject at certain points.
                text: {
                    // This is the logic to inject at the beginning of a rendered template. 
                    // This includes initializing the `context` stack.
                    start: 'var ' + CONTEXT + ' = this && this.' + STACKED + ' ? this : [];' + CONTEXT + '.' + STACKED + ' = true;' + 'var ' + STACK + ' = function(context, self) {' + 'var s;' + 'if (arguments.length == 1 && context) {' + 's = !context.' + STACKED + ' ? [context] : context;' +
                    // Handle helpers with custom contexts (#228)
                    '} else if (!context.' + STACKED + ') {' + 's = [self, context];' + '} else if (context && context === self && context.' + STACKED + ') {' + 's = context.slice(0);' + '} else {' + 's = context && context.' + STACKED + ' ? context.concat([self]) : ' + STACK + '(context).concat([self]);' + '}' + 'return (s.' + STACKED + ' = true) && s;' + '};'
                },

                // An ordered token registry for the scanner.
                // This needs to be ordered by priority to prevent token parsing errors.
                // Each token follows the following structure:
                //		[
                //			// Which key in the token map to match.
                //			"tokenMapName",
                //			// A simple token to match, like "{{".
                //			"token",
                //			// Optional. A complex (regexp) token to match that 
                //			// overrides the simple token.
                //			"[\\s\\t]*{{",
                //			// Optional. A function that executes advanced 
                //			// manipulation of the matched content. This is 
                //			// rarely used.
                //			function(content){   
                //				return content;
                //			}
                //		]
                tokens: [
                    // Return unescaped
                    ["returnLeft", "{{{", "{{[{&]"],
                    // Full line comments
                    ["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
                    // Inline comments
                    ["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
                    // Full line escapes
                    // This is used for detecting lines with only whitespace and an escaped tag
                    ["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function(content) {
                            return {
                                before: /^\n.+?\n$/.test(content) ? '\n' : '',
                                content: content.match(/\{\{(.+?)\}\}/)[1] || ''
                            };
                        }
                    ],
                    // Return escaped
                    ["escapeLeft", "{{"],
                    // Close return unescaped
                    ["returnRight", "}}}"],
                    // Close tag
                    ["right", "}}"]
                ],

                // ## Scanning Helpers
                // This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
                //		{
                //			// The content pattern to match in order to execute.
                //			// Only the first matching helper is executed.
                //			name: /pattern to match/,
                //			// The function to transform the content with.
                //			// @param {String} content   The content to transform.
                //			// @param {Object} cmd       Scanner helper data.
                //			//                           {
                //			//                             insert: "insert command",
                //			//                             tagName: "div",
                //			//                             status: 0
                //			//                           }
                //			fn: function(content, cmd) {
                //				return 'for text injection' || 
                //					{ raw: 'to bypass text injection' };
                //			}
                //		}
                helpers: [
                    // ### Partials
                    // Partials begin with a greater than sign, like {{> box}}.
                    // Partials are rendered at runtime (as opposed to compile time), 
                    // so recursive partials are possible. Just avoid infinite loops.
                    // For example, this template and partial:
                    // 		base.mustache:
                    // 			<h2>Names</h2>
                    // 			{{#names}}
                    // 				{{> user}}
                    // 			{{/names}}
                    // 		user.mustache:
                    // 			<strong>{{name}}</strong>
                    {
                        name: /^>[\s]*\w*/,
                        fn: function(content, cmd) {
                            // Get the template name and call back into the render method,
                            // passing the name and the current context.
                            var templateName = can.trim(content.replace(/^>\s?/, '')).replace(/["|']/g, "");
                            return "options.partials && options.partials['" + templateName + "'] ? can.Mustache.renderPartial(options.partials['" + templateName + "']," +
                                CONTEXT_STACK + ".pop(),options) : can.Mustache.render('" + templateName + "', " + CONTEXT_STACK + ")";
                        }
                    },

                    // ### Data Hookup
                    // This will attach the data property of `this` to the element
                    // its found on using the first argument as the data attribute
                    // key.
                    // For example:
                    //		<li id="nameli" {{ data 'name' }}></li>
                    // then later you can access it like:
                    //		can.$('#nameli').data('name');
                    {
                        name: /^\s*data\s/,
                        fn: function(content, cmd) {
                            var attr = content.match(/["|'](.*)["|']/)[1];
                            // return a function which calls `can.data` on the element
                            // with the attribute name with the current context.
                            return "can.proxy(function(__){" +
                            // "var context = this[this.length-1];" +
                            // "context = context." + STACKED + " ? context[context.length-2] : context; console.warn(this, context);" +
                            "can.data(can.$(__),'" + attr + "', this.pop()); }, " + CONTEXT_STACK + ")";
                        }
                    },

                    // ### Transformation (default)
                    // This transforms all content to its interpolated equivalent,
                    // including calls to the corresponding helpers as applicable. 
                    // This outputs the render code for almost all cases.
                    // #### Definitions
                    // * `context` - This is the object that the current rendering context operates within. 
                    //		Each nested template adds a new `context` to the context stack.
                    // * `stack` - Mustache supports nested sections, 
                    //		each of which add their own context to a stack of contexts.
                    //		Whenever a token gets interpolated, it will check for a match against the 
                    //		last context in the stack, then iterate through the rest of the stack checking for matches.
                    //		The first match is the one that gets returned.
                    // * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
                    //		If this is a simple interpolation, only the interpolation lookup will be passed.
                    //		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
                    //		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
                    //		exists to support the runtime context nesting that Mustache supports.
                    // * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
                    // * `options` - An object containing methods for executing the inner contents of sections or helpers.  
                    //		`options.fn` - Contains the inner template logic for a truthy section.  
                    //		`options.inverse` - Contains the inner template logic for a falsey section.  
                    //		`options.hash` - Contains the merged hash object argument for custom helpers.
                    // #### Design
                    // This covers the design of the render code that the transformation helper generates.
                    // ##### Pseudocode
                    // A detailed explanation is provided in the following sections, but here is some brief pseudocode
                    // that gives a high level overview of what the generated render code does (with a template similar to  
                    // `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
                    // *Initialize the render code.*
                    // 		view = []
                    // 		context = []
                    // 		stack = fn { context.concat([this]) }
                    // *Render the root section.*
                    // 		view.push( "string" )
                    // 		view.push( can.view.txt(
                    // *Render the nested section with `can.Mustache.txt`.*
                    // 			txt( 
                    // *Add the current context to the stack.*
                    // 				stack(), 
                    // *Flag this for truthy section mode.*
                    // 				"#",
                    // *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
                    // 				get( "a", stack() ),
                    // *Include the nested section's inner logic.
                    // The stack argument is usually the parent section's copy of the stack, 
                    // but it can be an override context that was passed by a custom helper.
                    // Sections can nest `0..n` times -- **NESTCEPTION**.*
                    // 				{ fn: fn(stack) {
                    // *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
                    // 					view = []
                    // 					view.push( "string" )
                    // 					view.push(
                    // *Add the current context to the stack.*
                    // 						stack(),
                    // *Flag this as interpolation-only mode.*
                    // 						null,
                    // *Interpolate the `b.c.d.e.name` variable using the stack.*
                    // 						get( "b.c.d.e.name", stack() ),
                    // 					)
                    // 					view.push( "string" )
                    // *Return the result for the nested section.*
                    // 					return view.join()
                    // 				}}
                    // 			)
                    // 		))
                    // 		view.push( "string" )
                    // *Return the result for the root section, which includes all nested sections.*
                    // 		return view.join()
                    // ##### Initialization
                    // Each rendered template is started with the following initialization code:
                    // 		var ___v1ew = [];
                    // 		var ___c0nt3xt = [];
                    // 		___c0nt3xt.___st4ck = true;
                    // 		var ___st4ck = function(context, self) {
                    // 			var s;
                    // 			if (arguments.length == 1 && context) {
                    // 				s = !context.___st4ck ? [context] : context;
                    // 			} else {
                    // 				s = context && context.___st4ck 
                    //					? context.concat([self]) 
                    //					: ___st4ck(context).concat([self]);
                    // 			}
                    // 			return (s.___st4ck = true) && s;
                    // 		};
                    // The `___v1ew` is the the array used to serialize the view.
                    // The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
                    // The `___st4ck` function is used to more easily update the context stack in certain situations.
                    // Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
                    // However, custom helpers will occasionally pass override contexts that need their own context stack.
                    // ##### Sections
                    // Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
                    // context in the resulting render code. The template itself is treated like a root section, with the 
                    // same execution logic as any others. Each section can have `0..n` nested sections within it.
                    // Here's an example of a template without any descendent sections.  
                    // Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
                    // Would output the following render code:
                    //		___v1ew.push("\"");
                    //		___v1ew.push(can.view.txt(1, '', 0, this, function() {
                    // 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), null, 
                    //				can.Mustache.get("a.b.c.d.e.name", 
                    //					___st4ck(___c0nt3xt, this))
                    //			);
                    //		}));
                    //		___v1ew.push("\" == \"Phil\"");
                    // The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
                    // will be pushed onto the view via `can.view.txt` in order to support live binding.
                    // The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
                    // a context lookup with `can.Mustache.get`.
                    // `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
                    // This stack will grow larger as sections nest.
                    // The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
                    // or `null` if it is an interpolation instead of a section.
                    // The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
                    // context lookup and return the approriate string or object.
                    // Any additional arguments, if they exist, are used for passing arguments to custom helpers.
                    // For nested sections, the last argument is an `options` object that contains the nested section's logic.
                    // Here's an example of a template with a single nested section.  
                    // Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
                    // Would output the following render code:
                    //		___v1ew.push("\"");
                    // 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
                    // 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), "#", 
                    //				can.Mustache.get("a", ___st4ck(___c0nt3xt, this)), 
                    //					[{
                    // 					_: function() {
                    // 						return ___v1ew.join("");
                    // 					}
                    // 				}, {
                    // 					fn: function(___c0nt3xt) {
                    // 						var ___v1ew = [];
                    // 						___v1ew.push(can.view.txt(1, '', 0, this, 
                    //								function() {
                    //  								return can.Mustache.txt(
                    // 									___st4ck(___c0nt3xt, this), 
                    // 									null, 
                    // 									can.Mustache.get("b.c.d.e.name", 
                    // 										___st4ck(___c0nt3xt, this))
                    // 								);
                    // 							}
                    // 						));
                    // 						return ___v1ew.join("");
                    // 					}
                    // 				}]
                    //			)
                    // 		}));
                    //		___v1ew.push("\" == \"Phil\"");
                    // This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
                    // These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
                    // The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
                    // or both, but there isn't any way to determine that at compilation time).
                    // Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
                    // This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
                    // aren't used, `___c0nt3xt` will be equivalent to the `___st4ck(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
                    // works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
                    // ensure that live binding in nested sections works properly.
                    // All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
                    // #### Implementation
                    {
                        name: /^.*$/,
                        fn: function(content, cmd) {
                            var mode = false,
                                result = [];

                            // Trim the content so we don't have any trailing whitespace.
                            content = can.trim(content);

                            // Determine what the active mode is.
                            // * `#` - Truthy section
                            // * `^` - Falsey section
                            // * `/` - Close the prior section
                            // * `else` - Inverted section (only exists within a truthy/falsey section)
                            if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
                                mode = mode[0];
                                switch (mode) {
                                    // Open a new section.
                                    case '#':
                                    case '^':
                                        result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
                                        break;
                                        // Close the prior section.
                                    case '/':
                                        return {
                                            raw: 'return ___v1ew.join("");}}])}));'
                                        };
                                        break;
                                }

                                // Trim the mode off of the content.
                                content = content.substring(1);
                            }

                            // `else` helpers are special and should be skipped since they don't 
                            // have any logic aside from kicking off an `inverse` function.
                            if (mode != 'else') {
                                var args = [],
                                    i = 0,
                                    hashing = false,
                                    arg, split, m;

                                // Parse the helper arguments.
                                // This needs uses this method instead of a split(/\s/) so that 
                                // strings with spaces can be correctly parsed.
                                (can.trim(content) + ' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function(whole, part) {
                                    args.push(part);
                                });

                                // Start the content render block.
                                result.push('can.Mustache.txt(' + CONTEXT_OBJ + ',' + (mode ? '"' + mode + '"' : 'null') + ',');

                                // Iterate through the helper arguments, if there are any.
                                for (; arg = args[i]; i++) {
                                    i && result.push(',');

                                    // Check for special helper arguments (string/number/boolean/hashes).
                                    if (i && (m = arg.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))) {
                                        // Found a native type like string/number/boolean.
                                        if (m[2]) {
                                            result.push(m[0]);
                                        }
                                        // Found a hash object.
                                        else {
                                            // Open the hash object.
                                            if (!hashing) {
                                                hashing = true;
                                                result.push('{' + HASH + ':{');
                                            }

                                            // Add the key/value.
                                            result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g, '\\"') + '",' + CONTEXT_OBJ + ')');

                                            // Close the hash if this was the last argument.
                                            if (i == args.length - 1) {
                                                result.push('}}');
                                            }
                                        }
                                    }
                                    // Otherwise output a normal interpolation reference.
                                    else {
                                        result.push('can.Mustache.get("' +
                                        // Include the reference name.
                                        arg.replace(/"/g, '\\"') + '",' +
                                        // Then the stack of context.
                                        CONTEXT_OBJ +
                                        // Flag as a helper method to aid performance, 
                                        // if it is a known helper (anything with > 0 arguments).
                                        (i == 0 && args.length > 1 ? ',true' : ',false') +
                                            (i > 0 ? ',true' : ',false') +
                                            ')');
                                    }
                                }
                            }

                            // Create an option object for sections of code.
                            mode && mode != 'else' && result.push(',[{_:function(){');
                            switch (mode) {
                                // Truthy section
                                case '#':
                                    result.push('return ___v1ew.join("");}},{fn:function(' + CONTEXT + '){var ___v1ew = [];');
                                    break;
                                    // If/else section
                                    // Falsey section
                                case 'else':
                                case '^':
                                    result.push('return ___v1ew.join("");}},{inverse:function(' + CONTEXT + '){var ___v1ew = [];');
                                    break;
                                    // Not a section
                                default:
                                    result.push(');');
                                    break;
                            }

                            // Return a raw result if there was a section, otherwise return the default string.
                            result = result.join('');
                            return mode ? {
                                raw: result
                            } : result;
                        }
                    }
                ]
            })
        });

        // Add in default scanner helpers first.
        // We could probably do this differently if we didn't 'break' on every match.
        var helpers = can.view.Scanner.prototype.helpers;
        for (var i = 0; i < helpers.length; i++) {
            Mustache.prototype.scanner.helpers.unshift(helpers[i]);
        };


        Mustache.txt = function(context, mode, name) {
            // Grab the extra arguments to pass to helpers.
            var args = Array.prototype.slice.call(arguments, 3),
                // Create a default `options` object to pass to the helper.
                options = can.extend.apply(can, [{
                        fn: function() {},
                        inverse: function() {}
                    }
                ].concat(mode ? args.pop() : []));


            var extra = {};
            if (context.context) {
                extra = context.options;
                context = context.context;
            }

            // Check for a registered helper or a helper-like function.
            if (helper = (Mustache.getHelper(name, extra) || (can.isFunction(name) && !name.isComputed && {
                fn: name
            }))) {
                // Use the most recent context as `this` for the helper.
                var stack = context[STACKED] && context,
                    context = (stack && context[context.length - 1]) || context,
                    // Update the options with a function/inverse (the inner templates of a section).
                    opts = {
                        fn: can.proxy(options.fn, context),
                        inverse: can.proxy(options.inverse, context)
                    },
                    lastArg = args[args.length - 1];

                // Store the context stack in the options if one exists
                if (stack) {
                    opts.contexts = stack;
                }
                // Add the hash to `options` if one exists
                if (lastArg && lastArg[HASH]) {
                    opts.hash = args.pop()[HASH];
                }
                args.push(opts);

                // Call the helper.
                return helper.fn.apply(context, args) || '';
            }

            // if a compute, get the value
            if (can.isFunction(name) && name.isComputed) {
                name = name();
            }

            // An array of arguments to check for truthyness when evaluating sections.
            var validArgs = args.length ? args : [name],
                // Whether the arguments meet the condition of the section.
                valid = true,
                result = [],
                i, helper, argIsObserve, arg;
            // Validate the arguments based on the section mode.
            if (mode) {
                for (i = 0; i < validArgs.length; i++) {
                    arg = validArgs[i];
                    argIsObserve = typeof arg !== 'undefined' && isObserve(arg);
                    // Array-like objects are falsey if their length = 0.
                    if (isArrayLike(arg)) {
                        // Use .attr to trigger binding on empty lists returned from function
                        if (mode == '#') {
                            valid = valid && !! (argIsObserve ? arg.attr('length') : arg.length);
                        } else if (mode == '^') {
                            valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
                        }
                    }
                    // Otherwise just check if it is truthy or not.
                    else {
                        valid = mode == '#' ? valid && !! arg : mode == '^' ? valid && !arg : valid;
                    }
                }
            }

            // Otherwise interpolate like normal.
            if (valid) {
                switch (mode) {
                    // Truthy section.
                    case '#':
                        // Iterate over arrays
                        if (isArrayLike(name)) {
                            var isObserveList = isObserve(name);

                            // Add the reference to the list in the contexts.
                            for (i = 0; i < name.length; i++) {
                                result.push(options.fn.call(name[i], context) || '');

                                // Ensure that live update works on observable lists
                                isObserveList && name.attr('' + i);
                            }
                            return result.join('');
                        }
                        // Normal case.
                        else {
                            return options.fn.call(name || {}, context) || '';
                        }
                        break;
                        // Falsey section.
                    case '^':
                        return options.inverse.call(name || {}, context) || '';
                        break;
                    default:
                        // Add + '' to convert things like numbers to strings.
                        // This can cause issues if you are trying to
                        // eval on the length but this is the more
                        // common case.
                        return '' + (name !== undefined ? name : '');
                        break;
                }
            }

            return '';
        };


        Mustache.get = function(ref, contexts, isHelper, isArgument) {
            var options = contexts.options || {};
            contexts = contexts.context || contexts;
            // Assume the local object is the last context in the stack.
            var obj = contexts[contexts.length - 1],
                // Assume the parent context is the second to last context in the stack.
                context = contexts[contexts.length - 2],
                // Split the reference (like `a.b.c`) into an array of key names.
                names = ref.split('.'),
                namesLength = names.length,
                value, lastValue, name, i, j,
                // if we walk up and don't find a property, we default
                // to listening on an undefined property of the first
                // context that is an observe
                defaultObserve,
                defaultObserveName;

            // Handle `this` references for list iteration: {{.}} or {{this}}
            if (/^\.|this$/.test(ref)) {
                // If context isn't an object, then it was a value passed by a helper so use it as an override.
                if (!/^object|undefined$/.test(typeof context)) {
                    return context || '';
                }
                // Otherwise just return the closest object.
                else {
                    while (value = contexts.pop()) {
                        if (typeof value !== 'undefined') {
                            return value;
                        }
                    }
                    return '';
                }
            }
            // Handle object resolution (like `a.b.c`).
            else if (!isHelper) {
                // Reverse iterate through the contexts (last in, first out).
                for (i = contexts.length - 1; i >= 0; i--) {
                    // Check the context for the reference
                    value = contexts[i];

                    // Is the value a compute?
                    if (can.isFunction(value) && value.isComputed) {
                        value = value();
                    }

                    // Make sure the context isn't a failed object before diving into it.
                    if (typeof value !== 'undefined' && value !== null) {
                        var isHelper = Mustache.getHelper(ref, options);
                        for (j = 0; j < namesLength; j++) {
                            // Keep running up the tree while there are matches.
                            if (typeof value[names[j]] !== 'undefined' && value[names[j]] !== null) {
                                lastValue = value;
                                value = value[name = names[j]];
                            }
                            // if there's a name conflict between property and helper
                            // property wins
                            else if (isHelper) {
                                return ref;
                            }
                            // If it's undefined, still match if the parent is an Observe.
                            else if (isObserve(value)) {
                                defaultObserve = value;
                                defaultObserveName = names[j];
                                lastValue = value = undefined;
                                break;
                            } else {
                                lastValue = value = undefined;
                                break;
                            }
                        }
                    }

                    // Found a matched reference.
                    if (value !== undefined) {
                        return Mustache.resolve(value, lastValue, name, isArgument);
                    }
                }
            }

            if (defaultObserve &&
            // if there's not a helper by this name and no attribute with this name
            !(Mustache.getHelper(ref) &&
                can.inArray(defaultObserveName, can.Observe.keys(defaultObserve)) === -1)) {
                return defaultObserve.compute(defaultObserveName);
            }
            // Support helpers without arguments, but only if there wasn't a matching data reference.
            // Helpers have priority over local function, see https://github.com/bitovi/canjs/issues/258
            if (value = Mustache.getHelper(ref, options)) {
                return ref;
            } else if (typeof obj !== 'undefined' && obj !== null && can.isFunction(obj[ref])) {
                // Support helper-like functions as anonymous helpers
                return obj[ref];
            }

            return '';
        };


        Mustache.resolve = function(value, lastValue, name, isArgument) {
            if (lastValue && can.isFunction(lastValue[name]) && isArgument) {
                if (lastValue[name].isComputed) {
                    return lastValue[name];
                }
                // Don't execute functions if they are parameters for a helper and are not a can.compute
                // Need to bind it to the original context so that that information doesn't get lost by the helper
                return function() {
                    return lastValue[name].apply(lastValue, arguments);
                };
            } else if (lastValue && can.isFunction(lastValue[name])) {
                // Support functions stored in objects.
                return lastValue[name]();
            }
            // Invoke the length to ensure that Observe.List events fire.
            else if (isObserve(value) && isArrayLike(value) && value.attr('length')) {
                return value;
            }
            // Add support for observes
            else if (lastValue && isObserve(lastValue)) {
                return lastValue.compute(name);
            } else if (can.isFunction(value)) {
                return value();
            } else {
                return value;
            }
        };


        // ## Helpers
        // Helpers are functions that can be called from within a template.
        // These helpers differ from the scanner helpers in that they execute
        // at runtime instead of during compilation.
        // Custom helpers can be added via `can.Mustache.registerHelper`,
        // but there are also some built-in helpers included by default.
        // Most of the built-in helpers are little more than aliases to actions 
        // that the base version of Mustache simply implies based on the 
        // passed in object.
        // Built-in helpers:
        // * `data` - `data` is a special helper that is implemented via scanning helpers. 
        //		It hooks up the active element to the active data object: `<div {{data "key"}} />`
        // * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
        // * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
        // * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
        // * `with` - Opens a context section: `{{#with var}} render {{/with}}`
        Mustache._helpers = {};

        Mustache.registerHelper = function(name, fn) {
            this._helpers[name] = {
                name: name,
                fn: fn
            };
        };


        Mustache.getHelper = function(name, options) {
            return options && options.helpers && options.helpers[name] && {
                fn: options.helpers[name]
            } || this._helpers[name]
            for (var i = 0, helper; helper = [i]; i++) {
                // Find the correct helper
                if (helper.name == name) {
                    return helper;
                }
            }
            return null;
        };


        Mustache.render = function(partial, context) {
            // Make sure the partial being passed in
            // isn't a variable like { partial: "foo.mustache" }
            if (!can.view.cached[partial] && context[partial]) {
                partial = context[partial];
            }

            // Call into `can.view.render` passing the
            // partial and context.
            return can.view.render(partial, context);
        };

        Mustache.renderPartial = function(partial, context, options) {
            return partial.render ? partial.render(context, options) :
                partial(context, options);
        };

        // The built-in Mustache helpers.
        can.each({
            // Implements the `if` built-in helper.

            'if': function(expr, options) {
                if ( !! Mustache.resolve(expr)) {
                    return options.fn(options.contexts || this);
                } else {
                    return options.inverse(options.contexts || this);
                }
            },
            // Implements the `unless` built-in helper.

            'unless': function(expr, options) {
                if (!Mustache.resolve(expr)) {
                    return options.fn(options.contexts || this);
                }
            },

            // Implements the `each` built-in helper.

            'each': function(expr, options) {
                expr = Mustache.resolve(expr);
                if ( !! expr && expr.length) {
                    var result = [];
                    for (var i = 0; i < expr.length; i++) {
                        result.push(options.fn(expr[i]));
                    }
                    return result.join('');
                }
            },
            // Implements the `with` built-in helper.

            'with': function(expr, options) {
                var ctx = expr;
                expr = Mustache.resolve(expr);
                if ( !! expr) {
                    return options.fn(ctx);
                }
            }

        }, function(fn, name) {
            Mustache.registerHelper(name, fn);
        });

        // ## Registration
        // Registers Mustache with can.view.
        can.view.register({
            suffix: "mustache",

            contentType: "x-mustache-template",

            // Returns a `function` that renders the view.
            script: function(id, src) {
                return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
                    text: src,
                    name: id
                }).template.out + " })";
            },

            renderer: function(id, text) {
                return Mustache({
                    text: text,
                    name: id
                });
            }
        });

        return can;
    })(__m3, __m9, __m15, __m16, __m17);

    // ## can/construct/super/super.js
    var __m18 = (function(can, Construct) {

        // tests if we can get super in .toString()
        var isFunction = can.isFunction,

            fnTest = /xyz/.test(function() {
                xyz;
            }) ? /\b_super\b/ : /.*/;

        // overwrites a single property so it can still call super
        can.Construct._overwrite = function(addTo, base, name, val) {
            // Check if we're overwriting an existing function
            addTo[name] = isFunction(val) &&
                isFunction(base[name]) &&
                fnTest.test(val) ? (function(name, fn) {
                return function() {
                    var tmp = this._super,
                        ret;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = base[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, val) : val;
        }

        // overwrites an object with methods, sets up _super
        //   newProps - new properties
        //   oldProps - where the old properties might be
        //   addTo - what we are adding to
        can.Construct._inherit = function(newProps, oldProps, addTo) {
            addTo = addTo || newProps
            for (var name in newProps) {
                can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
            }
        }

        return can;
    })(__m3, __m1);

    window['can'] = __m5;
})();
//steal('can/util',function( can ) {
	
var isArray = can.isArray,
	// essentially returns an object that has all the must have comparisons ...
	// must haves, do not return true when provided undefined
	cleanSet = function(obj, compares){
		var copy = can.extend({}, obj);
		for(var prop in copy) {
			var compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if( same(copy[prop], undefined, compare ) ) {
				delete copy[prop]
			}
		}
		return copy;
	},
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	};

/**
 * @class can.Object
 * @parent can.util
 * 
 * Object contains several helper methods that 
 * help compare objects.
 * 
 * ## same
 * 
 * Returns true if two objects are similar.
 * 
 *     can.Object.same({foo: "bar"} , {bar: "foo"}) //-> false
 *   
 * ## subset
 * 
 * Returns true if an object is a set of another set.
 * 
 *     can.Object.subset({}, {foo: "bar"} ) //-> true
 * 
 * ## subsets
 * 
 * Returns the subsets of an object
 * 
 *     can.Object.subsets({userId: 20},
 *                      [
 *                       {userId: 20, limit: 30},
 *                       {userId: 5},
 *                       {}
 *                      ]) 
 *              //->    [{userId: 20, limit: 30}]
 */
can.Object = {};

/**
 * @function same
 * Returns if two objects are the same.  It takes an optional compares object that
 * can be used to make comparisons.
 * 
 * This function does not work with objects that create circular references.
 * 
 * ## Examples
 * 
 *     can.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"}) //-> false
 *     
 *     // ignore the name property
 *     can.Object.same({name: "Brian"},
 *                   {name: "JUSTIN"},
 *                   {name: null})      //-> true
 *     
 *     // ignore case
 *     can.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"},
 *                   {name: "i"})      //-> true
 *     
 *     // deep rule
 *     can.Object.same({ person : { name: "Justin" } },
 *                   { person : { name: "JUSTIN" } },
 *                   { person : { name: "i"      } }) //-> true
 *                   
 *     // supplied compare function
 *     can.Object.same({age: "Thirty"},
 *                   {age: 30},
 *                   {age: function( a, b ){
 *                           if( a == "Thirty" ) { 
 *                             a = 30
 *                           }
 *                           if( b == "Thirty" ) {
 *                             b = 30
 *                           }
 *                           return a === b;
 *                         }})      //-> true
 * 
 * @param {Object} a an object to compare
 * @param {Object} b an object to compare
 * @param {Object} [compares] an object that indicates how to 
 * compare specific properties. 
 * Typically this is a name / value pair
 * 
 *     can.Object.same({name: "Justin"},{name: "JUSTIN"},{name: "i"})
 *     
 * There are two compare functions that you can specify with a string:
 * 
 *   - 'i' - ignores case
 *   - null - ignores this property
 * 
 * @param {Object} [deep] used internally
 */
var same = can.Object.same = function(a, b, compares, aParent, bParent, deep){
	var aType = typeof a,
		aArray = isArray(a),
		comparesType = typeof compares,
		compare;
	
	if(comparesType == 'string' || compares === null ){
		compares = compareMethods[compares];
		comparesType = 'function'
	}
	if(comparesType == 'function'){
		return compares(a, b, aParent, bParent)
	} 
	compares = compares || {};
	
	if(a instanceof Date){
		return a === b;
	}
	if(deep === -1){
		return aType === 'object' || a === b;
	}
	if(aType !== typeof  b || aArray !== isArray(b)){
		return false;
	}
	if(a === b){
		return true;
	}
	if(aArray){
		if(a.length !== b.length){
			return false;
		}
		for(var i =0; i < a.length; i ++){
			compare = compares[i] === undefined ? compares["*"] : compares[i]
			if(!same(a[i],b[i], a, b, compare )){
				return false;
			}
		};
		return true;
	} else if(aType === "object" || aType === 'function'){
		var bCopy = can.extend({}, b);
		for(var prop in a){
			compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if(! same( a[prop], b[prop], compare , a, b, deep === false ? -1 : undefined )){
				return false;
			}
			delete bCopy[prop];
		}
		// go through bCopy props ... if there is no compare .. return false
		for(prop in bCopy){
			if( compares[prop] === undefined || 
			    ! same( undefined, b[prop], compares[prop] , a, b, deep === false ? -1 : undefined )){
				return false;
			}
		}
		return true;
	} 
	return false;
};

/**
 * @function subsets
 * Returns the sets in 'sets' that are a subset of checkSet
 * @param {Object} checkSet
 * @param {Object} sets
 */
can.Object.subsets = function(checkSet, sets, compares){
	var len = sets.length,
		subsets = [],
		checkPropCount = propCount(checkSet),
		setLength;
		
	for(var i =0; i < len; i++){
		//check this subset
		var set = sets[i];
		if( can.Object.subset(checkSet, set, compares) ){
			subsets.push(set)
		}
	}
	return subsets;
};
/**
 * @function subset
 * Compares if checkSet is a subset of set
 * @param {Object} checkSet
 * @param {Object} set
 * @param {Object} [compares]
 * @param {Object} [checkPropCount]
 */
can.Object.subset = function(subset, set, compares){
	// go through set {type: 'folder'} and make sure every property
	// is in subset {type: 'folder', parentId :5}
	// then make sure that set has fewer properties
	// make sure we are only checking 'important' properties
	// in subset (ones that have to have a value)
	
	var setPropCount =0,
		compares = compares || {};
			
	for(var prop in set){

		if(! same(subset[prop], set[prop], compares[prop], subset, set )  ){
			return false;
		} 
	}
	return true;
}


var compareMethods = {
	"null" : function(){
		return true;
	},
	i : function(a, b){
		return (""+a).toLowerCase() == (""+b).toLowerCase()
	}
}
	
//return can.Object;

//});
//steal('can/util','can/util/string','can/util/object', function (can) {

	// Get the URL from old Steal root, new Steal config or can.fixture.rootUrl
	var getUrl = function(url) {
		if(typeof steal !== 'undefined') {
			if(can.isFunction(steal.config)) {
				return steal.config().root.mapJoin(url).toString();
			}
			return steal.root.join(url).toString();
		}
		return (can.fixture.rootUrl || '') + url;
	}

	var updateSettings = function (settings, originalOptions) {
			if (!can.fixture.on) {
				return;
			}

			//simple wrapper for logging
			var _logger = function(type, arr){
				if(console.log.apply){
					Function.prototype.call.apply(console[type], [console].concat(arr));
					// console[type].apply(console, arr)
				} else {
					console[type](arr)
				}
			},
			log = function () {
				if (window.console && console.log) {
					Array.prototype.unshift.call(arguments, 'fixture INFO:');
					_logger( "log", Array.prototype.slice.call(arguments) );
				}
				else if (window.opera && window.opera.postError) {
					opera.postError("fixture INFO: " + Array.prototype.join.call(arguments, ','));
				}
			}

			// We always need the type which can also be called method, default to GET
			settings.type = settings.type || settings.method || 'GET';

			// add the fixture option if programmed in
			var data = overwrite(settings);

			// if we don't have a fixture, do nothing
			if (!settings.fixture) {
				if (window.location.protocol === "file:") {
					log("ajax request to " + settings.url + ", no fixture found");
				}
				return;
			}

			//if referencing something else, update the fixture option
			if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
				settings.fixture = can.fixture[settings.fixture];
			}

			// if a string, we just point to the right url
			if (typeof settings.fixture == "string") {
				var url = settings.fixture;

				if (/^\/\//.test(url)) {
					// this lets us use rootUrl w/o having steal...
					url = getUrl(settings.fixture.substr(2));
				}

				if(data) {
					// Template static fixture URLs
					url = can.sub(url, data);
				}

				delete settings.fixture;

				//!steal-remove-start
				log("looking for fixture in " + url);
				//!steal-remove-end

				settings.url = url;
				settings.data = null;
				settings.type = "GET";
				if (!settings.error) {
					settings.error = function (xhr, error, message) {
						throw "fixtures.js Error " + error + " " + message;
					};
				}
			}
			else {
				//!steal-remove-start
				log("using a dynamic fixture for " + settings.type + " " + settings.url);
				//!steal-remove-end

				//it's a function ... add the fixture datatype so our fixture transport handles it
				// TODO: make everything go here for timing and other fun stuff
				// add to settings data from fixture ...
				settings.dataTypes && settings.dataTypes.splice(0, 0, "fixture");

				if (data && originalOptions) {
					can.extend(originalOptions.data, data)
				}
			}
		},
		// A helper function that takes what's called with response
		// and moves some common args around to make it easier to call
		extractResponse = function(status, statusText, responses, headers) {
			// if we get response(RESPONSES, HEADERS)
			if(typeof status != "number"){
				headers = statusText;
				responses = status;
				statusText = "success"
				status = 200;
			}
			// if we get response(200, RESPONSES, HEADERS)
			if(typeof statusText != "string"){
				headers = responses;
				responses = statusText;
				statusText = "success";
			}
			if ( status >= 400 && status <= 599 ) {
				this.dataType = "text"
			}
			return [status, statusText, extractResponses(this, responses), headers];
		},
		// If we get data instead of responses,
		// make sure we provide a response type that matches the first datatype (typically json)
		extractResponses = function(settings, responses){
			var next = settings.dataTypes ? settings.dataTypes[0] : (settings.dataType || 'json');
			if (!responses || !responses[next]) {
				var tmp = {}
				tmp[next] = responses;
				responses = tmp;
			}
			return responses;
		};

	//used to check urls
	// check if jQuery
	if (can.ajaxPrefilter && can.ajaxTransport) {

		// the pre-filter needs to re-route the url
		can.ajaxPrefilter(updateSettings);

		can.ajaxTransport("fixture", function (s, original) {
			// remove the fixture from the datatype
			s.dataTypes.shift();

			//we'll return the result of the next data type
			var timeout, stopped = false;

			return {
				send: function (headers, callback) {
					// we'll immediately wait the delay time for all fixtures
					timeout = setTimeout(function () {
						// if the user wants to call success on their own, we allow it ...
						var success = function() {
							if(stopped === false) {
								callback.apply(null, extractResponse.apply(s, arguments) );
							}
						},
						// get the result form the fixture
						result = s.fixture(original, success, headers, s);
						if(result !== undefined) {
							// make sure the result has the right dataType
							callback(200, "success", extractResponses(s, result), {});
						}
					}, can.fixture.delay);
				},
				abort: function () {
					stopped = true;
					clearTimeout(timeout)
				}
			};
		});
	} else {
		var AJAX = can.ajax;
		can.ajax = function (settings) {
			updateSettings(settings, settings);
			if (settings.fixture) {
				var timeout, d = new can.Deferred(),
					stopped = false;

				//TODO this should work with response
				d.getResponseHeader = function () {
				}

				// call success and fail
				d.then(settings.success, settings.fail);

				// abort should stop the timeout and calling success
				d.abort = function () {
					clearTimeout(timeout);
					stopped = true;
					d.reject(d)
				}
				// set a timeout that simulates making a request ....
				timeout = setTimeout(function () {
					// if the user wants to call success on their own, we allow it ...
					var success = function() {
						var response = extractResponse.apply(settings, arguments),
							status = response[0];

						if ( (status >= 200 && status < 300 || status === 304) && stopped === false) {
							d.resolve(response[2][settings.dataType])
						} else {
							// TODO probably resolve better
							d.reject(d, 'error', response[1]);
						}
					},
					// get the result form the fixture
					result = settings.fixture(settings, success, settings.headers, settings);
					if(result !== undefined) {
						d.resolve(result)
					}
				}, can.fixture.delay);
				
				return d;
			} else {
				return AJAX(settings);
			}
		}
	}

	var typeTest = /^(script|json|text|jsonp)$/,
	// a list of 'overwrite' settings object
		overwrites = [],
	// returns the index of an overwrite function
		find = function (settings, exact) {
			for (var i = 0; i < overwrites.length; i++) {
				if ($fixture._similar(settings, overwrites[i], exact)) {
					return i;
				}
			}
			return -1;
		},
	// overwrites the settings fixture if an overwrite matches
		overwrite = function (settings) {
			var index = find(settings);
			if (index > -1) {
				settings.fixture = overwrites[index].fixture;
				return $fixture._getData(overwrites[index].url, settings.url)
			}

		},
		// Makes an attempt to guess where the id is at in the url and returns it.
		getId = function (settings) {
			var id = settings.data.id;

			if (id === undefined && typeof settings.data === "number") {
				id = settings.data;
			}

			/*
			 Check for id in params(if query string)
			 If this is just a string representation of an id, parse
			 if(id === undefined && typeof settings.data === "string") {
			 id = settings.data;
			 }
			 //*/

			if (id === undefined) {
				settings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
					id = num;
				});
			}

			if (id === undefined) {
				id = settings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
					if (num != 'update') {
						id = num;
					}
				})
			}

			if (id === undefined) { // if still not set, guess a random number
				id = Math.round(Math.random() * 1000)
			}

			return id;
		};


	var $fixture = can.fixture = function (settings, fixture) {
		// if we provide a fixture ...
		if (fixture !== undefined) {
			if (typeof settings == 'string') {
				// handle url strings
				var matches = settings.match(/(GET|POST|PUT|DELETE) (.+)/i);
				if (!matches) {
					settings = {
						url : settings
					};
				} else {
					settings = {
						url : matches[2],
						type : matches[1]
					};
				}

			}

			//handle removing.  An exact match if fixture was provided, otherwise, anything similar
			var index = find(settings, !!fixture);
			if (index > -1) {
				overwrites.splice(index, 1)
			}
			if (fixture == null) {
				return
			}
			settings.fixture = fixture;
			overwrites.push(settings)
		} else {
			can.each(settings, function(fixture, url){
				$fixture(url, fixture);
			})
		}
	};
	var replacer = can.replacer;

	can.extend(can.fixture, {
		// given ajax settings, find an overwrite
		_similar : function (settings, overwrite, exact) {
			if (exact) {
				return can.Object.same(settings, overwrite, {fixture : null})
			} else {
				return can.Object.subset(settings, overwrite, can.fixture._compare)
			}
		},
		_compare : {
			url : function (a, b) {
				return !!$fixture._getData(b, a)
			},
			fixture : null,
			type : "i"
		},
		// gets data from a url like "/todo/{id}" given "todo/5"
		_getData : function (fixtureUrl, url) {
			var order = [],
				fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'),
				res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
					order.push(part)
					return "([^\/]+)"
				}) + "$").exec(url),
				data = {};

			if (!res) {
				return null;
			}
			res.shift();
			can.each(order, function (name) {
				data[name] = res.shift()
			})
			return data;
		},

		store: function (types, count, make, filter) {
			/**
			 * @function can.fixture.store
			 * @parent can.fixture
			 *
			 * `can.fixture.store(count, generator(index,items))` is used
			 * to create a store of items that can simulate a full CRUD service. Furthermore,
			 * the store can do filtering, grouping, sorting, and paging.
			 * 
			 * ## Basic Example
			 * 
			 * The following creates a store for 100 todos:
			 * 
			 *     var todoStore = can.fixture.store(100, function(i){
			 *       return {
			 * 	       id: i,
			 *         name: "todo number "+i,
			 *         description: "a description of some todo",
			 *         ownerId: can.fixture.rand(10)
			 *       }
			 *     })
			 * 
			 * `todoStore`'s methods can be used for the response to a REST service like:
			 * 
			 *      can.fixture({
			 * 	      'GET /todos':         todoStore.findAll,
			 *        'GET /todos/{id}':    todoStore.findOne,
			 *        'POST /todos':        todoStore.create,
			 *        'PUT /todos/{id}':    todoStore.update,
			 *        'DELETE /todos/{id}': todoStore.destroy
			 *      });
			 * 
			 * These fixtures, combined with a [can.Model] that connects to these services like:
			 * 
			 *      var Todo = can.Model({
			 *          findAll : 'GET /todos',
			 *          findOne : 'GET /todos/{id}',
			 *          create  : 'POST /todos',
			 *          update  : 'PUT /todos/{id}',
			 *          destroy : 'DELETE /todos/{id}'
			 *      }, {});
			 * 
			 * ... allows you to simulate requests for all of owner 5's todos like:
			 * 
			 *     Todo.findAll({ownerId: 5}, function(todos){
			 *        	   
			 *     })
			 * 
			 * ## Simulated Service
			 * 
			 * `can.fixture.store`'s [can.fixture.store.findAll findAll],
			 * [can.fixture.store.findOne findOne],
			 * [can.fixture.store.findOne create],
			 * [can.fixture.store.findOne update], and
			 * [can.fixture.store.findOne destroy] methods are used to
			 * simulate a REST service that 
			 * 
			 * 
			 * ## With can.ajax
			 *
			 *     //makes a nested list of messages
			 *     can.fixture.store(["messages","message"], 1000,
			 *      function(i, messages){
			 *       return {
			 *         subject: "This is message "+i,
			 *         body: "Here is some text for this message",
			 *         date: Math.floor( new Date().getTime() ),
			 *         parentId : i < 100 ? null : Math.floor(Math.random()*i)
			 *       }
			 *     })
			 *     //uses the message fixture to return messages limited by
			 *     // offset, limit, order, etc.
			 *     can.ajax({
			 *       url: "messages",
			 *       data: {
			 *          offset: 100,
			 *          limit: 50,
			 *          order: ["date ASC"],
			 *          parentId: 5},
			 *        },
			 *        fixture: "-messages",
			 *        success: function( messages ) {  ... }
			 *     });
			 *
			 * ## With can.Model
			 *
			 * `can.fixture.make` returns a model store that offers `findAll`, `findOne`, `create`,
			 * `update` and `destroy` fixture functions you can map to a [can.Model] Ajax request.
			 * Consider a model like this:
			 *
			 *      
			 *
			 * And an unnamed generated fixture like this:
			 *
			 *      var store = can.fixture.make(100, function(i) {
			 *          return {
			 *              id : i,
			 *              name : 'Todo ' + i
			 *          }
			 *      });
			 *
			 * You can map can.Model requests using the return value of `can.fixture.make`:
			 *

			 *
			 * @param {Array|String} types An array of the fixture names or the singular fixture name.
			 * If an array, the first item is the plural fixture name (prefixed with -) and the second
			 * item is the singular name.  If a string, it's assumed to be the singular fixture name.  Make
			 * will simply add s to the end of it for the plural name. If this parameter is not an array
			 * or a String the fixture won't be added and only return the generator object.
			 * @param {Number} count the number of items to create
			 * @param {Function} make a function that will return the JavaScript object. The
			 * make function is called back with the id and the current array of items.
			 * @param {Function} filter (optional) a function used to further filter results. Used for to simulate
			 * server params like searchText or startDate.
			 * The function should return true if the item passes the filter,
			 * false otherwise. For example:
			 *
			 *
			 *     function(item, settings){
			 *       if(settings.data.searchText){
			 *            var regex = new RegExp("^"+settings.data.searchText)
			 *           return regex.test(item.name);
			 *       }
			 *     }
			 *
			 * @return {Object} A generator object providing fixture functions for *findAll*, *findOne*, *create*,
			 * *update* and *destroy*.
			 */
			var items = [], // TODO: change this to a hash
				findOne = function (id) {
					for (var i = 0; i < items.length; i++) {
						if (id == items[i].id) {
							return items[i];
						}
					}
				},
				methods = {};

			if (typeof types === "string") {
				types = [types + "s", types ]
			} else if (!can.isArray(types)) {
				filter = make;
				make = count;
				count = types;
			}

			// make all items
			can.extend(methods, {
				/**
				 * @function can.fixture.store.findAll
				 * @parent can.fixture.store
				 * 
				 * `store.findAll(request)` simulates a request to 
				 * get a list items from the server. It supports the
				 * following params:
				 * 
				 *  - order - `order=name ASC` 
				 *  - group - `group=name`
				 *  - limit - `limit=20`
				 *  - offset - `offset=60`
				 *  - id filtering - `ownerId=5`
				 * 
				 * 
				 * @param {AjaxRequest} request The ajax request object 
				 * that contains a data object like:
				 * 
				 *     var response = store.findAll({
				 *       data: {
				 *         order: "name ASC"    
				 *       }
				 *     });
				 * 
				 * The `data` object may include any of the following properties
				 * 
				 * #### order
				 * 
				 * #### group
				 * 
				 * #### limit
				 * 
				 * #### offset
				 * 
				 * #### id properties
				 * 
				 * @return {Object} a response object like:
				 * 
				 *     {
				 *       count: 1000,
				 *       limit: 20,
				 *       offset: 60,
				 *       data: [item1, item2, ...]
				 *     }
				 * 
				 * where:
				 * 
				 * - count - the number of items that match any filtering 
				 *   before limit and offset is taken into account
				 * - offset - the offset passed
				 * - limit - the limit passed
				 * - data - an array of JS objects with each item's properties
				 * 
				 */
				findAll: function (request) {
					//copy array of items
					var retArr = items.slice(0);
					request.data = request.data || {};
					//sort using order
					//order looks like ["age ASC","gender DESC"]
					can.each((request.data.order || []).slice(0).reverse(), function (name) {
						var split = name.split(" ");
						retArr = retArr.sort(function (a, b) {
							if (split[1].toUpperCase() !== "ASC") {
								if (a[split[0]] < b[split[0]]) {
									return 1;
								} else if (a[split[0]] == b[split[0]]) {
									return 0
								} else {
									return -1;
								}
							}
							else {
								if (a[split[0]] < b[split[0]]) {
									return -1;
								} else if (a[split[0]] == b[split[0]]) {
									return 0
								} else {
									return 1;
								}
							}
						});
					});

					//group is just like a sort
					can.each((request.data.group || []).slice(0).reverse(), function (name) {
						var split = name.split(" ");
						retArr = retArr.sort(function (a, b) {
							return a[split[0]] > b[split[0]];
						});
					});


					var offset = parseInt(request.data.offset, 10) || 0,
						limit = parseInt(request.data.limit, 10) || (items.length - offset),
						i = 0;

					//filter results if someone added an attr like parentId
					for (var param in request.data) {
						i = 0;
						if (request.data[param] !== undefined && // don't do this if the value of the param is null (ignore it)
							(param.indexOf("Id") != -1 || param.indexOf("_id") != -1)) {
							while (i < retArr.length) {
								if (request.data[param] != retArr[i][param]) {
									retArr.splice(i, 1);
								} else {
									i++;
								}
							}
						}
					}

					if (filter) {
						i = 0;
						while (i < retArr.length) {
							if (!filter(retArr[i], request)) {
								retArr.splice(i, 1);
							} else {
								i++;
							}
						}
					}

					//return data spliced with limit and offset
					return {
						"count" : retArr.length,
						"limit" : request.data.limit,
						"offset" : request.data.offset,
						"data" : retArr.slice(offset, offset + limit)
					};
				},
				/**
				 * @function can.fixture.store.findOne
				 * @parent can.fixture.store
				 * 
				 * `store.findOne(request, response(item))` simulates a request to 
				 * get a single item from the server by id.
				 * 
				 *     todosStore.findOne({
				 *       url: "/todos/5"
				 *     }, function(todo){
				 *       
				 *     });
				 * 
				 */
				findOne : function (request, response) {
					var item = findOne(getId(request));
					response(item ? item : undefined);
				},
				/**
				 * @function can.fixture.store.update
				 * @parent can.fixture.store
				 * 
				 * `store.update(request, response(props,headers))` simulates
				 * a request to update an items properties on a server.
				 * 
				 *     todosStore.update({
				 *       url: "/todos/5"
				 *     }, function(props, headers){
				 *       props.id //-> 5
				 *       headers.location // "todos/5"
				 *     });
				 */
				update: function (request,response) {
					var id = getId(request);

					// TODO: make it work with non-linear ids ..
					can.extend(findOne(id), request.data);
					response({
						id : getId(request)
					}, {
						location : request.url || "/" + getId(request)
					});
				},
				/**
				 * @function can.fixture.store.destroy
				 * @parent can.fixture.store
				 * 
				 * `store.destroy(request, response())` simulates
				 * a request to destroy an item from the server.
				 * 
				 *     todosStore.destroy({
				 *       url: "/todos/5"
				 *     }, function(){});
				 */
				destroy: function (request) {
					var id = getId(request);
					for (var i = 0; i < items.length; i++) {
						if (items[i].id == id) {
							items.splice(i, 1);
							break;
						}
					}

					// TODO: make it work with non-linear ids ..
					can.extend(findOne(id) || {}, request.data);
					return {};
				},
				/**
				 * @function can.fixture.store.create
				 * @parent can.fixture.store
				 * 
				 * `store.create(request, response)`
				 */
				create: function (settings, response) {
					var item = make(items.length, items);

					can.extend(item, settings.data);

					if (!item.id) {
						item.id = items.length;
					}

					items.push(item);
					var id = item.id || parseInt(Math.random() * 100000, 10);
					response({
						id : id
					}, {
						location : settings.url + "/" + id
					})
				}
			});

			var reset = function(){
				items = [];
				for (var i = 0; i < (count); i++) {
					//call back provided make
					var item = make(i, items);
	
					if (!item.id) {
						item.id = i;
					}
					items.push(item);
				}
				if(can.isArray(types)) {
					can.fixture["~" + types[0]] = items;
					can.fixture["-" + types[0]] = methods.findAll;
					can.fixture["-" + types[1]] = methods.findOne;
					can.fixture["-" + types[1]+"Update"] = methods.update;
					can.fixture["-" + types[1]+"Destroy"] = methods.destroy;
					can.fixture["-" + types[1]+"Create"] = methods.create;
				}
			}
			reset()
			// if we have types given add them to can.fixture
			

			return can.extend({
				getId: getId,
				/**
				 * @function can.fixture.store.find
				 * @parent can.fixture.store
				 * 
				 * `store.find(settings)`
				 */
				find: function(settings){
					return findOne( getId(settings) );
				},
				/**
				 * @function can.fixture.store.reset
				 * @parent can.fixture.store
				 * 
				 * `store.reset()` resets the store to contain its 
				 * original data. This is useful for making tests that
				 * operate independently.
				 * 
				 * ## Basic Example
				 * 
				 * After creating a `taskStore` and hooking it up to a 
				 * `task` model in the "Basic Example" in [can.fixture.store store's docs],
				 * a test might create several tasks like:
				 * 
				 *     new Task({name: "Take out trash", ownerId: 5}).save();
				 * 
				 * But, another test might need to operate on the original set of
				 * tasks created by `can.fixture.store`. Reset the task store with:
				 * 
				 *     taskStore.reset()
				 * 
				 */
				reset: reset
			}, methods);
		},
		/**
		 * @function can.fixture.rand
		 * @parent can.fixture
		 *
		 * `can.fixture.rand` creates random integers or random arrays of
		 * other arrays.
		 *
		 * ## Examples
		 *
		 *     var rand = can.fixture.rand;
		 *
		 *     // get a random integer between 0 and 10 (inclusive)
		 *     rand(11);
		 *
		 *     // get a random number between -5 and 5 (inclusive)
		 *     rand(-5, 6);
		 *
		 *     // pick a random item from an array
		 *     rand(["j","m","v","c"],1)[0]
		 *
		 *     // pick a random number of items from an array
		 *     rand(["j","m","v","c"])
		 *
		 *     // pick 2 items from an array
		 *     rand(["j","m","v","c"],2)
		 *
		 *     // pick between 2 and 3 items at random
		 *     rand(["j","m","v","c"],2,3)
		 *
		 *
		 * @param {Array|Number} arr An array of items to select from.
		 * If a number is provided, a random number is returned.
		 * If min and max are not provided, a random number of items are selected
		 * from this array.
		 * @param {Number} [min] If only min is provided, min items
		 * are selected.
		 * @param {Number} [max] If min and max are provided, a random number of
		 * items between min and max (inclusive) is selected.
		 */
		rand : function (arr, min, max) {
			if (typeof arr == 'number') {
				if (typeof min == 'number') {
					return arr + Math.floor(Math.random() * (min - arr));
				} else {
					return Math.floor(Math.random() * arr);
				}

			}
			var rand = arguments.callee;
			// get a random set
			if (min === undefined) {
				return rand(arr, rand(arr.length + 1))
			}
			// get a random selection of arr
			var res = [];
			arr = arr.slice(0);
			// set max
			if (!max) {
				max = min;
			}
			//random max
			max = min + Math.round(rand(max - min))
			for (var i = 0; i < max; i++) {
				res.push(arr.splice(rand(arr.length), 1)[0])
			}
			return res;
		},
		/**
		 * @hide
		 *
		 * Use can.fixture.xhr to create an object that looks like an xhr object.
		 *
		 * ## Example
		 *
		 * The following example shows how the -restCreate fixture uses xhr to return
		 * a simulated xhr object:
		 * @codestart
		 * "-restCreate" : function( settings, cbType ) {
		 *   switch(cbType){
		 *     case "success":
		 *       return [
		 *         {id: parseInt(Math.random()*1000)},
		 *         "success",
		 *         can.fixture.xhr()];
		 *     case "complete":
		 *       return [
		 *         can.fixture.xhr({
		 *           getResponseHeader: function() { 
		 *             return settings.url+"/"+parseInt(Math.random()*1000);
		 *           }
		 *         }),
		 *         "success"];
		 *   }
		 * }
		 * @codeend
		 * @param {Object} [xhr] properties that you want to overwrite
		 * @return {Object} an object that looks like a successful XHR object.
		 */
		xhr : function (xhr) {
			return can.extend({}, {
				abort : can.noop,
				getAllResponseHeaders : function () {
					return "";
				},
				getResponseHeader : function () {
					return "";
				},
				open : can.noop,
				overrideMimeType : can.noop,
				readyState : 4,
				responseText : "",
				responseXML : null,
				send : can.noop,
				setRequestHeader : can.noop,
				status : 200,
				statusText : "OK"
			}, xhr);
		},
		/**
		 * @attribute can.fixture.on
		 * @parent can.fixture
		 *
		 * `can.fixture.on` lets you programatically turn off fixtures. This is mostly used for testing.
		 *
		 *     can.fixture.on = false
		 *     Task.findAll({}, function(){
		 *       can.fixture.on = true;
		 *     })
		 */
		on : true
	});
	/**
	 * @attribute can.fixture.delay
	 * @parent can.fixture
	 *
	 * `can.fixture.delay` indicates the delay in milliseconds between an ajax request is made and
	 * the success and complete handlers are called.  This only sets
	 * functional synchronous fixtures that return a result. By default, the delay is 200ms.
	 *
	 * @codestart
	 * steal('can/util/fixtures').then(function(){
	 *   can.fixture.delay = 1000;
	 * })
	 * @codeend
	 */
	can.fixture.delay = 200;

	/**
	 * @attribute can.fixture.rootUrl
	 * @parent can.fixture
	 *
	 * `can.fixture.rootUrl` contains the root URL for fixtures to use.
	 * If you are using StealJS it will use the Steal root
	 * URL by default.
	 */
	can.fixture.rootUrl = getUrl('');

	can.fixture["-handleFunction"] = function (settings) {
		if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
			settings.fixture = can.fixture[settings.fixture];
		}
		if (typeof settings.fixture == "function") {
			setTimeout(function () {
				if (settings.success) {
					settings.success.apply(null, settings.fixture(settings, "success"));
				}
				if (settings.complete) {
					settings.complete.apply(null, settings.fixture(settings, "complete"));
				}
			}, can.fixture.delay);
			return true;
		}
		return false;
	};

	//Expose this for fixture debugging
	can.fixture.overwrites = overwrites;
	can.fixture.make = can.fixture.store;
//	return can.fixture;
//});

// Adapted from http://webdesignerwall.com/tutorials/html5-grayscale-image-hover

var grayscale = function(src) {
	var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		imgObj = new Image();
	
	imgObj.src = src;
	canvas.width = imgObj.width;
	canvas.height = imgObj.height; 
	
	ctx.drawImage(imgObj, 0, 0); 
	var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

	for(var y = 0; y < imgPixels.height; y++){
		for(var x = 0; x < imgPixels.width; x++){
			var i = (y * 4) * imgPixels.width + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg; 
			imgPixels.data[i + 1] = avg; 
			imgPixels.data[i + 2] = avg;
		}
	}
	
	ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
	return canvas.toDataURL();
};

window.Grayscale = function(elements, fadeDuration) {
	elements.each(function() {
		var el = $(this);

		// wrap the image in a wrapper and clone it, adding the clone to the wrapper
		el.css({"position":"absolute"})
		  .wrap("<div class='img_wrapper' style='display: inline-block'>")
		  .clone()
		  .addClass('img_grayscale')
		  .css({
		  	'position': "absolute",
		  	'z-index': "998",
		  	'opacity': "0"
		  })
		  .insertBefore(el)
		  .queue(function(){
			el.parent().css({
				'width': this.width,
				'height': this.height
			}).end()
			.dequeue();
		});

		// replace the original with a greyscale version
		this.src = grayscale(this.src);
	});

	elements.parent().mouseover(function() {
		// fade in color image
		$(this).find('img:first').stop().animate({opacity:1}, fadeDuration);
	});
};

$(function() {
	$(document.body).on('mouseout', '.img_grayscale', function(){
		// fade out color image
		$(this).stop().animate({opacity:0}, 300);
	});
});
	    
// moment.js
// version : 2.0.0
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

	/************************************
	 Constants
	 ************************************/

	var moment,
		VERSION = "2.0.0",
		round = Math.round, i,
	// internal storage for language config files
		languages = {},

	// check for nodeJS
		hasModule = (typeof module !== 'undefined' && module.exports),

	// ASP.NET json date format regex
		aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

	// format tokens
		formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
		localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

	// parsing tokens
		parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

	// parsing token regexes
		parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
		parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
		parseTokenThreeDigits = /\d{3}/, // 000 - 999
		parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
		parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
		parseTokenWord = /[0-9]*[a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF]+\s*?[\u0600-\u06FF]+/i, // any word (or two) characters or numbers including two word month in arabic.
		parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
		parseTokenT = /T/i, // T (ISO seperator)
		parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

	// preliminary iso regex
	// 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
		isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
		isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

	// iso time formats and regexes
		isoTimes = [
			['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
			['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
			['HH:mm', /(T| )\d\d:\d\d/],
			['HH', /(T| )\d\d/]
		],

	// timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
		parseTimezoneChunker = /([\+\-]|\d\d)/gi,

	// getter and setter names
		proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
		unitMillisecondFactors = {
			'Milliseconds' : 1,
			'Seconds' : 1e3,
			'Minutes' : 6e4,
			'Hours' : 36e5,
			'Days' : 864e5,
			'Months' : 2592e6,
			'Years' : 31536e6
		},

	// format function strings
		formatFunctions = {},

	// tokens to ordinalize and pad
		ordinalizeTokens = 'DDD w W M D d'.split(' '),
		paddedTokens = 'M D H h m s w W'.split(' '),

		formatTokenFunctions = {
			M    : function () {
				return this.month() + 1;
			},
			MMM  : function (format) {
				return this.lang().monthsShort(this, format);
			},
			MMMM : function (format) {
				return this.lang().months(this, format);
			},
			D    : function () {
				return this.date();
			},
			DDD  : function () {
				return this.dayOfYear();
			},
			d    : function () {
				return this.day();
			},
			dd   : function (format) {
				return this.lang().weekdaysMin(this, format);
			},
			ddd  : function (format) {
				return this.lang().weekdaysShort(this, format);
			},
			dddd : function (format) {
				return this.lang().weekdays(this, format);
			},
			w    : function () {
				return this.week();
			},
			W    : function () {
				return this.isoWeek();
			},
			YY   : function () {
				return leftZeroFill(this.year() % 100, 2);
			},
			YYYY : function () {
				return leftZeroFill(this.year(), 4);
			},
			YYYYY : function () {
				return leftZeroFill(this.year(), 5);
			},
			a    : function () {
				return this.lang().meridiem(this.hours(), this.minutes(), true);
			},
			A    : function () {
				return this.lang().meridiem(this.hours(), this.minutes(), false);
			},
			H    : function () {
				return this.hours();
			},
			h    : function () {
				return this.hours() % 12 || 12;
			},
			m    : function () {
				return this.minutes();
			},
			s    : function () {
				return this.seconds();
			},
			S    : function () {
				return ~~(this.milliseconds() / 100);
			},
			SS   : function () {
				return leftZeroFill(~~(this.milliseconds() / 10), 2);
			},
			SSS  : function () {
				return leftZeroFill(this.milliseconds(), 3);
			},
			Z    : function () {
				var a = -this.zone(),
					b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
			},
			ZZ   : function () {
				var a = -this.zone(),
					b = "+";
				if (a < 0) {
					a = -a;
					b = "-";
				}
				return b + leftZeroFill(~~(10 * a / 6), 4);
			},
			X    : function () {
				return this.unix();
			}
		};

	function padToken(func, count) {
		return function (a) {
			return leftZeroFill(func.call(this, a), count);
		};
	}
	function ordinalizeToken(func) {
		return function (a) {
			return this.lang().ordinal(func.call(this, a));
		};
	}

	while (ordinalizeTokens.length) {
		i = ordinalizeTokens.pop();
		formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);
	}
	while (paddedTokens.length) {
		i = paddedTokens.pop();
		formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
	}
	formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


	/************************************
	 Constructors
	 ************************************/

	function Language() {

	}

	// Moment prototype object
	function Moment(config) {
		extend(this, config);
	}

	// Duration Constructor
	function Duration(duration) {
		var data = this._data = {},
			years = duration.years || duration.year || duration.y || 0,
			months = duration.months || duration.month || duration.M || 0,
			weeks = duration.weeks || duration.week || duration.w || 0,
			days = duration.days || duration.day || duration.d || 0,
			hours = duration.hours || duration.hour || duration.h || 0,
			minutes = duration.minutes || duration.minute || duration.m || 0,
			seconds = duration.seconds || duration.second || duration.s || 0,
			milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

		// representation for dateAddRemove
		this._milliseconds = milliseconds +
			seconds * 1e3 + // 1000
			minutes * 6e4 + // 1000 * 60
			hours * 36e5; // 1000 * 60 * 60
		// Because of dateAddRemove treats 24 hours as different from a
		// day when working around DST, we need to store them separately
		this._days = days +
			weeks * 7;
		// It is impossible translate months into days without knowing
		// which months you are are talking about, so we have to store
		// it separately.
		this._months = months +
			years * 12;

		// The following code bubbles up values, see the tests for
		// examples of what that means.
		data.milliseconds = milliseconds % 1000;
		seconds += absRound(milliseconds / 1000);

		data.seconds = seconds % 60;
		minutes += absRound(seconds / 60);

		data.minutes = minutes % 60;
		hours += absRound(minutes / 60);

		data.hours = hours % 24;
		days += absRound(hours / 24);

		days += weeks * 7;
		data.days = days % 30;

		months += absRound(days / 30);

		data.months = months % 12;
		years += absRound(months / 12);

		data.years = years;
	}


	/************************************
	 Helpers
	 ************************************/


	function extend(a, b) {
		for (var i in b) {
			if (b.hasOwnProperty(i)) {
				a[i] = b[i];
			}
		}
		return a;
	}

	function absRound(number) {
		if (number < 0) {
			return Math.ceil(number);
		} else {
			return Math.floor(number);
		}
	}

	// left zero fill a number
	// see http://jsperf.com/left-zero-filling for performance comparison
	function leftZeroFill(number, targetLength) {
		var output = number + '';
		while (output.length < targetLength) {
			output = '0' + output;
		}
		return output;
	}

	// helper function for _.addTime and _.subtractTime
	function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
		var ms = duration._milliseconds,
			d = duration._days,
			M = duration._months,
			currentDate;

		if (ms) {
			mom._d.setTime(+mom + ms * isAdding);
		}
		if (d) {
			mom.date(mom.date() + d * isAdding);
		}
		if (M) {
			currentDate = mom.date();
			mom.date(1)
				.month(mom.month() + M * isAdding)
				.date(Math.min(currentDate, mom.daysInMonth()));
		}
	}

	// check if is an array
	function isArray(input) {
		return Object.prototype.toString.call(input) === '[object Array]';
	}

	// compare two arrays, return the number of differences
	function compareArrays(array1, array2) {
		var len = Math.min(array1.length, array2.length),
			lengthDiff = Math.abs(array1.length - array2.length),
			diffs = 0,
			i;
		for (i = 0; i < len; i++) {
			if (~~array1[i] !== ~~array2[i]) {
				diffs++;
			}
		}
		return diffs + lengthDiff;
	}


	/************************************
	 Languages
	 ************************************/


	Language.prototype = {
		set : function (config) {
			var prop, i;
			for (i in config) {
				prop = config[i];
				if (typeof prop === 'function') {
					this[i] = prop;
				} else {
					this['_' + i] = prop;
				}
			}
		},

		_months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
		months : function (m) {
			return this._months[m.month()];
		},

		_monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
		monthsShort : function (m) {
			return this._monthsShort[m.month()];
		},

		monthsParse : function (monthName) {
			var i, mom, regex, output;

			if (!this._monthsParse) {
				this._monthsParse = [];
			}

			for (i = 0; i < 12; i++) {
				// make the regex if we don't have it already
				if (!this._monthsParse[i]) {
					mom = moment([2000, i]);
					regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
					this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
				}
				// test the regex
				if (this._monthsParse[i].test(monthName)) {
					return i;
				}
			}
		},

		_weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
		weekdays : function (m) {
			return this._weekdays[m.day()];
		},

		_weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
		weekdaysShort : function (m) {
			return this._weekdaysShort[m.day()];
		},

		_weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
		weekdaysMin : function (m) {
			return this._weekdaysMin[m.day()];
		},

		_longDateFormat : {
			LT : "h:mm A",
			L : "MM/DD/YYYY",
			LL : "MMMM D YYYY",
			LLL : "MMMM D YYYY LT",
			LLLL : "dddd, MMMM D YYYY LT"
		},
		longDateFormat : function (key) {
			var output = this._longDateFormat[key];
			if (!output && this._longDateFormat[key.toUpperCase()]) {
				output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
					return val.slice(1);
				});
				this._longDateFormat[key] = output;
			}
			return output;
		},

		meridiem : function (hours, minutes, isLower) {
			if (hours > 11) {
				return isLower ? 'pm' : 'PM';
			} else {
				return isLower ? 'am' : 'AM';
			}
		},

		_calendar : {
			sameDay : '[Today at] LT',
			nextDay : '[Tomorrow at] LT',
			nextWeek : 'dddd [at] LT',
			lastDay : '[Yesterday at] LT',
			lastWeek : '[last] dddd [at] LT',
			sameElse : 'L'
		},
		calendar : function (key, mom) {
			var output = this._calendar[key];
			return typeof output === 'function' ? output.apply(mom) : output;
		},

		_relativeTime : {
			future : "in %s",
			past : "%s ago",
			s : "a few seconds",
			m : "a minute",
			mm : "%d minutes",
			h : "an hour",
			hh : "%d hours",
			d : "a day",
			dd : "%d days",
			M : "a month",
			MM : "%d months",
			y : "a year",
			yy : "%d years"
		},
		relativeTime : function (number, withoutSuffix, string, isFuture) {
			var output = this._relativeTime[string];
			return (typeof output === 'function') ?
				output(number, withoutSuffix, string, isFuture) :
				output.replace(/%d/i, number);
		},
		pastFuture : function (diff, output) {
			var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
			return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
		},

		ordinal : function (number) {
			return this._ordinal.replace("%d", number);
		},
		_ordinal : "%d",

		preparse : function (string) {
			return string;
		},

		postformat : function (string) {
			return string;
		},

		week : function (mom) {
			return weekOfYear(mom, this._week.dow, this._week.doy);
		},
		_week : {
			dow : 0, // Sunday is the first day of the week.
			doy : 6  // The week that contains Jan 1st is the first week of the year.
		}
	};

	// Loads a language definition into the `languages` cache.  The function
	// takes a key and optionally values.  If not in the browser and no values
	// are provided, it will load the language file module.  As a convenience,
	// this function also returns the language values.
	function loadLang(key, values) {
		values.abbr = key;
		if (!languages[key]) {
			languages[key] = new Language();
		}
		languages[key].set(values);
		return languages[key];
	}

	// Determines which language definition to use and returns it.
	//
	// With no parameters, it will return the global language.  If you
	// pass in a language key, such as 'en', it will return the
	// definition for 'en', so long as 'en' has already been loaded using
	// moment.lang.
	function getLangDefinition(key) {
		if (!key) {
			return moment.fn._lang;
		}
		if (!languages[key] && hasModule) {
			require('./lang/' + key);
		}
		return languages[key];
	}


	/************************************
	 Formatting
	 ************************************/


	function removeFormattingTokens(input) {
		if (input.match(/\[.*\]/)) {
			return input.replace(/^\[|\]$/g, "");
		}
		return input.replace(/\\/g, "");
	}

	function makeFormatFunction(format) {
		var array = format.match(formattingTokens), i, length;

		for (i = 0, length = array.length; i < length; i++) {
			if (formatTokenFunctions[array[i]]) {
				array[i] = formatTokenFunctions[array[i]];
			} else {
				array[i] = removeFormattingTokens(array[i]);
			}
		}

		return function (mom) {
			var output = "";
			for (i = 0; i < length; i++) {
				output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];
			}
			return output;
		};
	}

	// format date using native date object
	function formatMoment(m, format) {
		var i = 5;

		function replaceLongDateFormatTokens(input) {
			return m.lang().longDateFormat(input) || input;
		}

		while (i-- && localFormattingTokens.test(format)) {
			format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
		}

		if (!formatFunctions[format]) {
			formatFunctions[format] = makeFormatFunction(format);
		}

		return formatFunctions[format](m);
	}


	/************************************
	 Parsing
	 ************************************/


		// get the regex to find the next token
	function getParseRegexForToken(token) {
		switch (token) {
			case 'DDDD':
				return parseTokenThreeDigits;
			case 'YYYY':
				return parseTokenFourDigits;
			case 'YYYYY':
				return parseTokenSixDigits;
			case 'S':
			case 'SS':
			case 'SSS':
			case 'DDD':
				return parseTokenOneToThreeDigits;
			case 'MMM':
			case 'MMMM':
			case 'dd':
			case 'ddd':
			case 'dddd':
			case 'a':
			case 'A':
				return parseTokenWord;
			case 'X':
				return parseTokenTimestampMs;
			case 'Z':
			case 'ZZ':
				return parseTokenTimezone;
			case 'T':
				return parseTokenT;
			case 'MM':
			case 'DD':
			case 'YY':
			case 'HH':
			case 'hh':
			case 'mm':
			case 'ss':
			case 'M':
			case 'D':
			case 'd':
			case 'H':
			case 'h':
			case 'm':
			case 's':
				return parseTokenOneOrTwoDigits;
			default :
				return new RegExp(token.replace('\\', ''));
		}
	}

	// function to convert string input to date
	function addTimeToArrayFromToken(token, input, config) {
		var a, b,
			datePartArray = config._a;

		switch (token) {
			// MONTH
			case 'M' : // fall through to MM
			case 'MM' :
				datePartArray[1] = (input == null) ? 0 : ~~input - 1;
				break;
			case 'MMM' : // fall through to MMMM
			case 'MMMM' :
				a = getLangDefinition(config._l).monthsParse(input);
				// if we didn't find a month name, mark the date as invalid.
				if (a != null) {
					datePartArray[1] = a;
				} else {
					config._isValid = false;
				}
				break;
			// DAY OF MONTH
			case 'D' : // fall through to DDDD
			case 'DD' : // fall through to DDDD
			case 'DDD' : // fall through to DDDD
			case 'DDDD' :
				if (input != null) {
					datePartArray[2] = ~~input;
				}
				break;
			// YEAR
			case 'YY' :
				datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
				break;
			case 'YYYY' :
			case 'YYYYY' :
				datePartArray[0] = ~~input;
				break;
			// AM / PM
			case 'a' : // fall through to A
			case 'A' :
				config._isPm = ((input + '').toLowerCase() === 'pm');
				break;
			// 24 HOUR
			case 'H' : // fall through to hh
			case 'HH' : // fall through to hh
			case 'h' : // fall through to hh
			case 'hh' :
				datePartArray[3] = ~~input;
				break;
			// MINUTE
			case 'm' : // fall through to mm
			case 'mm' :
				datePartArray[4] = ~~input;
				break;
			// SECOND
			case 's' : // fall through to ss
			case 'ss' :
				datePartArray[5] = ~~input;
				break;
			// MILLISECOND
			case 'S' :
			case 'SS' :
			case 'SSS' :
				datePartArray[6] = ~~ (('0.' + input) * 1000);
				break;
			// UNIX TIMESTAMP WITH MS
			case 'X':
				config._d = new Date(parseFloat(input) * 1000);
				break;
			// TIMEZONE
			case 'Z' : // fall through to ZZ
			case 'ZZ' :
				config._useUTC = true;
				a = (input + '').match(parseTimezoneChunker);
				if (a && a[1]) {
					config._tzh = ~~a[1];
				}
				if (a && a[2]) {
					config._tzm = ~~a[2];
				}
				// reverse offsets
				if (a && a[0] === '+') {
					config._tzh = -config._tzh;
					config._tzm = -config._tzm;
				}
				break;
		}

		// if the input is null, the date is not valid
		if (input == null) {
			config._isValid = false;
		}
	}

	// convert an array to a date.
	// the array should mirror the parameters below
	// note: all values past the year are optional and will default to the lowest possible value.
	// [year, month, day , hour, minute, second, millisecond]
	function dateFromArray(config) {
		var i, date, input = [];

		if (config._d) {
			return;
		}

		for (i = 0; i < 7; i++) {
			config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
		}

		// add the offsets to the time to be parsed so that we can have a clean array for checking isValid
		input[3] += config._tzh || 0;
		input[4] += config._tzm || 0;

		date = new Date(0);

		if (config._useUTC) {
			date.setUTCFullYear(input[0], input[1], input[2]);
			date.setUTCHours(input[3], input[4], input[5], input[6]);
		} else {
			date.setFullYear(input[0], input[1], input[2]);
			date.setHours(input[3], input[4], input[5], input[6]);
		}

		config._d = date;
	}

	// date from string and format string
	function makeDateFromStringAndFormat(config) {
		// This array is used to make a Date, either with `new Date` or `Date.UTC`
		var tokens = config._f.match(formattingTokens),
			string = config._i,
			i, parsedInput;

		config._a = [];

		for (i = 0; i < tokens.length; i++) {
			parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
			if (parsedInput) {
				string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
			}
			// don't parse if its not a known token
			if (formatTokenFunctions[tokens[i]]) {
				addTimeToArrayFromToken(tokens[i], parsedInput, config);
			}
		}
		// handle am pm
		if (config._isPm && config._a[3] < 12) {
			config._a[3] += 12;
		}
		// if is 12 am, change hours to 0
		if (config._isPm === false && config._a[3] === 12) {
			config._a[3] = 0;
		}
		// return
		dateFromArray(config);
	}

	// date from string and array of format strings
	function makeDateFromStringAndArray(config) {
		var tempConfig,
			tempMoment,
			bestMoment,

			scoreToBeat = 99,
			i,
			currentDate,
			currentScore;

		while (config._f.length) {
			tempConfig = extend({}, config);
			tempConfig._f = config._f.pop();
			makeDateFromStringAndFormat(tempConfig);
			tempMoment = new Moment(tempConfig);

			if (tempMoment.isValid()) {
				bestMoment = tempMoment;
				break;
			}

			currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

			if (currentScore < scoreToBeat) {
				scoreToBeat = currentScore;
				bestMoment = tempMoment;
			}
		}

		extend(config, bestMoment);
	}

	// date from iso format
	function makeDateFromString(config) {
		var i,
			string = config._i;
		if (isoRegex.exec(string)) {
			config._f = 'YYYY-MM-DDT';
			for (i = 0; i < 4; i++) {
				if (isoTimes[i][1].exec(string)) {
					config._f += isoTimes[i][0];
					break;
				}
			}
			if (parseTokenTimezone.exec(string)) {
				config._f += " Z";
			}
			makeDateFromStringAndFormat(config);
		} else {
			config._d = new Date(string);
		}
	}

	function makeDateFromInput(config) {
		var input = config._i,
			matched = aspNetJsonRegex.exec(input);

		if (input === undefined) {
			config._d = new Date();
		} else if (matched) {
			config._d = new Date(+matched[1]);
		} else if (typeof input === 'string') {
			makeDateFromString(config);
		} else if (isArray(input)) {
			config._a = input.slice(0);
			dateFromArray(config);
		} else {
			config._d = input instanceof Date ? new Date(+input) : new Date(input);
		}
	}


	/************************************
	 Relative Time
	 ************************************/


		// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
		return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	}

	function relativeTime(milliseconds, withoutSuffix, lang) {
		var seconds = round(Math.abs(milliseconds) / 1000),
			minutes = round(seconds / 60),
			hours = round(minutes / 60),
			days = round(hours / 24),
			years = round(days / 365),
			args = seconds < 45 && ['s', seconds] ||
				minutes === 1 && ['m'] ||
				minutes < 45 && ['mm', minutes] ||
				hours === 1 && ['h'] ||
				hours < 22 && ['hh', hours] ||
				days === 1 && ['d'] ||
				days <= 25 && ['dd', days] ||
				days <= 45 && ['M'] ||
				days < 345 && ['MM', round(days / 30)] ||
				years === 1 && ['y'] || ['yy', years];
		args[2] = withoutSuffix;
		args[3] = milliseconds > 0;
		args[4] = lang;
		return substituteTimeAgo.apply({}, args);
	}


	/************************************
	 Week of Year
	 ************************************/


		// firstDayOfWeek       0 = sun, 6 = sat
		//                      the day of the week that starts the week
		//                      (usually sunday or monday)
		// firstDayOfWeekOfYear 0 = sun, 6 = sat
		//                      the first week is the week that contains the first
		//                      of this day of the week
		//                      (eg. ISO weeks use thursday (4))
	function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
		var end = firstDayOfWeekOfYear - firstDayOfWeek,
			daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();


		if (daysToDayOfWeek > end) {
			daysToDayOfWeek -= 7;
		}

		if (daysToDayOfWeek < end - 7) {
			daysToDayOfWeek += 7;
		}

		return Math.ceil(moment(mom).add('d', daysToDayOfWeek).dayOfYear() / 7);
	}


	/************************************
	 Top Level Functions
	 ************************************/

	function makeMoment(config) {
		var input = config._i,
			format = config._f;

		if (input === null || input === '') {
			return null;
		}

		if (typeof input === 'string') {
			config._i = input = getLangDefinition().preparse(input);
		}

		if (moment.isMoment(input)) {
			config = extend({}, input);
			config._d = new Date(+input._d);
		} else if (format) {
			if (isArray(format)) {
				makeDateFromStringAndArray(config);
			} else {
				makeDateFromStringAndFormat(config);
			}
		} else {
			makeDateFromInput(config);
		}

		return new Moment(config);
	}

	moment = function (input, format, lang) {
		return makeMoment({
			_i : input,
			_f : format,
			_l : lang,
			_isUTC : false
		});
	};

	// creating with utc
	moment.utc = function (input, format, lang) {
		return makeMoment({
			_useUTC : true,
			_isUTC : true,
			_l : lang,
			_i : input,
			_f : format
		});
	};

	// creating with unix timestamp (in seconds)
	moment.unix = function (input) {
		return moment(input * 1000);
	};

	// duration
	moment.duration = function (input, key) {
		var isDuration = moment.isDuration(input),
			isNumber = (typeof input === 'number'),
			duration = (isDuration ? input._data : (isNumber ? {} : input)),
			ret;

		if (isNumber) {
			if (key) {
				duration[key] = input;
			} else {
				duration.milliseconds = input;
			}
		}

		ret = new Duration(duration);

		if (isDuration && input.hasOwnProperty('_lang')) {
			ret._lang = input._lang;
		}

		return ret;
	};

	// version number
	moment.version = VERSION;

	// default format
	moment.defaultFormat = isoFormat;

	// This function will load languages and then set the global language.  If
	// no arguments are passed in, it will simply return the current global
	// language key.
	moment.lang = function (key, values) {
		var i;

		if (!key) {
			return moment.fn._lang._abbr;
		}
		if (values) {
			loadLang(key, values);
		} else if (!languages[key]) {
			getLangDefinition(key);
		}
		moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
	};

	// returns language data
	moment.langData = function (key) {
		if (key && key._lang && key._lang._abbr) {
			key = key._lang._abbr;
		}
		return getLangDefinition(key);
	};

	// compare moment object
	moment.isMoment = function (obj) {
		return obj instanceof Moment;
	};

	// for typechecking Duration objects
	moment.isDuration = function (obj) {
		return obj instanceof Duration;
	};


	/************************************
	 Moment Prototype
	 ************************************/


	moment.fn = Moment.prototype = {

		clone : function () {
			return moment(this);
		},

		valueOf : function () {
			return +this._d;
		},

		unix : function () {
			return Math.floor(+this._d / 1000);
		},

		toString : function () {
			return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
		},

		toDate : function () {
			return this._d;
		},

		toJSON : function () {
			return moment.utc(this).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
		},

		toArray : function () {
			var m = this;
			return [
				m.year(),
				m.month(),
				m.date(),
				m.hours(),
				m.minutes(),
				m.seconds(),
				m.milliseconds()
			];
		},

		isValid : function () {
			if (this._isValid == null) {
				if (this._a) {
					this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
				} else {
					this._isValid = !isNaN(this._d.getTime());
				}
			}
			return !!this._isValid;
		},

		utc : function () {
			this._isUTC = true;
			return this;
		},

		local : function () {
			this._isUTC = false;
			return this;
		},

		format : function (inputString) {
			var output = formatMoment(this, inputString || moment.defaultFormat);
			return this.lang().postformat(output);
		},

		add : function (input, val) {
			var dur;
			// switch args to support add('s', 1) and add(1, 's')
			if (typeof input === 'string') {
				dur = moment.duration(+val, input);
			} else {
				dur = moment.duration(input, val);
			}
			addOrSubtractDurationFromMoment(this, dur, 1);
			return this;
		},

		subtract : function (input, val) {
			var dur;
			// switch args to support subtract('s', 1) and subtract(1, 's')
			if (typeof input === 'string') {
				dur = moment.duration(+val, input);
			} else {
				dur = moment.duration(input, val);
			}
			addOrSubtractDurationFromMoment(this, dur, -1);
			return this;
		},

		diff : function (input, units, asFloat) {
			var that = this._isUTC ? moment(input).utc() : moment(input).local(),
				zoneDiff = (this.zone() - that.zone()) * 6e4,
				diff, output;

			if (units) {
				// standardize on singular form
				units = units.replace(/s$/, '');
			}

			if (units === 'year' || units === 'month') {
				diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
				output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
				output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;
				if (units === 'year') {
					output = output / 12;
				}
			} else {
				diff = (this - that) - zoneDiff;
				output = units === 'second' ? diff / 1e3 : // 1000
					units === 'minute' ? diff / 6e4 : // 1000 * 60
						units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
							units === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
								units === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
									diff;
			}
			return asFloat ? output : absRound(output);
		},

		from : function (time, withoutSuffix) {
			return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
		},

		fromNow : function (withoutSuffix) {
			return this.from(moment(), withoutSuffix);
		},

		calendar : function () {
			var diff = this.diff(moment().startOf('day'), 'days', true),
				format = diff < -6 ? 'sameElse' :
					diff < -1 ? 'lastWeek' :
						diff < 0 ? 'lastDay' :
							diff < 1 ? 'sameDay' :
								diff < 2 ? 'nextDay' :
									diff < 7 ? 'nextWeek' : 'sameElse';
			return this.format(this.lang().calendar(format, this));
		},

		isLeapYear : function () {
			var year = this.year();
			return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		},

		isDST : function () {
			return (this.zone() < moment([this.year()]).zone() ||
				this.zone() < moment([this.year(), 5]).zone());
		},

		day : function (input) {
			var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
			return input == null ? day :
				this.add({ d : input - day });
		},

		startOf: function (units) {
			units = units.replace(/s$/, '');
			// the following switch intentionally omits break keywords
			// to utilize falling through the cases.
			switch (units) {
				case 'year':
					this.month(0);
				/* falls through */
				case 'month':
					this.date(1);
				/* falls through */
				case 'week':
				case 'day':
					this.hours(0);
				/* falls through */
				case 'hour':
					this.minutes(0);
				/* falls through */
				case 'minute':
					this.seconds(0);
				/* falls through */
				case 'second':
					this.milliseconds(0);
				/* falls through */
			}

			// weeks are a special case
			if (units === 'week') {
				this.day(0);
			}

			return this;
		},

		endOf: function (units) {
			return this.startOf(units).add(units.replace(/s?$/, 's'), 1).subtract('ms', 1);
		},

		isAfter: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) > +moment(input).startOf(units);
		},

		isBefore: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) < +moment(input).startOf(units);
		},

		isSame: function (input, units) {
			units = typeof units !== 'undefined' ? units : 'millisecond';
			return +this.clone().startOf(units) === +moment(input).startOf(units);
		},

		zone : function () {
			return this._isUTC ? 0 : this._d.getTimezoneOffset();
		},

		daysInMonth : function () {
			return moment.utc([this.year(), this.month() + 1, 0]).date();
		},

		dayOfYear : function (input) {
			var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
			return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
		},

		isoWeek : function (input) {
			var week = weekOfYear(this, 1, 4);
			return input == null ? week : this.add("d", (input - week) * 7);
		},

		week : function (input) {
			var week = this.lang().week(this);
			return input == null ? week : this.add("d", (input - week) * 7);
		},

		// If passed a language key, it will set the language for this
		// instance.  Otherwise, it will return the language configuration
		// variables for this instance.
		lang : function (key) {
			if (key === undefined) {
				return this._lang;
			} else {
				this._lang = getLangDefinition(key);
				return this;
			}
		}
	};

	// helper for adding shortcuts
	function makeGetterAndSetter(name, key) {
		moment.fn[name] = moment.fn[name + 's'] = function (input) {
			var utc = this._isUTC ? 'UTC' : '';
			if (input != null) {
				this._d['set' + utc + key](input);
				return this;
			} else {
				return this._d['get' + utc + key]();
			}
		};
	}

	// loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
	for (i = 0; i < proxyGettersAndSetters.length; i ++) {
		makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
	}

	// add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
	makeGetterAndSetter('year', 'FullYear');

	// add plural methods
	moment.fn.days = moment.fn.day;
	moment.fn.weeks = moment.fn.week;
	moment.fn.isoWeeks = moment.fn.isoWeek;

	/************************************
	 Duration Prototype
	 ************************************/


	moment.duration.fn = Duration.prototype = {
		weeks : function () {
			return absRound(this.days() / 7);
		},

		valueOf : function () {
			return this._milliseconds +
				this._days * 864e5 +
				this._months * 2592e6;
		},

		humanize : function (withSuffix) {
			var difference = +this,
				output = relativeTime(difference, !withSuffix, this.lang());

			if (withSuffix) {
				output = this.lang().pastFuture(difference, output);
			}

			return this.lang().postformat(output);
		},

		lang : moment.fn.lang
	};

	function makeDurationGetter(name) {
		moment.duration.fn[name] = function () {
			return this._data[name];
		};
	}

	function makeDurationAsGetter(name, factor) {
		moment.duration.fn['as' + name] = function () {
			return +this / factor;
		};
	}

	for (i in unitMillisecondFactors) {
		if (unitMillisecondFactors.hasOwnProperty(i)) {
			makeDurationAsGetter(i, unitMillisecondFactors[i]);
			makeDurationGetter(i.toLowerCase());
		}
	}

	makeDurationAsGetter('Weeks', 6048e5);


	/************************************
	 Default Lang
	 ************************************/


		// Set default language, other languages will inherit from English.
	moment.lang('en', {
		ordinal : function (number) {
			var b = number % 10,
				output = (~~ (number % 100 / 10) === 1) ? 'th' :
					(b === 1) ? 'st' :
						(b === 2) ? 'nd' :
							(b === 3) ? 'rd' : 'th';
			return number + output;
		}
	});


	/************************************
	 Exposing Moment
	 ************************************/


	// CommonJS module is defined
	if (hasModule) {
		module.exports = moment;
	}
	/*global ender:false */
	if (typeof ender === 'undefined') {
		// here, `this` means `window` in the browser, or `global` on the server
		// add `moment` as a global object via a string identifier,
		// for Closure Compiler "advanced" mode
		this['moment'] = moment;
	}
	/*global define:false */
	if (typeof define === "function" && define.amd) {
		define("moment", [], function () {
			return moment;
		});
	}
}).call(this);
!function(){var q=null;window.PR_SHOULD_USE_CONTINUATION=!0;
	(function(){function S(a){function d(e){var b=e.charCodeAt(0);if(b!==92)return b;var a=e.charAt(1);return(b=r[a])?b:"0"<=a&&a<="7"?parseInt(e.substring(1),8):a==="u"||a==="x"?parseInt(e.substring(2),16):e.charCodeAt(1)}function g(e){if(e<32)return(e<16?"\\x0":"\\x")+e.toString(16);e=String.fromCharCode(e);return e==="\\"||e==="-"||e==="]"||e==="^"?"\\"+e:e}function b(e){var b=e.substring(1,e.length-1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g),e=[],a=
		b[0]==="^",c=["["];a&&c.push("^");for(var a=a?1:0,f=b.length;a<f;++a){var h=b[a];if(/\\[bdsw]/i.test(h))c.push(h);else{var h=d(h),l;a+2<f&&"-"===b[a+1]?(l=d(b[a+2]),a+=2):l=h;e.push([h,l]);l<65||h>122||(l<65||h>90||e.push([Math.max(65,h)|32,Math.min(l,90)|32]),l<97||h>122||e.push([Math.max(97,h)&-33,Math.min(l,122)&-33]))}}e.sort(function(e,a){return e[0]-a[0]||a[1]-e[1]});b=[];f=[];for(a=0;a<e.length;++a)h=e[a],h[0]<=f[1]+1?f[1]=Math.max(f[1],h[1]):b.push(f=h);for(a=0;a<b.length;++a)h=b[a],c.push(g(h[0])),
		h[1]>h[0]&&(h[1]+1>h[0]&&c.push("-"),c.push(g(h[1])));c.push("]");return c.join("")}function s(e){for(var a=e.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g),c=a.length,d=[],f=0,h=0;f<c;++f){var l=a[f];l==="("?++h:"\\"===l.charAt(0)&&(l=+l.substring(1))&&(l<=h?d[l]=-1:a[f]=g(l))}for(f=1;f<d.length;++f)-1===d[f]&&(d[f]=++x);for(h=f=0;f<c;++f)l=a[f],l==="("?(++h,d[h]||(a[f]="(?:")):"\\"===l.charAt(0)&&(l=+l.substring(1))&&l<=h&&
		(a[f]="\\"+d[l]);for(f=0;f<c;++f)"^"===a[f]&&"^"!==a[f+1]&&(a[f]="");if(e.ignoreCase&&m)for(f=0;f<c;++f)l=a[f],e=l.charAt(0),l.length>=2&&e==="["?a[f]=b(l):e!=="\\"&&(a[f]=l.replace(/[A-Za-z]/g,function(a){a=a.charCodeAt(0);return"["+String.fromCharCode(a&-33,a|32)+"]"}));return a.join("")}for(var x=0,m=!1,j=!1,k=0,c=a.length;k<c;++k){var i=a[k];if(i.ignoreCase)j=!0;else if(/[a-z]/i.test(i.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi,""))){m=!0;j=!1;break}}for(var r={b:8,t:9,n:10,v:11,
		f:12,r:13},n=[],k=0,c=a.length;k<c;++k){i=a[k];if(i.global||i.multiline)throw Error(""+i);n.push("(?:"+s(i)+")")}return RegExp(n.join("|"),j?"gi":"g")}function T(a,d){function g(a){var c=a.nodeType;if(c==1){if(!b.test(a.className)){for(c=a.firstChild;c;c=c.nextSibling)g(c);c=a.nodeName.toLowerCase();if("br"===c||"li"===c)s[j]="\n",m[j<<1]=x++,m[j++<<1|1]=a}}else if(c==3||c==4)c=a.nodeValue,c.length&&(c=d?c.replace(/\r\n?/g,"\n"):c.replace(/[\t\n\r ]+/g," "),s[j]=c,m[j<<1]=x,x+=c.length,m[j++<<1|1]=
		a)}var b=/(?:^|\s)nocode(?:\s|$)/,s=[],x=0,m=[],j=0;g(a);return{a:s.join("").replace(/\n$/,""),d:m}}function H(a,d,g,b){d&&(a={a:d,e:a},g(a),b.push.apply(b,a.g))}function U(a){for(var d=void 0,g=a.firstChild;g;g=g.nextSibling)var b=g.nodeType,d=b===1?d?a:g:b===3?V.test(g.nodeValue)?a:d:d;return d===a?void 0:d}function C(a,d){function g(a){for(var j=a.e,k=[j,"pln"],c=0,i=a.a.match(s)||[],r={},n=0,e=i.length;n<e;++n){var z=i[n],w=r[z],t=void 0,f;if(typeof w==="string")f=!1;else{var h=b[z.charAt(0)];
		if(h)t=z.match(h[1]),w=h[0];else{for(f=0;f<x;++f)if(h=d[f],t=z.match(h[1])){w=h[0];break}t||(w="pln")}if((f=w.length>=5&&"lang-"===w.substring(0,5))&&!(t&&typeof t[1]==="string"))f=!1,w="src";f||(r[z]=w)}h=c;c+=z.length;if(f){f=t[1];var l=z.indexOf(f),B=l+f.length;t[2]&&(B=z.length-t[2].length,l=B-f.length);w=w.substring(5);H(j+h,z.substring(0,l),g,k);H(j+h+l,f,I(w,f),k);H(j+h+B,z.substring(B),g,k)}else k.push(j+h,w)}a.g=k}var b={},s;(function(){for(var g=a.concat(d),j=[],k={},c=0,i=g.length;c<i;++c){var r=
		g[c],n=r[3];if(n)for(var e=n.length;--e>=0;)b[n.charAt(e)]=r;r=r[1];n=""+r;k.hasOwnProperty(n)||(j.push(r),k[n]=q)}j.push(/[\S\s]/);s=S(j)})();var x=d.length;return g}function v(a){var d=[],g=[];a.tripleQuotedStrings?d.push(["str",/^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/,q,"'\""]):a.multiLineStrings?d.push(["str",/^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
		q,"'\"`"]):d.push(["str",/^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/,q,"\"'"]);a.verbatimStrings&&g.push(["str",/^@"(?:[^"]|"")*(?:"|$)/,q]);var b=a.hashComments;b&&(a.cStyleComments?(b>1?d.push(["com",/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,q,"#"]):d.push(["com",/^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\n\r]*)/,q,"#"]),g.push(["str",/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,q])):d.push(["com",
		/^#[^\n\r]*/,q,"#"]));a.cStyleComments&&(g.push(["com",/^\/\/[^\n\r]*/,q]),g.push(["com",/^\/\*[\S\s]*?(?:\*\/|$)/,q]));if(b=a.regexLiterals){var s=(b=b>1?"":"\n\r")?".":"[\\S\\s]";g.push(["lang-regex",RegExp("^(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*("+("/(?=[^/*"+b+"])(?:[^/\\x5B\\x5C"+b+"]|\\x5C"+s+"|\\x5B(?:[^\\x5C\\x5D"+b+"]|\\x5C"+
		s+")*(?:\\x5D|$))+/")+")")])}(b=a.types)&&g.push(["typ",b]);b=(""+a.keywords).replace(/^ | $/g,"");b.length&&g.push(["kwd",RegExp("^(?:"+b.replace(/[\s,]+/g,"|")+")\\b"),q]);d.push(["pln",/^\s+/,q," \r\n\t\u00a0"]);b="^.[^\\s\\w.$@'\"`/\\\\]*";a.regexLiterals&&(b+="(?!s*/)");g.push(["lit",/^@[$_a-z][\w$@]*/i,q],["typ",/^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/,q],["pln",/^[$_a-z][\w$@]*/i,q],["lit",/^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i,q,"0123456789"],["pln",/^\\[\S\s]?/,
		q],["pun",RegExp(b),q]);return C(d,g)}function J(a,d,g){function b(a){var c=a.nodeType;if(c==1&&!x.test(a.className))if("br"===a.nodeName)s(a),a.parentNode&&a.parentNode.removeChild(a);else for(a=a.firstChild;a;a=a.nextSibling)b(a);else if((c==3||c==4)&&g){var d=a.nodeValue,i=d.match(m);if(i)c=d.substring(0,i.index),a.nodeValue=c,(d=d.substring(i.index+i[0].length))&&a.parentNode.insertBefore(j.createTextNode(d),a.nextSibling),s(a),c||a.parentNode.removeChild(a)}}function s(a){function b(a,c){var d=
		c?a.cloneNode(!1):a,e=a.parentNode;if(e){var e=b(e,1),g=a.nextSibling;e.appendChild(d);for(var i=g;i;i=g)g=i.nextSibling,e.appendChild(i)}return d}for(;!a.nextSibling;)if(a=a.parentNode,!a)return;for(var a=b(a.nextSibling,0),d;(d=a.parentNode)&&d.nodeType===1;)a=d;c.push(a)}for(var x=/(?:^|\s)nocode(?:\s|$)/,m=/\r\n?|\n/,j=a.ownerDocument,k=j.createElement("li");a.firstChild;)k.appendChild(a.firstChild);for(var c=[k],i=0;i<c.length;++i)b(c[i]);d===(d|0)&&c[0].setAttribute("value",d);var r=j.createElement("ol");
		r.className="linenums";for(var d=Math.max(0,d-1|0)||0,i=0,n=c.length;i<n;++i)k=c[i],k.className="L"+(i+d)%10,k.firstChild||k.appendChild(j.createTextNode("\u00a0")),r.appendChild(k);a.appendChild(r)}function p(a,d){for(var g=d.length;--g>=0;){var b=d[g];F.hasOwnProperty(b)?D.console&&console.warn("cannot override language handler %s",b):F[b]=a}}function I(a,d){if(!a||!F.hasOwnProperty(a))a=/^\s*</.test(d)?"default-markup":"default-code";return F[a]}function K(a){var d=a.h;try{var g=T(a.c,a.i),b=g.a;
		a.a=b;a.d=g.d;a.e=0;I(d,b)(a);var s=/\bMSIE\s(\d+)/.exec(navigator.userAgent),s=s&&+s[1]<=8,d=/\n/g,x=a.a,m=x.length,g=0,j=a.d,k=j.length,b=0,c=a.g,i=c.length,r=0;c[i]=m;var n,e;for(e=n=0;e<i;)c[e]!==c[e+2]?(c[n++]=c[e++],c[n++]=c[e++]):e+=2;i=n;for(e=n=0;e<i;){for(var p=c[e],w=c[e+1],t=e+2;t+2<=i&&c[t+1]===w;)t+=2;c[n++]=p;c[n++]=w;e=t}c.length=n;var f=a.c,h;if(f)h=f.style.display,f.style.display="none";try{for(;b<k;){var l=j[b+2]||m,B=c[r+2]||m,t=Math.min(l,B),A=j[b+1],G;if(A.nodeType!==1&&(G=x.substring(g,
			t))){s&&(G=G.replace(d,"\r"));A.nodeValue=G;var L=A.ownerDocument,o=L.createElement("span");o.className=c[r+1];var v=A.parentNode;v.replaceChild(o,A);o.appendChild(A);g<l&&(j[b+1]=A=L.createTextNode(x.substring(t,l)),v.insertBefore(A,o.nextSibling))}g=t;g>=l&&(b+=2);g>=B&&(r+=2)}}finally{if(f)f.style.display=h}}catch(u){D.console&&console.log(u&&u.stack||u)}}var D=window,y=["break,continue,do,else,for,if,return,while"],E=[[y,"auto,case,char,const,default,double,enum,extern,float,goto,inline,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
			"catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"],M=[E,"alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,delegate,dynamic_cast,explicit,export,friend,generic,late_check,mutable,namespace,nullptr,property,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"],N=[E,"abstract,assert,boolean,byte,extends,final,finally,implements,import,instanceof,interface,null,native,package,strictfp,super,synchronized,throws,transient"],
		O=[N,"as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,internal,into,is,let,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var,virtual,where"],E=[E,"debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"],P=[y,"and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
		Q=[y,"alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"],W=[y,"as,assert,const,copy,drop,enum,extern,fail,false,fn,impl,let,log,loop,match,mod,move,mut,priv,pub,pure,ref,self,static,struct,true,trait,type,unsafe,use"],y=[y,"case,done,elif,esac,eval,fi,function,in,local,set,then,until"],R=/^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/,
		V=/\S/,X=v({keywords:[M,O,E,"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",P,Q,y],hashComments:!0,cStyleComments:!0,multiLineStrings:!0,regexLiterals:!0}),F={};p(X,["default-code"]);p(C([],[["pln",/^[^<?]+/],["dec",/^<!\w[^>]*(?:>|$)/],["com",/^<\!--[\S\s]*?(?:--\>|$)/],["lang-",/^<\?([\S\s]+?)(?:\?>|$)/],["lang-",/^<%([\S\s]+?)(?:%>|$)/],["pun",/^(?:<[%?]|[%?]>)/],["lang-",
		/^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i],["lang-js",/^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i]]),["default-markup","htm","html","mxml","xhtml","xml","xsl"]);p(C([["pln",/^\s+/,q," \t\r\n"],["atv",/^(?:"[^"]*"?|'[^']*'?)/,q,"\"'"]],[["tag",/^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i],["atn",/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],["lang-uq.val",/^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/],["pun",/^[/<->]+/],
		["lang-js",/^on\w+\s*=\s*"([^"]+)"/i],["lang-js",/^on\w+\s*=\s*'([^']+)'/i],["lang-js",/^on\w+\s*=\s*([^\s"'>]+)/i],["lang-css",/^style\s*=\s*"([^"]+)"/i],["lang-css",/^style\s*=\s*'([^']+)'/i],["lang-css",/^style\s*=\s*([^\s"'>]+)/i]]),["in.tag"]);p(C([],[["atv",/^[\S\s]+/]]),["uq.val"]);p(v({keywords:M,hashComments:!0,cStyleComments:!0,types:R}),["c","cc","cpp","cxx","cyc","m"]);p(v({keywords:"null,true,false"}),["json"]);p(v({keywords:O,hashComments:!0,cStyleComments:!0,verbatimStrings:!0,types:R}),
		["cs"]);p(v({keywords:N,cStyleComments:!0}),["java"]);p(v({keywords:y,hashComments:!0,multiLineStrings:!0}),["bash","bsh","csh","sh"]);p(v({keywords:P,hashComments:!0,multiLineStrings:!0,tripleQuotedStrings:!0}),["cv","py","python"]);p(v({keywords:"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",hashComments:!0,multiLineStrings:!0,regexLiterals:2}),["perl","pl","pm"]);p(v({keywords:Q,
		hashComments:!0,multiLineStrings:!0,regexLiterals:!0}),["rb","ruby"]);p(v({keywords:E,cStyleComments:!0,regexLiterals:!0}),["javascript","js"]);p(v({keywords:"all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes",hashComments:3,cStyleComments:!0,multilineStrings:!0,tripleQuotedStrings:!0,regexLiterals:!0}),["coffee"]);p(v({keywords:W,cStyleComments:!0,multilineStrings:!0}),["rc","rs","rust"]);
		p(C([],[["str",/^[\S\s]+/]]),["regex"]);var Y=D.PR={createSimpleLexer:C,registerLangHandler:p,sourceDecorator:v,PR_ATTRIB_NAME:"atn",PR_ATTRIB_VALUE:"atv",PR_COMMENT:"com",PR_DECLARATION:"dec",PR_KEYWORD:"kwd",PR_LITERAL:"lit",PR_NOCODE:"nocode",PR_PLAIN:"pln",PR_PUNCTUATION:"pun",PR_SOURCE:"src",PR_STRING:"str",PR_TAG:"tag",PR_TYPE:"typ",prettyPrintOne:D.prettyPrintOne=function(a,d,g){var b=document.createElement("div");b.innerHTML="<pre>"+a+"</pre>";b=b.firstChild;g&&J(b,g,!0);K({h:d,j:g,c:b,i:1});
			return b.innerHTML},prettyPrint:D.prettyPrint=function(a,d){function g(){for(var b=D.PR_SHOULD_USE_CONTINUATION?c.now()+250:Infinity;i<p.length&&c.now()<b;i++){for(var d=p[i],j=h,k=d;k=k.previousSibling;){var m=k.nodeType,o=(m===7||m===8)&&k.nodeValue;if(o?!/^\??prettify\b/.test(o):m!==3||/\S/.test(k.nodeValue))break;if(o){j={};o.replace(/\b(\w+)=([\w%+\-.:]+)/g,function(a,b,c){j[b]=c});break}}k=d.className;if((j!==h||e.test(k))&&!v.test(k)){m=!1;for(o=d.parentNode;o;o=o.parentNode)if(f.test(o.tagName)&&
			o.className&&e.test(o.className)){m=!0;break}if(!m){d.className+=" prettyprinted";m=j.lang;if(!m){var m=k.match(n),y;if(!m&&(y=U(d))&&t.test(y.tagName))m=y.className.match(n);m&&(m=m[1])}if(w.test(d.tagName))o=1;else var o=d.currentStyle,u=s.defaultView,o=(o=o?o.whiteSpace:u&&u.getComputedStyle?u.getComputedStyle(d,q).getPropertyValue("white-space"):0)&&"pre"===o.substring(0,3);u=j.linenums;if(!(u=u==="true"||+u))u=(u=k.match(/\blinenums\b(?::(\d+))?/))?u[1]&&u[1].length?+u[1]:!0:!1;u&&J(d,u,o);r=
		{h:m,c:d,j:u,i:o};K(r)}}}i<p.length?setTimeout(g,250):"function"===typeof a&&a()}for(var b=d||document.body,s=b.ownerDocument||document,b=[b.getElementsByTagName("pre"),b.getElementsByTagName("code"),b.getElementsByTagName("xmp")],p=[],m=0;m<b.length;++m)for(var j=0,k=b[m].length;j<k;++j)p.push(b[m][j]);var b=q,c=Date;c.now||(c={now:function(){return+new Date}});var i=0,r,n=/\blang(?:uage)?-([\w.]+)(?!\S)/,e=/\bprettyprint\b/,v=/\bprettyprinted\b/,w=/pre|xmp/i,t=/^code$/i,f=/^(?:pre|code|xmp)$/i,
			h={};g()}};typeof define==="function"&&define.amd&&define("google-code-prettify",[],function(){return Y})})();}()

can.Model('Bitovi.OSS.ActivitySummary', {
	summary: null,
	// the configuration is not going to change,
	// and it's pretty much a singleton, so:
	findOne: function() {
		if(Bitovi.OSS.ActivitySummary.summary === null) {
			Bitovi.OSS.ActivitySummary.summary = $.ajax({
				url: Bitovi.URL.BITHUB + 'summary',
				dataType: 'json',
				data: {
					origin_date: moment().subtract('months', 1).format('YYYY-MM-DD:')
				}
			});
		}

		return Bitovi.OSS.ActivitySummary.summary;
	},
	model: function(data) {
		//{"data":{"app":23,"article":30,"plugin":7,"code":1041,"chat":5578,"twitter":1510,"issues_event":247,"github":2547}}
		data = data.data;
		return {
			apps: data.app,
			commits: data.code,
			posts: data.posts,
			articles: data.article,
			plugins: data.plugin
		};
	}
}, { });
can.Model("Bitovi.OSS.ChatLine", {
	models: function(list) {
		var models = list.data.map(function(el) {
			return Bitovi.OSS.ChatLine.model(el);
		});

		return new can.Observe.List(models).reverse();
	},
	model: function(data) {
		return {
			actor: data.actor,
			body: data.title,
			feed: data.feed,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=chat&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });

can.Model('Bitovi.OSS.Configuration', {
	configuration: null,
	// the configuration is not going to change,
	// and it's pretty much a singleton, so:
	findOne: function() {
		if(Bitovi.OSS.Configuration.configuration === null) {
			Bitovi.OSS.Configuration.configuration = $.ajax({
				url: Bitovi.URL.BUILDER_DATA,
				dataType: 'jsonp'
			});
		}

		return Bitovi.OSS.Configuration.configuration;
	},
	model: function(data) {
		var libraries = [];
		can.each(data.configurations, function(library, id) {
			library.id = id;
			libraries.push(library);
		});
		
		var types = {};
		can.each(data.types, function(description, id) {
			types[id] = {
				id: id,
				description: description,
				modules: []
			};
		});

		can.each(data.modules, function(module, path) {
			module.id = Bitovi.OSS.Configuration.pathToID(path);
			module.path = path;
			types[module.type].modules.push(module);
		});

		return {
			name: data.name,
			version: data.version,
			description: data.description,
			libraries: libraries,
			types: types,
			modules: data.modules
		};
	},
	pathToID: function(path) {
		return path.split('/').join('-').split('.').join('_');
	},
	idToPath: function(id) {
		return id.split('_').join('.').split('/').join('/');
	}
}, { });
can.Model("Bitovi.OSS.ForumPost", {
	model: function(data) {
		return {
			actor: data.actor,
			title: data.title,
			body: data.body,

			feed: data.feed,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?feed=forums&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
can.Model("Bitovi.OSS.GithubEvent", {
	model: function(data) {
		return {
			actor: data.actor,
			actorID: data._author,
			picture: data.source_data.org.avatar_url,
			title: data.title,
			commits: data.source_data.payload.commits.map(function(el) {
				return {
					hash: el.sha,
					message: el.message
				}
			}),

			feed: data.feed,
			category: data.category,
			link: data.url,
			points: data.points,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=code&also=source_data&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
can.Model("Bitovi.OSS.GithubIssue", {
	model: function(data) {
		return {
			actor: data.actor,
			actorID: data._author,
			picture: data.source_data.org.avatar_url,
			title: data.title,
			body: data.body,

			feed: data.feed,
			category: data.category,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB +  '?category=bug&also=source_data&order=upvotes&limit={limit}',
		dataType: 'json'
	}
}, { });
can.Model("Bitovi.OSS.Plugin", {
	model: function(data) {
		// The API's not returning plugins and apps yet, so this may
		// end up being innacurate.
		return {
			actor: data.actor,
			title: data.title,
			body: data.body,

			feed: data.feed,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=article|app|plugin&order=upvotes:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
can.Model("Bitovi.OSS.Tweet", {
	model: function(data) {
		return {
			handle: data.actor,
			realName: data.source_data.user.name,
			picture: data.source_data.user.profile_image_url,
			body: data.title,

			feed: data.feed,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?feed=twitter&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
can.Control('Bitovi.OSS.ApiSignature', {}, {
	'h2 click': function(el, ev) {
		this.element.toggleClass('collapsed');
	}
});
can.Control('Bitovi.OSS.Benefits', {
	defaults: {
		tabs: {
			flexible: {
				className: 'flexible',
				title: 'Flexible',
				tagline: 'Works with jQuery, Dojo, Mootools, YUI, and Zepto. Reuse your existing templates.',
				link: 'guides/Why.html#Flexible'
			},
			powerful: {
				className: 'powerful',
				title: 'Powerful',
				tagline: 'Packs in everything you need to build your app. And you can learn it in a day.',
				link: 'guides/Why.html#Powerful'
			},
			fast: {
				className: 'fast',
				title: 'Fast',
				tagline: 'Sleek, responsive, and only 36K: exactly what it says on the can.',
				link: 'guides/Why.html#Fast'
			}
		}
	}
}, {
	init: function() {
		this.state = new can.Observe({tabs: this.options.tabs, selectedTab: this.options.tabs.powerful});
		this.element.html(can.view('templates/benefitTabs.mustache', this.state, {
			makeTabs: function(tabs, options) {
				var out = '';
				can.each(tabs().attr(), function(val, key) {
					out += options.fn(val);
				});
				return out;
			}
		}));
		this._switchBenefit('powerful');
	},
	'li mouseover': function(el, ev) {
		this._switchBenefit(el.data('benefit'));
	},
	_switchBenefit: function(benefit) {
		this.state.attr('selectedTab', this.options.tabs[benefit]);

		$('li', this.element).removeClass('active');
		$('li[data-benefit=' + benefit + ']', this.element).addClass('active');

	}
});
can.Control('Bitovi.OSS.CDNChooser', {
	defaults: {
		version: '',
		libraries: [],
		selectedLibrary: '',
		cdn: Bitovi.URL.CDN
	}
}, {
	init: function() {
		this.options = new can.Observe(this.options);
		
		var self = this;
		Bitovi.OSS.Configuration.findOne().done(function(config) {
			self.options.libraries.attr(config.libraries);
			self.options.attr('version', config.version);
			self.element.find('select').change();
		});

		this.element.html(can.view('templates/cdnChooser.mustache', this.options));
	},
	// function adapted from http://stackoverflow.com/questions/11128130/select-text-in-javascript
	selectText: function(element) {
		if (document.body.createTextRange) { // ms
	        var range = document.body.createTextRange();
	        range.moveToElementText(element);
	        range.select();
	    } else if (window.getSelection) { // moz, opera, webkit
	        var selection = window.getSelection();            
	        var range = document.createRange();
	        range.selectNodeContents(element);
	        selection.removeAllRanges();
	        selection.addRange(range);
	    }
	},
	'.cdn-link click': function(el, ev) {
		this.selectText(el[0]);
	},
	'select change': function(el, ev) {
		this.options.attr('selectedLibrary', el.val());
	}
});
can.Control('Bitovi.OSS.CommunityTab', {
	defaults: {
		view: ''
	}
}, {
	init: function() {
		can.Mustache.registerHelper('formatDate', function(date) {
			return moment(date()).calendar();
		});

		this.element.html(can.view(this.options.view, this.options.state));
	}
});
can.Control('Bitovi.OSS.CommunityTabs', {
	defaults: {
		tabControls: {
			'forums': 'ForumsTab',
			'irc': 'IRCTab',
			'plugins': 'PluginsTab',
			'twitter': 'TwitterTab',
			'issues': 'IssuesTab',
			'github': 'GithubTab'
		}
	}
}, {
	init: function() {
		// get data for all six tabs up front
		// this way, it doesn't call for the data every time a tab switches.
		this.state = new can.Observe({});
		var self = this;

		Bitovi.OSS.ForumPost.findAll({limit: 3}).done(function(posts) {
			self.state.attr('forumPosts', posts);
		});
		// Missing counts for forum categories
		Bitovi.OSS.ChatLine.findAll({limit: 30}).done(function(lines) {
			self.state.attr('lines', lines);
		});
		Bitovi.OSS.Plugin.findAll({limit: 3}).done(function(plugins) {
			self.state.attr('plugins', plugins);
		});
		// Missing counts for plugins/apps/articles
		Bitovi.OSS.Tweet.findAll({limit: 3}).done(function(tweets) {
			self.state.attr('tweets', tweets);
		});
		Bitovi.OSS.GithubIssue.findAll({limit: 3}).done(function(issues) {
			self.state.attr('issues', issues);
		});
		Bitovi.OSS.GithubEvent.findAll({limit: 3}).done(function(commits) {
			self.state.attr('commits', commits);
		});
		// Missing follower counts for github

		this.element.html(can.view('templates/communityTabs.mustache', {}));
	},
	//'li mouseenter': '_switchTab',
	'li click': function(el, ev) {
		can.route.attr('type', el.prop('class'));
	},
	':type route': function(data) {
		this._switchTab(data.type);
	},
	_switchTab: function(selectedTab) {
		this.element
			.find('li').removeClass('active')
			.filter('.' + selectedTab).addClass('active');
		var tabControl = this.options.tabControls[selectedTab];
		new Bitovi.OSS[tabControl]($('.content > .container'), {state: this.state});
	}
});
can.Control("Bitovi.OSS.ContentsList", {
	init: function() {
		var sections = [];

		this.collectSignatures().each(function(ix) {
			var h2 = $('h2', this);
			this.id = 'sig' + ix;
			//this.id = encodeURIComponent(h2.text());
			sections.push({id: this.id, text: h2.text()});
		});

		this.collectHeadings().each(function(ix) {
			var el = $(this);
			this.id = 'section' + ix;
			//this.id = encodeURIComponent(el.text());
			sections.push({id: this.id, text: el.text()});
		});

		this.element.html(can.view(
			'templates/contentsList.mustache',
			{sections: sections},
			{encode: function() { return encodeURIComponent(this); }}
		));

		if(window.location.hash.length) {
			var anchor = $(window.location.hash);
			if(anchor.length) {
				anchor[0].scrollIntoView(true);
			}
		}
	},
	collectSignatures: function() {
		return $('.content .signature');
	},
	collectHeadings: function() {
		return $('.content .comment h2');
	}
});
can.Control('Bitovi.OSS.DownloadCustomizer', {
	defaults: {
		minified: false,
		configuration: null,
		view: 'templates/downloadCustomizer.mustache'
	}
}, {
	init: function() {
		this.options = new can.Observe(this.options);
		this.isDependedOnBy = {};
		this.checkAlls = {};
		
		var self = this;
		Bitovi.OSS.Configuration.findOne().done(function(config) {
			self.isDependedOnBy = self._collectDependedOn(config);
			self.options.attr('configuration', config);
			can.each(config.types, function(obj, type) {
				self.element.find('[name=' + type + ']:checkbox:first').change();
			});
		});

		this.element.append(can.view(this.options.view, this.options, {
			versionNumber: function(version) {
				return version() ? version() : '';
			}
		}));
	},
	_collectDependedOn: function(config) {
		var isDependedOnBy = {};
		can.each(config.modules, function(module, path) {
			can.each(module.dependencies, function(dependency) {
				if(! isDependedOnBy[dependency]) {
					isDependedOnBy[dependency] = [];
				}

				isDependedOnBy[dependency].push(path);
			});
		});

		return isDependedOnBy;
	},
	'input.module[type=checkbox] change': function(el, ev) {
		if(el.prop('checked')) {
			// also check dependencies
			can.each(can.data(el, 'module').dependencies, function(dependency) {
				$('#' + Bitovi.OSS.Configuration.pathToID(dependency)).prop('checked', true).change();
			});

			if(! $('[name=' + el.prop('name') + ']:checkbox:enabled:not(:checked)').length) {
				$('#' + el.prop('name')).prop('checked', true);
			}
		} else {
			$('.all[data-type=' + can.data(el, 'module').type + ']').prop('checked', false);
			this.checkAlls[can.data(el, 'module').type] = false;

			if(this.isDependedOnBy[el.val()]) {
				// uncheck depended-on-cies
				can.each(this.isDependedOnBy[el.val()], function(dependedOn) {
					$('#' + Bitovi.OSS.Configuration.pathToID(dependedOn)).prop('checked', false).change();
				});
			}
		}
	},
	'.all change': function(el, ev) {
		this.checkAlls[can.data(el, 'type')] = el.prop('checked');

		can.each(this.options.configuration.types[can.data(el, 'type')].modules, function(module) {
			var check = $('#' + Bitovi.OSS.Configuration.pathToID(module.id))
			if(! check.prop('disabled')) {
				check.prop('checked', el.prop('checked')).change();
			}
		});
	},
	'input[name=configuration] change': function(el, ev) {
		if(el.prop('checked')) {
			this._libraryChanged(el.prop('id'));
		}
	},
	_libraryChanged: function(libraryID) {
		var self = this;
		can.each(this.options.configuration.modules, function(module) {
			var disallowed = !!(module.configurations && module.configurations.indexOf(libraryID) < 0);
			var check = $('#' + module.id);
			check
				.closest('tr').toggleClass('inactive', disallowed).end()
				.prop('disabled', disallowed)
				.prop('checked', disallowed ? false : check.prop('checked') || self.checkAlls[module.type]).change();
		});
		can.each(this.options.configuration.types, function(obj, type) {
			self.element.find('[name=' + type + ']:checkbox:first').change();
		});
	}

});
Bitovi.OSS.CommunityTab('Bitovi.OSS.ForumsTab', {
	defaults: {
		view: 'templates/forumsTab.mustache'
	}
}, {
	init: function() {
		this._super();

		can.Mustache.registerHelper('truncatePost', function(post) {
			var div = $('<div></div>').html(post());
			/* Here's the 'smart' (ish?) way, but that's not how Bithub does it.
			return div[0].childNodes[0].nodeValue || div.children().first().text();
			*/
			return div.text().substr(0, 200);
		});

	},
	'#forumSearch button click': function(el, ev) {
		var terms = $('input[type=search]').val();
		window.location.href = 'https://forum.javascriptmvc.com/#Search/' + terms;
	},
	'#forumSearch input[type=search] keypress': function(el, ev) {
		if(ev.which === 13/* Return */) {
			ev.preventDefault();
			var terms = el.val();
			window.location.href = 'https://forum.javascriptmvc.com/#Search/' + terms;
		}
	}
});
Bitovi.OSS.CommunityTab('Bitovi.OSS.GithubTab', {
	defaults: {
		view: 'templates/githubTab.mustache'
	}
}, {
	init: function() {
		this._super();

		can.Mustache.registerHelper('truncateHash', function(hash) {
			return hash().substr(0, 6);
		});
	}
});
Bitovi.OSS.DownloadCustomizer('Bitovi.OSS.HeroDownloadCustomizer', {
	defaults: {
		view: 'templates/heroDownloadCustomizer.mustache'
	}
}, {
	init: function() {
		this._super();
		this.isOpen = false;
	},
	'.customize click': function(el, ev) {
		this.toggleFlyout();
		ev.stopPropagation();
	},
	'.customize-box click': function(el, ev) {
		ev.stopPropagation();
	},
	'{window} click': function(el, ev) {
		this.toggleFlyout(false);
	},
	'.download click': function(el, ev) {
		this.toggleFlyout(false);
	},
	'select[name=configuration] change': function(el, ev) {
		this._libraryChanged(el.val());
	},
	_libraryChanged: function(libraryID) {
		var self = this;
		can.each(this.options.configuration.modules, function(module) {
			var disallowed = !!(module.configurations && module.configurations.indexOf(libraryID) < 0);
			var check = $('#' + module.id);
			check
				.closest('li').toggleClass('inactive', disallowed).end()
				.prop('disabled', disallowed)
				.prop('checked', disallowed ? false : check.prop('checked') || self.checkAlls[module.type]).change();
		});
	},
	toggleFlyout: function(open) {
		if(open === undefined) {
			this.isOpen = this.element.find('.customize').toggleClass('active').hasClass('active');
			open = this.isOpen;
		}

		if(open) {
			this.element.find('.customize').addClass('active');
			var customizeBox = this.element.find('.customize-box').show();

			// make customizeBox the right width
			customizeBox.width($('#hero-download').width() - (parseInt(customizeBox.css('padding-left'), 10) + parseInt(customizeBox.css('padding-right'), 10)));

			this.isOpen = true;
		} else {
			this.element.find('.customize').removeClass('active');
			this.element.find('.customize-box').hide();
			this.isOpen = false;
		}
	}
});
Bitovi.OSS.CommunityTab('Bitovi.OSS.IRCTab', {
	defaults: {
		view: 'templates/ircTab.mustache'
	}
}, {
	init: function() {
		this._super();
		this.scrollToBottom();
	},
	scrollToBottom: function() {
		var chatbox = $('.irc-chat-container', this.element);
		chatbox.scrollTop(chatbox.prop('scrollHeight'));
	},
	'{state} lines': function(ev, newVal, oldVal) {
		// we have to wait until the tempate re-renders
		window.setTimeout(can.proxy(this.scrollToBottom, this), 0);
	}
});
Bitovi.OSS.CommunityTab('Bitovi.OSS.IssuesTab', {
	defaults: {
		view: 'templates/issuesTab.mustache'
	}
}, {
	init: function() {
		this._super();
	}
});
can.Control('Bitovi.OSS.LiveExample', {
    
}, {
    '.execute click': function(el, ev) {
    }
});
can.Mustache.registerHelper('makeHref', function(src) {
	return src().replace(/ /g, "_")
		.replace(/&#46;/g, ".")
		.replace(/&gt;/g, "_gt_")
		.replace(/\*/g, "_star_")
		.replace(/\//g, "|") + '.html';
});

can.Control('Bitovi.OSS.Menu', {
	defaults: {
		emptyText: 'Nothing found...'
	}
}, {
	search: function(regex) {
		this.element.addClass('search-results').find('[data-search]').each(function() {
			var el = $(this),
				searchTerm = el.data('search');

			if(searchTerm && regex.test(searchTerm)) {
				// Show parent search containers
				el.show().parents('.search-container').show()
					// Show all children
					.end().closest('.search-container').find('.search-container').show();
			}
		});

		// Show main headings
		this.element.find('.api > .search-container > [data-search]').show();
	},

	reset: function() {
		this.element.removeClass('search-results').find('.search-container').css('display', '')
			.end().find('[data-search]').css('display', '');
	},

	'.search input keyup': function(el) {
		var value = el.val().replace(/([.?*+^$[\]\\(){}|-])/g);
		if(value.length > 1) {
			this.element.find('.search-container').hide();
			this.search(new RegExp(value, 'gim'));
		} else {
			this.reset();
		}
	}/*,

	'li.active > a click': function(el, ev) {
		ev.preventDefault();
	},

	'li.active click': function(el, ev) {
		el.toggleClass('collapsed');
	}*/
});

Bitovi.OSS.CommunityTab('Bitovi.OSS.PluginsTab', {
	defaults: {
		view: 'templates/pluginsTab.mustache'
	}
}, {
	init: function() {
		this._super();
	}
});
can.Control('Bitovi.OSS.SocialStats', {}, {
	init: function() {
		this.state = new can.Observe({});
		this.element.html(can.view('templates/socialStats.mustache', this.state, {
			plural: function(word, count) {
				// if we ever get an irregular plural (like 'people') we'll have to special-case.
				return count === 1 ? word : word + 's';
			}
		}));

		Bitovi.OSS.ActivitySummary.findOne().done(can.proxy(function(summary) {
			this.state.attr(summary);
		}, this));
	}
});
Bitovi.OSS.CommunityTab('Bitovi.OSS.TwitterTab', {
	defaults: {
		view: 'templates/twitterTab.mustache'
	}
}, {
	init: function() {
		this._super();
	}
});
(function(window) {
can.view.preload('templates_benefitTabs_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("  <ul class=\"circle-tabs\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("makeTabs",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("tabs",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push(" \t<li class=\"");___v1ew.push(can.view.txt(1,'li','class',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("className",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" data-benefit=\"");___v1ew.push(can.view.txt(1,'li','data-benefit',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("className",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("<a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("title",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></li>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push(" </ul>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("with",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("selectedTab",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push(" <div class=\"tab-description ");___v1ew.push(can.view.txt(1,'div','class',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("className",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("tagline",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" <a class=\"readmore\" href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("More &#187;</a></div>");return ___v1ew.join("");}}])}));; return ___v1ew.join('')}} }));
can.view.preload('templates_cdnChooser_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<h4>CDN:</h4>\n<div class=\"input\">\n\t<div class=\"dropdown\">\n\t  <select>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'select',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("libraries",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t    <option value=\"");___v1ew.push(can.view.txt(1,'option','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'option',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("description",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</option>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t  </select>\n  </div>\n  <span class=\"cdn-link\">");___v1ew.push(can.view.txt(1,'span',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("cdn",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("/");___v1ew.push(can.view.txt(1,'span',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("version",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("/can.");___v1ew.push(can.view.txt(1,'span',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("selectedLibrary",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(".js</span>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_chat_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"irc-chat-container\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("lines",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t<div><span class=\"username\">");___v1ew.push(can.view.txt(1,'span',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actor",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</span>: ");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("body",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_communityTabs_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<ul class=\"circle-tabs\">\n   <li class=\"forums\"><a>Forums</a></li>\n   <li class=\"irc\"><a>IRC</a></li>\n   <li class=\"plugins\"><a>Apps & Plugins</a></li>\n   <li class=\"twitter\"><a>Twitter</a></li>\n   <li class=\"issues\"><a>Issues</a></li>\n   <li class=\"github\"><a>Github</a></li>\n</ul>");; return ___v1ew.join('')}} }));
can.view.preload('templates_contentsList_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<ul>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("sections",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t<li><a href=\"#");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("text",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></li>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("</ul>");; return ___v1ew.join('')}} }));
can.view.preload('templates_downloadCustomizer_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<h1>Customize<span class=\"pullright\">version ");___v1ew.push(can.view.txt(1,'span',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("versionNumber",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("configuration.version",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push("</span></h1>\n<form method=\"get\" action=\"http://bitbuilder.herokuapp.com/can.custom.js\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'form',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("configuration",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("  ");___v1ew.push(can.view.txt(0,'form',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("configuration",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n  <div class=\"libraries\">Library:");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.libraries",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("    <input type=\"radio\" id=\"");___v1ew.push(can.view.txt(1,'input','id',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" name=\"configuration\" value=\"");___v1ew.push(can.view.txt(1,'input','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("name",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push("",can.view.pending(),">");___v1ew.push("<label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"radio\"",can.view.pending(),">");___v1ew.push("</label>\n    <label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'label',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("description",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</label>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("    <span class=\"pullright\">\n      <input id=\"minify\" type=\"checkbox\" name=\"minify\" value=\"true\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("minified",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push("",can.view.pending(),">");___v1ew.push("<label for=\"minify\" class=\"checkbox\"></label><label for=\"minify\">Minified</label>\n    </span>\n  </div>\n  <table class=\"options\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n    <tr>\n      <th width=\"40\" align=\"center\" valign=\"top\"><input type=\"checkbox\" class=\"all\" id=\"core\" data-type=\"core\"/><label for=\"core\" class=\"checkbox\"></label></th>\n      <th colspan=\"2\" align=\"center\" valign=\"middle\"><label for=\"core\">Core</label></th>\n    </tr>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'table',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.types.core.modules",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("    <tr>\n      <td width=\"40\" align=\"center\" valign=\"top\"><input type=\"checkbox\" id=\"");___v1ew.push(can.view.txt(1,'input','id',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"module\" name=\"plugins\" value=\"");___v1ew.push(can.view.txt(1,'input','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("path",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'input',1,this,function(){ return can.proxy(function(__){can.data(can.$(__),'module', this.pop()); }, ___st4ck(___c0nt3xt,this))}));___v1ew.push("",can.view.pending(),"/>");___v1ew.push("<label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"checkbox\"",can.view.pending(),">");___v1ew.push("</label></td>\n      <td width=\"175\" align=\"left\" valign=\"top\"><label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'label',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("name",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</label></td>\n      <td align=\"left\" valign=\"top\">");___v1ew.push(can.view.txt(1,'td',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("description",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</td>\n    </tr>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("    </tr>\n  </table>\n  <table class=\"options\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n    <tr>\n      <th width=\"40\" align=\"center\" valign=\"top\"><input type=\"checkbox\" class=\"all checkbox\" id=\"plugin\" data-type=\"plugin\"/><label for=\"plugin\" class=\"checkbox\"></label></th>\n      <th colspan=\"2\" align=\"center\" valign=\"middle\"><label for=\"plugin\">Plugins</label></th>\n    </tr>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'table',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.types.plugin.modules",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("    <tr>\n      <td width=\"40\" align=\"center\" valign=\"top\"><input type=\"checkbox\" id=\"");___v1ew.push(can.view.txt(1,'input','id',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"module\" name=\"plugins\" value=\"");___v1ew.push(can.view.txt(1,'input','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("path",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'input',1,this,function(){ return can.proxy(function(__){can.data(can.$(__),'module', this.pop()); }, ___st4ck(___c0nt3xt,this))}));___v1ew.push("",can.view.pending(),"/>");___v1ew.push("<label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"checkbox\"",can.view.pending(),">");___v1ew.push("</label></td>\n      <td width=\"175\" align=\"left\" valign=\"top\"><label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'label',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("name",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</label></td>\n      <td align=\"left\" valign=\"top\">");___v1ew.push(can.view.txt(1,'td',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("description",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</td>\n    </tr>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("    </tr>\n  </table>\n  <br />\n  <div class=\"download-button\">\n    <button class=\"color\" type=\"submit\">Customize & Download</button>\n  </div>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("</form>");; return ___v1ew.join('')}} }));
can.view.preload('templates_forumPost_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"bithub-post\">\n\t<!-- Commented out b/c it doesn't make sense without the ability to vote up, which we can't do yet. //TG -->\n\t<!-- <div class=\"pull-left score\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("points",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div> --> \n\t\n\t<h5><a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("title",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></h5>\n\t<p>");___v1ew.push(can.view.txt(1,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("truncatePost",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("body",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("+</a></p>\n\t<div class=\"bithub-footer\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actor",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" / ");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("formatDate",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("date",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" via <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("feed",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></div>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_forumsTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description forums\">\n\t<form id=\"forumSearch\">\n\t\t<input type=\"search\" placeholder=\"Search the forums...\" />\n\t\t<button type=\"button\">Go</button>\n\t</form>\n\t<div class=\"posts\">\n\t\t<h1>Recent Posts</h1>\n\t\t<div class=\"bithub-content\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("forumPosts",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/forumPost.mustache'] ? can.Mustache.renderPartial(options.partials['templates/forumPost.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/forumPost.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("forumPosts",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n\t\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</div>\n\t</div>\n\t<div class=\"pull-right categories\">\n\t\t<ul>\n\t\t\t<li><a href=\"https://forum.javascriptmvc.com/#filter/discussions\">Discussions</a></li>\n\t\t\t<li><a href=\"https://forum.javascriptmvc.com/#filter/announcement\">Announcements</a></li>\n\t\t\t<li><a href=\"https://forum.javascriptmvc.com/#filter/questions\">Questions</a></li>\n\t\t\t<li><a href=\"https://forum.javascriptmvc.com/#filter/ideas\">Ideas</a></li>\n\t\t\t<li><a href=\"https://forum.javascriptmvc.com/#filter/problems\">Problems</a></li>\n\t\t</ul>\n\t\t<!--<ul>\n\t\t\t<li><a href=\"#\">Today</a></li>\n\t\t\t<li><a href=\"#\">This Week</a></li>\n\t\t\t<li><a href=\"#\">This Month</a></li>\n\t\t\t<li><a href=\"#\">This Year</a></li>\n\t\t</ul>-->\n\t</div>\n\t<br class=\"clear\" />\n</div><!-- .tab-description -->");; return ___v1ew.join('')}} }));
can.view.preload('templates_githubEvent_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"bithub-post\">\n\t<!-- Commented out b/c it doesn't make sense without the ability to vote up, which we can't do yet. //TG -->\n\t<!-- <div class=\"pull-left score\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("points",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div> --> \n\t\n\t<h2><a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actor",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("title",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></h2>");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t<p>- ");___v1ew.push(can.view.txt(1,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("truncateHash",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("hash",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("message",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</p>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t<div class=\"bithub-footer\"><a href=\"http://bithub.com/users/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actorID",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actor",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a> / ");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("formatDate",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("date",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" via <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("feed",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></div>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_githubFollowers_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<ul class=\"follower-badges\"><h4>Today</h4>\n\t<li class=\"watch\">");___v1ew.push(can.view.txt(1,'li',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("watchers",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" people started watching <a href=\"\">canjs</a></li>\n\t<li class=\"forked\">");___v1ew.push(can.view.txt(1,'li',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("forkers",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" people forked <a href=\"\">canjs</a></li>\n</ul>");; return ___v1ew.join('')}} }));
can.view.preload('templates_githubIssue_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"bithub-post\">\n\t<!-- Commented out b/c it doesn't make sense without the ability to vote up, which we can't do yet. //TG -->\n\t<!-- <div class=\"pull-left score\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("points",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div> --> \n\t\n\t<h5><a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("title",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></h5>\n\t<p>");___v1ew.push(can.view.txt(0,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("body",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("<a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("+</a></p>\n\t<div class=\"bithub-footer\"><a href=\"http://bithub.com/users/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actorID",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actor",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a> / ");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("formatDate",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("date",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" via <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("feed",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></div>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_githubTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description commits\">\n\t<h1>Latest Commits</h1>\n\t\n\t<div class=\"pull-right categories\">\n\t\t\n\t\t<div class=\"button-container\"><a href=\"http://github.com/bitovi/canjs\" class=\"button\"><span class=\"icon-github\"></span> Follow on Github</a></div>\n\t\t\t\t<div class=\"center\">\n\t\t<iframe src=\"http://ghbtns.com/github-btn.html?user=bitovi&repo=canjs&type=watch&count=true\"\n\t\t        allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"110\" height=\"20\"></iframe>\n\t\t<iframe src=\"http://ghbtns.com/github-btn.html?user=bitovi&repo=canjs&type=fork&count=true\"\n\t\t        allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"95\" height=\"20\"></iframe>\n\t\t</div><!-- center -->");___v1ew.push("\n\t\t\n\t</div><!-- categories -->\n\t\t\t\n\t<div class=\"posts\">\n\t\t\n\t\t<div class=\"bithub-content\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/githubEvent.mustache'] ? can.Mustache.renderPartial(options.partials['templates/githubEvent.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/githubEvent.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n\t\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</div>\n\t</div>\n\t<br class=\"clear\" />\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_heroDownloadCustomizer_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<button class=\"customize\">Customize <span class=\"arrow down\"></span></button>\n<div class=\"customize-box\">\n\t<form method=\"get\" action=\"http://bitbuilder.herokuapp.com/can.custom.js\">\n\t\t<div class=\"general-options\">\n\t\t\t<div class=\"dropdown\">\n\t\t\t<select name=\"configuration\" class=\"library\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'select',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.libraries",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t\t\t<option value=\"");___v1ew.push(can.view.txt(1,'option','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'option',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push("",can.view.pending(),">");___v1ew.push(can.view.txt(1,'option',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("description",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</option>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t\t</select>\n\t\t\t</div>\n\t\t\t<input id=\"minified\" type=\"checkbox\" name=\"minify\" value=\"true\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("minified",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push("",can.view.pending(),">");___v1ew.push("<label for=\"minified\" class=\"checkbox\"></label><label for=\"minified\">Minified</label>\n\t\t</div>\n\t\t<ul class=\"half\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.types.core.modules",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t\t<li class=\"checkbox-wrap\"><input id=\"");___v1ew.push(can.view.txt(1,'input','id',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"module\" type=\"checkbox\" name=\"plugins\" value=\"");___v1ew.push(can.view.txt(1,'input','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("path",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'input',1,this,function(){ return can.proxy(function(__){can.data(can.$(__),'module', this.pop()); }, ___st4ck(___c0nt3xt,this))}));___v1ew.push("",can.view.pending(),"/>");___v1ew.push("<label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"checkbox\"",can.view.pending(),">");___v1ew.push("</label><label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'label',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("name",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</label></li>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</ul>\n\t\t<ul class=\"half\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("configuration.types.plugin.modules",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t\t<li class=\"checkbox-wrap\"><input id=\"");___v1ew.push(can.view.txt(1,'input','id',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"module\" type=\"checkbox\" name=\"plugins\" value=\"");___v1ew.push(can.view.txt(1,'input','value',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("path",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" ");___v1ew.push(can.view.txt(0,'input',1,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("isDefault",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("checked");return ___v1ew.join("");}}])}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'input',1,this,function(){ return can.proxy(function(__){can.data(can.$(__),'module', this.pop()); }, ___st4ck(___c0nt3xt,this))}));___v1ew.push("",can.view.pending(),"/>");___v1ew.push("<label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" class=\"checkbox\"",can.view.pending(),">");___v1ew.push("</label><label for=\"");___v1ew.push(can.view.txt(1,'label','for',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("id",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'label',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("name",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</label></li>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</ul>\n\t\t<button class=\"color download\" type=\"submit\">Download</button>\n\t</form>\n</div>\n<p class=\"button-desc\">Works with: JQuery, Zepto, Dojo, Mootools, YUI</p>");; return ___v1ew.join('')}} }));
can.view.preload('templates_ircTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description irc\">\n\t<h1>Real-Time Chat</h1>\n\t\n\t<div class=\"pull-right categories\">\n\t\t<a href=\"http://webchat.freenode.net/?channels=canjs\" class=\"button\"><span class=\"icon-chat\"></span> Join the Chat</a>\n\t\t<p>Freenode IRC Channel <a href=\"http://webchat.freenode.net/?channels=canjs\">#canjs</a></p>\n\t\t<!--<ul><h4>Currently Online</h4>\n\t\t\t<li>tomgreever</li>\n\t\t\t<li>someone</li>\n\t\t\t<li>rabies423</li>\n\t\t\t<li>junkinyourtrunk</li>\n\t\t\t<li>canjsbot</li>\n\t\t\t<li>@bitovi</li>\n\t\t\t<li>me</li>\n\t\t</ul>-->\n\t</div>\n\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/chat.mustache'] ? can.Mustache.renderPartial(options.partials['templates/chat.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/chat.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n\t<br class=\"clear\" />\n</div><!-- .tab-description -->");; return ___v1ew.join('')}} }));
can.view.preload('templates_issuesTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description issues\">\n\t<h1>Top Issues</h1>\n\t\n\t<div class=\"pull-right categories\">\n\t\t\n\t\t<div class=\"button-container\"><a href=\"https://github.com/bitovi/canjs/issues/new\" class=\"button\">+ New Issue</a></div>\n\t\t\n\t\t<div class=\"center\">\n\t\t<iframe src=\"http://ghbtns.com/github-btn.html?user=bitovi&repo=canjs&type=watch&count=true\"\n\t\t        allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"110\" height=\"20\"></iframe>\n\t\t<iframe src=\"http://ghbtns.com/github-btn.html?user=bitovi&repo=canjs&type=fork&count=true\"\n\t\t        allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"95\" height=\"20\"></iframe>\n\t\t</div><!-- center -->");___v1ew.push("\n\t\t\n\t</div><!-- categories -->\n\t\t\t\n\t<div class=\"posts\">\n\t\t<div class=\"bithub-content\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("issues",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/githubIssue.mustache'] ? can.Mustache.renderPartial(options.partials['templates/githubIssue.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/githubIssue.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("issues",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n\t\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</div>\n\t</div>\n\t\n\t<br class=\"clear\" />\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_plugin_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"bithub-post\">\n\t<!-- Commented out b/c it doesn't make sense without the ability to vote up, which we can't do yet. //TG -->\n\t<!-- <div class=\"pull-left score\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("points",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div> --> \n\t\n\t<h2><a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("title",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></h2>\n\t<p>");___v1ew.push(can.view.txt(1,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("body",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("<a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("+</a></p>\n\t<div class=\"bithub-footer\"><a href=\"http://bithub.com/users/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("actorID",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("author",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a> / ");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("formatDate",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("date",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" via <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("feed",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></div>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_pluginsTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description plugins\">\n\t<div class=\"pull-right categories\">\n\t\t<a href=\"http://bithub.com/app/\" class=\"button\">+ Add your App</a>\n\t\t<ul>\n\t\t\t<li><a href=\"http://bithub.com/article/\">Articles</a></li>\n\t\t\t<li><a href=\"http://bithub.com/app/\">Apps</a></li>\n\t\t\t<li><a href=\"http://bithub.com/plugin/\">Plugins</a></li>\n\t\t</ul>\n\t</div>\n\t<div class=\"posts\">\n\t\t<h1>Top Articles, Apps, &amp; Plugins</h1>\n\t\t<div class=\"bithub-content\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("plugins",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/plugin.mustache'] ? can.Mustache.renderPartial(options.partials['templates/plugin.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/plugin.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("plugins",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n\t\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</div>\n\t</div>\n\t<br class=\"clear\" />\n</div><!-- .tab-description -->");; return ___v1ew.join('')}} }));
can.view.preload('templates_socialStats_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"container\">\n  <ul class=\"social-stats\">\n  \t");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("<li class=\"commits\"><a href=\"community.html#!github\">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" recent ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plural",{context:___st4ck(___c0nt3xt,this),options:options},true,false),'commit',can.Mustache.get("commits",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push("</a></li>");return ___v1ew.join("");}}])}));___v1ew.push("\n  \t");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("plugins",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("<li class=\"plugins\"><a href=\"community.html#!plugins\">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plugins",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plural",{context:___st4ck(___c0nt3xt,this),options:options},true,false),'plugin',can.Mustache.get("plugins",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" submitted</a></li>");return ___v1ew.join("");}}])}));___v1ew.push("\n    ");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("apps",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("<li class=\"apps\"><a href=\"community.html#!plugins\">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("apps",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plural",{context:___st4ck(___c0nt3xt,this),options:options},true,false),'app',can.Mustache.get("apps",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" submitted</a></li>");return ___v1ew.join("");}}])}));___v1ew.push("\n    ");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("posts",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("<li class=\"forums\"><a href=\"community.html#!forums\">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("posts",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" new forum ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plural",{context:___st4ck(___c0nt3xt,this),options:options},true,false),'post',can.Mustache.get("posts",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push("</a></li>");return ___v1ew.join("");}}])}));___v1ew.push("\n    ");___v1ew.push(can.view.txt(0,'ul',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("if",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("articles",{context:___st4ck(___c0nt3xt,this),options:options},false,true),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("<li class=\"irc\"><a href=\"community.html#!plugins\">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("articles",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push(" recent ");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("plural",{context:___st4ck(___c0nt3xt,this),options:options},true,false),'article',can.Mustache.get("articles",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push("</a></li>");return ___v1ew.join("");}}])}));___v1ew.push("\n  </ul>\n</div><!-- .container -->");; return ___v1ew.join('')}} }));
can.view.preload('templates_tweet_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"bithub-post tweet\">\n\t<!-- Commented out b/c it doesn't make sense without the ability to vote up, which we can't do yet. //TG -->\n\t<!-- <div class=\"pull-left score\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("points",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</div> --> \n\t\n\t<div class=\"twitter-profile-pic pull-left\">\n\t\t<a href=\"http://twitter.com/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("handle",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push("<img src=\"");___v1ew.push(can.view.txt(1,'img','src',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("picture",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\" alt=\"\"",can.view.pending(),"/>");___v1ew.push("</a>\n\t</div>\n\t<h5><a class=\"name\" href=\"http://twitter.com/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("handle",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("realName",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a><a class=\"handle\" href=\"http://twitter.com/");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("handle",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(" @");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("handle",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></h5>\n\t<p>");___v1ew.push(can.view.txt(1,'p',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("body",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</p>\n\t<div class=\"bithub-footer\">");___v1ew.push(can.view.txt(1,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("formatDate",{context:___st4ck(___c0nt3xt,this),options:options},true,false),can.Mustache.get("date",{context:___st4ck(___c0nt3xt,this),options:options},false,true));}));___v1ew.push(" via <a href=\"");___v1ew.push(can.view.txt(1,'a','href',this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("link",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'a',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},null,can.Mustache.get("feed",{context:___st4ck(___c0nt3xt,this),options:options},false,false));}));___v1ew.push("</a></div>\n</div>");; return ___v1ew.join('')}} }));
can.view.preload('templates_twitterTab_mustache',can.Mustache(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];var ___c0nt3xt = this && this.___st4ck3d ? this : [];___c0nt3xt.___st4ck3d = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck3d ? [context] : context;} else if (!context.___st4ck3d) {s = [self, context];} else if (context && context === self && context.___st4ck3d) {s = context.slice(0);} else {s = context && context.___st4ck3d ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck3d = true) && s;};___v1ew.push("<div class=\"tab-description twitter\">\n\t<div class=\"pull-right categories\">\n\t\t<a href=\"http://twitter.com/canjs\" class=\"button\"><span class=\"icon-twitter\"></span> Follow on Twitter</a>\n\t</div><!-- categories -->\n\t<div class=\"posts\">\n\t\t<h1>Recent CanJS Tweets</h1>\n\t\t<div class=\"bithub-content\">");___v1ew.push("\n");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"#",can.Mustache.get("tweets",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\t\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return options.partials && options.partials['templates/tweet.mustache'] ? can.Mustache.renderPartial(options.partials['templates/tweet.mustache'],___st4ck(___c0nt3xt,this).pop(),options) : can.Mustache.render('templates/tweet.mustache', ___st4ck(___c0nt3xt,this))}));___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t\t");___v1ew.push(can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt({context:___st4ck(___c0nt3xt,this),options:options},"^",can.Mustache.get("tweets",{context:___st4ck(___c0nt3xt,this),options:options},false,false),[{_:function(){return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];___v1ew.push("\n\t\t\t<div class=\"loading\"/>");___v1ew.push("\n");return ___v1ew.join("");}}])}));___v1ew.push("\t\t</div>\n\t</div>\n\t<br class=\"clear\" />\n</div>");; return ___v1ew.join('')}} }));
})(this);
(function() {
	Bitovi.OSS.initTwitterWidgets = function() {
		if($('.twitter-follow-button').length) {
			// replace the "Follow @canjs!" link with a little wiget with follower count.
			$('#twitter-wjs').remove();
			!function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (!d.getElementById(id)) {
					js = d.createElement(s);
					js.id = id;
					js.src = "//platform.twitter.com/widgets.js";
					fjs.parentNode.insertBefore(js, fjs);
				}
			}(document, "script", "twitter-wjs");
		}
	};

	Bitovi.OSS.redrawFont = function() {
		var style = $('<style>:before,:after{content:none !important}</style>');
		$('head').append(style);

		window.setTimeout(function() {
			style.remove();
		}, 0);
	};
})();
