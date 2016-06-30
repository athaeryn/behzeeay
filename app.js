const W = 500
const H = 500

function makeCanvas (w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}

class Anchor {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.children = []
  }

  addChild (anchor) {
    this.children.push(anchor)
  }

  draw (ctx) {
    ctx.strokeRect(this.x - 2, this.y - 2, 5, 5)
    ctx.fillRect(this.x - 1, this.y - 1, 3, 3)
  }

  *[Symbol.iterator] () {
      yield this
      for (let child of this.children) {
        yield* child
      }
  }
}

function isHit (target, x, y, slop = 4) {
  return Math.abs(target.x - x) <= slop && Math.abs(target.y - y) <= slop
}

setTimeout(function () {
  const canvas = makeCanvas(W, H)
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  const state = {}
  state.mouseX = 0
  state.mouseY = 0

  let rootAnchor

  let activeAnchor
  let lastAnchor

  canvas.addEventListener('mousedown', function(event) {
    const x = event.layerX
    const y = event.layerY
    const newAnchor = new Anchor(event.layerX, event.layerY)

    if (!rootAnchor) {
      rootAnchor = newAnchor
      activeAnchor = newAnchor
      return
    }

    let existingAnchor
    for (let anchor of rootAnchor) {
      if (isHit(anchor, x, y)) {
        existingAnchor = anchor
        break
      }
    }
    if (existingAnchor) {
      activeAnchor = existingAnchor
    } else {
      lastAnchor.addChild(newAnchor)
      activeAnchor = newAnchor
    }
    draw()
  })

  canvas.addEventListener('mousemove', function (event) {
    const x = event.layerX
    const y = event.layerY
    state.mouseX = x
    state.mouseY = y
    if (activeAnchor) {
      activeAnchor.x = x
      activeAnchor.y = y
    }
    draw()
  })

  canvas.addEventListener('mouseup', function (event) {
    lastAnchor = activeAnchor
    activeAnchor = null
    draw()
  })

  function draw () {
    if (!rootAnchor) return
    ctx.clearRect(0, 0, W, H)
    for (let anchor of rootAnchor) {
      for (let child of anchor.children) {
        drawLine(ctx, anchor, child)
      }
      if (anchor == activeAnchor) {
        ctx.strokeStyle = 'cyan'
        anchor.draw(ctx)
        ctx.strokeStyle = 'black'
      } else {
        anchor.draw(ctx)
      }
    }
  }
}, 1)

function drawLine (ctx, a, b) {
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}
