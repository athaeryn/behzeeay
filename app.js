const W = 500
const H = 500

class Node {
  constructor (id) {
    this.id = id
    this.edges = new Set()
  }

  addEdge (id) {
    this.edges.add(id)
  }

  removeEdge (id) {
    this.edges.delete(id)
  }
}

class Graph {
  constructor () {
    this._nodeData = new Map() // TODO: maybe merge these?
    this._nodes = new Map()
    this._edges = new Set()
  }

  nodes () {
    return this._nodeData.values()
  }

  *edges () {
    // TODO: remove duplication
    for (let node of this._nodes.values()) {
      const nodeData = this._nodeData.get(node.id)
      for (let id of node.edges.values()) {
        yield [nodeData, this._nodeData.get(id)]
      }
    }
  }

  addNode (node) {
    if (!(node instanceof Point)) {
      console.error("you're adding something to the graph that isn't a Point")
    }
    this._nodeData.set(node.id, node)
    this._nodes.set(node.id, new Node(node.id))
  }

  removeNode (node) {
    this._nodeData.delete(node.id)
    this._nodes.delete(node.id)
  }

  // removes b, replaces references with a
  mergeNodes (a, b) {
    const bEdges = this._nodes.get(b.id).edges.values()
    for (let nodeId of bEdges) {
      const node = this._nodes.get(nodeId)
      this.addEdge(a, node)
      this.removeEdge(node, b)
    }
    this.removeNode(b)
  }

  addEdge (a, b) {
    this._nodes.get(a.id).addEdge(b.id)
    this._nodes.get(b.id).addEdge(a.id)
  }

  removeEdge (a, b) {
    this._nodes.get(a.id).removeEdge(b.id)
  }
}

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  isHit (x, y, slop = 4) {
    return Math.abs(this.x - x) <= slop && Math.abs(this.y - y) <= slop
  }
}

class Anchor extends Point {
  constructor (x, y) {
    super(x, y)
    this.id = Anchor.nextId
    Anchor.nextId += 1
  }

  draw (ctx, width = 5) {
    ctx.fillRect(this.x - width / 2, this.y - width / 2, width, width)
    ctx.strokeRect(this.x - width / 2, this.y - width / 2, width, width)
  }
}
Anchor.nextId = 0

const canvas = document.createElement('canvas')
canvas.width = W
canvas.height = H
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'white'
let mouse = { x: 0, y: 0}

let graph = new Graph()

let activeAnchor
let lastAnchor
let hoveredAnchor

let drawAnchors = true

function handleMouseDown (event) {
  const x = event.layerX
  const y = event.layerY

  let existingAnchor
  for (let anchor of graph.nodes()) {
    if (anchor.isHit(x, y)) {
      existingAnchor = anchor
      break
    }
  }
  if (existingAnchor) {
    if (lastAnchor) {
      graph.addEdge(existingAnchor, lastAnchor)
      activeAnchor = existingAnchor
    } else {
      activeAnchor = existingAnchor
    }
  } else {
    const newAnchor = new Anchor(event.layerX, event.layerY)
    graph.addNode(newAnchor)
    if (lastAnchor) {
      graph.addEdge(lastAnchor, newAnchor)
    }
    activeAnchor = newAnchor
  }
  draw()
}

function handleMouseMove (event) {
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
    if (anchor.isHit(x, y)) {
      hoveredAnchor = anchor
      break
    }
  }
  draw()
}

function handleMouseUp (event) {
  if (activeAnchor && !lastAnchor && hoveredAnchor) {
    graph.mergeNodes(hoveredAnchor, activeAnchor)
  }
  lastAnchor = activeAnchor
  activeAnchor = null
  draw()
}

function handleKeyDown (event) {
  if (event.which == 27) { // esc
    lastAnchor = null
    activeAnchor = null
  } else if (event.which == 72) {
    drawAnchors = false
  }
  draw()
}

function handleKeyUp (event) {
  if (event.which == 72) {
    drawAnchors = true
  }
  draw()
}

function main () {
  document.body.appendChild(canvas)

  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
}

function draw () {
  ctx.clearRect(0, 0, W, H)
  for (let [a, b] of graph.edges()) {
    drawLine(ctx, a, b)
  }
  if (drawAnchors && lastAnchor) {
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

function drawLine (ctx, a, b) {
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}
