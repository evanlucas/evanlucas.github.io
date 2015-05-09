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
