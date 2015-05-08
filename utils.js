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
