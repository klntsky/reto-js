// License: MIT
// Check out test/ dir for examples of usage.

module.exports = { $label: $label,
                   $return: $return,
                   $rethrow: $rethrow };

const wrong_args = "reto.js: wrong arguments for ";

// $label is used to mark a given function with a text string.
function $label () {

    var label, fun, no_call;

    // Dealing with arguments.
    // Order of arguments is completely ignored since each element has it's own type.
    Array.from(arguments).map((arg) => {
        switch (typeof arg) {
            case 'function':
                fun = arg;
                break;
            case 'boolean':
                no_call = arg;
                break;
            case 'string':
                label = arg;
                break;
        }
    });

    if (typeof fun === 'undefined') {
        throw wrong_args + '$label';
    }

    var ret = function () {
        try {
            return fun ();
        } catch (e) {
            if (typeof e.__RETO_TO__ === 'string') {
                if (e.__RETO_TO__ === label) {
                    return e.__RETO_VALUE__;
                }
            } else if (typeof e.__RETO_TO__ === 'number') {
                if (e.__RETO_TO__ === 1) {
                    return e.__RETO_VALUE__;
                }
                e.__RETO_TO__--;
            }
            throw e;
        }
    };

    return no_call ? ret : ret();
}

function $return (fst, snd) {
    var to, value;

    if (arguments.length >= 2) {
        to = fst; value = snd;
    } else {
        to = 1; value = fst;
    }

    if (typeof to === 'number') {
        // Only natural numbers are allowed.
        if (to % 1 !== 0 || to < 1) {
            throw wrong_args + '$return';
        }
    } else if (typeof to !== 'string') {
        throw wrong_args + '$return';
    }

    var exc = { __RETO_TO__: to,
                __RETO_VALUE__: value };
    exc.toString = () => "This exception was thrown by reto-js library. Maybe you forgot to add a $label() or use $rethrow() in a catch block? Check out the README for more info.";
    throw exc;
}

function $rethrow (e) {
    if (['string', 'number'].includes(typeof e.__RETO_TO__)) {
        throw e;
    }
}
