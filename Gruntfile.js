module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        mochaTest: {
            all: {
                options: {
                    reporter: 'spec',
                    noFail: false
                },
                src: ['test/*.js']
            }
        },
    });

    grunt.registerTask('test', ['mochaTest:all']);
}
