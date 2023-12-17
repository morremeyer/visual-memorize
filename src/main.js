import './style.css'
import * as pdfjs from 'pdfjs-dist'

// Source for the PDF.js worker script
const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs')
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

// Error message setter
const errorDiv = document.getElementById('error')
function setError(e) {
  errorDiv.innerText = `Error: ${e}`
  console.error(e)
}

// Area in which drag and drop works
const dropArea = document.body

// Various DOM elements
const fileSelector = document.getElementById('file-selector')
const explanation = document.getElementById('explanation')
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

// Sizes
const appHeight = document.documentElement.clientHeight - 30
const appWidth = document.documentElement.clientWidth - 30

// Variable to store the PDF document
let pdf

// Variable to store the current PDF page
let page

// If true, a PDF page is displayed currently. If false,
// only an image is displayed. This is used to determine
// if the full page needs to be shown next or a new random
// page needs to be selected and its image displayed
//
// Initialized to true so that the first call to showNext()
// displays a single image
let isPage = true

// Enable file dialog
fileSelector.addEventListener('change', event => {
  const fileList = event.target.files
  loadPdf(fileList[0])
})

// Enable drag & drop
dropArea.addEventListener('dragover', event => {
  event.stopPropagation()
  event.preventDefault()
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = 'copy'
})
dropArea.addEventListener('drop', event => {
  event.stopPropagation()
  event.preventDefault()
  const fileList = event.dataTransfer.files
  loadPdf(fileList[0])
})

// Listen to arrow right
document.body.addEventListener('keydown', event => {
  if (event.key !== 'ArrowRight') {
    return
  }
  showNext()
})

// Listen to tap and click on the canvas
canvas.addEventListener('touchstart', event => {
  event.preventDefault()
  showNext()
})
canvas.addEventListener('click', () => {
  showNext()
})

// Show the next image or PDF page
async function showNext() {
  // Currently displaying a page, display the next one
  if (isPage) {
    // Random number between 1 and the number of pages
    const pageNumber = Math.floor(Math.random() * pdf.numPages) + 1

    // Get new pages
    page = await pdf.getPage(pageNumber)

    // Extract the first image on the page and display it
    const operatorList = await page.getOperatorList()
    const imgIndex = operatorList.fnArray.indexOf(pdfjs.OPS.paintImageXObject)
    const imgArgs = operatorList.argsArray[imgIndex]
    if (typeof imgArgs === 'undefined') {
      showNext()
      return
    }
    const imgRef = imgArgs[0]
    const imgObj = page.objs.get(imgRef)

    // Set the canvas width to the avaliable width or the image width, whichever is smaller
    canvas.width = Math.min(imgObj.bitmap.width, appWidth)

    // Calculate the width to height ratio
    const aspectRatio = imgObj.bitmap.width / imgObj.bitmap.height

    // Set the canvas height based on the aspect ratio
    canvas.height = Math.floor(canvas.width / aspectRatio)

    // Draw the ImageBitmap onto the canvas
    context.drawImage(imgObj.bitmap, 0, 0, canvas.width, canvas.height)

    isPage = false
  } else {
    const scale = setCanvasSize(page.view[2], page.view[3])

    // Render the PDF page on the canvas
    const renderContext = {
      canvasContext: context,
      viewport: page.getViewport({ scale: scale }), // You can adjust the scale
    }
    page.render(renderContext)

    isPage = true
  }
}

// set the canvas size based on the element width and height
function setCanvasSize(width, height) {
  const aspectRatio = width / height

  // How often does the page fit in the height and width?
  // Calculate the scale from that
  const heightRatio = appHeight / height
  const widthRatio = appWidth / width
  const scale = Math.min(heightRatio, widthRatio)

  // Set the canvas height to the avaliable height or the page height, whichever is smaller
  canvas.height = appHeight

  // Set the canvas width based on the aspect ratio
  canvas.width = Math.floor(canvas.height * aspectRatio)

  return scale
}

// Load the PDF
async function loadPdf(file) {
  const fileReader = new FileReader()
  fileReader.onload = () => {
    const arrayBuffer = fileReader.result

    // Load document
    pdfjs
      .getDocument({ data: arrayBuffer })
      .promise.then(async function (pdfDoc) {
        pdf = pdfDoc
        explanation.style.display = 'none'
        await showNext()
      })
      .catch(e => {
        setError(e)
      })
  }

  // Read the PDF file as a data URL
  fileReader.readAsArrayBuffer(file)
}
