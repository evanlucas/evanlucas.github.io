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
}

function handleCmd(cmd, clone) {
  if (!cmd) return true
  var args = argsplit(cmd.trim())
  var command = args[0]

  var func = cmds[command].bind(commands)
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
