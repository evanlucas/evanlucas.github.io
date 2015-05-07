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
