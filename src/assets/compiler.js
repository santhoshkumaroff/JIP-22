BrowserFS.configure({ fs: "IndexedDB", options: {} }, function (err) {
    var greetings = 'GIT Web Terminal\nuse [[;#fff;]help] to see available commands' +
        ' or [[;#fff;]credits] to list of projects used\n' + 
        'Check [[!;;;;https://jcubic.github.io/git/]latest version]\n'
    var name = 'git';
    if (err) {
        return $('.term').terminal(function(command, term) {
            term.error('BrowserFS was not initialized');
        }, {greetings,name}).error(err.message || err);
    }
    window.fs = BrowserFS.BFSRequire("fs");
    window.path = BrowserFS.BFSRequire("path");
    var dir = '/';
    var cwd = '/';
    var credentials = {};
    var branch;
    // -----------------------------------------------------------------------------------------------------
    function color(name, string) {
        var colors = {
            blue:   '#55f',
            green:  '#4d4',
            grey:   '#999',
            red:    '#A00',
            yellow: '#FF5',
            violet: '#a320ce',
            white:  '#fff'
        }
        if (colors[name]) {
            return '[[;' + colors[name] + ';]' + string + ']';
        } else {
            return string;
        }
    }
    // -----------------------------------------------------------------------------------------------------
    function list(path) {
        term.pause();
        return listDir(path).then((list) => (term.resume(), list));
    }
    // -----------------------------------------------------------------------------------------------------
    function gitroot(cwd) {
        return git.findRoot({fs, filepath: cwd});
    }
    // -----------------------------------------------------------------------------------------------------
    async function gitBranch() {
        try {
            var dir = await gitroot(cwd);
            var ref = await git.resolveRef({fs, dir, ref: 'HEAD', depth: 1});
            return ref.match(/ref: refs\/heads\/(.*)/)[1];
        } catch(e) {
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // return path for cd
    function get_path(string) {
        var path = cwd.replace(/^\//, '').split('/');
        if (path[0] === '') {
            path = path.slice(1);
        }
        var parts = string === '/'
        ? string.split('/')
        : string.replace(/\/?[^\/]*$/, '').split('/');
        if (parts[0] === '') {
            parts = parts.slice(1);
        }
        if (string === '/') {
            return [];
        } else if (string.startsWith('/')) {
            return parts;
        } else if (path.length) {
            return path.concat(parts);
        } else {
            return parts;
        }
    }
    // -----------------------------------------------------------------------------------------------------
    function read(cmd, cb, raw) {
        var filename = typeof cmd === 'string' ? cmd : cmd.args.length == 1 ? cwd + '/' + cmd.args[0] : null;
        if (filename) {
            fs.readFile(filename, function(err, data) {
                if (err) {
                    term.error(err.message);
                } else {
                    var text;
                    var m = filename.match(/\.([^.]+)$/);
                    if (m) {
                        var language = m[1];
                    }
                    if (!raw && language && Prism.languages[language]) {
                        var grammar = Prism.languages[language];
                        var tokens = Prism.tokenize(data.toString(), grammar);
                        text = Prism.Token.stringify(tokens, language);
                    } else {
                        text = data.toString();
                    }
                    cb(text);
                }
            });
        }
    }
    // -----------------------------------------------------------------------------------------------------
    function split_args(args) {
        return {
            options: args.filter(arg => arg.match(/^-/)).join('').replace(/-/g, ''),
            args: args.filter(arg => !arg.match(/^-/))
        };
    }
    // -----------------------------------------------------------------------------------------------------
    function processGitFiles(files) {
        return gitroot(cwd).then((dir) => {
            var re = new RegExp('^' + dir + '/');
            return {
                files: files.map(filepath => path.resolve(cwd + '/' + filepath).replace(re, '')),
                dir
            };
        }); 
    }
    // -----------------------------------------------------------------------------------------------------
    function getOption(option, args) {
        option = args.reduce((acc, arg) => {
            if (typeof acc == 'string') {
                return acc;
            } else if (acc === true) {
                return arg;
            } else if (option instanceof RegExp ? arg.match(option) : arg === option) {
                return true;
            }
            return false;
        }, false);
        return option === true ? false : option;
    }
    // -----------------------------------------------------------------------------------------------------
    function getAllStats({fs, branch}) {
        function notGitDir(name) {
            return !name.match(/^\.git\/?/);
        }
        return gitroot(cwd).then((dir) => {
            return Promise.all([listBranchFiles(fs, dir, branch), listDir(dir)]).then(([tracked, rest]) => {
                var re = new RegExp('^' + dir);
                rest = rest.files.map(path => path.replace(re, ''));
                return Promise.all(union(tracked, rest).filter(notGitDir).map(filepath => {
                    return git.status({fs, dir, filepath}).then(status => {
                        return [filepath, status];
                    });
                }));
            });
        });
    }
    // -----------------------------------------------------------------------------------------------------
    function gitAddAll({fs, dir, branch}) {
        return getAllStats({fs, cwd: dir, branch}).then((files) => {
            return files.filter(([_, status]) => !status.includes(['unmodified', 'ignored']));
        }).then((files) => {
            return Promise.all(files.map(([filepath]) => git.add({fs, dir, filepath})));
        });
    }
    const error = (e) => term.error(e.message || e).resume();
    var commands = {
        cd: function(cmd) {
            if (cmd.args.length === 1) {
                var dirname = path.resolve(cwd + '/' + cmd.args[0]);
                term.pause();
                fs.stat(dirname, (err, stat) => {
                    if (err) {
                        term.error("Directory don't exits").resume();
                    } else if (stat.isFile()) {
                        term.error(`"${dirname}" is not directory`).resume();
                    } else {
                        cwd = dirname == '/' ? dirname : dirname.replace(/\/$/, '');
                        gitBranch().then(b => {
                            branch = b;
                            term.resume();
                        });
                    }
                });
            }
        },
        vi: function(cmd) {
            var textarea = $('.vi');
            var editor;
            var fname = cmd.args[0];
            term.focus(false);
            if (fname) {
                var path;
                if (fname.match(/^\//)) {
                    path = fname;
                } else {
                    path = cwd + '/' + fname;
                }
                function open(file) {
                    // we need to replace < and & because jsvi is handling html tags
                    // and don't work properly for raw text
                    textarea.val(file.replace(/</g, '&lt;').replace(/&/g, '&amp;'));
                    editor = window.editor = vi(textarea[0], {
                        color: '#ccc',
                        backgroundColor: '#000',
                        onSave: function() {
                            var file = textarea.val().replace(/&amp;/g, '&').replace(/&lt;/g, '<');
                            fs.writeFile(path, file, function(err, wr) {
                                if (err) {
                                    term.error(err.message);
                                }
                            });
                        },
                        onExit: term.focus
                    });
                }
                fs.stat(path, (err, stat) => {
                    if (stat && stat.isFile()) {
                        read(cmd, open, true);
                    } else {
                        var dir = path.replace(/[^\/]+$/, '');
                        fs.stat(dir, (err, stat) => {
                            if (stat && stat.isDirectory()) {
                                open('')
                            } else if (err) {
                                term.error(err.message);
                            } else {
                                term.error(`${dir} directory don't exists`);
                            }
                        });
                    }
                });
            }
        },
        cat: function(cmd) {
            read(cmd, term.echo);
        },
        less: function(cmd) {
            read(cmd, term.less.bind(term));
        },
        ls: function(cmd) {
            var {options, args} = split_args(cmd.args);
            function filter(list) {
                if (options.match(/a/)) {
                    return list;
                } else if (options.match(/A/)) {
                    return list.filter(name => !name.match(/^\.{1,2}$/));
                } else {
                    return list.filter(name => !name.match(/^\./));
                }
            }
            list(cwd + '/' + (args[0] || '')).then((content) => {
                var dirs = filter(['.', '..'].concat(content.dirs)).map((dir) => color('blue', dir));
                term.echo(dirs.concat(filter(content.files)).join('\n'));
            });
        },
        clean: function() {
            term.push(function(yesno) {
                if (yesno.match(/^y(es)?$/i)) {
                    fs.getRootFS().empty();
                }
                if (yesno.match(/^(y(es)?|n(o)?)$/i)) {
                    term.pop();
                }
            }, {
                prompt: 'are you sure you want clean File System [Y/N]? '
            });
        },
        rm: function(cmd) {
            var {options, args} = split_args(cmd.args);
            
            var len = args.length;
            if (len) {
                term.pause();
            }
            args.forEach(arg => {
                var path_name = path.resolve(cwd + '/' + arg);
                fs.stat(path_name, (err, stat) => {
                    if (err) {
                        term.error(err);
                    } else if (stat) {
                        if (stat.isDirectory()) {
                            if (options.match(/r/)) {
                                rmDir(path_name);
                            } else {
                                term.error(`${path_name} is directory`);
                            }
                        } else if (stat.isFile()) {
                            fs.unlink(path_name);
                        } else {
                            term.error(`${path_name} is invalid`)
                        }
                        if (!--len) {
                            term.resume();
                        }
                    }
                });
            });
        },
        git: {
            push: function(cmd) {
                if (credentials.username && credentials.password) {
                    term.pause();
                    var emitter = new EventEmitter();
                    emitter.on('message', (message) => {
                        term.echo(message);
                    });
                    gitroot(cwd).then(dir => {
                        return git.push({
                            fs,
                            dir,
                            ref: branch,
                            authUsername: credentials.username,
                            authPassword: credentials.password,
                            emitter
                        });
                    }).then(term.resume).catch(error);
                } else {
                    term.error('You need to call `git login` to set username and password before push');
                }
                
            },
            commit: function(cmd) {
                cmd.args.shift();
                gitroot(cwd).then(dir => {
                    var all = !!cmd.args.filter(arg => arg.match(/^-.*a/)).length;
                    if (all) {
                        return Promise.all([dir, gitAddAll({fs, dir, branch})]);
                    }
                    return [dir];
                }).then(([dir]) => {
                    var message = getOption(/-.*m$/, cmd.args);
                    var name = credentials.fullname || credentials.username;
                    if (!message) {
                        term.echo('TODO: edit using vi');
                    } else if (!name) {
                        term.error('You need to use git login first');
                    } else {
                        return git.commit({fs, dir, author: {
                            email: credentials.email,
                            name
                        }, message});
                    }
                }).catch(error);
            },
            add: function(cmd) {
                term.pause();
                cmd.args.shift();
                var all = cmd.args.filter(arg => arg.match(/^(-A|-all)$/)).length;
                if (all) {
                    gitroot(cwd).then(dir => {
                        return gitAddAll({fs, dir, branch});
                    }).then(term.resume).catch(error);
                } else if (cmd.args.length > 0) {
                    processGitFiles(cmd.args).then(({files, dir}) => {
                        return Promise.all(files.map(filepath => git.add({fs, dir, filepath})));
                    }).then(term.resume).catch(error);
                } else {
                    term.resume();
                }
            },
            rm: function(cmd) {
                cmd.args.shift();
                var long_options = cmd.args.filter(name => name.match(/^--/));
                var {args, options} = split_args(cmd.args.filter(name => !name.match(/^--/)));
                var len = args.length;
                if (!len) {
                    term.error('Nothing to remove');
                } else {
                    term.pause();
                    gitroot(cwd).then((dir) => {
                        var re = new RegExp('^' + dir + '/');
                        args.forEach(arg => {
                            var path_name = path.resolve(cwd + '/' + arg);
                            fs.stat(path_name, (err, stat) => {
                                if (err) {
                                    term.error(err);
                                } else if (stat) {
                                    var filepath = path_name.replace(re, '');
                                    if (stat.isDirectory()) {
                                        var promise = git.listDir({fs, dir}).then((list) => {
                                            var files = list.filter(name => name.startsWith(filepath));
                                            return Promise.all(files.map(file => git.remove({fs, dir, filepath})));
                                        }).catch(err => term.error(err));
                                        if (options.match(/r/)) {
                                            if (!long_options.includes(/--cached/)) {
                                                promise.then(() => rmDir(path_name));
                                            }
                                        } else {
                                            term.error(`${path_name} is directory`);
                                        }
                                    } else if (stat.isFile()) {
                                        if (!long_options.includes(/--cached/)) {
                                            git.remove({fs, dir, filepath}).then(() => fs.unlink(path_name));
                                        } else {
                                            git.remove({fs, dir, filepath})
                                        }
                                    }
                                } else {
                                    term.error('uknown error');
                                }
                                if (!--len) {
                                    term.resume();
                                }
                            });
                        });
                    });
                }
            },
            login: function() {
                var questions = [
                    {name: 'username'},
                    {name: 'password', mask: true},
                    {name: 'fullname'},
                    {name: 'email'}
                ]
                term.echo('This will not authenticate to test if login/password are correct,\n'+
                          'only save credentials in localStorage (expect password) and use them when push/clone/commit');
                var history = term.history();
                history.disable();
                (function loop() {
                    var question = questions.shift();
                    if (!question) {
                        history.enable();
                    } else {
                        var name = question.name;
                        term.push(answer => {
                            credentials[name] = answer;
                            if (!question.mask) {
                                localStorage.setItem('git_' + name, answer);
                            }
                            term.pop();
                            loop();
                        }, {
                            prompt: name + ': ',
                            name: 'read'
                        }).set_mask(!!question.mask);
                        if (!question.mask) {
                            term.insert(localStorage.getItem('git_' + name) || '');
                        }
                    }
                })();
            },
            status: function(cmd) {
                var dir = cwd.split('/')[1];
                term.pause();
                getAllStats({fs, branch}).then((files) => {
                    function filter(files, name) {
                        if (name instanceof Array) {
                            return files.filter(([_, status]) => name.includes(status));
                        }
                        return files.filter(([_, status]) => status === name);
                    }
                    function not(files, name) {
                        if (name instanceof Array) {
                            return files.filter(([_, status]) => !name.includes(status));
                        }
                        return files.filter(([_, status]) => status !== name);
                    }
                    var changes = not(files, ['unmodified', 'ignored']);
                    if (!changes.length) {
                        git.log({fs, dir, depth: 2, ref: branch}).then((commits) => {
                            term.echo(`On branch ${branch}`);
                            if (commits.length == 2) {
                                term.echo('nothing to commit, working directory clean\n');
                            } else {
                                // new repo
                                term.echo('nothing to commit (create/copy files and use "git add" to track)\n');
                            }
                            term.resume();
                        });
                    } else {
                        var label = {
                            'deleted':  'deleted:    ',
                            'added':    'new file:   ',
                            'modified': 'modified:   ',
                            'absent':   'deleted:    '
                        };
                        var padding = '        ';
                        var output = [`On branch ${branch}`];
                        function listFiles(files, colorname) {
                            return files.map(([name, status]) => {
                                return padding + color(colorname, label[status.replace(/^\*/, '')] + name);
                            });
                        }
                        var lines;
                        var to_be_added = filter(changes, ['added', 'modified', 'deleted']);
                        if (to_be_added.length) {
                            lines = [
                                'Changes to be committed:',
                                '  (use "git rm --cached <file>..." to unstage)',
                                ''
                            ];
                            lines = lines.concat(listFiles(to_be_added, 'green'));
                            output.push(lines.join('\n'));
                        }
                        var not_added = filter(changes, ['*modified', '*deleted', '*absent']);
                        if (not_added.length) {
                            lines = [
                                'Changes not staged for commit:',
                                '  (use "git add <file>..." to update what will be committed)',
                                '  (use "git checkout -- <file>..." to discard changes in working directory)',
                                ''
                            ];
                            
                            lines = lines.concat(listFiles(not_added, 'red'));
                            output.push(lines.join('\n'));
                        }
                        
                        var untracked = filter(changes, '*added');
                        if (untracked.length) {
                            lines = [
                                'Untracked files:',
                                '  (use "git add <file>..." to include in what will be committed)',
                                ''
                            ];
                            lines = lines.concat(untracked.map(([name, status]) => padding + color('red', name)));
                            output.push(lines.join('\n'));
                        }
                        if (output.length) {
                            term.echo(output.join('\n\n') + '\n');
                        }
                        term.resume();
                    }
                }).catch(error);
            },
            diff: function(cmd) {
                cmd.args.shift();
                term.pause();
                function diff({dir, filepath}) {
                    var fname = dir + '/' + filepath;
                    return new Promise(function(resolve, reject) {
                        fs.readFile(fname, function(err, newFile) {
                            if (err) {
                                return reject(err);
                            }
                            readBranchFile({fs, dir, branch, filepath}).then(oldFile => {
                                const diff = JsDiff.structuredPatch(filepath, filepath, oldFile, newFile);
                                const text = diff.hunks.map(hunk => {
                                    return hunk.lines.map(line => {
                                        if (color_name) {
                                            return color(color_name, line);
                                        } else {
                                            return line;
                                        }
                                    }).join('\n');
                                }).join('\n');
                                resolve({
                                    text,
                                    filepath
                                });
                            }).catch(err => reject(err));
                        });
                    })
                }
                function format(diff) {
                    const header = color('white', 'diff --git a/' + diff.filepath + ' b/' + diff.filepath);
                    return [header, diff.text].join('\n');
                }
                gitroot(cwd).then(dir => {
                    if (!cmd.args.length) {
                        return git.listFiles({dir,fs}).then(files => {
                            return Promise.all(files.map((filepath) => {
                                return git.status({fs, dir, filepath}).then(status => {
                                    if (['unmodified', 'ignored'].includes(status)) {
                                        return null;
                                    } else {
                                        return diff({dir, filepath});
                                    }
                                });
                            }));
                        }).then((diffs) => {
                            return diffs.filter(Boolean).reduce((acc, diff) => {
                                acc.push(format(diff));
                                return acc;
                            }, []).join('\n');
                        });
                    } else {
                        var re = new RegExp('^' + dir + '/?');
                        var filepath = fname.replace(re, '');
                        return diff({dir, filepath}).then(({diff}) => diff).then(format);
                    }
                }).then(text => {
                    if (text.length - 1 > term.cols()) {
                        term.less(text);
                    } else {
                        term.echo(text);
                    }
                    term.resume();
                }).catch(err => term.error(err.message).resume());
            },
            log: function(cmd) {
                var depth = getOption('-n', cmd.args);
                depth = depth ? +depth : false;
                gitroot(cwd).then(dir => {
                    function format(commit) {
                        var output = []
                        output.push(color('yellow', `commit ${commit.oid}`));
                        if (commit.author) {
                            output.push(`Author: ${commit.author.name} <${commit.author.email}>`);
                            var offset = commit.author.timezoneOffset * -1;
                            var t = (offset > 1 ? '+' : '-') + ('0' + (offset / 60).toString().replace('.', '') + '00').slice(-4);
                            var date = moment.utc((commit.author.timestamp + (offset * 60 )) * 1000)
                            .format('ddd MMM MM HH:mm:SS YYYY ') + t;
                            output.push(`Date: ${date}`);
                        }
                        output.push('');
                        output.push(`    ${commit.message}`);
                        return output.join('\n');
                    }
                    git.log({fs, dir, depth, ref: branch}).then(commits => {
                        var text = commits.map(format).join('\n\n');
                        if (text.length - 1 > term.cols()) {
                            term.less(text);
                        } else {
                            term.echo(text);
                        }
                    });
                });
            },
            clone: function(cmd) {
                var url = 'https://jcubic.pl/proxy.php?' + cmd.args[1];
                term.pause();
                var re = /\/([^\/]+)(\.git)?$/;
                var repo_dir = cmd.args.length === 3 ? cmd.args[2] : cmd.args[1].match(re)[1];
                fs.stat("/" + repo_dir, function(err, stat) {
                    if (err) {
                        fs.mkdir(repo_dir, function(err) { if (!err) { clone() }});
                    } else if (stat) {
                        if (stat.isFile()) {
                            term.error(`"${repo_dir}" is a file`);
                        } else {
                            fs.readdir("/" + repo_dir, function(err, list) {
                                if (list.length) {
                                    term.error(`"${repo_dir}" exists and is not empty`);
                                } else {
                                    clone();
                                }
                            })
                        }
                    }
                })
                var emitter = new EventEmitter();
                var index = null;
                emitter.on('message', (message) => {
                    if (message.match(/Compressing/)) {
                        if (index === null) {
                            term.echo(message);
                            index = term.last_index();
                        } else {
                            term.update(index, message)
                        }
                    } else {
                        term.echo(message);
                    }
                });
                function clone() {
                    term.echo(`Cloning into '${repo_dir}'...`);
                    git.clone({
                        fs: fs,
                        dir: repo_dir,
                        url: url,
                        depth: 1,
                        singleBranch: true,
                        emitter: emitter
                    }).then(() => {
                        term.echo(`clone complete`).resume();
                    }).catch(error);
                }
            }
        },
        credits: function() {
            var lines = [
                'Projects used with GIT Web Terminal:',
                '\t[[!;;;;https://isomorphic-git.github.io]isomorphic-git] v. ' + git.version() + ' by William Hilton',
                '\t[[!;;;;https://github.com/jvilk/BrowserFS]BrowserFS] by John Vilk',
                '\t[[!;;;;https://terminal.jcubic.pl]jQuery Terminal] v.' + $.terminal.version + ' by Jakub Jankiewicz',
                '\t[[!;;;;https://github.com/timoxley/wcwidth]wcwidth] by Jun Woong',
                '\t[[!;;;;https://github.com/inexorabletash/polyfill]keyboard key polyfill] by Joshua Bell',
                '\t[[!;;;;https://github.com/jcubic/jsvi]jsvi] originaly by Internet Connection, Inc. with changes from Jakub Jankiewicz',
                '\t[[!;;;;https://github.com/Olical/EventEmitter/]EventEmitter] by Oliver Caldwell',
                '\t[[!;;;;https://github.com/PrismJS/prism]PrimsJS] by Lea Verou',
                '\t[[!;;;;https://momentjs.com]Momentjs] v. ' + moment.version,
                '\t[[!;;;;https://github.com/kpdecker/jsdiff]jsdiff] by Kevin Decker'
            ];
            term.echo(lines.join('\n'));
        },
        help: function() {
            term.echo('List of commands: ' + Object.keys(commands).join(', '));
            term.echo('List of Git commands: ' + Object.keys(commands.git).join(', '));
            term.echo([
                'to use git you first need to clone the repo, it may take a while (depednig on the size),',
                'then you can made changes using [[;#fff;]vi], use [[;#fff;]git add] and then [[;#fff;]git commit].',
                'Before you commit you need to use new command [[b;#fff;]git login] that will ask for credentails,',
                'it also ask for fullname and email that is used in [[b;#fff;]git commit]. If you set correct',
                'username and password you can push to remote, it you type wrong credentials you can call login again'
            ].join('\n'));
        }
    };
    var term = $('.term').terminal(function(command, term) {
        var cmd = $.terminal.parse_command(command);
        if (commands[cmd.name]) {
            var action = commands[cmd.name];
            var args = cmd.args.slice();
            while (true) {
                if (typeof action == 'object' && args.length) {
                    action = action[args.shift()];
                } else {
                    break;
                }
            }
            if (action) {
                action.call(term, cmd);
            }
        }
    }, {
        completion: function(string, cb) {
            var cmd = $.terminal.parse_command(this.before_cursor());
            function processAssets(callback) {
                var dir = get_path(string);
                list('/' + dir.join('/')).then(callback);
            }
            function prepend(list) {
                if (string.match(/\//)) {
                    var path = string.replace(/\/[^\/]+$/, '').replace(/\/+$/, '');
                    return list.map((dir) => path + '/' + dir);
                } else {
                    return list;
                }
            }
            function trailing(list) {
                return list.map((dir) => dir + '/');
            }
            if (cmd.name !== string) {
                switch (cmd.name) {
                    // complete file and directories
                    case 'vi':
                    case 'less':
                        return processAssets(content => cb(prepend(trailing(content.dirs).concat(content.files))));
                    // complete directories
                    case 'ls':
                    case 'cd':
                        return processAssets(content => cb(prepend(trailing(content.dirs))));
                }
            }
            if (cmd.args.length) {
                var command = commands[cmd.name];
                if (command) {
                    var args = cmd.args.slice();
                    while (true) {
                        if (typeof command == 'object' && args.length > 1) {
                            command = command[args.shift()];
                        } else {
                            break;
                        }
                    }
                    if ($.isPlainObject(command)) {
                        cb(Object.keys(command));
                    }
                }
            } else {
                cb(Object.keys(commands));
            }
        },
        greetings,
        name,
        prompt: function(cb) {
            var path = color('blue', cwd);
            var b = branch ? ' &#91;' + color('violet', branch) + '&#93;' : '';
            cb([
                color('green', (credentials.username || 'anonymous') + '@gitwebterm'),
                ':',
                path,
                b,
                '$ '
            ].join(''));
        }
    });
});

function time() {
    var d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => ('0' + n).slice(-2)).join(':');
}
function listDir(path) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(err, dirList) {
            if (err) {
                return reject(err);
            }
            var result = {
                files: [],
                dirs: []
            };
            var len = dirList.length;
            if (!len) {
                resolve(result);
            }
            dirList.forEach(function(filename) {
                var file = (path === '/' ? '' : path) + '/' + filename;

                fs.stat(file, function(err, stat) {
                    if (stat) {
                        result[stat.isFile() ? 'files' : 'dirs'].push(filename);
                    }
                    if (!--len) {
                        resolve(result);
                    }
                });
            });

        });
    });
}

