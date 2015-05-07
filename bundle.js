(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var closeButton = document.querySelector('li.red')
var minBtn = document.querySelector('li.yellow')
var full = document.querySelector('li.green')
var ul = document.querySelector('ul.btns')

closeButton.addEventListener('click', function() {
  var res = confirm('Are you sure you want to close this terminal?')
  res && window.close()
})

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

},{}]},{},[1]);
