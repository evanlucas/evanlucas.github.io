(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var utils = require('./utils')
var blacklist = ['_list', 'ctrlC']

function Commands() {
  if (!(this instanceof Commands))
    return new Commands()

  this.processlist = {}
  this._currentPid = 1
  this._buildProcessList()
  var keys = Object.keys(Commands.prototype)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    this[k] = this[k].bind(this)
  }
}

Commands.prototype._buildProcessList = function _buildProcessList() {
  var procs = [
    '/sbin/launchd'
  , '/sbin/github'
  , '/usr/libexec/watchdogd'
  , 'login -pfq evan /usr/bin/fish'
  , '-fish'
  ]

  for (var i=0, len=procs.length; i<len; i++) {
    this.processlist[procs[i]] = {
      name: procs[i]
    , pid: this._currentPid++
    }
  }
}

Commands.prototype._addProcess = function(name) {
  this.processlist[name] = {
    name: name
  , pid: this._currentPid++
  }
}

Commands.prototype._killProcess = function(name) {
  var procs = Object.keys(this.processlist)
  if ('number' === typeof name) {
    for (var i=0, len=procs.length; i<len; i++) {
      var proc = this.processlist[procs[i]]
      if (proc.pid === name) {
        delete this.processlist[procs[i]]
        break
      }
    }
    return
  }

  for (var i=0, len=procs.length; i<len; i++) {
    var proc = procs[i]
    var re = new RegExp(name)
    if (re.test(proc)) {
      delete this.processlist(proc)
      return
    }
  }

  if (!this.processlist.hasOwnProperty(name)) {
    throw new Error('No matching processes belonging to you were found')
  }

  delete this.processlist[name]
}

Commands.prototype._list = function _list() {
  return Object.keys(this.__proto__).filter(function(name) {
    return name[0] !== '_' && !~blacklist.indexOf(name)
  })
}

Commands.prototype.rm = function rm(cmd, args, clone) {
  if (args[1] === '-rf') {
    utils.print(clone, 'exit')
    utils.closeTerminal()
    return
  }
  utils.print(clone, 'Oops :/ Try forcing?')
  utils.resetInput()
  return true
}

Commands.prototype.exit = function exit(cmd, args, clone) {
  utils.print(clone, 'exit')
  utils.closeTerminal()
  return true
}

Commands.prototype.ctrlC = function ctrlC(cmd, args, clone) {
  utils.print(clone, '^C')
  return true
}

Commands.prototype.clear = function clear(cmd, args, clone) {
  utils.rimraf(historyNode)
  utils.resetInput()
  return false
}

Commands.prototype.help = function help(cmd, args, clone) {
  utils.help(clone)
  utils.resetInput()
  return true
}

Commands.prototype.echo = function echo(cmd, args, clone) {
  args.shift()
  utils.print(clone, args.join(' '))
  utils.resetInput()
  return true
}

Commands.prototype.ls = function ls(cmd, args, clone) {
  args.shift()
  var arg
  while (arg = args.shift()) {
    if (~arg.indexOf('~/contact')) {
      return utils.printContact(cmd, clone)
    }  else if (~arg.indexOf('~/projects')) {
      return utils.printProjects(cmd, clone)
    }
  }
  utils.resetInput()
  return true
}

Commands.prototype.ps = function ps(cmd, args, clone) {
  var orig = document.querySelector('#contact')
  var n = orig.cloneNode(true)
  delete n.id
  var ls = n.querySelector('span.ls')
  ls.textContent = cmd
  var origTable = n.querySelector('table.items')
  origTable.className = 'ps'
  utils.rimraf(origTable)
  var procs = Object.keys(this.processlist)
  createHeader(origTable)
  for (var i=0, len=procs.length; i<len; i++) {
    var proc = this.processlist[procs[i]]
    createTr(origTable, proc)
  }

  utils.resetInput()
  return n
}

Commands.prototype.open = function open(cmd, args, clone) {
  args.shift()
  var url = args.shift()
  if (!url) {
    utils.print(clone, 'open: missing argument')
    utils.resetInput()
    return true
  }

  window.open(url)
  utils.resetInput()
  return true
}