// source: https://stackoverflow.com/a/3629861/387194
function union(x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}
function intersection(a, b) {
    return a.filter(function(n) {
        return b.includes(n);
    });
}
// source: https://stackoverflow.com/a/31918120/387194
function rmdir(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
}
// prism overwrite to produce terminal formatting instead of html
(function(Token) {
    var _ = Prism;
    _.Token = function(type, content, alias, matchedStr, greedy) {
        Token.apply(this, [].slice.call(arguments));
    };
    _.Token.stringify = function(o, language, parent) {
        if (typeof o == 'string') {
            return o;
        }

        if (_.util.type(o) === 'Array') {
            return o.map(function(element) {
                return _.Token.stringify(element, language, o);
            }).join('');
        }

        var env = {
            type: o.type,
            content: Token.stringify(o.content, language, parent),
            tag: 'span',
            classes: ['token', o.type],
            attributes: {},
            language: language,
            parent: parent
        };

        if (env.type == 'comment') {
            env.attributes['spellcheck'] = 'true';
        }

        if (o.alias) {
            var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
            Array.prototype.push.apply(env.classes, aliases);
        }

        _.hooks.run('wrap', env);

        var attributes = Object.keys(env.attributes).map(function(name) {
            return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
        }).join(' ');
        return env.content.split(/\n/).map(function(content) {
            return '[[b;;;' + env.classes.join(' ') + ']' + $.terminal.escape_brackets(content) + ']';
        }).join('\n');

    };
})(Prism.Token);

