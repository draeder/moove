const path = require('node:path')
const fs = require('fs/promises')
const { app, BrowserWindow, screen } = require('electron')
const Gun = require('gun')
const robot = require('robotjs')

const server = require('http').createServer().listen(30210);
const gun = Gun({ web: server })

let win

app.whenReady().then(() => {
  __dirname = __dirname + "/public"

  let displayBounds = {}
  function bounds(){
    const displays = screen.getAllDisplays()
    console.log(displays)
    const externalDisplay = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    if (externalDisplay) {
      win = new BrowserWindow({
        x: externalDisplay.bounds.x + 50,
        y: externalDisplay.bounds.y + 50
      })
      win.loadURL(`file://${__dirname}/index.html`)
    }

    for(let display in displays){
      displayBounds[displays[display].id] = {bounds: displays[display].bounds}
    }
    console.log(displayBounds)
  }
  bounds()

  screen.on('display-metrics-changed', data => {
    console.log(data)
    bounds()
  })

  let currentDisplayId
  let lastDisplayId
  const edgeThreshold = 0 // Number of pixels from the edge to consider the mouse at the edge
  let edge = false
  let prevCoords = { x: 0, y: 0 }
  let direction
  let currentEdge = "none"
  async function moove(coords){
    for (const displayId in displayBounds) {
      const display = displayBounds[displayId]
      const bounds = display.bounds
    
      if ( coords.x >= bounds.x && coords.x <= bounds.x + bounds.width &&
          coords.y >= bounds.y && coords.y <= bounds.y + bounds.height ) {
        currentDisplayId = displayId
      }
    }
    
    if (currentDisplayId) {
      const currentDisplay = displayBounds[currentDisplayId]
      const currentBounds = currentDisplay.bounds
    
      if ( coords.x <= currentBounds.x + edgeThreshold ||
          coords.x >= currentBounds.x + currentBounds.width - edgeThreshold ||
          coords.y <= currentBounds.y + edgeThreshold ||
          coords.y >= currentBounds.y + currentBounds.height - edgeThreshold ) {
        edge = true
      }
      else {
        edge = false
      }

      if (coords.x > prevCoords.x) {
        direction = "right"
      } else if (coords.x < prevCoords.x) {
        direction = "left"
      } else if (coords.y > prevCoords.y) {
        direction = "down"
      } else if (coords.y < prevCoords.y) {
        direction = "up"
      }

      if (coords.x === currentBounds.x) {
        currentEdge = "left"
        //robot.moveMouse(-1, -1)
      } else if (coords.x === currentBounds.x + currentBounds.width - 1) {
        currentEdge = "right"
      } else if (coords.y === currentBounds.y) {
        currentEdge = "top"
        //robot.moveMouse(-1, -1)
      } else if (coords.y === currentBounds.y + currentBounds.height - 1) {
        currentEdge = "bottom"
        //robot.moveMouse(-1, -1)
      }

      if(lastDisplayId != currentDisplayId) {
        currentEdge = "none"
      }

      let mooves = {
        x: coords.x,
        y: coords.y,
        direction: direction,
        monitor: currentDisplayId,
        edge: currentEdge
      }

      gun.get('mooveMouseEvent').put(mooves)

      if(lastDisplayId === currentDisplayId){
        currentEdge = "none"
      }

      prevCoords = coords
      lastDisplayId = currentDisplayId

    }
  }

  setInterval( () => {
    let coords = screen.getCursorScreenPoint()
    if(coords.x === prevCoords.x && coords.y === prevCoords.y) return
    moove(coords)
  },0)

  // Delete history every minute
  setInterval( async () =>{
    for (const file of await fs.readdir("radata")) {
      await fs.unlink(path.join("radata", file));
    }
  }, 60 * 1000)

  // delete history on exit
  process.on("SIGINT", async () => {
    await fs.rm("radata", {recursive: true})
    process.exit(1)
  })
})