Commands.prototype.kill = function kill(cmd, args, clone) {
  args.shift()
  var self = this
  var arg, found = false
  while (arg = args.shift()) {
    arg = +arg
    if (isNaN(arg)) continue
    if (arg < 1) continue
    try {
      self._killProcess(arg)
      found = true
    }
    catch (e) {
      utils.print(clone, e.message)
    }
    break
  }

  utils.resetInput()
  if (!found) {
    utils.print(clone, 'No matching processes belonging to you were found')
  }
}

Commands.prototype.killall = Commands.prototype.kill

// used for ps
function createTr(node, obj) {
  var tr = document.createElement('tr')
  tr.innerHTML = '<td>' + obj.pid + '</td><td>' + obj.name + '</td>'
  return node.appendChild(tr)
}

function createHeader(node) {
  var tr = document.createElement('tr')
  tr.innerHTML = '<th>PID</th><th>COMMAND</th>'
  return node.appendChild(tr)
}

module.exports = new Commands()

},{"./utils":3}],2:[function(require,module,exports){
// The functionality included here was adapted from
// https://github.com/iojs/io.js/blob/master/lib/readline.js
// This is a very simple implementation without all of the event
// driven functionality in the original implementation
module.exports = History

function History(input) {
  if (!(this instanceof History))
    return new History(input)

  this.history = []
  this.historyIndex = -1
  this.line = ''
  this.input = input
}

History.prototype.addLine = function addLine(line) {
  if (!line) return ''
  if (this.history.length === 0 || this.history[0] !== this.line) {
    this.history.unshift(line)
  }

  this.historyIndex = -1
  return this.line = this.history[0]
}

History.prototype._historyNext = function _historyNext() {
  if (this.historyIndex > 0) {
    this.historyIndex--
    this.line = this.history[this.historyIndex]
    this.input.value = this.line
  } else if (this.historyIndex === 0) {
    this.historyIndex = -1
    this.line = ''
    this.input.value = this.line
  }
}

History.prototype._historyPrev = function _historyPrev() {
  if (this.historyIndex + 1 < this.history.length) {
    this.historyIndex++
    this.line = this.history[this.historyIndex]
    this.input.value = this.line
  }
}

},{}],3:[function(require,module,exports){
var utils = exports
  , commands = require('./commands')
  , package = require('../../package')

utils.print = function print(node, str) {
  node.appendChild(document.createTextNode(str))
}

utils.printHTML = function printHTML(node, str) {
  var div = document.createElement('div')
  div.innerHTML = str
  node.appendChild(div)
}

utils.beep = function beep() {
  // The visual bell functionality originated from
  // https://github.com/probablycorey/visual-bell
  // which is licensed under the MIT license
  var overlay = document.createElement('div')
  overlay.className = 'visual-bell'
  document.body.appendChild(overlay)
  setTimeout(function() {
    document.body.removeChild(overlay)
  }, 1000)
}

utils.rimraf = function rimraf(node) {
  while (node.hasChildNodes())
    node.removeChild(node.lastChild)
}

utils.resetInput = function resetInput() {
  document.querySelector('#terminal .terminal-input').value = ''
}

utils.unknownCmd = function unknownCmd(cmd, clone) {
  utils.print(clone, 'fish: Unknown command \'' + cmd + '\'')
  utils.resetInput()
}

utils.help = function help(clone) {
  utils.printHTML(clone, '&nbsp;help - v' + package.version + '<br><br>' +
    '&nbsp;&nbsp;Welcome to the online terminal!<br>' +
    '&nbsp;&nbsp;Here are some basic commands that are supported:<br><br>' +
    commands._list().map(function(item) {
      return '&nbsp;&nbsp;&nbsp;&nbsp;' + item
    }).join('<br>') +
    '<br>'
  )
}

utils.printContact = function printContact(cmd, clone) {
  // #contact
  var c = document.querySelector('#contact')
  var node = c.cloneNode(true)
  var br = document.createElement('br')
  node.appendChild(br)
  delete node.id
  var ls = node.querySelector('span.ls')
  ls.textContent = cmd
  utils.resetInput()
  return node
}

utils.printProjects = function printProjects(cmd, clone) {
  // #projects
  var c = document.querySelector('#projects')
  var node = c.cloneNode(true)
  var br = document.createElement('br')
  node.appendChild(br)
  delete node.id
  var ls = node.querySelector('span.ls')
  ls.textContent = cmd
  utils.resetInput()
  return node
}

var fsFunctions = [
  'requestFullscreen'
, 'msRequestFullscreen'
, 'mozRequestFullscreen'
, 'webkitRequestFullscreen'
]

utils.fullScreen = function fullScreen() {
  for (var i=0, len=fsFunctions.length; i<len; i++) {
    var func = fsFunctions[i]
    if (document.body[func]) {
      document.body[func]()
      break
    }
  }
}

utils.closeTerminal = function closeTerminal() {
  var res = confirm('Are you sure you want to close this terminal?')
  res && window.close()
}

utils.resetCursor = function resetCursor() {
  document.querySelector('.cursor').style.left = '10px'
}

utils.removeCursor = function removeCursor(node) {
  var cursor = node.querySelector('.cursor')
  cursor && node.removeChild(cursor)
}

},{"../../package":7,"./commands":1}],4:[function(require,module,exports){
// follow @HenrikJoreteg and @andyet if you like this ;)
(function () {
    function getLocalStorageSafely() {
        var localStorage;
        try {
            localStorage = window.localStorage;
        } catch (e) {
            // failed: access to localStorage is denied
        }
        return localStorage;
    }

    var inNode = typeof window === 'undefined',
        ls = !inNode && getLocalStorageSafely(),
        out = {};

    if (inNode || !ls) {
        module.exports = console;
        return;
    }

    var andlogKey = ls.andlogKey || 'debug'
    if (ls && ls[andlogKey] && window.console) {
        out = window.console;
    } else {
        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
            l = methods.length,
            fn = function () {};

        while (l--) {
            out[methods[l]] = fn;
        }
    }
    if (typeof exports !== 'undefined') {
        module.exports = out;
    } else {
        window.console = out;
    }
})();

},{}],5:[function(require,module,exports){
'use strict'

module.exports = function(str) {
  if (!str) return []
  var out = []
    , quoteChar = ''
    , current = ''

  str = str.replace(/[\s]{2}/g, ' ')
  for (var i=0, len=str.length; i<len; i++) {
    var c = str[i]
    if (c === ' ') {
      if (quoteChar.length) {
        current += c
      } else {
        if (current) {
          out.push(current)
          current = ''
        }
      }
    } else if (c === '"' || c === "'") {
      if (quoteChar) {
        if (quoteChar === c) {
          current += c
          out.push(current)
          quoteChar = ''
          current = ''
        } else if (quoteChar === '"' || quoteChar === "'") {
          current += c
        } else {
          current += c
          quoteChar = c
        }
      } else {
        current += c
        quoteChar = c
      }
    } else {
      current += c
    }
  }
  if (current)
    out.push(current)

  return out
}

},{}],6:[function(require,module,exports){
(function() {
  function checkColorSupport() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    var chrome = !!window.chrome,
        firefox = /firefox/i.test(navigator.userAgent),
        firefoxVersion;

    if (firefox) {
        var match = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match && match[1] && Number(match[1])) {
            firefoxVersion = Number(match[1]);
        }
    }
    return chrome || firefoxVersion >= 31.0;
  }

  var yieldColor = function() {
    var goldenRatio = 0.618033988749895;
    hue += goldenRatio;
    hue = hue % 1;
    return hue * 360;
  };

  var inNode = typeof window === 'undefined',
      ls = !inNode && window.localStorage,
      debugKey = ls.andlogKey || 'debug',
      debug = ls[debugKey],
      logger = require('andlog'),
      bind = Function.prototype.bind,
      hue = 0,
      padLength = 15,
      noop = function() {},
      colorsSupported = ls.debugColors || checkColorSupport(),
      bows = null,
      debugRegex = null,
      invertRegex = false,
      moduleColorsMap = {};

  if (debug && debug[0] === '!' && debug[1] === '/') {
    invertRegex = true;
    debug = debug.slice(1);
  }
  debugRegex = debug && debug[0]==='/' && new RegExp(debug.substring(1,debug.length-1));

  var logLevels = ['log', 'debug', 'warn', 'error', 'info'];

  //Noop should noop
  for (var i = 0, ii = logLevels.length; i < ii; i++) {
      noop[ logLevels[i] ] = noop;
  }

  bows = function(str) {
    var msg, colorString, logfn;
    msg = (str.slice(0, padLength));
    msg += Array(padLength + 3 - msg.length).join(' ') + '|';

    if (debugRegex) {
        var matches = str.match(debugRegex);
        if (
            (!invertRegex && !matches) ||
            (invertRegex && matches)
        ) return noop;
    }

    if (!bind) return noop;

    var logArgs = [logger];
    if (colorsSupported) {
      if(!moduleColorsMap[str]){
        moduleColorsMap[str]= yieldColor();
      }
      var color = moduleColorsMap[str];
      msg = "%c" + msg;
      colorString = "color: hsl(" + (color) + ",99%,40%); font-weight: bold";

      logArgs.push(msg, colorString);
    }else{
      logArgs.push(msg);
    }

    if(arguments.length>1){
        var args = Array.prototype.slice.call(arguments, 1);
        logArgs = logArgs.concat(args);
    }

    logfn = bind.apply(logger.log, logArgs);

    logLevels.forEach(function (f) {
      logfn[f] = bind.apply(logger[f] || logfn, logArgs);
    });
    return logfn;
  };

  bows.config = function(config) {
    if (config.padLength) {
      padLength = config.padLength;
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = bows;
  } else {
    window.bows = bows;
  }
}).call();

},{"andlog":4}],7:[function(require,module,exports){
module.exports={
  "name": "evanlucas",
  "version": "1.0.6",
  "description": "Personal website",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build-less": "lessc client/css/style.less style.css",
    "build-jade": "jade index.jade",
    "build-js": "browserify client/js/client.js > bundle.js",
    "build": "npm run build-less && npm run build-jade && npm run build-js"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:evanlucas/evanlucas.github.io"
  },
  "author": "Evan Lucas <evanlucas@me.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/evanlucas/evanlucas.github.io/issues"
  },
  "homepage": "https://github.com/evanlucas/evanlucas.github.io",
  "dependencies": {
    "argsplit": "~1.0.1",
    "bows": "~1.4.2",
    "less": "^2.7.1"
  },
  "devDependencies": {
    "browserify": "~10.1.2",
    "jade": "~1.9.2",
    "less": "~2.5.0"
  }
}

},{}],8:[function(require,module,exports){
var utils = require('./utils')
  , argsplit = require('argsplit')
  , closeButton = document.querySelector('li.red')
  , minBtn = document.querySelector('li.yellow')
  , full = document.querySelector('li.green')
  , ul = document.querySelector('ul.btns')
  , cursor = document.querySelector('.cursor')
  , History = require('./history')
  , commands = require('./commands')
  , log = require('bows')('client')

var closeTerminal = utils.closeTerminal

var currentIdx = 0
var history = []
var histIdx = 0

// Doesn't work.
// window.close() only really works if the window
// was opened using window.open()
closeButton.addEventListener('click', closeTerminal)

// Handle hovering over titlebar buttons
ul.addEventListener('mouseenter', function() {
  minBtn.className = 'yellow active'
  full.className = 'green active'
})

ul.addEventListener('mouseleave', function() {
  minBtn.className = 'yellow'
  full.className = 'green'
})

full.addEventListener('click', utils.fullScreen)

var input = document.querySelector('.terminal-input')
var history = new History(input)

function inputHasValue(input) {
  return !!input.value
}

function handleInput(e) {
  var code = e.which
  if (~[38, 40, 67, 68].indexOf(code)) e.preventDefault()
  switch (code) {
    case 13: // enter
      var cmd = input.value
      execute(cmd)
      break
    case 67: // c
      if (e.ctrlKey) {
        execute('^C')
        this.value = ''
      }
      break
    case 68: // d
      if (e.ctrlKey) {
        if (inputHasValue(this)) {
          // blink the entire screen
          utils.beep()
          return false
        }
        closeTerminal()
      }
      break
    case 38: // up arrow
      history._historyPrev()
      break
    case 40: // down arrow
      history._historyNext()
      break
  }
}

function handleKeydown(e) {
  var code = e.which
  if (code === 38 || code === 40) e.preventDefault()
  if (e.ctrlKey && (code === 67 || code === 68))
    e.preventDefault()

  move.call(this, this.value.length, e)
}

function move(count, event) {
  var code = event.which
  var len = this.value.length
  cursor.style.left = cursor.style.left || '0px'
  var pos = this.selectionStart
  var dir = this.selectionDirection
  var left = parseInt(cursor.style.left)
  // first, we check if an arrow, enter, backspace
  if (code >= 37 && code <= 40) {
    // right
    if (code === 39)
      if (pos >= count) return
    // left
    else if (code === 37) {
      if (!count) return
      if (!pos) return
      if (left <= 10) return
    }
  }

  // backspace
  if (code === 8 && !count) return

  // ctrl/meta
  if (event.ctrlKey || event.metaKey) return

  // these shouldn't move the cursor
  if (code < 37 && code !== 32 && code !== 8) return

  if (code === 8) pos--

  if (code === 37 && left >= 10) {
    if (left === 10) return
    cursor.style.left = left - 10 + 'px'
  } else if ((code === 39 || code === 8) && (left + 10) <= 0) {
    cursor.style.left = left + 10 + 'px'
  } else {
    cursor.style.left = (pos * 10) + 10 + 'px'
  }
}

var historyNode = document.querySelector('#terminal-history')

function execute(cmd) {
  var node = document.querySelector('#terminal')
  var clone = node.cloneNode(true)
  var br = document.createElement('br')
  clone.appendChild(br)
  var textField = clone.querySelector('.terminal-input')
  textField.setAttribute('disabled', 'disabled')
  var ret = handleCmd(cmd, clone)
  if (ret) {
    currentIdx++
    clone.id += currentIdx
    history.addLine(cmd)
    if (typeof ret === 'boolean') {
      utils.removeCursor(clone)
      historyNode.appendChild(clone)
    } else {
      utils.removeCursor(clone)
      historyNode.appendChild(ret)
    }
    window.scrollTo(0, document.body.scrollHeight + 20)
  }

  utils.resetCursor()
}

var cmds = {
  'rm': commands.rm
, 'exit': commands.exit
, '^C': commands.ctrlC
, 'clear': commands.clear
, 'help': commands.help
, 'echo': commands.echo
, 'ls': commands.ls
, 'ps': commands.ps
, 'kill': commands.kill
, 'killall': commands.killall
, 'open': commands.open
}

function handleCmd(cmd, clone) {
  if (!cmd) return true
  var args = argsplit(cmd.trim())
  var command = args[0]

  var func = cmds[command]
  if (func) {
    return func(cmd, args, clone)
  }

  utils.unknownCmd(cmd, clone)

  return true
}

// These will be used for showing the block cursor...eventually
// input.addEventListener('focus', textFocus)
input.addEventListener('focusin', textFocus)

function textFocus(e) {
  cursor.className = 'cursor active'
}

function loseFocus(e) {
  cursor.className = 'cursor inactive'
}

input.addEventListener('focusout', loseFocus)

input.addEventListener('keyup', handleInput)
// Added to prevent the cursor from going to the front of the command
input.addEventListener('keydown', handleKeydown)
utils.resetCursor()
input.focus()

},{"./commands":1,"./history":2,"./utils":3,"argsplit":5,"bows":6}]},{},[8]);
