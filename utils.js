var utils = exports

utils.print = function(node, str) {
  node.appendChild(document.createTextNode(str))
}

utils.beep = function() {
  var overlay = document.createElement('div')
  overlay.className = 'visual-bell'
  document.body.appendChild(overlay)
  setTimeout(function() {
    document.body.removeChild(overlay)
  }, 1000)
}

utils.rimraf = function(node) {
  while (node.hasChildNodes())
    node.removeChild(node.lastChild)
}

utils.resetInput = function() {
  document.querySelector('#terminal .terminal-input').value = ''
}

utils.unknownCmd = function(cmd, clone) {
  utils.print(clone, 'fish: Unkown command \'' + cmd + '\'')
  utils.resetInput()
}
