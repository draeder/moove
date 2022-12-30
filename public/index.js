const gun = new Gun({peers: "http://localhost:30210/gun"})

let coordinates = document.getElementById("coordinates")

gun.get("mooveMouseEvent").on(data => {
  coordinates.innerText = "x: " + data.x + " y: " + data.y + 
    "\r\n" + "Pointer Direction: " + data.direction +
    "\r\n" + "Display ID: " + data.monitor +
    "\r\n" + "Edge: " + data.edge 
})

// helper function

const RADIUS = 20

function degToRad(degrees) {
  var result = Math.PI / 180 * degrees
  return result
}

// setup of the canvas

var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')

var x = 500
var y = 500

function canvasDraw() {
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#f00"
  ctx.beginPath()
  ctx.arc(x, y, RADIUS, 0, degToRad(360), true)
  ctx.fill()
}
canvasDraw()

// pointer lock object forking for cross browser

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock

canvas.onclick = function() {
  canvas.requestPointerLock()
}

// pointer lock event listeners

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false)
document.addEventListener('mozpointerlockchange', lockChangeAlert, false)

function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked')
    document.addEventListener("mousemove", updatePosition, false)
  } else {
    console.log('The pointer lock status is now unlocked')  
    document.removeEventListener("mousemove", updatePosition, false)
  }
}

var tracker = document.getElementById('tracker')

var animation
function updatePosition(e) {
  x += e.movementX
  y += e.movementY
  if (x > canvas.width + RADIUS) {
    x = -RADIUS
  }
  if (y > canvas.height + RADIUS) {
    y = -RADIUS
  }  
  if (x < -RADIUS) {
    x = canvas.width + RADIUS
  }
  if (y < -RADIUS) {
    y = canvas.height + RADIUS
  }
  tracker.textContent = "X position: " + x + ", Y position: " + y

  if (!animation) {
    animation = requestAnimationFrame(function() {
      animation = null
      canvasDraw()
    })
  }
}