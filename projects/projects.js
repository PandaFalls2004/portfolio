import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  
let sliceGenerator = d3.pie().value((d) => d.value);
  
// let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

// let data = [1, 2];
// let total = 0;

// for (let d of data) {
//   total += d;
// }
// let angle = 0;


// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }

let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr("fill", colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})
let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
          .attr('class', 'legend');
})


let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
});

// Function to Render Pie Chart
// 
function renderPieChart(projectsGiven) {
    // Clear previous SVG elements & Legend
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();
    
    let legend = d3.select('.legend');
    legend.html("");

    // Aggregate project count per year
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    // Convert rolled-up data into an array
    let newData = newRolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    // Slice Generator
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);

    // Arc Generator
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    // Color Scale
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Append Pie Chart Slices
    newSVG.selectAll('path')
        .data(newArcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr("fill", (d, i) => colors(i))
        .attr('stroke', 'white');

    // Render Legend
    newData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .attr('class', 'legend');
    });
}

// Event Listener for Filtering
searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();
    
    // Filter Projects
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Update Projects & Pie Chart
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
let selectedIndex = -1;
let svg = d3.select('svg');
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        // Toggle selectedIndex
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update pie chart selection
        paths.attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

        // Update legend selection
        legend.selectAll('li').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      });
      
      
  });
  if (selectedIndex === -1) {
    renderProjects(projects, projectsContainer, 'h2');
  } else {
    // Filter projects based on the selected wedge's label (year)
    let selectedYear = newData[selectedIndex].label;
    let filteredProjects = projects.filter(project => project.year === selectedYear);
  }

 



