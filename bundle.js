(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var commands = exports
  , utils = require('./utils')

var blacklisted = ['_list', 'ctrlC']

commands._list = function _list() {
  return Object.keys(commands).filter(function(name) {
    return !~blacklisted.indexOf(name)
  })
}

commands.rm = function rm(cmd, args, clone) {
  if (args[1] === '-rf') {
    utils.print(clone, 'exit')
    utils.closeTerminal()
    return
  }
  utils.print(clone, 'Oops :/ Try forcing?')
  utils.resetInput()
  return true
}

commands.exit = function exit(cmd, args, clone) {
  utils.print(clone, 'exit')
  utils.closeTerminal()
  return true
}

commands.ctrlC = function ctrlC(cmd, args, clone) {
  utils.print(clone, '^C')
  return true
}

commands.clear = function clear(cmd, args, clone) {
  utils.rimraf(historyNode)
  utils.resetInput()
  return false
}

commands.help = function help(cmd, args, clone) {
  utils.help(clone)
  utils.resetInput()
  return true
}

commands.echo = function echo(cmd, args, clone) {
  args.shift()
  utils.print(clone, args.join(' '))
  utils.resetInput()
  return true
}

commands.ls = function ls(cmd, args, clone) {
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

},{"../../package":5,"./commands":1}],4:[function(require,module,exports){
module.exports = function(str) {
  if (!str) return []
  var out = []
    , quoteChar = ''
    , current = ''

  str = str.replace(/[\s]{2}/g, ' ')
  for (var i=0, len=str.length; i<len; i++) {
    var c = str[i]
    if (c === ' ') {
      if (quoteChar) {
        current += c
      } else {
        if (current) {
          out.push(current)
          current = ''
        }
      }
    } else if (c === '"') {
      if (quoteChar && quoteChar === c) {
        current += c
        out.push(current)
        quoteChar = ''
        current = ''
      } else {
        current += c
        quoteChar = c
      }
    } else if (c === "'") {
      if (quoteChar && quoteChar === c) {
        current += c
        out.push(current)
        quoteChar = ''
        current = ''
      } else {
        current +=
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

},{}],5:[function(require,module,exports){
module.exports={
  "name": "evanlucas",
  "version": "1.0.0",
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
    "argsplit": "~1.0.1"
  },
  "devDependencies": {
    "browserify": "~10.1.2",
    "jade": "~1.9.2",
    "less": "~2.5.0"
  }
}

},{}],6:[function(require,module,exports){
var utils = require('./utils')
  , argsplit = require('argsplit')
  , closeButton = document.querySelector('li.red')
  , minBtn = document.querySelector('li.yellow')
  , full = document.querySelector('li.green')
  , ul = document.querySelector('ul.btns')
  , History = require('./history')
  , commands = require('./commands')

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

function textFocus(e) {

}

function loseFocus(e) {

}

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
      historyNode.appendChild(clone)
    } else {
      historyNode.appendChild(ret)
    }
    window.scrollTo(0, document.body.scrollHeight + 20)
  }
}

var cmds = {
  'rm': commands.rm
, 'exit': commands.exit
, '^C': commands.ctrlC
, 'clear': commands.clear
, 'help': commands.help
, 'echo': commands.echo
, 'ls': commands.ls
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
// input.addEventListener('focusin', textFocus)
// input.addEventListener('focusout', loseFocus)

input.addEventListener('keyup', handleInput)
// Added to prevent the cursor from going to the front of the command
input.addEventListener('keydown', handleKeydown)
input.focus()

},{"./commands":1,"./history":2,"./utils":3,"argsplit":4}]},{},[6]);
