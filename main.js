// JS code for prosit algorithm - Ryo SHIINA

// >=== custom values 
const startNodeId = 12 //id of starting node.
const nodeColor = 'white' // node fill color in CSS spec.
const nodeStrokeColor = 'black' // node stroke color in CSS spec.
const nodeStrokeWidth = 2 // node stroke width in px.
const nodeNameColor = 'black' // node name color in CSS spec.
const nodeNameStrokeWidth = 1 // node name stroke width in px.
const nodeNameFontSize = 15 // node name font size in px.
const nodeNameOffsetX = 15 // node name X offset in px.
const nodeNameOffsetY = -15 // node name Y offset in px.
const nodeRadius = 10 // node radius in px.
const edgeColor = 'grey' // edge stroke color in CSS spec.
const edgeWidth = 2 // edge stroke width in px.
const edgeVisitedColor = 'red' // visited edge color in CSS spec.
const edgeVisitedWidth = 3 // visited edge stroke width in px.
const distanceColor = 'blue' // distance color in CSS spec.
const waypointSteps = 100 // steps for animation waypoints.
const transitionStepTime = 1 // waiting time between each step in milliseconds.
// ===<

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const background = document.getElementById('background')
const bgButton = document.getElementById('bgButton')
const calcButton = document.getElementById('calcButton')
const logBox = document.getElementById('logs')

const nodes = [
  {
    id: 1,
    name: 'A',
    x: 141,
    y: 69,
    linked: [2, 5]
  },
  {
    id: 2,
    name: 'B',
    x: 1016,
    y: 162,
    linked: [1, 11]
  },
  {
    id: 3,
    name: 'C',
    x: 228,
    y: 192,
    linked: [4, 6]
  },
  {
    id: 4,
    name: 'D',
    x: 706,
    y: 245,
    linked: [3, 10]
  },
  {
    id: 5,
    name: 'E',
    x: 111,
    y: 277,
    linked: [1, 6]
  },
  {
    id: 6,
    name: 'F',
    x: 209,
    y: 291,
    linked: [3, 5, 7, 8]
  },
  {
    id: 7,
    name: 'G',
    x: 432,
    y: 316,
    linked: [6, 9]
  },
  {
    id: 8,
    name: 'H',
    x: 194,
    y: 400,
    linked: [6, 9]
  },
  {
    id: 9,
    name: 'I',
    x: 417,
    y: 430,
    linked: [7, 8, 10, 12]
  },
  {
    id: 10,
    name: 'J',
    x: 674,
    y: 469,
    linked: [4, 9, 11, 13]
  },
  {
    id: 11,
    name: 'K',
    x: 880,
    y: 498,
    linked: [2, 10]
  },
  {
    id: 12,
    name: 'L',
    x: 397,
    y: 554,
    linked: [9, 13]
  },
  {
    id: 13,
    name: 'M',
    x: 652,
    y: 587,
    linked: [10, 12]
  }
]

const edges = {}

let useBackground = true

const toggleBackground = () => {
  useBackground = !useBackground
  if (useBackground) {
    background.style.display = 'block'
  } else {
    background.style.display = 'none'
  }
}

const log = (text, color = 'black') => {
  const msgElem = document.createElement('p')
  const msg = document.createTextNode(text)
  msgElem.style.color = color
  msgElem.appendChild(msg)
  logBox.appendChild(msgElem)
  logBox.scrollTop = logBox.scrollHeight;
}

const getCursorPosition = e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  log(`{ x: ${x}, y: ${y} }`)
}

const drawNode = node => {
  // arc(x,y,r,startangle,endangle)
  context.beginPath()
  context.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
  context.fillStyle = nodeColor
  context.fill()
  context.strokeStyle = nodeStrokeColor
  context.lineWidth = nodeStrokeWidth
  context.stroke()
  context.fillStyle = nodeNameColor
  context.fillText(node.name, node.x + nodeNameOffsetX, node.y + nodeNameOffsetY)
}

