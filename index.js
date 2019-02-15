const TO = Symbol('TO');
const VALUE = Symbol('VALUE');

class RetoException extends Error {
    constructor (to, value) {
        super();
        this[TO] = to;
        this[VALUE] = value;
        this.toString = () => "This exception was thrown by reto-js library. \
Maybe you forgot to add a $label() or use $rethrow() in a catch block? \
Check out README for more info.";
    }
}

// $label is used to mark the given function with a string.
function $label () {
    let label, fun, dontCall = false;

    // Dealing with arguments.
    // Order of arguments is completely ignored since each argument has it's own type.
    [].forEach.call(arguments, (arg) => {
        switch (typeof arg) {
            case 'function':
                fun = arg;
                break;
            case 'boolean':
                dontCall = arg;
                break;
            case 'string':
                label = arg;
                break;
        }
    });

    if (typeof fun === 'undefined') {
        throw "reto-js: wrong arguments for $label";
    }

    const func = function () {
        try {
            return fun();
        } catch (e) {
            if (e instanceof RetoException) {
                if (e[TO] === label || e[TO] === 1) {
                    return e[VALUE];
                }
                if (typeof e[TO] === 'number')
                    e[TO]--;
            }
            throw e;
        }
    };

    return dontCall ? func : func();
}

function validate$ReturnArg (to) {
}

function $return (fst, snd) {
    var to, value;

    // read arguments
    if (arguments.length >= 2) {
        to = fst; value = snd;
    } else {
        to = 1; value = fst;
    }

    // check arguments
    const message = "reto-js: wrong arguments for $return";
    if (typeof to === 'number') {
        // Only natural numbers are allowed.
        if (to % 1 !== 0 || to < 1) {
            throw wrong_args + '$return';
        }
    } else if (typeof to !== 'string') {
        throw new Error(message);
    }

    throw new RetoException(to, value);
}

function $rethrow (e) {
    if (e instanceof RetoException && ['string', 'number'].includes(typeof e[TO])) {
        throw e;
    }
}


module.exports = { $label, $return, $rethrow };