async function listBranchFiles(fs, dir, branchName) {
    const repo = { fs, dir };
    const originBaseRef = 'refs/remotes/origin/';
    const sha = await git.resolveRef({ ...repo, ref: originBaseRef + branchName });
    const { object: { tree } } = await git.readObject({ ...repo, oid: sha });
    var list = [];
    return (async function readFiles(oid, path) {
        const { object: { entries } } = await git.readObject({ ...repo, oid});
        var i = 0;
        return (async function loop() {
            var entry = entries[i++];
            if (entry) {
                if (entry.type == "blob") {
                    list.push(Object.assign({}, entry, {
                        path: path.concat(entry.path).join('/')
                    }));
                } else if (entry.type == "tree" && entry.path !== ".git") {
                    await readFiles(entry.oid, path.concat(entry.path));
                }
                return loop();
            }
        })();
    })(tree, []).then(() => list.map((entry) => entry.path));
}

async function readBranchFile({ dir, fs, filepath, branch }) {
    const ref = 'refs/remotes/origin/' + branch;
    const sha = await git.resolveRef({ fs, dir,  ref });
    const { object: { tree } } = await git.readObject({ fs, dir, oid: sha });
    return (async function loop(tree, path) {
        if (!path.length) {
            throw new Error(`File ${filepath} not found`);
        }
        var name = path.shift();
        const { object: { entries } } = await git.readObject({ fs, dir, oid: tree });
        const packageEntry = entries.find((entry) => entry.path === name);
        if (!packageEntry) {
            throw new Error(`File ${filepath} not found`);
        } else {
            if (packageEntry.type == "blob") {
                const { object: pkg } = await git.readObject({ fs, dir, oid: packageEntry.oid })
                return pkg.toString('utf8');
            } else if (packageEntry.type == "tree") {
                return loop(packageEntry.oid, path);
            }
        }
    })(tree, filepath.split('/'));
}