const drawEdge = edge => {
  context.beginPath()
  context.lineWidth = edgeWidth
  context.moveTo(edge.node1.x, edge.node1.y)
  context.lineTo(edge.node2.x, edge.node2.y)
  context.strokeStyle = edgeColor
  context.lineWidth = edgeWidth
  context.stroke()
  context.textAlign = 'center'
  context.fillStyle = distanceColor
  context.fillText(Math.round(edge.distance), edge.midpoint.x, edge.midpoint.y)
}

const sleep = () => new Promise(resolve => setTimeout(resolve, transitionStepTime))

const animateTransition = async (node1, node2) => {
  for (let i = 0; i < waypointSteps; i++) {
    const multiplier = i / waypointSteps
    const nextMultiplier = (i + 1) / waypointSteps
    const currentPos = {
      x: node1.x + (node2.x - node1.x) * multiplier,
      y: node1.y + (node2.y - node1.y) * multiplier
    }
    const nextPos = {
      x: node1.x + (node2.x - node1.x) * nextMultiplier,
      y: node1.y + (node2.y - node1.y) * nextMultiplier
    }
    context.beginPath()
    context.strokeStyle = edgeVisitedColor
    context.lineWidth = edgeVisitedWidth
    context.moveTo(currentPos.x, currentPos.y)
    context.lineTo(nextPos.x, nextPos.y)
    context.stroke()
    drawNode(node1)
    drawNode(node2)
    await sleep()
  }
}

const findNodeById = id => {
  return nodes.find(e => e.id === id)
}

const compareNodeIds = (node1, node2) => {
  if (node1.id > node2.id) {
    return {
      low: node2,
      high: node1
    }
  }
  return {
    low: node1,
    high: node2
  }
}

const getOtherEndNode = (edge, node) => {
  return edge.node1.id === node.id ? edge.node2 : edge.node1
}

const findAdjacentEdges = node => {
  return Object.values(edges).filter(e => e.node1.id === node.id || e.node2.id === node.id)
}

const findUnvisitedEdges = (availableEdges = null) => {
  const conditionFunc = e => e.visited === false
  return availableEdges 
    ? availableEdges.filter(e => conditionFunc(e))
    : Object.values(edges).filter(e => conditionFunc(e))
}

const getRandomItemFromArray = arr => {
  const randIndex = Math.floor(Math.random() * arr.length)
  return arr[randIndex]
}

const checkEulerian = () => {
  let oddCount = 0
  nodes.forEach(e => {
    const degree = e.linked.length
    log(`${e.name}'s degree: ${degree}`)
    if (!((degree % 2) === 0)) {
      oddCount++
    }
  })
  // eulerian cycle if all degrees are even 
  // eulerian trail if there are either 0 or 2 odd degrees
  if (oddCount === 0) {
    return {
      trail: true,
      cycle: true,
    }
  } else if (oddCount === 2) {
    return {
      trail: true,
      cycle: false,
    }
  }
  return {
    trail: false,
    cycle: false,
  }
}

const findNewSubtourStartNode = tour => {
  if (tour.length > 0) {
    const eligibleNodes = {}
    tour.forEach(e => {
      const adjacentEdges = findAdjacentEdges(e)
      const unvisitedEdges = findUnvisitedEdges(adjacentEdges)
      if (unvisitedEdges.length > 0) {
        if (!eligibleNodes[e.id]) {
          eligibleNodes[e.id] = e
        }
      }
    })
    return getRandomItemFromArray(Object.values(eligibleNodes))
  }
  return findNodeById(startNodeId)
}

