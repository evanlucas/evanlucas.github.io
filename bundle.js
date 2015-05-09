(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var utils = exports

utils.print = function print(node, str) {
  node.appendChild(document.createTextNode(str))
}

utils.printHTML = function printHTML(node, str) {
  var div = document.createElement('div')
  div.innerHTML = str
  node.appendChild(div)
}

utils.beep = function beep() {
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
  utils.printHTML(clone, 'help<br><br>' +
    '&nbsp;Welcome to the online terminal!<br>' +
    '&nbsp;Here are some basic commands that are supported:<br><br>' +
    ['rm', 'exit', 'clear', 'help', 'echo'].map(function(item) {
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var utils = require('./utils')
  , argsplit = require('argsplit')
  , closeButton = document.querySelector('li.red')
  , minBtn = document.querySelector('li.yellow')
  , full = document.querySelector('li.green')
  , ul = document.querySelector('ul.btns')
  , History = require('./history')

function closeTerminal() {
  var res = confirm('Are you sure you want to close this terminal?')
  res && window.close()
}

var currentIdx = 0
var history = []
var histIdx = 0

closeButton.addEventListener('click', closeTerminal)

ul.addEventListener('mouseenter', function() {
  minBtn.className = 'yellow active'
  full.className = 'green active'
})

ul.addEventListener('mouseleave', function() {
  minBtn.className = 'yellow'
  full.className = 'green'
})

var funcs = [
  'requestFullscreen'
, 'msRequestFullscreen'
, 'mozRequestFullscreen'
, 'webkitRequestFullscreen'
]

var len = funcs.length

full.addEventListener('click', function() {
  for (var i=0; i<len; i++) {
    var func = funcs[i]
    if (document.body[func]) {
      document.body[func]()
      break
    }
  }
})

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
      console.log(ret)
      historyNode.appendChild(ret)
    }
    window.scrollTo(0, document.body.scrollHeight + 20)
  }
}

function handleCmd(cmd, clone) {
  if (!cmd) return true
  var args = argsplit(cmd.trim())
  var command = args[0]
  switch (command) {
    case 'rm':
      if (args[1] === '-rf') {
        utils.print(clone, 'exit')
        closeTerminal()
        return
      }
      utils.print(clone, 'Oops :/ Try forcing?')
      utils.resetInput()
      break
    case 'exit':
      utils.print(clone, 'exit')
      closeTerminal()
      break
    case '^C':
      utils.print(clone, '^C')
      break
    case 'clear':
      utils.rimraf(historyNode)
      utils.resetInput()
      return false
      break
    case 'help':
      utils.help(clone)
      utils.resetInput()
      break
    case 'echo':
      args.shift()
      utils.print(clone, args.join(' '))
      utils.resetInput()
      break
    case 'ls':
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
      break
    default:
      utils.unknownCmd(cmd, clone)
      break
  }

  return true
}


input.addEventListener('focus', textFocus)
input.addEventListener('focusin', textFocus)
input.addEventListener('focusout', loseFocus)
input.addEventListener('keyup', handleInput)
input.focus()

},{"./history":1,"./utils":2,"argsplit":3}]},{},[4]);
