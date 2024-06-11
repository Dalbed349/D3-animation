// Set the dimensions and margins of the diagram
const width = 1000, height = 1000;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Calculate pentagon points

const center = { x: width / 2, y: height / 2 };

// Append the svg object
const svg = d3.select("#d3-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(0,0)`);

const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y);

// #############################
const MIDDLE_CLASS = "middle";
const OUTER_CLASS = "outer";
const INNER_CLASS = "inner"
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// 
let middleRotationAngle = 0; // Initial rotation angle for the middle polygon

function generatePolygonPoints(numPoints,radius, rotationAngle = 0){
    return Array.from({length: numPoints }, (_,i) => {
        const baseAngleDeg = 360 / numPoints * i - 90; // Original angle without rotation
        const angleDeg = baseAngleDeg + rotationAngle; 
        // const angle_deg = 360 / numPoints * i - 90;
        // const angle_rad = Math.PI / 180 * angle_deg;
        const angle_rad = Math.PI / 180 * angleDeg;
        return {
            x: center.x + radius * Math.cos(angle_rad),
            y: center.y + radius * Math.sin(angle_rad)
        };
    });
}



async function updatePolygon(innerNumPoints,innerRadius,middleNumPoints,middleRadius,outerNumPoints, outerRadius) {

    const innerData = generatePolygonPoints(innerNumPoints, innerRadius);
    // let innerPromise = drawPolygon(innerData, "#69b3a2", 5, INNER_CLASS);
    const middleData = generatePolygonPoints(middleNumPoints, middleRadius,middleRotationAngle);
    const outerData = generatePolygonPoints(outerNumPoints, outerRadius);
    // let outerPromise = drawPolygon(outerData, "#407294", 3, OUTER_CLASS); // Draw outer polygon with different styles
    

     drawPolygon(innerData, "#19b3a2", 5, INNER_CLASS,8),
     await delay(1000);
     drawPolygon(middleData, '#FF33B2', 4, MIDDLE_CLASS,5),
     await delay(1000);
     drawPolygon(outerData, "#12b3a3", 1, OUTER_CLASS,2)

     middleData.forEach((_, index) => {
        drawConnectingLines(middleData, outerData, index); // Adjusted to pass index
    });
    // await delay(1000);
    // drawConnectingLines(middleData, outerData) // Draw strategic connecting lines
    drawConnectingLines2(innerData, middleData) // Draw strategic connecting lines

    middleRotationAngle += 0;
}
// 


// 
function drawPolygon(data, fillColor, strokeWidth, className,rvalue) {
    // Update or enter circles
    let transitionsCompleted = [];
    // 
    const circles = svg.selectAll(`circle.${className}`).data(data);
    circles.enter().append("circle")
        .attr("class", className) // Use fillColor as class for simplicity
        .merge(circles)
        .transition().duration(1000)  // Smooth transition for updating positions
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", rvalue)
        .style("fill", fillColor)
        .end()
        .then(() => { transitionsCompleted.push(true); });

    circles.exit().remove();  // Remove extra circles if reducing points

    // Update path for connecting lines
    const linePath = svg.selectAll(`path.${className}`).data([data]); // Wrap data in an array for a single path
    linePath.enter().append("path")
        .attr("class", className)
        .merge(linePath)
        .transition().duration(1000)  // Smooth transition for updating the path
        .attr("d", lineGenerator(data.concat(data[0]))) // Close the polygon
        .attr("fill", "none")
        // .attr("stroke", 'black')
        .attr("stroke-width", strokeWidth)
        .end()
        .then(() => { transitionsCompleted.push(true); });

    return transitionsCompleted; 
}

let lineCountSide = 2;
let totalLines = 5;
let lineCountSide2 = 1;