const integrateSubtour = (tour, subTour) => {
  if (tour.length > 0) {
    let resTour = []
    const targetIndex = tour.findIndex(e => e.id === subTour.origin.id)
    if (targetIndex === 0) {
      const rightChunk = tour.slice(1)
      resTour = subTour.path.concat(rightChunk)
    } else if (targetIndex === tour.length - 1) {
      const leftChunk = tour.slice(0, tour.length - 2)
      resTour = leftChunk.concat(subTour.path)
    } else {
      const leftChunk = tour.slice(0, targetIndex)
      const rightChunk = tour.slice(targetIndex + 1)
      resTour = leftChunk.concat(subTour.path).concat(rightChunk)
    }
    return resTour
  }
  return subTour.path
}

const startHierholzerSubtour = (tour) => {
  let currentNode = findNewSubtourStartNode(tour)
  const subTourOrigin = currentNode
  const subTour = [currentNode]
  let subTourName = currentNode.name
  let cycled = false
  
  log(`Starting new subtour with node ${currentNode.name}`, 'green')
  while (!cycled) {
    const availableEdges = findAdjacentEdges(currentNode)
    const eligibleEdges = findUnvisitedEdges(availableEdges)
    const chosenEdge = getRandomItemFromArray(eligibleEdges)
    const nextNode = getOtherEndNode(chosenEdge, currentNode)
    edges[chosenEdge.id].visited = true
    currentNode = nextNode
    subTourName += currentNode.name
    subTour.push(currentNode)
    if (currentNode.id === subTourOrigin.id) {
      cycled = true;
    }
  }
  log(`Established ${subTourName}`, 'green')
  return{
    origin: subTourOrigin,
    path: subTour
  }
}

const hierholzer = () => {
  log("Running Hierholzer's algorithm...", 'blue')
  let tour = []
  let completed = false
  while(!completed) {
    const subTour = startHierholzerSubtour(tour)
    tour = integrateSubtour(tour, subTour)
    const unvisitedEdges = findUnvisitedEdges()
    if (unvisitedEdges.length > 0) {
    } else {
      completed = true
    }
  }
  return tour
}


const calculatePath = () => {
  log('Starting strategy...', 'red')
  const eulerian = checkEulerian()
  if (eulerian.cycle) {
    log('This graph has an eulerian cycle.')
    const tour = hierholzer()
    log('Strategy calculated.', 'red')
    return tour
  }
  log('This graph has no eulerian cycle.')
  return null
}

const drawPath = async path => {
  const promises = []
  const pathLength = path.length
  let pathName = ''
  for (let i = 0; i < path.length - 1; i++) {
    currentNode = path[i]
    nextNode = path[i + 1]
    pathName += path[i].name
    await animateTransition(currentNode, nextNode)
  }
  pathName += path[0].name
  log(`${pathName} established.`, 'blue')
  log(`Please refresh for another run.`)
}

const executePath = async () => {
  calcButton.disabled = true
  path = calculatePath()
  drawPath(path)
}

const init = () => {
  bgButton.addEventListener('click', toggleBackground)
  calcButton.addEventListener('click', executePath)
  canvas.addEventListener('mousedown', e => getCursorPosition(e))
  context.font = `${nodeNameFontSize}px consolas`
  
  // calculate edges
  nodes.forEach(e => {
    // register edges with unique ID 
    e.linked.forEach(v => {
      const targetNode = findNodeById(v)
      const { low, high } = compareNodeIds(e, targetNode)
      const edgeId = `${low.id}_${high.id}`
      // calculate distance and midpoint when creating the edge
      if (!edges[edgeId]) {
        const distance = Math.sqrt(Math.pow((e.x - targetNode.x), 2) + Math.pow((e.y - targetNode.y), 2))
        const midpoint = {
          x: (e.x + targetNode.x) / 2,
          y: (e.y + targetNode.y) / 2, 
        }
        edges[edgeId] = {
          id: edgeId,
          visited: false,
          distance,
          midpoint,
          node1: low,
          node2: high,
        }
      }
    })
  })

  // draw edges first.
  Object.values(edges).forEach(e => {
    drawEdge(e)
  })

  // draw nodes on top of edges.
  nodes.forEach(e => {
    drawNode(e)
  })
}

init()
