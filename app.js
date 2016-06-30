const W = 500
const H = 500

function makeCanvas (w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}

class Graph {
  constructor () {
    this._nodes = new Map()
    this._edges = new Set()
  }

  nodes () {
    return this._nodes.values()
  }

  *edges () {
    for (let [a, b] of this._edges.values()) {
      yield [this._nodes.get(a), this._nodes.get(b)]
    }
  }

  addNode (node) {
    this._nodes.set(node.id, node)
  }

  removeNode(node) {
    this._nodes.delete(node.id)
  }

  addEdge (a, b) {
    this._edges.add([a.id, b.id])
  }

  removeEdge (a, b) {
    this._edges.remove([a.id, b.id])
  }
}

let nextAnchorId = 0
class Anchor {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.children = []
    this.id = nextAnchorId
    nextAnchorId += 1
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

  let mouse = { x: 0, y: 0}

  let graph = new Graph()

  let activeAnchor
  let lastAnchor
  let hoveredAnchor

  let drawAnchors = true

  canvas.addEventListener('mousedown', function(event) {
    const x = event.layerX
    const y = event.layerY

    let existingAnchor
    for (let anchor of graph.nodes()) {
      if (isHit(anchor, x, y)) {
        existingAnchor = anchor
        break
      }
    }
    if (existingAnchor) {
      activeAnchor = existingAnchor
    } else {
      const newAnchor = new Anchor(event.layerX, event.layerY)
      graph.addNode(newAnchor)
      if (lastAnchor) {
        graph.addEdge(lastAnchor, newAnchor)
      }
      activeAnchor = newAnchor
    }
    draw()
  })

  canvas.addEventListener('mousemove', function (event) {
    const x = event.layerX
    const y = event.layerY
    mouse.x = x
    mouse.y = y
    if (activeAnchor) {
      activeAnchor.x = x
      activeAnchor.y = y
    }
    hoveredAnchor = null
    for (let anchor of graph.nodes()) {
      if (anchor == activeAnchor) continue
      if (isHit(anchor, x, y)) {
        hoveredAnchor = anchor
        break
      }
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
    for (let [a, b] of graph.edges()) {
      drawLine(ctx, a, b)
    }
    if (lastAnchor && !hoveredAnchor) {
      ctx.strokeStyle = '#999999'
      drawLine(ctx, mouse, lastAnchor)
      ctx.strokeStyle = 'black'
    }
    for (let anchor of graph.nodes()) {
      if (!drawAnchors) continue
      let color = 'black'
      let size = 5
      if (anchor == activeAnchor) {
        color = 'red'
        size = 7
      } else if (anchor == lastAnchor) {
        color = 'green'
        size = 9
      }
      if (anchor == hoveredAnchor) {
        size = 11
      }
      if (color != 'black') {
        ctx.strokeStyle = color
      }
      anchor.draw(ctx, size)
      ctx.strokeStyle = 'black'
    }
  }
}, 1)

function drawLine (ctx, a, b) {
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}
