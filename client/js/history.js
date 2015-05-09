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
