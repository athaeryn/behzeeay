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

  draw (ctx, width = 5) {
    ctx.fillRect(this.x - width / 2, this.y - width / 2, width, width)
    ctx.strokeRect(this.x - width / 2, this.y - width / 2, width, width)
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

  let rootAnchors = []

  let activeAnchor
  let lastAnchor

  let drawAnchors = true

  canvas.addEventListener('mousedown', function(event) {
    const x = event.layerX
    const y = event.layerY

    // if (!rootAnchor) {
    //   rootAnchor = newAnchor
    //   activeAnchor = newAnchor
    //   return
    // }

    let existingAnchor
    for (let rootAnchor of rootAnchors) {
      for (let anchor of rootAnchor) {
        if (isHit(anchor, x, y)) {
          existingAnchor = anchor
          break
        }
      }
    }
    if (existingAnchor) {
      activeAnchor = existingAnchor
    } else {
      const newAnchor = new Anchor(event.layerX, event.layerY)
      if (lastAnchor) {
        lastAnchor.addChild(newAnchor)
      } else {
        rootAnchors.push(newAnchor)
      }
      activeAnchor = newAnchor
    }
    draw()
  })

  canvas.addEventListener('mousemove', function (event) {
    const x = event.layerX
    const y = event.layerY
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

  document.addEventListener('keydown', function (event) {
    if (event.which == 27) { // esc
      lastAnchor = null
      activeAnchor = null
    } else if (event.which == 72) {
      drawAnchors = false
    }
    draw()
  })
  document.addEventListener('keyup', function (event) {
    if (event.which == 72) {
      drawAnchors = true
    }
    draw()
  })

  function draw () {
    ctx.clearRect(0, 0, W, H)
    for (let rootAnchor of rootAnchors) {
      for (let anchor of rootAnchor) {
        for (let child of anchor.children) {
          drawLine(ctx, anchor, child)
        }
        if (!drawAnchors) continue
        if (anchor == activeAnchor) {
          ctx.strokeStyle = 'cyan'
          anchor.draw(ctx, 7)
          ctx.strokeStyle = 'black'
        } else if (anchor == lastAnchor) {
          ctx.strokeStyle = 'green'
          anchor.draw(ctx, 9)
          ctx.strokeStyle = 'black'
        } else {
          anchor.draw(ctx)
        }
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
