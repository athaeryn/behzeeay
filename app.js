function makeCanvas (w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}

function setStage () {
  const container = document.createElement('div')
  const canvas = makeCanvas(500, 500)
  container.appendChild(canvas)
  document.body.appendChild(container)
  return canvas
}

class Anchor {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  draw (ctx) {
    ctx.strokeRect(this.x - 4, this.y - 4, 8, 8)
  }
}

function isHit (target, x, y, slop = 4) {
  return Math.abs(target.x - x) <= slop && Math.abs(target.y - y) <= slop
}

setTimeout(function () {
  const canvas = setStage()
  const ctx = canvas.getContext('2d')
  const state = {}
  state.mouseX = 0
  state.mouseY = 0

  const anchors = []
  let activeAnchor
  let lastAnchor

  canvas.addEventListener('mousemove', function(event) {
    state.mouseX = event.layerX
    state.mouseY = event.layerY
    update()
  })

  canvas.addEventListener('mousedown', function(event) {
    const x = event.layerX
    const y = event.layerY
    let existingAnchor
    for (let anchor of anchors) {
      if (isHit(anchor, x, y)) {
        existingAnchor = anchor
        break
      }
    }
    if (existingAnchor) {
      activeAnchor = existingAnchor
    } else {
      const newAnchor = new Anchor(event.layerX, event.layerY)
      anchors.push(newAnchor)
      activeAnchor = newAnchor
    }
    update()
  })

  canvas.addEventListener('mouseup', function (event) {
    lastAnchor = activeAnchor
    activeAnchor = null
    update()
  })

  function update () {
    ctx.clearRect(0, 0, 500, 500)
    anchors.forEach(function (anchor) {
      if (anchor == activeAnchor) {
        ctx.strokeStyle = 'cyan'
        anchor.draw(ctx)
      } else if (anchor == lastAnchor) {
        ctx.strokeStyle = 'blue'
        anchor.draw(ctx)
      } else {
        anchor.draw(ctx)
      }
      ctx.strokeStyle = 'black'
    })

    if (activeAnchor) {
      ctx.beginPath()
      ctx.moveTo(state.mouseX, state.mouseY)
      ctx.lineTo(activeAnchor.x, activeAnchor.y)
      ctx.stroke()
    }
  }
}, 1)
