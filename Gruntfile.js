module.exports = function(grunt){
  const devPort        = 9200,
    connectPort        = 9287;

  require('load-grunt-tasks')(grunt);

  var baseUrl = 'https://unknown.cartographe.io/';
    md5Filenames = {};

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
      ]
    },
    less: {
      default: {
        options: {
          banner: '/* GENERATED FROM LESS */\n',
          sourceMap: true,
          ieCompat: true
        },
        files: [{
          '.public/css/cards.css': ['src/less/cards.less']
        }]
      },
      extern: {
        files: [{
          '.public/css/extern.css': ['src/less/font-awesome/font-awesome.less',
                                     'src/less/bootstrap/bootstrap.less']
        }]
      }
    },
    cssmin: {
      options: {
      },
      target: {
        files: {
          'docs/css/cards.css': ['.public/css/cards.css']
        }
      }
    },
    connect: {
      options: {
        port: connectPort,
        hostname: 'localhost'
      },
      local: {
        options: {
          base: ['.public'],
          port: 9200,
          open: true,
          livereload: 29976
        }
      }
    },
    copy: {
      dev_index: {
        src: 'src/index.html', dest: '.public/index.html',
        options: {
          process: function (content) {
            content = content.replace(/%BASE_PATH%/g, '');
            content = content.replace(/%DEPENDENCIES%/g, '<script src="config.js"></script>');
            return content;
          }
        }
      },
      dev: {
        files: [{
          expand: true, dot: true,
          cwd: 'src', dest: '.public',
          src: [
            'img/**/*',
            'fonts/**/*'
          ]
        }]
      },
      dist: {
        files: [{
          expand: true, dot: true,
          cwd: '.public', dest: 'docs',
          src: [
            'css/font-awesome.min.css',
            'css/cards.css',
            'img/**/*',
            'favicon.ico',
            'lib/system.js'
          ]
        }]
      },
      distIndex: {
        src: 'index.html', dest: 'docs/index.html',
        options: {
          process: function (content) {
            content = content.replace(/%BASE_PATH%/g, baseUrl);
            content = content.replace(/%DEPENDENCIES%/g,
                '<script src="' + baseUrl + '/js/'+ md5Filenames['libs.js'] +'"></script>\n' +
                '    <script src="' + baseUrl + '/js/' + md5Filenames['cards.js'] + '"></script>');
            return content;
          }
        }
      }
    },
    symlink: {
      dev: {
        files: [{
          expand: true,
          overwrite: true,
          cwd: 'src',
          src: ['data','img','js','config.js'],
          dest: '.public'
        }]
      }
    },
    md5: {
      bundle: {
        files: {
          'docs/js/': 'tmp/*.js'
        },
        options: {
          keepBasename: true,
          keepExtension: true,
          afterEach: function (fileChange) {
            var oldName = fileChange.oldPath.substring(fileChange.oldPath.lastIndexOf('/')+1);
            var newName = fileChange.newPath.substring(fileChange.newPath.lastIndexOf('/')+1);
            md5Filenames[oldName] = newName;
          }
        }
      }
    },
    shell: {
      bundle: {
        command: [
          'jspm bundle js/cards.js - jquery - moment - svg.js - jspdf tmp/cards.js --minify --skip-source-maps',
          'jspm bundle jquery + moment + svg.js + jspdf tmp/libs.js --minify --skip-source-maps'
        ].join('&&')
      }
    },
    usage: {
      options: {
        'title': 'Cartographe\n',
        'taskGroups': [{
          'header': 'Release tasks',
          'tasks': ['release']
        },{
          'header': 'Dev tasks',
          'tasks': ['dev']
        }],
        'taskDescriptionOverrides': {
          'dev': 'Runs livereload development server.'
        }
      }
    },
    watch: {
      options: {
        livereload: 29976
      },
      html: {
        files: ['src/index.html'],
        tasks: ['copy:dev_index']
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['copy:dev']
      },
      css: {
        files: ['src/less/*.less'],
        tasks: ['less']
      }
    }
  });

  grunt.registerTask('release', ['less', 'cssmin', 'shell:bundle', 'copy:dist', 'md5', 'copy:distIndex']);
  grunt.registerTask('dev', ['symlink', 'less', 'copy:dev', 'copy:dev_index', 'connect:local', 'watch']);
  grunt.registerTask('default', ['usage']);
};
