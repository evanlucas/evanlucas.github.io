var utils = require('./utils')
var blacklist = ['_list', 'ctrlC']

function Commands() {
  if (!(this instanceof Commands))
    return new Commands()

  this.processlist = {}
  this._currentPid = 1
  this._buildProcessList()
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
