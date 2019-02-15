var assert = require('assert');
var util = require('util');

var t = require('../index.js');
$label = t.$label;
$return = t.$return;
$rethrow = t.$rethrow;

describe('test1', () => {
    it('passed', () => {

        // [[function, result | undefined]]
        // null result means 'must throw an error'
        var tests = [
            [() => {
                var r = $label("foo", () => {

                    var tmp = $label("bar", () => {
                        $label("baz", () => {
                            $return("bar", 1);
                            throw 'unreachable';
                        });

                        throw 'unreachable';
                    });

                    $return("foo", tmp);
                    throw 'unreachable';
                });

                return r;
            }, 1],

            // $return - usage with numbers
            // First argument is a number of nested functions to return from.
            // Second argument is a value
            [() => $label(() => {
                $return(1, 2);
            }), 2],

            [() => $label(() => {
                $label(() => {
                    $return(2, 3);
                });
            }), 3],

            [() => $label(() => {
                $label(() => {
                    $label(() => {
                        $return(3, 4);
                    });
                });
            }), 4],

            [() => $label(() => {
                $label(() => {
                    $label(() => {
                        $label(() => {
                            $return(4, 5);
                        });
                    });
                });
            }), 5],

            [() => $label(() => {
                $label(() => {
                    $label(() => {
                        $label(() => {
                            $label(() => {
                                $return(5, 6);
                            });
                        });
                    });
                });
            }), 6],

            // $return - labeled functions
            [() => $label('a', () => {
                $label('b', () => {
                    $label('c', () => {
                        $label('d', () => {
                            $label('e', () => {
                                $return('a', 7);
                            });
                            throw 'unreachable';
                        });
                        throw 'unreachable';
                    });
                    throw 'unreachable';
                });
                throw 'unreachable';

            }), 7],

            // The next three examples do the same thing.
            [() => $label('a', () => {
                // ^
                // | returning here
                return $label('b', () => {
                    $label('c', () => {
                        $label('d', () => {
                            $label('e', () => {
                                $return('b', 8);
                            });
                        });
                    });
                });
            }), 8],

            [() => $label('a', () => {
                $return(1, $label('b', () => {
                    $label('c', () => {
                        $label('d', () => {
                            $label('e', () => {
                                $return('b', 9);
                            });
                            throw 'unreachable';

                        });
                        throw 'unreachable';

                    });
                    throw 'unreachable';
                }));
                throw 'unreachable';
            }), 9],

            [() => $label('a', () => {
                $return('a', $label('b', () => {
                    $label('c', () => {
                        $label('d', () => {
                            $label('e', () => {
                                $return('b', 9);
                            });
                        });
                    });
                }));
            }), 9],

            [() => $label('a', () => {
                $label('b', () => {
                    $label('c', () => {
                        $label('d', () => {
                            $label('e', () => {
                                // return from the outermost function
                                $return('a', 9);
                                throw 0;
                            });
                            throw 1;
                        });
                        throw 2;
                    });
                    throw 3;
                });
            }), 9],

            // interpret single argument as return value,
            [() => $label('a', () => {
                $return(10);
            }), 10],

            [() => $label(() => {
                $return($label(() => {
                    $return($label(() => {
                        $return(11);
                    }));
                }));
            }), 11],

            [() => $label(() => {
                $return($label(() => {
                    $return($label(() => {
                        $return($label(() => {
                            $return(12);
                        }));
                    }));
                }));
            }), 12],

            [() => $label(() => {
                $return($label(() => {
                    $return($label(() => {
                        $return($label(() => {
                            $return($label(() => {
                                $return(13);
                            }));
                        }));
                    }));
                }));
            }), 13],

            // try blocks

            // $rethrow
            [() => {
                try {
                    throw "foo";
                } catch (e) {
                    $rethrow(e);
                    return "bar";
                }
            }, "bar"],

            [() => {
                return $label('bar', () => {
                    try {
                        $return('bar', 'baz');
                    } catch (e) {
                        $rethrow(e);
                        return false;
                    }
                });
            }, "baz"],

            // code from README

            [() => {
                var tmp;
                (() => {
                    (() => {
                        tmp = "foo";
                        return;
                    })();

                    if (typeof tmp != 'undefined') {
                        return;
                    }

                    // unreachable if `tmp` is set
                })();

                if (typeof tmp != 'undefined') {
                    return 1;
                }

                // unreachable if `tmp` is set
            }, 1],

            [() => {
                return $label('example', () => {
                    (() => {
                        (() => {
                            $return('example', 'some_value');
                        })();
                    })();
                });
            }, 'some_value'],

            // no_call

            // mustn't throw
            [() => {
                var f = $label('foo', true, () => {
                    $return('bar', 1);
                });
                return 1;
            }, 1],

            // return `undefined` literally
            [() => {
                var tmp = $label('foo', () => {
                    $return('foo', undefined);
                });
                return tmp;
            }, undefined],

            // $return: number as argument
            [() => {
                var tmp = $label(() => {
                    $return(1.0, 'value'); // 1.0 is still correct
                });
                return tmp;
            }, 'value'],

            [() => {
                var tmp = $label(() => {
                    $return(1.1, 'value'); // must throw: 1.1 is not a natural
                });
                return tmp;
            }, null],

            [() => {
                var tmp = $label(() => {
                    $return(-1, 'value'); // must throw: number is <= 0
                });
                return tmp;
            }, null],

            [() => {
                var tmp = $label(() => {
                    $return(0, 'value'); // must throw: number is <= 0
                });
                return tmp;
            }, null],

            [() => {
                try {
                    $return('foo', '1');
                } catch (e) {
                    return e + '';
                }
            }, "This exception was thrown by reto-js library. Maybe you forgot to add a $label() or use $rethrow() in a catch block? Check out README for more info."]
        ];

        for (var [fun, res] of tests) {
            if (res !== null) {
                assert.deepStrictEqual(fun(), res);
                console.log('passed:', util.inspect(res), ' is result of', fun);
            } else {
                console.log('passed:', fun, 'throws');
                assert.throws(fun);
            }
        }
    });
});