function getColorByIndex(index) {
    const colors = [ "#57B8D3", "#314044", "#ACCFD8"];
    return colors[index % colors.length]; // Cycle through a fixed set of colors
}
function drawConnectingLines(middleData, outerData,middleIndex){

    middleData.forEach((innerPoint,i) => {
        const color = getColorByIndex(i);
        let centralIndex = Math.round((i / middleData.length) * outerData.length);
        for (let j = -lineCountSide; j <= lineCountSide; j++) { // Loop from -1 to 1 to get left, center, and right points
            let adjustedIndex = (centralIndex + j + outerData.length) % outerData.length;
            const outerPoint = outerData[adjustedIndex];
            let line = svg.append("line")
                .attr("class", "connectingLine")
                .attr("x1", innerPoint.x)
                .attr("y1", innerPoint.y)
                .attr("x2", innerPoint.x) // Initially, the line ends where it starts
                .attr("y2", innerPoint.y)
                .style("stroke", color)
                .style("stroke-width", .5);

            // Animate the line to extend to the outer point
            line.transition()
                .delay(2000) // Delay to ensure it starts after the shapes are drawn
                .duration(1000)
                .attr("x2", outerPoint.x)
                .attr("y2", outerPoint.y);
        }
    })
}
function drawConnectingLines2(innerData, middleData){

    innerData.forEach((innerPoint,i) => {
        let centralIndex = Math.round((i / innerData.length) * middleData.length);
        for (let j = -lineCountSide2; j <= lineCountSide2; j++) { // Loop from -1 to 1 to get left, center, and right points
            let adjustedIndex = (centralIndex + j + middleData.length) % middleData.length;
            const outerPoint = middleData[adjustedIndex];
            let line = svg.append("line")
                .attr("class", "connectingLine")
                .attr("x1", innerPoint.x)
                .attr("y1", innerPoint.y)
                .attr("x2", innerPoint.x) // Initially, the line ends where it starts
                .attr("y2", innerPoint.y)
                .style("stroke", "grey")
                .style("stroke-width", .5);

            // Animate the line to extend to the outer point
            line.transition()
                .delay(1000) // Delay to ensure it starts after the shapes are drawn
                .duration(1000)
                .attr("x2", outerPoint.x)
                .attr("y2", outerPoint.y);
        }
    })
}
// 
function fillBetweenPolygons(sourceData, targetData, fillColor) {
    let pathData = sourceData.concat(targetData.slice().reverse()); // Combine points, reversing the second set
    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    // Create a closed path for the combined points
    svg.append("path")
        .datum(pathData) // Bind the combined points data
        .attr("d", line(pathData) + "Z") // Generate the "d" attribute and close the path with "Z"
        .attr("fill", fillColor) // Fill color
        .attr("stroke", fillColor) // Optional: add a stroke color if desired
        .attr("stroke-width", 1)
        .attr("class", "filledPolygon"); // Class name for potential CSS styling or manipulation
}

// #############################

let innerNumPoints = 15; // For example, change this to 6 for a hexagon
let outerNumPoints = 15
let innerRadius = 105; // Radius of the polygon
let outerRadius = 150;
let middleRadius= 125;
let middleNumPoints= 10;
updatePolygon(innerNumPoints, innerRadius,middleNumPoints,middleRadius, outerNumPoints, outerRadius);


setInterval(() => {
    // lineCountSide = Math.floor(Math.random(3,4)*10);
    lineCountSide = 1;
    totalLines = lineCountSide * 2 + 5
    // 
    innerNumPoints = Math.floor(Math.random(3) * 10)+2 ;  
    innerRadius = Math.floor(Math.random() * 100) + 100; 

    middleRadius= innerRadius*1.7;
    middleNumPoints= innerNumPoints*3

    outerNumPoints= innerNumPoints * totalLines * 3;
    outerRadius = innerRadius*2; 


    svg.selectAll("line.connectingLine").remove();
    updatePolygon(innerNumPoints, innerRadius,middleNumPoints,middleRadius,outerNumPoints, outerRadius);
  },6500); // Change every 3000 milliseconds (3 seconds)

