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
  if (~[38, 40, 67, 68].indexOf(code)) e.preventDefault()
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

// These will be used for showing the block cursor...eventually
// input.addEventListener('focus', textFocus)
// input.addEventListener('focusin', textFocus)
// input.addEventListener('focusout', loseFocus)

input.addEventListener('keyup', handleInput)
// Added to prevent the cursor from going to the front of the command
input.addEventListener('keydown', handleKeydown)
input.focus()
